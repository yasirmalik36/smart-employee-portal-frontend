# 🖥️ Smart Employee Portal — Frontend

> Enterprise Angular 17 HR platform with AI-driven analytics, real-time notifications, face recognition attendance, and a fully modular architecture using **NgRx**, **Standalone Components**, and **OnPush change detection**.

[![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## ✨ Features

- 🏠 **Dashboard** — Real-time KPIs, attendance overview, pending tasks, and AI-generated insights
- 🕐 **Attendance Module** — Clock-in/out with webcam face recognition, monthly calendar view
- 🏖️ **Leave Management** — Apply, track, and approve leaves with balance indicators
- ✅ **Task Management** — Kanban board with priority, status, and due date tracking
- 👥 **Employee Directory** — Search, filter, and manage employee profiles
- 📊 **Analytics** — AI-powered attendance patterns, productivity trends, anomaly alerts
- 🔔 **Real-time Notifications** — SignalR-powered live updates without page refresh
- 🌓 **Dark / Light Mode** — System preference detection with manual toggle
- 📱 **Responsive** — Mobile-first design, works on all screen sizes

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── core/                   # Singleton services, guards, interceptors
│   │   ├── auth/               # JWT auth service, route guards
│   │   ├── interceptors/       # HTTP auth, error, loading interceptors
│   │   └── services/           # API, SignalR, notification services
│   ├── shared/                 # Reusable components, pipes, directives
│   │   ├── components/         # Buttons, modals, data tables, charts
│   │   └── pipes/              # Date formatting, status display
│   ├── features/               # Lazy-loaded feature modules
│   │   ├── dashboard/          # Main dashboard with AI analytics
│   │   ├── attendance/         # Clock-in/out, calendar, reports
│   │   ├── leaves/             # Leave request, approval workflow
│   │   ├── tasks/              # Kanban task board
│   │   └── employees/          # Employee directory & profiles
│   └── store/                  # NgRx state management
│       ├── auth/               # Auth state, actions, reducers, effects
│       ├── employees/          # Employee state
│       └── notifications/      # Real-time notification state
├── assets/                     # Images, icons, fonts
└── environments/               # Dev, staging, prod configs
```

**Key Angular Patterns:**
- ✅ Standalone Components (Angular 17)
- ✅ NgRx for global state — auth, notifications, employee data
- ✅ OnPush Change Detection — optimised rendering performance
- ✅ Lazy Loading — all feature modules loaded on demand
- ✅ Reactive Forms with custom validators
- ✅ HTTP Interceptors — auto JWT refresh, error handling, loading state

---

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Angular 17 (Standalone) |
| Language | TypeScript 5.x |
| State Management | NgRx 17 |
| Reactive | RxJS 7 |
| UI Components | Angular Material + Custom |
| Styling | SCSS + Tailwind CSS |
| Charts | Chart.js / ng2-charts |
| Real-time | @microsoft/signalr |
| HTTP | Angular HttpClient + Interceptors |
| Testing | Jest + Angular Testing Library |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Angular CLI 17](https://angular.io/cli): `npm install -g @angular/cli@17`
- Backend API running (see [smart-employee-portal-backend](https://github.com/yasirmalik36/smart-employee-portal-backend))

### 1. Clone the Repository

```bash
git clone https://github.com/yasirmalik36/smart-employee-portal-frontend.git
cd smart-employee-portal-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api',
  signalRUrl: 'https://localhost:7001/hubs',
  faceRecognitionUrl: 'http://localhost:5000'
};
```

### 4. Run Development Server

```bash
ng serve
```

App will be available at `http://localhost:4200`

### 5. Build for Production

```bash
ng build --configuration production
```

---

## 📁 Key Modules

### Dashboard
Real-time metrics widget, attendance summary, pending approvals, AI analytics chart showing productivity trends and anomaly alerts.

### Attendance Module
Webcam integration for face recognition clock-in, monthly calendar with daily attendance status, late/early departure indicators, and CSV export.

### Leave Management
Multi-step leave application form, manager approval workflow with email notifications, leave balance progress bars, and team leave calendar.

### Task Board
Drag-and-drop Kanban board (To Do → In Progress → Done), task assignment, priority flags, due date countdown, and comment threads.

---

## 🔗 Related Repositories

| Repo | Description |
|------|-------------|
| [smart-employee-portal-backend](https://github.com/yasirmalik36/smart-employee-portal-backend) | .NET Core 8 REST API |
| [smart-employee-portal-face-recognition](https://github.com/yasirmalik36/smart-employee-portal-face-recognition) | Python face recognition microservice |

---

## 🤝 Author

**Yasir Mehmood** — Senior Full-Stack & AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-1B3A6B?style=flat-square)](https://yasir-portfolio-omega.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/yasir-mehmood-53549a1b3)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=flat-square&logo=gmail)](mailto:yash36114@gmail.com)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
