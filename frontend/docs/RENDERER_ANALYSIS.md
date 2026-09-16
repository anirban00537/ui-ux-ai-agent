# Canvas Renderer: Competitor vs. Butterfast Analysis

This document outlines the architectural and design differences between our current `MobileFrame` renderer and the high-performance implementation used by industry competitors.

## 📊 Comparison Summary

| Feature | Competitor Implementation | Butterfast (Previous) |
| :--- | :--- | :--- |
| **Architecture** | Real-time "Player" Application | Static `srcDoc` Snippet |
| **Styling Engine** | Tailwind v4 Runtime / Custom Utilities | Legacy Tailwind v3 CDN |
| **Theming** | Root-level CSS Variables (`--primary`, etc.) | Hardcoded inline styles |
| **Animations** | Keyframe-based Enter/Exit System | Static (no movement) |
| **Isolation** | Independent Sub-domain/Route | Shared Root Layout (caused conflicts) |

---

## 🛠 Key "Secret Sauce" Elements

### 1. Tailwind v4 @theme Engine
The competitor uses a specialized runtime block that defines the entire design system tokens inside the iframe:
```css
@theme inline {
  --color-primary: var(--primary);
  --animate-in: var(--tw-duration, 150ms) enter;
}
```
**Why it matters:** This allows the AI to use complex animation classes (`fade-in-up`, `zoom-in-95`) that don't exist in standard Tailwind, making the UI feel extremely premium.

### 2. Variable-First Design
The structure is driven by variables mounted on the `<html>` tag.
- **Competitor:** Changes the color of 100+ items instantly by updating one variable on the root.
- **Us:** Currently have to re-render the entire HTML string to change one color.

---

## 🏁 Implementation Status (Butterfast Upgrade)

We have already completed the first phase of the upgrade:

- [x] **Route Isolation**: Moved main app to `(app)` and created `/renderers/canvas`.
- [x] **CORS/Communication**: Implemented `postMessage` protocol for content sync.
- [x] **Modern Bezel**: Refactored `MobileFrame.tsx` with premium squircle curves and soft shadows.

### 🚀 Pending Enhancements (Phase 2)

- [ ] **Animation Engine**: Port the keyframe system for enter/exit transitions.
- [ ] **Variable Theming**: Refactor `UPDATE_CONTENT` to separate CSS variables from HTML structure.
- [ ] **Typography Pack**: Preload the "Premium 4" font families (Bricolage, DM Sans, etc.).

---

**butterfast-renderer-v2**  
*Status: In Progress - Core Isolation Complete*
