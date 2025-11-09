# AI TODO App - Design System & Style Guide

## Overview
This document defines the visual design, styling conventions, and UI patterns for the AI TODO App.

---

## 🎨 Design Philosophy

**Principles:**
- Clean and minimal
- Focus-driven (help users concentrate on tasks)
- Calm and not overwhelming
- Professional yet approachable
- Accessible and readable

---

## 🎨 Color Palette

### Primary Colors
```css
/* Purple/Blue - Main interactive elements */
--primary: oklch(0.5106 0.2301 276) /* Purple/Blue for primary actions */
--primary-foreground: oklch(1.0000 0 0) /* White text on primary */
```

### Secondary Colors
```css
/* Teal/Cyan - Secondary actions and accents */
--secondary: oklch(0.7038 0.1230 182) /* Teal/Cyan */
--secondary-foreground: oklch(1.0000 0 0) /* White text on secondary */
```

### Accent Colors
```css
/* Orange - Highlights and special elements */
--accent: oklch(0.7686 0.1647 70) /* Orange accent */
--accent-foreground: oklch(0 0 0) /* Black text on accent */
```

### Neutral/Background Colors
```css
/* Light mode backgrounds */
--background: oklch(0.9789 0.0082 121) /* Off-white main background */
--foreground: oklch(0 0 0) /* Black text */
--card: oklch(1.0000 0 0) /* Pure white cards */
--card-foreground: oklch(0 0 0) /* Black text on cards */
--popover: oklch(1.0000 0 0) /* White popovers */
--popover-foreground: oklch(0 0 0) /* Black text on popovers */
--muted: oklch(0.9551 0 0) /* Light gray for muted elements */
--muted-foreground: oklch(0.3211 0 0) /* Dark gray for muted text */
```

### Sidebar Colors
```css
--sidebar: oklch(0.9789 0.0082 121) /* Light gray sidebar */
--sidebar-foreground: oklch(0 0 0) /* Black text */
--sidebar-primary: oklch(0.5106 0.2301 276) /* Purple for active items */
--sidebar-primary-foreground: oklch(1.0000 0 0) /* White text */
--sidebar-accent: oklch(0.7686 0.1647 70) /* Orange accent */
--sidebar-accent-foreground: oklch(0 0 0) /* Black text */
--sidebar-border: oklch(0 0 0) /* Black border */
--sidebar-ring: oklch(0.7853 0.1041 274.7134) /* Purple focus ring */
```

### Chart Colors
```css
/* Data visualization colors */
--chart-1: oklch(0.5106 0.2301 276) /* Purple */
--chart-2: oklch(0.7038 0.1230 182) /* Teal */
--chart-3: oklch(0.7686 0.1647 70) /* Orange */
--chart-4: oklch(0.6559 0.2118 354) /* Pink/Magenta */
--chart-5: oklch(0.7227 0.1920 149.5793) /* Green */
```

### Semantic Colors
```css
/* Status indicators */
--success: oklch(0.7227 0.1920 149.5793) /* Green for completed */
--destructive: oklch(0.6368 0.2078 25) /* Red for errors/delete */
--destructive-foreground: oklch(1.0000 0 0) /* White on destructive */
```

### Border & Focus
```css
--border: oklch(0 0 0) /* Black borders */
--input: oklch(0.5555 0 0) /* Medium gray for inputs */
--ring: oklch(0.7853 0.1041 274.7134) /* Purple focus ring */
```

---

## 📐 Typography

### Font Families
```css
/* Modern, clean fonts */
--font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-serif: 'Source Serif 4', Georgia, serif
--font-mono: 'Geist Mono', 'Courier New', monospace
```

### Font Usage
- **Headings & UI:** Geist (Sans-serif) - Clean, modern
- **Long-form content:** Source Serif 4 (Serif) - Readable for body text
- **Code & Data:** Geist Mono (Monospace) - Technical content

### Font Sizes
```css
/* Tailwind default scale */
--text-xs: 0.75rem    /* 12px - Small labels, meta info */
--text-sm: 0.875rem   /* 14px - Secondary text, descriptions */
--text-base: 1rem     /* 16px - Body text, inputs */
--text-lg: 1.125rem   /* 18px - Subheadings */
--text-xl: 1.25rem    /* 20px - Card titles */
--text-2xl: 1.5rem    /* 24px - Section headings */
--text-3xl: 1.875rem  /* 30px - Page titles */
--text-4xl: 2.25rem   /* 36px - Hero text */
```

