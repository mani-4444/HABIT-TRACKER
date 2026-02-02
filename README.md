# HabitTracker

> An intelligent habit tracking web app with secure authentication and behavioral insights.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🔗 Live Demo

> 🚀 ([](https://habit-tracker-indol-two.vercel.app/))

---

## 📸 Screenshots

|            Landing Page             |                Dashboard                |                Analytics                |
| :---------------------------------: | :-------------------------------------: | :-------------------------------------: |
| ![Landing](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) | ![Analytics](screenshots/analytics.png) |

> _Add screenshots to a `screenshots/` folder in the repository root_

---

## ✨ Features

| Feature                                | Description                                                  |
| -------------------------------------- | ------------------------------------------------------------ |
| 🔐 **Email + Password Authentication** | Secure user registration and login powered by Supabase Auth  |
| 📧 **OTP Email Verification**          | Verify user email addresses with one-time password codes     |
| 🔑 **Secure Password Reset**           | Forgot password flow with email-based recovery               |
| ✅ **Habit CRUD**                      | Create, read, update, and delete habits with custom emojis   |
| 📅 **Daily Tracking**                  | Simple one-click habit completion tracking                   |
| 📊 **Analytics Dashboard**             | Visual insights into streaks, completion rates, and patterns |
| 🛡️ **Protected Routes**                | Route guards ensuring authenticated access only              |

---

## 🛠️ Tech Stack

| Technology       | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| **React 18**     | UI library with hooks and functional components       |
| **TypeScript**   | Type-safe development with static analysis            |
| **Supabase**     | Backend-as-a-Service for auth and PostgreSQL database |
| **Tailwind CSS** | Utility-first CSS framework for rapid styling         |
| **Vite**         | Next-generation frontend build tool                   |
| **shadcn/ui**    | Accessible, customizable component library            |
| **React Router** | Declarative client-side routing                       |
| **Recharts**     | Composable charting library for analytics             |
| **React Query**  | Server state management and caching                   |
| **Zod**          | Schema validation for forms                           |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **bun** package manager
- **Supabase** account ([Sign up free](https://supabase.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/mani-4444/HABIT-TRACKER.git

# Navigate to project directory
cd HABIT-TRACKER

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable                 | Description                        | Required |
| ------------------------ | ---------------------------------- | :------: |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          |    ✅    |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |    ✅    |

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Never commit your `.env` file. Use `.env.example` as a template.

---

## 📁 Folder Structure

```
HABIT-TRACKER/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React context providers (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and Supabase client
│   ├── pages/              # Route page components
│   └── test/               # Test files and setup
├── .env.example            # Environment variables template
├── index.html              # HTML entry point
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 📜 Available Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start development server with HMR |
| `npm run build`      | Build for production              |
| `npm run preview`    | Preview production build locally  |
| `npm run lint`       | Run ESLint for code quality       |
| `npm run test`       | Run test suite with Vitest        |
| `npm run test:watch` | Run tests in watch mode           |

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mani-4444/HABIT-TRACKER)

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

---

## 🔮 Future Improvements

- [ ] Dark mode theme toggle
- [ ] Habit categories and tags
- [ ] Weekly/monthly habit scheduling
- [ ] Push notifications and reminders
- [ ] Social sharing and accountability partners
- [ ] Data export (CSV/JSON)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Manideep**

- GitHub: [@mani-4444](https://github.com/mani-4444)

---

<p align="center">
  Made with ❤️ for building better habits
</p>
