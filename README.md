# UI/UX AI Agent 🎨🤖

<p align="center">
  <strong>Autonomous AI-Powered UI/UX Design & Component Generation Platform</strong>
</p>

<p align="center">
  Full-stack platform utilizing multi-agent LLM pipelines to autonomously generate, refactor, and manipulate UI/UX designs, slide cards, and responsive components with interactive canvas manipulation and drag-and-drop ergonomics.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/dnd--kit-Drag_&_Drop-brightgreen?style=for-the-badge" alt="dnd-kit" />
</p>

---

## 🌟 Overview

**UI/UX AI Agent** is a full-stack monorepo featuring:
- **`frontend/`**: Next.js and React client with a spatial canvas, interactive panning, slide card architecture, rich theming, and `@dnd-kit` drag-and-drop layout manipulation.
- **`backend/`**: NestJS API service powering autonomous AI design agents, code synthesis, LLM streaming, database persistence via Prisma ORM, and subscription billing.

---

## 📂 Monorepo Architecture

```text
ui-ux-ai-agent/
├── frontend/                 # Client Workspace (Next.js, React, Tailwind CSS, dnd-kit)
│   ├── src/                  # Application source code & UI components
│   ├── docs/                 # Architecture, design & performance specifications
│   │   ├── DESIGN.md
│   │   ├── SlideCard-architecture.md
│   │   └── PERFORMANCE_ISSUES.md
│   ├── package.json
│   └── README.md
│
└── backend/                  # API & Multi-Agent Backend (NestJS, Prisma, LLMs)
    ├── src/                  # Controllers, agent modules, services & DTOs
    ├── prisma/               # Database schema & migrations
    ├── package.json
    └── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `v18+` (Node 20+ recommended)
- **PostgreSQL**: Running instance

---

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and API keys in .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
```
*API runs at `http://localhost:3001`.*

---

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web application runs at `http://localhost:3000`.*

---

## 👤 Author

**Anirban Roy**  
- GitHub: [@anirban00537](https://github.com/anirban00537)  
- Email: [anirban00537@gmail.com](mailto:anirban00537@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License**.