### Font Weights
```css
--font-regular: 400   /* Body text */
--font-medium: 500    /* Emphasis, labels */
--font-semibold: 600  /* Subheadings */
--font-bold: 700      /* Headings, important text */
```

---

## 📏 Spacing

### Base Spacing Scale
```css
/* To be defined based on screenshot */
--spacing-0: 0
--spacing-1: 0.25rem  /* 4px */
--spacing-2: 0.5rem   /* 8px */
--spacing-3: 0.75rem  /* 12px */
--spacing-4: 1rem     /* 16px */
--spacing-5: 1.25rem  /* 20px */
--spacing-6: 1.5rem   /* 24px */
--spacing-8: 2rem     /* 32px */
--spacing-10: 2.5rem  /* 40px */
--spacing-12: 3rem    /* 48px */
```

---

## 🔲 Components

### Buttons

#### Primary Button (Purple)
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-medium">
  Primary Action
</Button>
```
- Background: Purple `oklch(0.5106 0.2301 276)`
- Text: White
- Border radius: `0.5rem` (8px - rounded-lg)
- Padding: `1rem 1.5rem`
- Font: Medium weight

#### Secondary Button (Teal)
```tsx
<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-4 py-2 font-medium">
  Set Goal
</Button>
```
- Background: Teal `oklch(0.7038 0.1230 182)`
- Text: White
- Same styling as primary

#### Outline Button
```tsx
<Button variant="outline" className="border-2 border-border rounded-lg px-6 py-3">
  GitHub
</Button>
```
- Border: 2px black
- Background: White
- Border radius: `0.5rem` (8px)
- Large padding for social buttons

### Cards

```tsx
<Card className="rounded-xl border border-border bg-card p-6 shadow-sm">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">Move Goal</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Set your daily activity goal.
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Card Styling:**
- Border radius: `0.75rem` (12px - rounded-xl)
- Border: 1px black `oklch(0 0 0)`
- Background: White `oklch(1.0000 0 0)`
- Padding: `1.5rem` (24px - p-6)
- Shadow: Subtle shadow (shadow-sm)

### Input Fields

```tsx
<Input 
  type="email" 
  placeholder="m@example.com"
  className="rounded-lg border border-input bg-muted px-4 py-3"
/>
```

**Input Styling:**
- Border radius: `0.5rem` (8px - rounded-lg)
- Border: 1px gray `oklch(0.5555 0 0)`
- Background: Light gray `oklch(0.9551 0 0)`
- Padding: `0.75rem 1rem`
- Font: Base size

### Data Visualization

#### Line Charts
```tsx
// Use chart colors for data series
colors: {
  chart1: 'oklch(0.5106 0.2301 276)', // Purple
  chart2: 'oklch(0.7038 0.1230 182)', // Teal
  chart3: 'oklch(0.7686 0.1647 70)',  // Orange
  chart4: 'oklch(0.6559 0.2118 354)', // Pink
  chart5: 'oklch(0.7227 0.1920 149.5793)', // Green
}
```
- Line thickness: 2-3px
- Point size: 6-8px
- Smooth curves (bezier)
- Light grid lines

---

## 🎯 Layout Patterns

### Dashboard Layout
```
┌─────────────────────────────────────┐
│ Header (fixed, optional)            │
├──────┬──────────────────────────────┤
│      │                              │
│ Side │  Main Content Area           │
│ bar  │  - Grid of cards             │
│      │  - White background          │
│      │  - Rounded corners           │
└──────┴──────────────────────────────┘
```

**Layout Specifications:**
- Main background: `oklch(0.9789 0.0082 121)` (light gray)
- Sidebar background: Same as main
- Content padding: `2rem` (32px)
- Card grid gap: `1.5rem` (24px)
- Max content width: Responsive (full width with padding)

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards here */}
</div>
```

### Responsive Breakpoints
```css
/* Tailwind default breakpoints */
--breakpoint-sm: 640px   /* Mobile landscape */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Large desktop */
--breakpoint-2xl: 1536px /* Extra large */
```

**Responsive Grid:**
- Mobile (< 640px): 1 column
- Tablet (640-1024px): 2 columns  
- Desktop (> 1024px): 3 columns

---

## 🎨 UI Patterns

### Revenue/Stats Card
```tsx
<Card className="rounded-xl border border-border bg-card p-6">
  <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
  <p className="text-4xl font-bold mt-2">$15,231.89</p>
  <p className="text-sm text-success mt-1">+20.1% from last month</p>
  {/* Chart */}
