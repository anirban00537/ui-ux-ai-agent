# UI/UX AI Agent Backend ⚙️🎨

<p align="center">
  <strong>Autonomous Multi-Agent AI Backend for UI/UX Design & Component Generation</strong>
</p>

<p align="center">
  High-performance NestJS 10 API powering multi-agent design workflows, dynamic layout structuring, theme synthesis, real-time SSE design streaming, and Polar.sh subscription monetization.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10.4-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS 10" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma_ORM-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Qwen_3_Coder-Agent-blueviolet?style=for-the-badge" alt="Qwen Coder" />
  <img src="https://img.shields.io/badge/Polar.sh-Billing-000000?style=for-the-badge&logo=polar&logoColor=white" alt="Polar.sh" />
</p>

---

## 🌟 Overview

The **UI/UX AI Agent Backend** is a specialized NestJS microservice responsible for orchestrating generative design agents. It enables users to describe design intent in natural language and receive production-ready UI layouts, responsive components, customized color themes, and exportable slide designs.

### Core Capabilities:
1. **Multi-Agent Design Pipeline**: Autonomous LLM agents (`qwen/qwen3-coder-next`, DeepInfra, OpenAI) equipped with structured tools to construct UI layouts, style tokens, and content blocks.
2. **Dynamic Layout & Theme Engine**: Programmatic creation and mutation of design grids, card containers, typography rules, and theme palettes.
3. **Real-Time Streaming Design Chat**: Server-Sent Events (SSE) streaming conversational refinement of generated designs.
4. **Production Export Service**: Compiles canvas designs into clean HTML/Tailwind, JSON schemas, or image snapshots.
5. **Subscription & Credit Ledger**: Cryptographic Polar.sh webhook processing and real-time generation quota accounting.

---

## 🏛 System Architecture & Modules

```text
src/
├── modules/
│   ├── designs/                 # Core UI/UX design generation & agent chat
│   │   ├── chat/                # Real-time SSE streaming design companion
│   │   ├── dto/                 # Input validation DTOs (class-validator)
│   │   ├── tools/               # AI Agent execution tools (layout, styling, blocks)
│   │   ├── schemas.ts           # Zod schemas for structured agent outputs
│   │   ├── designs.controller.ts# REST endpoints for design CRUD & generation
│   │   ├── designs.service.ts   # Design lifecycle & persistence logic
│   │   ├── designs-chat.service.ts # Streaming agent chat engine
│   │   └── designs-export.service.ts # Code & asset export compiler
│   ├── layouts/                 # Structural templates and grid systems
│   ├── themes/                  # Color palettes, typography & theme management
│   ├── images/                  # Asset uploads & Backblaze B2 / AWS S3 presigned URLs
│   ├── subscription/            # Polar.sh checkout, webhooks & credit management
│   ├── auth/                    # Better-Auth, Google OAuth, JWT cookie authentication
│   ├── blog/                    # Built-in Markdown SEO publishing engine
│   ├── prisma/                  # Prisma ORM client singleton & extensions
│   └── logger/                  # Structured Winston logging
└── shared/                      # Global guards, interceptors & exception filters
```

---

## 🔬 Key Engineering Highlights

### 1. Multi-Agent Design Orchestration
- Uses agent tool-calling patterns where specialized agents generate layout grids, compose visual elements, select accessible color palettes, and validate responsiveness.
- All agent responses are strictly validated against **Zod schemas** to guarantee deterministic JSON output.

### 2. Live SSE Streaming Canvas Refinement
- When users converse with the design assistant (e.g. *"Change hero section to a 3-column split with amber accents"*), the backend streams updates over Server-Sent Events (SSE), dynamically updating the client canvas in real-time.

### 3. Clean Code & Asset Exporting
- `designs-export.service.ts` converts JSON design trees into production-ready Tailwind CSS and React component code that developers can copy-paste directly into their apps.

### 4. Enterprise Auth & Secure Billing
- **Cookie Security**: Auth tokens are stored exclusively in `httpOnly` secure cookies.
- **HMAC Webhooks**: Polar.sh billing events are verified with raw HMAC cryptographic signatures to guarantee payment safety.

---

## 🔌 API Endpoint Reference

### Designs & AI Agents
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/designs` | Create a new design project from user prompt |
| `GET` | `/api/designs` | List paginated designs for authenticated user |
| `GET` | `/api/designs/:id` | Get full design state (blocks, rows, columns, theme) |
| `PATCH`| `/api/designs/:id` | Update design structure or layout manually |
| `DELETE`| `/api/designs/:id` | Delete design and associated assets |
| `GET` | `/api/designs/:id/chat/stream` | **SSE Stream**: Real-time design assistant conversational stream |
| `GET` | `/api/designs/:id/export` | Export design as React/Tailwind code or template |

### Layouts & Themes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/layouts` | Retrieve layout templates and structural presets |
| `GET` | `/api/themes` | Retrieve active color palettes and typography themes |
| `POST` | `/api/themes` | Create custom user theme |

### Subscriptions & Credits
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/subscription/plans` | Retrieve available subscription tiers |
| `POST` | `/api/subscription/checkout` | Create checkout session URL |
| `POST` | `/api/subscription/webhook` | Raw-body HMAC verified Polar.sh webhook |
| `GET` | `/api/subscription/credits` | Check user's remaining generation credits |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **PostgreSQL 15+**
- **LLM API Key**: OpenAI, DeepInfra, or OpenRouter API key

### Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *Fill in your database URL, JWT secret, and LLM API keys.*

3. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Start development server:
   ```bash
   npm run start:dev
   ```
   *The API will be live at `http://localhost:3001`.*

---

## 👤 Author

**Anirban Roy**  
- GitHub: [@anirban00537](https://github.com/anirban00537)  
- Email: [anirban00537@gmail.com](mailto:anirban00537@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License**.
