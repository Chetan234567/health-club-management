# HCMS Frontend With Role Signup

React + Tailwind CSS frontend for a Health Club Management System. The project follows a lightweight MVC modular structure with role-based login and signup access.

## Main Features

- Separate signup and login pages for Admin, Member, and Trainer.
- Admin dashboard with members, trainers, plans, classes, and attendance management.
- Admin CRUD for members, trainers, plans, and class/coaching schedules.
- Member portal with profile edit, plan payment, receipt download, remaining days, trainer request, class booking, and monthly attendance.
- Trainer workspace with member requests, assigned clients, work calendar, and class booking.
- Forgot password flow for every role using email, OTP, and new password update.
- Admin report downloads for members, trainers, and Reports & Analytics.
- Training request status badges show pending in red and accepted in green with request/update date-time.
- One class booking per role per day. Selecting a new class replaces the previous selection.
- Indian rupee pricing for all subscription plans.
- HeathClub Buddy chatbot widget with optional backend API integration.

## Project Structure

```text
src/
  models/          Static domain data and role navigation
  controllers/     React hooks for routing, dashboard state, chatbot state
  services/        API service layer for chatbot integration
  views/           Page-level screens for Admin, Member, Trainer
  components/      Reusable UI components
  styles/          Tailwind and shared CSS utilities
```

## Role URLs

```text
/admin/login
/admin/signup
/member/login
/member/signup
/trainer/login
/trainer/signup
```

After login:

```text
/admin/dashboard
/member/dashboard
/trainer/dashboard
```

## Demo Credentials

```text
Admin:   admin@healthclub.com   / password
Member:  member@healthclub.com  / password
Trainer: trainer@healthclub.com / password
```

You can also create a new account from the signup page for each role.

## Run Locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173/admin/login
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Chatbot API Integration

The chatbot button is named **HeathClub Buddy** in the application.

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Set your Spring Boot chatbot microservice URL:

```text
VITE_CHATBOT_API_URL=http://localhost:8081/api/chat
```

Expected chatbot request:

```json
{
  "role": "member",
  "message": "Suggest a plan for weight loss"
}
```

Expected chatbot response:

```json
{
  "reply": "For weight loss, start with HIIT Burn and the Strength Pro plan."
}
```

## Frontend Flow

```text
Browser URL
  -> useRoleRouter
  -> AuthView login/signup
  -> useClubDashboard
  -> AppShell
  -> Role View
  -> CRUD / attendance / booking actions
```

## Notes

- Current data is stored in React state for frontend demonstration.
- Replace `src/models/clubData.js` seed arrays with backend API calls during Spring Boot integration.
- Short comments are included at the top of pages and components to explain project flow.
