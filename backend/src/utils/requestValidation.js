const isBlank = (value) => value === undefined || value === null || value === "";

const isPositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
};

const isNonNegativeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

const hasInvalidNumber = (payload, fields, validator = isNonNegativeNumber) =>
  fields.some((field) => !isBlank(payload[field]) && !validator(payload[field]));

module.exports = {
  isBlank,
  isPositiveNumber,
  isNonNegativeNumber,
  hasInvalidNumber,
};
