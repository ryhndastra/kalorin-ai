import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      common: {
        guest: "Guest",
        signIn: "Sign In",
        signUp: "Sign Up",
        continueAsGuest: "Continue as Guest",
        retry: "Retry",
        loadingApp: "Loading app...",
      },
      nav: {
        home: "Home",
        analyze: "Analyze",
        meals: "Meals",
        track: "Track",
        insights: "Insights",
        profile: "Profile",
        logout: "Logout",
        account: "Account",
        getStarted: "Get Started",
        logoutSuccess: "Logged out successfully.",
        logoutFailed: "Failed to log out.",
      },
      auth: {
        email: "Email",
        password: "Password",
        fullName: "Full Name",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot Password?",
        enterEmail: "Enter Email",
        enterPassword: "Enter Password",
        createPassword: "Create Password",
        repeatPassword: "Repeat Password",
        enterFullName: "Enter your full name",
        orContinueWith: "or continue with",
        googleFailed: "Failed to sign in with Google.",
        phoneComingSoon: "Phone login is coming soon.",
        appleComingSoon: "Apple login is coming soon.",
        validate: {
          emailRequired: "Email is required.",
          emailInvalid: "Email format is invalid.",
          passwordRequired: "Password is required.",
          fullNameRequired: "Full name is required.",
          passwordMin: "Password must be at least 6 characters.",
          confirmPasswordRequired: "Confirm password is required.",
          passwordMismatch: "Password and confirm password do not match.",
          fixFields: "Please correct the highlighted fields.",
        },
        login: {
          title: "Welcome back!",
          subtitle: "Sign in to access your personalized nutrition plan",
          signingIn: "Signing in...",
          noAccount: "Don't have an account?",
          scannerTry: "Just want to try the food scanner?",
          invalidCreds: "Incorrect email or password. Please try again.",
        },
        register: {
          title: "Create an Account",
          subtitle: "Join us to start tracking your personalized nutrition plan",
          creating: "Creating Account...",
          haveAccount: "Already have an account?",
          emailUsed: "Email is already registered. Please sign in.",
          registerFailed: "Failed to register. Please try again.",
        },
      },
      landing: {
        navbarLogin: "Sign In",
        heroTitleLine1: "Eat Smart,",
        heroTitleHighlight: "Live Healthier",
        heroTitleLine2: "Every Day",
        heroSubtitle:
          "Kalorin AI helps you calculate BMI, analyze nutrition needs, and discover food recommendations tailored to your body condition quickly and easily.",
        startFree: "Start for Free",
        analyzing: "AI is analyzing...",
        sampleFood: "Grilled Chicken Salad",
        featuresTitle: "Everything You Need",
        featuresSubtitle: "One app for your daily nutrition needs",
        feature1Title: "Easy Calorie Tracking",
        feature1Desc:
          "Log your daily foods and drinks quickly to monitor calorie intake more consistently and accurately.",
        feature2Title: "Personal AI Recommendations",
        feature2Desc:
          "Get meal pattern and nutrition target recommendations tailored to your profile, goals, and body needs.",
        feature3Title: "Complete Nutrition Analysis",
        feature3Desc:
          "View your daily nutrition summary, from calories, protein, and fat to carbohydrates, to support a healthier lifestyle.",
        howTitle: "How KaloriN AI Works",
        step1Title: "Sign up & set goals",
        step1Desc:
          "Create an account and set your health goals, like losing weight, maintaining your weight, or gaining muscle mass. Kalorin AI will help you reach those goals with nutrition-based food recommendations.",
        step2Title: "Log your meals",
        step2Desc:
          "Input the foods you consume each day to track calories and nutrition. The system helps log protein, fat, and carbohydrates in a practical and organized way.",
        step3Title: "Get AI insights",
        step3Desc:
          "Analyze your eating habits with AI for more personalized recommendations. Discover insights on nutrition needs, calorie balance, and practical next steps.",
        ctaTitleLine1: "Start your healthy journey",
        ctaTitleLine2: "today",
        ctaSubtitle: "Free forever. No credit card needed.",
        ctaButton: "Sign Up Now - Free",
        ctaNote: "Sign in with Google, Apple, or phone number",
      },
      app: {
        offlineTitle: "You are offline",
        offlineDesc: "Internet connection is lost. Please reconnect and refresh.",
      },
    },
  },
  id: {
    translation: {
      common: {
        guest: "Tamu",
        signIn: "Masuk",
        signUp: "Daftar",
        continueAsGuest: "Lanjut sebagai Tamu",
        retry: "Coba Lagi",
        loadingApp: "Memuat aplikasi...",
      },
      nav: {
        home: "Beranda",
        analyze: "Analisis",
        meals: "Makanan",
        track: "Lacak",
        insights: "Insight",
        profile: "Profil",
        logout: "Keluar",
        account: "Akun",
        getStarted: "Mulai",
        logoutSuccess: "Berhasil logout.",
        logoutFailed: "Gagal logout.",
      },
      auth: {
        email: "Email",
        password: "Password",
        fullName: "Nama Lengkap",
        confirmPassword: "Konfirmasi Password",
        forgotPassword: "Lupa Password?",
        enterEmail: "Masukkan Email",
        enterPassword: "Masukkan Password",
        createPassword: "Buat Password",
        repeatPassword: "Ulangi Password",
        enterFullName: "Masukkan nama lengkap",
        orContinueWith: "atau lanjutkan dengan",
        googleFailed: "Gagal login dengan Google.",
        phoneComingSoon: "Fitur login via nomor HP segera hadir.",
        appleComingSoon: "Fitur login via Apple segera hadir.",
        validate: {
          emailRequired: "Email wajib diisi.",
          emailInvalid: "Format email tidak valid.",
          passwordRequired: "Password wajib diisi.",
          fullNameRequired: "Nama lengkap wajib diisi.",
          passwordMin: "Password minimal 6 karakter.",
          confirmPasswordRequired: "Konfirmasi password wajib diisi.",
          passwordMismatch: "Password dan konfirmasi password tidak sama.",
          fixFields: "Tolong perbaiki field yang ditandai.",
        },
        login: {
          title: "Selamat datang kembali!",
          subtitle: "Masuk untuk akses rencana nutrisi personalmu",
          signingIn: "Sedang masuk...",
          noAccount: "Belum punya akun?",
          scannerTry: "Cuma mau coba scanner makanan?",
          invalidCreds: "Email atau password salah. Silakan coba lagi.",
        },
        register: {
          title: "Buat Akun",
          subtitle: "Yuk mulai lacak rencana nutrisi personalmu",
          creating: "Membuat akun...",
          haveAccount: "Sudah punya akun?",
          emailUsed: "Email sudah terdaftar. Silakan masuk.",
          registerFailed: "Gagal mendaftar. Silakan coba lagi.",
        },
      },
      landing: {
        navbarLogin: "Masuk",
        heroTitleLine1: "Makan Cerdas,",
        heroTitleHighlight: "Hidup Sehat",
        heroTitleLine2: "Setiap Hari",
        heroSubtitle:
          "Kalorin AI membantu Anda menghitung BMI, menganalisis kebutuhan nutrisi, dan menemukan rekomendasi makanan yang sesuai dengan kondisi tubuh secara cepat dan mudah.",
        startFree: "Mulai Gratis",
        analyzing: "AI sedang menganalisis...",
        sampleFood: "Salad Ayam Panggang",
        featuresTitle: "Semua yang Kamu Butuhkan",
        featuresSubtitle: "Satu app untuk semua kebutuhan gizi harianmu",
        feature1Title: "Track Kalori Mudah",
        feature1Desc:
          "Catat makanan dan minuman harianmu dengan cepat untuk memantau asupan kalori secara lebih teratur dan akurat.",
        feature2Title: "Rekomendasi AI Personal",
        feature2Desc:
          "Dapatkan rekomendasi pola makan dan target nutrisi yang disesuaikan dengan profil, tujuan, dan kebutuhan tubuhmu.",
        feature3Title: "Analisis Nutrisi Lengkap",
        feature3Desc:
          "Lihat ringkasan nutrisi harian mulai dari kalori, protein, lemak, hingga karbohidrat untuk membantu menjaga pola hidup sehat.",
        howTitle: "Cara kerja KaloriN AI",
        step1Title: "Daftar & atur tujuan",
        step1Desc:
          "Buat akun dan tentukan tujuan kesehatanmu, seperti menurunkan berat badan, menjaga berat badan, atau meningkatkan massa otot. Kalorin AI akan membantu kamu mencapai tujuan tersebut dengan rekomendasi makanan yang sesuai kebutuhan nutrisi tubuhmu.",
        step2Title: "Catat makananmu",
        step2Desc:
          "Masukkan makanan yang kamu konsumsi setiap hari untuk memantau asupan kalori dan nutrisi. Sistem membantu mencatat protein, lemak, dan karbohidrat secara praktis dan terorganisir.",
        step3Title: "Dapatkan insight AI",
        step3Desc:
          "Analisis pola makanmu dengan bantuan AI untuk rekomendasi yang lebih personal. Temukan insight tentang kebutuhan nutrisi, keseimbangan kalori, dan langkah lanjutan.",
        ctaTitleLine1: "Mulai perjalanan sehatmu",
        ctaTitleLine2: "hari ini",
        ctaSubtitle: "Gratis selamanya. Tidak perlu kartu kredit.",
        ctaButton: "Daftar Sekarang - Gratis",
        ctaNote: "Login dengan Google, Apple, atau nomor HP",
      },
      app: {
        offlineTitle: "Kamu sedang offline",
        offlineDesc: "Koneksi internet terputus. Sambungkan kembali lalu refresh.",
      },
    },
  },
};

const savedLanguage = localStorage.getItem("app_language");

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "id",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
