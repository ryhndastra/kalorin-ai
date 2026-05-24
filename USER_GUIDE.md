# KaloriN AI User Guide

This guide explains how to use KaloriN AI from the user's perspective.

## 1. Guest Mode

You can use KaloriN AI without signing in by opening the landing page and choosing the food analyzer.

As a guest, you can:

- Open the landing page.
- Use the Analyze page.
- Scan or upload food images.
- Search foods.

As a guest, you cannot:

- Open Home, Meals, Track, Insights, or Profile.
- Add foods to your meal log.
- Get personalized tracking history.
- Get full personalized recommendations based on your profile.

If you try to open a protected page directly from the URL, the app redirects you to sign in.

## 2. Create an Account

You can create an account with:

- Email and password.
- Google login.

After creating or signing in with a new account, KaloriN AI asks you to complete your body data first.

Required data:

- Birthdate
- Weight
- Height

This data is used to calculate:

- BMI
- BMI status
- Ideal weight range
- Daily calorie target
- Protein target

You must complete this step before continuing with authenticated features.

## 3. Home Dashboard

The Home page shows your daily nutrition overview.

You can see:

- Greeting with your account name.
- BMI status.
- Ideal weight range.
- Calories eaten today.
- Calories left or goal reached.
- Protein, carbs, fat, and water progress.
- Today's meal count.
- Whether you are on track.
- Personalized recommendation section.

## 4. Analyze Food

The Analyze page has two modes:

- Scan Image
- Search Food

### Scan Image

Use this mode to analyze food from a camera capture or uploaded image.

Steps:

1. Open Analyze.
2. Choose Scan Image.
3. Start camera or upload an image.
4. Submit the image for analysis.
5. Review the detected food and nutrition estimate.
6. If signed in, click Add to Meal Log to save it.

### Search Food

Use this mode to search the food database.

Steps:

1. Open Analyze.
2. Choose Search Food.
3. Type a food keyword or use category chips.
4. Review calories and macros.
5. If signed in, click Add to Meal.

After adding a food, today's stats update automatically.

## 5. Meals

The Meals page shows AI-powered food recommendations based on your profile and nutrition goals.

You can:

- View recommended foods.
- Open food details.
- Read AI reasoning for why a food is recommended.
- Add recommended foods to your meal log.

Recommendations work best after your profile data is complete and you have some meal history.

## 6. Track

The Track page shows your daily meal history.

You can:

- Choose a date.
- View foods logged on that date.
- See total calories, protein, carbs, and fat.
- Compare your intake with your daily calorie target.

Use this page to check what you have already eaten and how close you are to your goal.

## 7. Insights

The Insights page summarizes weekly nutrition behavior.

It can show:

- Weekly trends.
- Weekly comparison.
- Nutrition score.
- Tracking streaks.
- Behavioral insights generated from your meal patterns.

Insights become more useful after you track meals for several days.

## 8. Profile

The Profile page contains your account and nutrition settings.

You can edit:

- Account name
- Birthdate
- Weight
- Height
- Goal
- Daily calorie target
- Protein target

When you update body stats or goals, KaloriN AI recalculates targets where applicable.

When you update your account name, the app updates both:

- Firebase display name
- Database profile name

## 9. Goals

Available goal options:

- Stay Healthy
- Weight Loss
- Bulking

Changing your goal can affect the recommended calorie and protein targets.

## 10. Logout

You can log out from:

- Navbar profile dropdown.
- Profile page Sign Out button.

After logout, you return to the landing page.

## Troubleshooting

### I cannot open Home, Meals, Track, Insights, or Profile.

You are probably using guest mode. Sign in or create an account first.

### I signed in but still see a required profile modal.

Complete birthdate, weight, and height. These fields are required for personalized recommendations.

### Food recommendations are empty.

Try these checks:

- Make sure your profile is complete.
- Make sure the backend is running.
- Make sure the AI service is running.
- Try tracking a few meals first.

### AI explanation or behavioral insight is unavailable.

The AI service may be offline, Redis may be unavailable, or the Gemini API key may be missing.

### My dashboard data looks outdated.

Try adding a meal again or revisiting the page. Authenticated actions usually refresh profile stats automatically after saving.
