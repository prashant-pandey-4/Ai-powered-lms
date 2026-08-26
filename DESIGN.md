---
name: SkillUP LMS
description: Modern Matte Dark & Electric Lime AI-Powered Learning Management System
colors:
  primary: "#d4f76d"
  primary-hover: "#c4ea5c"
  canvas: "#0d0d10"
  surface: "#16161a"
  surface-hover: "#1c1c22"
  border: "#23232a"
  text-primary: "#ffffff"
  text-muted: "#8e8e9c"
  accent-peach: "#f9d8b9"
  accent-blue: "#bfe2ff"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: SkillUP LMS

## Overview

**Creative North Star: "The Modern Engineering Studio"**

SkillUP uses a focused matte dark canvas paired with high-contrast electric lime accents (`#d4f76d`) for high-utility learning, uninterrupted code comprehension, and instant AI doubt solving. The aesthetic draws inspiration from modern developer toolkits (Linear, Raycast) with restrained elevation, crisp border geometry, and zero frivolous decoration.

**Key Characteristics:**
- Deep matte charcoal foundation (`#0d0d10`) that eliminates eye fatigue during multi-hour technical study sessions.
- Purposeful high-contrast active highlights (`#d4f76d`) used strictly for active tabs, completion milestones, and primary user actions.
- Clear structural division between navigation, lecture playback, course syllabus, and real-time AI assistance.

## Colors

A deliberate technical palette built on charcoal depth, dark surface layering, and vibrant functional highlights.

### Primary
- **Electric Lime** (`#d4f76d`): Reserved for primary call-to-action buttons, active navigation states, lesson completion checkmarks, and video progress rings.

### Neutral
- **Canvas Base** (`#0d0d10`): Root application background.
- **Card Surface** (`#16161a`): Content panels, video containers, and list containers.
- **Elevated Hover Surface** (`#1c1c22`): Interactive card hover states and elevated chips.
- **Structural Border** (`#23232a`): 1px hairline dividers and bounding boxes.
- **Text High-Contrast** (`#ffffff`): Course titles, headings, and key numeric metrics.
- **Text Muted** (`#8e8e9c`): Body explanations, metadata labels, and timestamps.

### Secondary Functional
- **Warm Peach** (`#f9d8b9`): Secondary task cards and deadline highlights.
- **Ice Blue** (`#bfe2ff`): Analytics metrics and certificate achievements.

### Named Rules
**The Restrained Accent Rule.** Electric lime is never used for generic container backgrounds or decorative borders; it is strictly an active state or primary action trigger.

## Typography

**Display & Body Font:** Apple System / Inter / Roboto clean sans-serif stack.

### Hierarchy
- **Display** (Bold 700, 24px - 32px, 1.2 line-height): Top bar headers, course titles.
- **Headline** (Bold 700, 16px - 20px, 1.3 line-height): Card headers, syllabus module titles.
- **Body** (Regular 400, 12px - 14px, 1.5 line-height): Lesson descriptions, AI explanations.
- **Meta / Label** (Medium 500/600, 10px - 11px, uppercase/tabular): Video duration tags, lesson counts.

## Layout

- **Fixed Sidebar**: 256px (`w-64`) desktop navigation rail fixed to the left viewport.
- **Top Header**: 80px (`h-20`) sticky bar with title, capsule search, and user auth status.
- **Split View Learning Studio**: 8-column video & notes feed paired with 4-column dockable playlist & AI tutor panel.
- **Spacing Grid**: 4px base increment, standardized on 8px, 16px, 20px, 24px padding units.

## Elevation & Depth

Surfaces rely on tonal layering rather than heavy drop shadows. Depth is communicated via `1px solid #23232a` borders and subtle background shifts from `#0d0d10` (canvas) to `#16161a` (card) to `#1c1c22` (hover/interactive).

## Shapes

- **Containers & Cards**: 16px (`rounded-2xl`) for main module cards and video wrapper.
- **Inputs & Search**: Full capsule (`rounded-full`) for search bars and primary pills.
- **Action Buttons**: Full capsule (`rounded-full`) or 12px (`rounded-xl`).
- **Icons & Mini Avatars**: 8px - 10px (`rounded-lg` / `rounded-full`).

## Components

### Buttons
- **Primary**: Full capsule (`rounded-full`), `#d4f76d` background with black bold text (`#000000`), hover background `#c4ea5c`.
- **Secondary / Ghost**: Dark surface (`#16161a`), border `#23232a`, text `#ffffff`, hover border `#d4f76d`.

### Cards & Modules
- **Surface**: Background `#16161a`, border `1px solid #23232a`, padding `20px`, corner radius `16px`.
- **Hover**: Subtle `-translate-y-1` lift with border `#34343d`.

### Search Input
- **Capsule**: Height `44px`, background `#16161a`, border `#23232a`, text `#ffffff`, placeholder `#6c6c7a`, focus border `#d4f76d`.

## Do's and Don'ts

### Do:
- **Do** maintain high text contrast (pure white headers, `#8e8e9c` descriptions on `#16161a` cards).
- **Do** preserve 16px corner radius for course cards and video players.
- **Do** keep AI chat grounded in specific lecture context.

### Don'ts:
- **Don't** use arbitrary purple/indigo gradients or generic glowing blurs.
- **Don't** use loud neon colors across entire card surfaces.
- **Don't** use generic stock photos with smiling faces; use real video frames or domain-specific diagrams.
