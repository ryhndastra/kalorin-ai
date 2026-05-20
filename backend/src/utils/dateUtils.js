const JAKARTA_TIMEZONE = "Asia/Jakarta";
const JAKARTA_UTC_OFFSET_HOURS = 7;

const getJakartaDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const valueOf = (type) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: valueOf("year"),
    month: valueOf("month"),
    day: valueOf("day"),
  };
};

const toJakartaStartUtc = ({ year, month, day }) =>
  new Date(Date.UTC(year, month - 1, day, -JAKARTA_UTC_OFFSET_HOURS, 0, 0, 0));

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
};

const parseDateInput = (dateInput) => {
  if (!dateInput) {
    return getJakartaDateParts();
  }

  const match = String(dateInput).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match.map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
};

const getJakartaDayRange = (dateInput) => {
  const parts = parseDateInput(dateInput);

  if (!parts) {
    return null;
  }

  const startOfDay = toJakartaStartUtc(parts);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

  return {
    startOfDay,
    endOfDay,
  };
};

const getJakartaRollingRange = (days = 7) => {
  const todayRange = getJakartaDayRange();
  const startOfRange = addDays(todayRange.startOfDay, -(days - 1));

  return {
    startOfRange,
    endOfRange: todayRange.endOfDay,
  };
};

const formatJakartaDate = (date) =>
  new Date(date).toLocaleDateString("en-CA", {
    timeZone: JAKARTA_TIMEZONE,
  });

const formatJakartaWeekday = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    timeZone: JAKARTA_TIMEZONE,
    weekday: "long",
  });

module.exports = {
  JAKARTA_TIMEZONE,
  getJakartaDayRange,
  getJakartaRollingRange,
  formatJakartaDate,
  formatJakartaWeekday,
};
