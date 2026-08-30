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
| 🤖 **AI Habit Coaching**               | Evidence-backed pattern detection and weekly behavioral reviews |
| 🌟 **Community Testimonials**          | High-trust social proof showcase with verified streak badges |
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

For local AI insights API development, run these in separate terminals:

```bash
npm run dev:vercel
npm run dev
```

This starts the Vercel local runtime for `/api/*` and the Vite frontend with HMR.

---

## API Runtime

AI insights API runs as a Vercel serverless function.

Local development:

- Run `npm run dev:vercel` (Vercel local API runtime on localhost:3000)
- Run `npm run dev` (Vite frontend on localhost:8080)
- Frontend requests to `/api/*` are proxied to the local Vercel runtime

If this is your first time running Vercel locally, you may be prompted to authenticate in the terminal.

If you run only `npm run dev`, frontend pages still work, but serverless endpoints are not guaranteed to be available.

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
├── public/                 # Static assets (favicons, testimonial portraits)
│   └── testimonials/       # Authentic portraits for community testimonials
├── src/
│   ├── components/         # Reusable UI components
│   │   └── ui/             # shadcn/ui components (testimonial, button, card, etc.)
│   ├── contexts/           # React context providers (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and Supabase client
│   ├── pages/              # Route page components (Landing, Overview, Analysis, etc.)
│   └── test/               # Test files and setup
├── .env.example            # Environment variables template
├── index.html              # HTML entry point
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

### 💬 Community Testimonial Component

Located in `src/components/ui/testimonial.tsx`, this component renders equal-height, high-trust social proof cards with:
- Photorealistic portraits with smooth bottom cinematic gradients
- Amber streak pill badges with animated `Flame` icons
- 5-star ratings (`5.0`) with subtle quote accents
- Emerald `Verified` indicators
- Scannable quotes and category tags

**Usage:**

```tsx
import Testimonial from "@/components/ui/testimonial";

// Render default habit builder stories (Gora, Geetha, Dong Lee)
<Testimonial />

// Or pass custom items via props
<Testimonial items={customTestimonialList} />
```

A standalone demo wrapper is also available at `src/components/ui/demo.tsx`.

---

## 📜 Available Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start development server with HMR |
| `npm run dev:vercel` | Start Vercel local API runtime    |
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
