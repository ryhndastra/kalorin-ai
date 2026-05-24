const AI_URL = process.env.AI_URL || "http://localhost:8000";
const MAX_FOOD_SCAN = 10;
const AI_TIMEOUT = Number(process.env.AI_TIMEOUT || 15000);
const CACHE_TTL = 1000 * 60 * 30;
const INSIGHT_TTL = 1000 * 60 * 60 * 6;
const RECOMMENDATION_LIST_TTL = 1000 * 60 * 60 * 6;
const CONCURRENT_LIMIT = 1;

module.exports = {
  AI_URL,
  MAX_FOOD_SCAN,
  AI_TIMEOUT,
  CACHE_TTL,
  INSIGHT_TTL,
  RECOMMENDATION_LIST_TTL,
  CONCURRENT_LIMIT,
};