</Card>
```

### Goal Setting Card
```tsx
<Card className="rounded-xl border border-border bg-card p-6">
  <h2 className="text-xl font-semibold">Move Goal</h2>
  <p className="text-sm text-muted-foreground mt-1">Set your daily activity goal.</p>
  
  <div className="flex items-center justify-center gap-4 my-8">
    <button className="w-10 h-10 rounded-full border-2 border-border">−</button>
    <div className="text-center">
      <p className="text-5xl font-bold">350</p>
      <p className="text-xs text-muted-foreground uppercase">CALORIES/DAY</p>
    </div>
    <button className="w-10 h-10 rounded-full border-2 border-border">+</button>
  </div>
  
  <Button className="w-full bg-secondary text-white rounded-lg py-3">
    Set Goal
  </Button>
</Card>
```

### Chart Card (Exercise Minutes)
```tsx
<Card className="rounded-xl border border-border bg-card p-6">
  <h2 className="text-xl font-semibold">Exercise Minutes</h2>
  <p className="text-sm text-muted-foreground mt-1">
    Your exercise minutes are ahead of where you normally are.
  </p>
  {/* Line chart with multiple series */}
</Card>
```

### Status Badges
```tsx
// Completed tasks
<Badge className="bg-success text-white">Completed</Badge>

// In progress
<Badge className="bg-primary text-white">In Progress</Badge>

// Pending
<Badge className="bg-accent text-black">Pending</Badge>

// Blocked/Error
<Badge className="bg-destructive text-white">Blocked</Badge>
```

---

## 🌓 Dark Mode

### Support
- [x] Light mode (primary)
- [ ] Dark mode (not shown in reference)
- [ ] System preference toggle

**Note:** Current design is light mode optimized. Dark mode colors use oklch format which supports automatic dark mode conversion if needed in the future.

---

## ♿ Accessibility

### Requirements
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Focus indicators visible on all interactive elements
- Keyboard navigation supported
- Screen reader friendly labels

---

## 📸 Reference Screenshots

### Color Palette Reference
![Color Palette](./design-assets/color-palette.png)

### UI Components Preview
![UI Components](./design-assets/ui-components-preview.png)

### Typography & Fonts
![Typography](./design-assets/typography-reference.png)

**Key Design Elements Captured:**
- ✅ Clean, minimal aesthetic
- ✅ Rounded corners (8-12px)
- ✅ Subtle shadows
- ✅ Purple/Teal/Orange color scheme
- ✅ Modern sans-serif typography (Geist)
- ✅ Card-based layout
- ✅ Data visualization with clean charts
- ✅ White cards on light gray background

---

## 🎨 Figma/Design Files

Link: [To be added if available]

---

## 🔄 Implementation Guidelines

### For AI Agents:
1. **Always reference this design system** when creating new components
2. **Use existing components** from `/components/ui/` when available
3. **Follow Tailwind CSS conventions** as defined here
4. **Maintain consistency** with existing pages
5. **Update this document** if you introduce new patterns

### Component Creation Checklist:
- [ ] Matches color palette
- [ ] Uses defined spacing scale
- [ ] Follows typography rules
- [ ] Includes hover/active/focus states
- [ ] Mobile responsive
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Consistent with existing components

---

## 📝 Change Log

| Date | Change | By |
|------|--------|-----|
| 2025-11-09 | Initial design system created | User |
| 2025-11-09 | Colors extracted from reference screenshots | AI Agent |
| 2025-11-09 | Typography defined (Geist, Source Serif 4, Geist Mono) | AI Agent |
| 2025-11-09 | Component styles documented | AI Agent |
| 2025-11-09 | Layout patterns and UI patterns added | AI Agent |

**Design Language:** Clean, minimal, modern with purple/teal/orange accent colors. Card-based UI with rounded corners and subtle shadows.

---

## 📚 Related Documentation

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

