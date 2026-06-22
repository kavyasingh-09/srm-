---
name: Glassmorphism Academic Fusion
version: 1.2.0
colors:
  primary: "#003A70"
  primaryDark: "#3b82f6"
  accent: "#FFC72C"
  accentHover: "#ffd561"
  success: "#10b981"
  error: "#f43f5e"
  bgLight: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
  bgDark: "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)"
typography:
  headingFont: "Outfit"
  bodyFont: "Inter"
effects:
  borderRadius: "16px"
  blur: "16px"
---

# SRM Campus Marketplace Design Specification

Google Stitch design guide for building a visually-stunning academic peer-to-peer trading hub.

## 1. Brand Identity & Theme
A fusion of academic heritage (SRM colors) with advanced modern web styling. The theme feels professional, secure, yet vibrantly alive for college students.

## 2. Core Visual Guidelines

### A. Glassmorphism Architecture
- **Surfaces:** All container modules, product cards, and modals must use a translucent background (`rgba` with `0.45` to `0.7` opacity) combined with `backdrop-filter: blur(16px)`.
- **Borders:** Thin, high-contrast borders (`1px solid rgba(255, 255, 255, 0.08)` for dark, `rgba(255, 255, 255, 0.4)` for light) to define clean structures without visual noise.
- **Shadows:** Soft, spreading drop shadows (`0 8px 32px 0 rgba(31, 38, 135, 0.06)` for light, `0 8px 32px 0 rgba(0, 0, 0, 0.35)` for dark) to add depth layers.

### B. Micro-Animations & Dynamic Feedback
- **Scaling:** Any interactive element (cards, tabs, buttons) must scale up slightly (`transform: translateY(-2px) scale(1.015)`) on hover.
- **Focus Rings:** Form fields must glow with `var(--accent-color)` or `var(--primary-color)` using box-shadow on focus.
- **Transitions:** Every CSS property transition should use a smooth bezier curve: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.

### C. Typography Contrast
- **Titles:** Heavy, geometric, and clean using the **Outfit** font family (weight 700 to 900).
- **Body & Metadata:** Highly legible, clean sans-serif using the **Inter** font family. Keep letter spacing tight.
