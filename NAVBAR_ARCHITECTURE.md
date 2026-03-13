# 📐 Dashboard Architecture - Navbar Terpisah

## Struktur Organisasi

### Folder Components
```
src/components/
├── Navbar.vue          ← Regular navbar (white, light theme)
└── ScadaNavbar.vue     ← SCADA navbar (dark, branded theme)
```

### Layout Structure
```
App.vue (Main Layout)
├── Navbar.vue (if not SCADA route)
└── router-view
    ├── HomeView.vue
    ├── ProductionReportView.vue
    ├── HumanResourcesView.vue
    └── SCADADashboardView.vue
        ├── ScadaNavbar.vue (embedded)
        └── Dashboard content
```

---

## Navbar Components

### 1. **Navbar.vue** (Regular Dashboard Navbar)

**Styling:**
- Background: White (#ffffff)
- Borders: Light shadow
- Icons: Material Design
- Text colors: Purple & Gray

**Content:**
- Dashboard home icon + logo
- Navigation links:
  - Home (/)
  - SCADA (/scada)
  - Laporan (/reports)
  - Human Resources (/hr)

**Responsive:**
- Hidden on mobile (sm: breakpoint)
- Full navigation on desktop

---

### 2. **ScadaNavbar.vue** (SCADA Dedicated Navbar)

**Styling:**
- Background: Gradient dark (slate-800 → slate-900)
- Borders: Bottom border with slate-700
- Theme: Dark mode, professional
- Animation: Online status pulse

**Content:**
- SCADA branded logo + title
- Subtitle: "Pengolahan Pakan Ternak"
- Navigation links (SCADA-focused):
  - Home (/)
  - Monitoring (/scada) - *highlighted*
  - Reports (/reports)
- Status indicator: ONLINE (green pulse)

**Sticky Position:**
- `sticky top-0 z-50` - Stays at top while scrolling
- Professional appearance

---

## Route Configuration

### App.vue Logic

```javascript
const route = useRoute()
const isSCADARoute = (path) => path === '/scada'
```

**Conditional Rendering:**
- If route is `/scada` → Show ScadaNavbar (embedded in SCADA view)
- All other routes → Show Navbar (in App.vue)

---

## Advantages of This Structure

### ✅ Separation of Concerns
- Each navbar is independent
- Easy to modify without affecting others
- Clear visual identity

### ✅ No Visual Confusion
- SCADA dashboard has its own branded navbar
- Regular dashboards use standard navbar
- Users immediately know which section they're in

### ✅ Flexible Styling
- Navbar.vue: Light, minimal, professional
- ScadaNavbar.vue: Dark, branded, industrial
- Easy to customize each independently

### ✅ Better Organization
- Components folder contains reusable components
- Views folder contains page layouts
- Clear hierarchy

### ✅ Sticky Navigation
- ScadaNavbar stays at top while scrolling
- Important for long SCADA dashboards
- z-index managed properly

---

## Navigation Flow

```
/ (Home)
  └─ Navbar.vue

/scada (SCADA Dashboard)
  └─ SCADADashboardView
     └─ ScadaNavbar.vue

/reports (Production Report)
  └─ Navbar.vue

/hr (Human Resources)
  └─ Navbar.vue
```

---

## Styling Hierarchy

### Navbar.vue (Light Theme)
```
- Background: bg-white
- Text: text-gray-800 (default), text-gray-500 (inactive)
- Active: border-purple-500, text-gray-900
- Shadow: shadow-md
```

### ScadaNavbar.vue (Dark Theme)
```
- Background: gradient-to-r from-slate-800 to-slate-900
- Text: text-white, text-gray-400 (inactive)
- Active: border-cyan-500, text-cyan-400
- Border: border-slate-700
- Shadow: shadow-lg
```

---

## Component Props & Events

### Navbar.vue
- **No props** - Uses useRoute() for navigation
- **No emits** - Navigation handled by RouterLink

### ScadaNavbar.vue
- **No props** - Uses useRoute() for navigation
- **No emits** - Navigation handled by RouterLink
- **Auto-active**: Cyan highlight on /scada route

---

## Icon Usage

### Material Icons
Both navbars use Material Symbols Outlined:
- `home` - Home link
- `build` - SCADA/Monitoring
- `radar` - Alternative SCADA icon
- `assessment` - Reports
- `groups` - Human Resources
- `check_circle` - Status indicator

---

## Responsive Behavior

### Desktop (sm breakpoint and up)
- Full navigation visible
- Horizontal layout
- Logo + text displayed

### Mobile (below sm)
- Navigation hidden (add burger menu if needed)
- Logo still visible
- Can extend with mobile menu

---

## Future Enhancements

### Potential Improvements
1. **Mobile Menu** - Hamburger menu for mobile
2. **User Profile** - Add user menu in navbar
3. **Notifications** - Alert bell icon
4. **Search** - Search functionality
5. **Dark Mode Toggle** - For Navbar.vue
6. **Breadcrumbs** - Show current path
7. **Settings** - Settings dropdown
8. **Logout** - User logout button

---

## File References

### Files Modified
- `src/App.vue` - Conditional navbar rendering
- `src/components/Navbar.vue` - NEW: Regular navbar
- `src/components/ScadaNavbar.vue` - NEW: SCADA navbar
- `src/views/SCADADashboardView.vue` - Embedded ScadaNavbar

### No Breaking Changes
- All existing functionality maintained
- All routes still work properly
- Fully backward compatible

---

## How to Extend

### Add New Route with Custom Navbar

1. Create new navbar component:
```vue
<!-- src/components/CustomNavbar.vue -->
<template>
  <!-- Your custom navbar -->
</template>
```

2. Update App.vue logic:
```javascript
const isCustomRoute = (path) => path === '/custom'
```

3. Add to template:
```vue
<CustomNavbar v-if="isCustomRoute(route.path)" />
```

4. Add navbar to view or App.vue

---

## Testing Checklist

- [x] Navbar.vue displays on / route
- [x] Navbar.vue displays on /reports route
- [x] Navbar.vue displays on /hr route
- [x] ScadaNavbar.vue displays on /scada route
- [x] Active link highlighting works
- [x] Navigation links functional
- [x] Responsive design works
- [x] No styling conflicts
- [x] Z-index properly managed

---

**Last Updated:** 27 January 2026
**Status:** ✅ Complete and tested
