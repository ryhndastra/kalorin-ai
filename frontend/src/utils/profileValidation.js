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
}) => {
  if (!birthdate || !gender || !activityLevel || !weight || !height) {
    return "Tanggal lahir, gender, aktivitas, berat, dan tinggi wajib diisi.";
  }

  const birthDateObj = new Date(birthdate);
  if (Number.isNaN(birthDateObj.getTime())) {
    return "Tanggal lahir tidak valid.";
  }

  const now = new Date();
  if (birthDateObj > now) {
    return "Tanggal lahir tidak boleh di masa depan.";
  }

  const age = calculateAgeFromBirthdate(birthdate);
  if (
    age === null ||
    age < PROFILE_LIMITS.minAge ||
    age > PROFILE_LIMITS.maxAge
  ) {
    return `Umur harus antara ${PROFILE_LIMITS.minAge}-${PROFILE_LIMITS.maxAge} tahun.`;
  }

  if (weight < PROFILE_LIMITS.minWeight || weight > PROFILE_LIMITS.maxWeight) {
    return `Berat badan harus antara ${PROFILE_LIMITS.minWeight}-${PROFILE_LIMITS.maxWeight} kg.`;
  }

  if (height < PROFILE_LIMITS.minHeight || height > PROFILE_LIMITS.maxHeight) {
    return `Tinggi badan harus antara ${PROFILE_LIMITS.minHeight}-${PROFILE_LIMITS.maxHeight} cm.`;
  }

  if (gender === "male" && (isPregnant || isBreastfeeding)) {
    return "Untuk gender male, opsi pregnant dan breastfeeding tidak boleh dipilih.";
  }

  return null;
};
