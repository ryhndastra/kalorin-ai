export const PROFILE_LIMITS = {
  minAge: 12,
  maxAge: 100,
  minWeight: 25,
  maxWeight: 300,
  minHeight: 120,
  maxHeight: 250,
};

export const calculateAgeFromBirthdate = (birthdate) => {
  if (!birthdate) return null;

  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age--;
  }

  return age;
};

export const validateProfileInput = ({
  birthdate,
  gender,
  activityLevel,
  weight,
  height,
  isPregnant,
  isBreastfeeding,
  language = "id",
}) => {
  const isId = String(language).toLowerCase().startsWith("id");

  if (!birthdate || !gender || !activityLevel || !weight || !height) {
    return isId
      ? "Tanggal lahir, gender, aktivitas, berat, dan tinggi wajib diisi."
      : "Birthdate, gender, activity, weight, and height are required.";
  }

  const birthDateObj = new Date(birthdate);
  if (Number.isNaN(birthDateObj.getTime())) {
    return isId ? "Tanggal lahir tidak valid." : "Birthdate is invalid.";
  }

  const now = new Date();
  if (birthDateObj > now) {
    return isId
      ? "Tanggal lahir tidak boleh di masa depan."
      : "Birthdate cannot be in the future.";
  }

  const age = calculateAgeFromBirthdate(birthdate);
  if (
    age === null ||
    age < PROFILE_LIMITS.minAge ||
    age > PROFILE_LIMITS.maxAge
  ) {
    return isId
      ? `Umur harus antara ${PROFILE_LIMITS.minAge}-${PROFILE_LIMITS.maxAge} tahun.`
      : `Age must be between ${PROFILE_LIMITS.minAge}-${PROFILE_LIMITS.maxAge} years.`;
  }

  if (weight < PROFILE_LIMITS.minWeight || weight > PROFILE_LIMITS.maxWeight) {
    return isId
      ? `Berat badan harus antara ${PROFILE_LIMITS.minWeight}-${PROFILE_LIMITS.maxWeight} kg.`
      : `Weight must be between ${PROFILE_LIMITS.minWeight}-${PROFILE_LIMITS.maxWeight} kg.`;
  }

  if (height < PROFILE_LIMITS.minHeight || height > PROFILE_LIMITS.maxHeight) {
    return isId
      ? `Tinggi badan harus antara ${PROFILE_LIMITS.minHeight}-${PROFILE_LIMITS.maxHeight} cm.`
      : `Height must be between ${PROFILE_LIMITS.minHeight}-${PROFILE_LIMITS.maxHeight} cm.`;
  }

  if (gender === "male" && (isPregnant || isBreastfeeding)) {
    return isId
      ? "Untuk gender laki-laki, opsi hamil dan menyusui tidak boleh dipilih."
      : "Pregnant and breastfeeding options cannot be selected for male gender.";
  }

  return null;
};
