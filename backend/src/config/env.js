const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const parseCorsOrigins = (value) => {
  if (!value) return DEFAULT_CORS_ORIGINS;

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const validateCriticalEnv = () => {
  const hasFirebaseCredential = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );

  if (!hasFirebaseCredential) {
    throw new Error(
      "Missing Firebase Admin credential: set FIREBASE_SERVICE_ACCOUNT_BASE64 or GOOGLE_APPLICATION_CREDENTIALS",
    );
  }
};

module.exports = {
  DEFAULT_CORS_ORIGINS,
  parseCorsOrigins,
  validateCriticalEnv,
};
