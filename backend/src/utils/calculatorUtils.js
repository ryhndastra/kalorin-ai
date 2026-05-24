const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const VALID_GENDERS = new Set(["male", "female"]);

const MIN_TARGET_CALORIES = {
  male: 1500,
  female: 1200,
};
const DEFAULT_TARGETS = { calories: 2000, protein: 100 };

const normalizeGender = (gender) => {
  if (typeof gender !== "string") return null;

  const normalized = gender.trim().toLowerCase();
  return VALID_GENDERS.has(normalized) ? normalized : null;
};

const normalizeActivityLevel = (activityLevel) => {
  if (typeof activityLevel !== "string") return "sedentary";

  const normalized = activityLevel.trim().toLowerCase();
  return ACTIVITY_FACTORS[normalized] ? normalized : "sedentary";
};

const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const calculateDailyNeeds = (
  weight,
  height,
  birthdate,
  goal,
  gender,
  activityLevel,
  clinicalFlags = {},
) => {
  // guard clause, kalau data ga lengkap kasih default standar minimal
  if (!weight || !height || !birthdate) {
    return { ...DEFAULT_TARGETS };
  }

  const age = calculateAge(birthdate);
  const normalizedGender = normalizeGender(gender);
  const normalizedActivityLevel = normalizeActivityLevel(activityLevel);
  const isPregnant = Boolean(clinicalFlags.isPregnant);
  const isBreastfeeding = Boolean(clinicalFlags.isBreastfeeding);
  const hasMedicalCondition = Boolean(clinicalFlags.hasMedicalCondition);

  // Mifflin-St Jeor is for healthy adults. For under-18 or special
  // physiological/medical conditions, avoid auto-targets and prefer manual targets.
  if (
    !normalizedGender ||
    age <= 0 ||
    age < 18 ||
    isPregnant ||
    isBreastfeeding ||
    hasMedicalCondition
  ) {
    return { ...DEFAULT_TARGETS };
  }

  const numericWeight = parseFloat(weight);
  const numericHeight = parseFloat(height);

  // Mifflin-St Jeor BMR equation for adults.
  const bmr =
    10 * numericWeight +
    6.25 * numericHeight -
    5 * age +
    (normalizedGender === "male" ? 5 : -161);

  // TDEE = BMR x activity factor.
  const tdee = bmr * ACTIVITY_FACTORS[normalizedActivityLevel];

  let targetCalories = tdee;
  if (goal === "Weight Loss") {
    targetCalories = Math.max(
      tdee - 500,
      MIN_TARGET_CALORIES[normalizedGender],
    );
  } else if (goal === "Bulking") {
    targetCalories = tdee + 500;
  }

  let proteinMultiplier = 1.8;

  if (goal === "Weight Loss") {
    proteinMultiplier = 2.0;
  } else if (goal === "Bulking") {
    proteinMultiplier = 1.9;
  }

  const targetProtein = numericWeight * proteinMultiplier;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(targetProtein),
  };
};

module.exports = {
  ACTIVITY_FACTORS,
  calculateDailyNeeds,
  calculateAge,
  normalizeActivityLevel,
  normalizeGender,
};
