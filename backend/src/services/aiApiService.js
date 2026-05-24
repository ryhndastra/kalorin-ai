const axios = require("axios");
const redis = require("redis");
const { AI_URL, AI_TIMEOUT, CACHE_TTL } = require("../config/aiConfig");
const isTestEnv = process.env.NODE_ENV === "test";
const isDevEnv = process.env.NODE_ENV !== "production";
const debugLog = (...args) => {
  if (isDevEnv && !isTestEnv) {
    console.debug(...args);
  }
};

// REDIS CLIENT
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

if (!isTestEnv) {
  redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
  redisClient.on("connect", () => debugLog("✅ Redis connected"));
}

(async () => {
  if (isTestEnv) return;

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    if (isTestEnv) return;
    console.error("❌ Redis Connect Error:", error.message);
  }
})();

const REDIS_PREFIX = "ai:recommend:";
const REDIS_TTL_SECONDS = Math.max(
  1,
  Math.floor((CACHE_TTL || 1800000) / 1000),
);

const getRedisCache = async (key) => {
  try {
    if (!redisClient.isReady) return null;

    const data = await redisClient.get(`${REDIS_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setRedisCache = async (key, value) => {
  try {
    if (!redisClient.isReady) return;

    await redisClient.setEx(
      `${REDIS_PREFIX}${key}`,
      REDIS_TTL_SECONDS,
      JSON.stringify(value),
    );
  } catch {
    // silent fail
  }
};

// CIRCUIT BREAKER
// Kalau AI 429/error terus → stop kirim request sementara
const circuitBreaker = {
  state: "CLOSED", // CLOSED = normal | OPEN = stop requests | HALF_OPEN = coba lagi
  failureCount: 0,
  failureThreshold: 3,
  retryAfter: null,
  retryDelay: 60_000,

  recordFailure(retryAfterMs = null) {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold || retryAfterMs) {
      this.state = "OPEN";
      const delay = retryAfterMs ?? this.retryDelay;
      this.retryAfter = Date.now() + delay;
      debugLog(`🔴 Circuit OPEN — retry in ${Math.ceil(delay / 1000)}s`);
    }
  },

  recordSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
    this.retryAfter = null;
    debugLog("🟢 Circuit CLOSED — AI service recovered");
  },

  canRequest() {
    if (this.state === "CLOSED") return true;
    if (this.state === "OPEN") {
      if (Date.now() >= this.retryAfter) {
        this.state = "HALF_OPEN";
        debugLog("🟡 Circuit HALF_OPEN — trying one request");
        return true;
      }
      const waitSec = Math.ceil((this.retryAfter - Date.now()) / 1000);
      debugLog(`🔴 Circuit OPEN — blocked, retry in ${waitSec}s`);
      return false;
    }
    if (this.state === "HALF_OPEN") return true;
    return false;
  },
};

// Parse "retry in Xs" dari pesan error Gemini → ms
const parseRetryDelay = (errorData) => {
  try {
    const msg =
      typeof errorData === "string"
        ? errorData
        : JSON.stringify(errorData?.detail || errorData);
    const match = msg.match(/retry[_\s]delay[^0-9]*(\d+)/i);
    if (match) return parseInt(match[1]) * 1000 + 2000; // tambah 2s buffer
  } catch {}
  return null;
};

// AXIOS INSTANCE
const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: AI_TIMEOUT,
});

// RETRY WITH EXPONENTIAL BACKOFF
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const postWithRetry = async (endpoint, payload, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Cek circuit breaker sebelum kirim
    if (!circuitBreaker.canRequest()) {
      throw new Error("AI service temporarily unavailable (circuit open)");
    }

    try {
      const response = await aiClient.post(endpoint, payload);
      circuitBreaker.recordSuccess();
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      // 429 Rate Limit — parse retry delay dari Gemini
      if (status === 429) {
        const retryMs = parseRetryDelay(errorData);
        circuitBreaker.recordFailure(retryMs);

        if (attempt < retries) {
          const backoff = retryMs ?? Math.pow(2, attempt) * 5000; // 5s, 10s
          debugLog(
            `⏳ Rate limited, waiting ${Math.ceil(backoff / 1000)}s before retry (attempt ${attempt + 1}/${retries})`,
          );
          await sleep(backoff);
          continue;
        }
      }

      // Error lain (5xx, network, dll)
      if (status >= 500 || !status) {
        circuitBreaker.recordFailure();
      }

      console.error(
        `❌ AI API Error (${endpoint}):`,
        errorData || error.message,
      );
      throw new Error("AI service unavailable");
    }
  }
};

// REQUEST DEDUPLICATION
const inFlightRequests = new Map();

const deduplicatedPost = async (endpoint, payload) => {
  const dedupKey = `${endpoint}:${JSON.stringify(payload)}`;

  if (inFlightRequests.has(dedupKey)) {
    debugLog("♻️  Dedup: reusing in-flight request");
    return inFlightRequests.get(dedupKey);
  }

  const requestPromise = postWithRetry(endpoint, payload).finally(() => {
    inFlightRequests.delete(dedupKey);
  });

  inFlightRequests.set(dedupKey, requestPromise);
  return requestPromise;
};

// RECOMMENDATION — score only, tanpa explanation
// Dipanggil untuk tiap food di list rekomendasi
const requestRecommendation = async (payload) => {
  const cacheKey = JSON.stringify(payload);

  const cached = await getRedisCache(cacheKey);
  if (cached) {
    debugLog("⚡ Redis cache hit");
    return cached;
  }

  const result = await deduplicatedPost("/api/recommend", payload);
  await setRedisCache(cacheKey, result);

  return result;
};

// RECOMMENDATION WITH EXPLANATION
// Hanya dipanggil saat user buka detail food
// Gemini hanya jalan di Python kalau cache miss
const requestRecommendationWithExplanation = async (payload) => {
  const cacheKey = `explain:${JSON.stringify(payload)}`;

  const cached = await getRedisCache(cacheKey);
  if (cached) {
    debugLog("⚡ Redis explain cache hit");
    return cached;
  }

  const result = await deduplicatedPost("/api/recommend/explain", payload);
  await setRedisCache(cacheKey, result);

  return result;
};

// INSIGHT  (dedup + circuit breaker)
// Cache udah dihandle di Python (insight_cache)
const requestInsight = async (payload) => {
  return await deduplicatedPost("/api/daily-insight", payload);
};

const requestBehavioralInsights = async (payload) => {
  return await deduplicatedPost("/api/behavioral-insights", payload);
};

// EXPOSE circuit state untuk monitoring/debugging
const getCircuitState = () => ({
  state: circuitBreaker.state,
  failureCount: circuitBreaker.failureCount,
  retryAfter: circuitBreaker.retryAfter
    ? new Date(circuitBreaker.retryAfter).toISOString()
    : null,
});

module.exports = {
  requestRecommendation,
  requestRecommendationWithExplanation,
  requestInsight,
  requestBehavioralInsights,
  getCircuitState,
};
