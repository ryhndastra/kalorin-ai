export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export const ACTIVITY_LEVEL_OPTIONS = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise, mostly sitting.",
  },
  {
    value: "light",
    label: "Lightly Active",
    description: "Light exercise or walking 1-3 days/week.",
  },
  {
    value: "moderate",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week.",
  },
  {
    value: "active",
    label: "Active",
    description: "Hard exercise 6-7 days/week.",
  },
  {
    value: "very_active",
    label: "Very Active",
    description: "Very hard training or physical job most days.",
  },
];

export const getGenderLabel = (value) =>
  GENDER_OPTIONS.find((option) => option.value === value)?.label || "Not Set";

export const getActivityLevelLabel = (value) =>
  ACTIVITY_LEVEL_OPTIONS.find((option) => option.value === value)?.label ||
  "Not Set";

export const getActivityLevelDescription = (value) =>
  ACTIVITY_LEVEL_OPTIONS.find((option) => option.value === value)?.description ||
  "";
