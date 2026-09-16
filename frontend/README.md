# UI/UX AI Agent Frontend 🎨🖥️

<p align="center">
  <strong>Interactive Spatial Canvas & Generative Design Client</strong>
</p>

<p align="center">
  Modern Next.js 15 & React 19 application featuring a high-performance spatial canvas, smooth panning/zooming, SlideCard component architecture, and `@dnd-kit` drag-and-drop layout manipulation.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/dnd--kit-Drag_&_Drop-brightgreen?style=for-the-badge" alt="dnd-kit" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
</p>

---

## 🌟 Overview

The **UI/UX AI Agent Frontend** is an interactive design workspace where users can visually compose, edit, and collaborate with autonomous AI agents on UI/UX mockups, presentation slide cards, and responsive component layouts.

---

## ✨ Feature Suite

### 1. Spatial Interactive Canvas
- **Fluid Panning & Zooming**: Canvas navigation with keyboard shortcuts (`Space + Drag`, scroll zoom) and responsive boundary clamping.
- **Dynamic Theming**: Instant theme switching across modern, corporate, minimal, cyber, and vibrant palettes with automated contrast calculations.

### 2. Composable SlideCard Architecture
- Built on a decoupled layout hierarchy:
  - `SlideCard`: Top-level slide container with layout metadata.
  - `InsertDropZone`: Insertion targets between rows and blocks.
  - `DroppableRow`: Flexible horizontal rows with dynamic column balancing.
  - `ResizableColumn`: Percentage-based column width resizing with neighboring column constraint solving.
  - `DraggableBlock`: Draggable component containers featuring action bars and live property inspectors.
  - `BlockRenderer`: Renders concrete block types (ProseMirror rich text, stat cards, media grids, button groups).

### 3. Drag-and-Drop Ergonomics (`@dnd-kit`)
- Multi-container drag-and-drop powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
- Global drag state bridging displaying animated insertion lines and preview ghosts.

### 4. Real-Time Streaming AI Assistant
- Inline chat companion connected via Server-Sent Events (SSE).
- Streams natural language design modifications and updates canvas components incrementally without full-page reloads.

### 5. Production Code Export
- One-click export to clean, self-contained **React + Tailwind CSS** components or modular JSON design trees.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18+` (Node 20+ recommended)
- **Backend Service**: Running instance of the `backend/` service at `http://localhost:3001`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local 2>/dev/null || true
   ```
   *Ensure API base URLs point to your backend service.*

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server |
| `npm run build` | Compiles production build |
| `npm run start` | Runs production server |
| `npm run lint` | Checks code quality and ESLint rules |

---

## 👤 Author

**Anirban Roy**  
- GitHub: [@anirban00537](https://github.com/anirban00537)  
- Email: [anirban00537@gmail.com](mailto:anirban00537@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License**.
