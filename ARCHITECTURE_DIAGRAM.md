# 🎯 Dashboard Architecture Overview

## Complete Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     App.vue (Main Layout)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─ Conditional Rendering ─────────────────────────────┐   │
│  │                                                      │   │
│  │  If route !== '/scada':                             │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │   Navbar.vue (Light Theme - White BG)       │   │   │
│  │  │  ┌──────────────────────────────────────┐   │   │   │
│  │  │  │ 📊 PM Dashboard                      │   │   │   │
│  │  │  │ [Home] [SCADA] [Laporan] [HR]        │   │   │   │
│  │  │  └──────────────────────────────────────┘   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  If route === '/scada': (NAVBAR IN VIEW ONLY)       │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         <router-view />  (Page Content)              │   │
│  │                                                      │   │
│  │  ┌─ HomeView.vue ────────────────────────────────┐  │   │
│  │  │ Navbar.vue ↑ (from App.vue)                  │  │   │
│  │  │ [Dashboard Content]                          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌─ ProductionReportView.vue ────────────────────┐  │   │
│  │  │ Navbar.vue ↑ (from App.vue)                  │  │   │
│  │  │ [Report Content]                             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌─ SCADADashboardView.vue ──────────────────────┐  │   │
│  │  │ ┌────────────────────────────────────────────┐│  │   │
│  │  │ │ ScadaNavbar.vue (Dark Theme - Dark BG)   ││  │   │
│  │  │ │ ┌────────────────────────────────────┐    ││  │   │
│  │  │ │ │ 🔨 SCADA Dashboard               │    ││  │   │
│  │  │ │ │ [Home] [Monitoring] [Reports] 🟢 │    ││  │   │
│  │  │ │ │ Pengolahan Pakan Ternak         │    ││  │   │
│  │  │ │ └────────────────────────────────┘    ││  │   │
│  │  │ └────────────────────────────────────────────┘│  │   │
│  │  │ [SCADA Dashboard Content]                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌─ HumanResourcesView.vue ──────────────────────┐  │   │
│  │  │ Navbar.vue ↑ (from App.vue)                  │  │   │
│  │  │ [HR Content]                                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Route-to-Navbar Mapping

```
┌─────────────┬──────────────────────┬──────────────────────┐
│    Route    │      Navbar          │   Location           │
├─────────────┼──────────────────────┼──────────────────────┤
│ / (home)    │ Navbar.vue           │ App.vue              │
│             │ (light theme)        │ (conditional render) │
├─────────────┼──────────────────────┼──────────────────────┤
│ /scada      │ ScadaNavbar.vue      │ SCADADashboardView   │
│             │ (dark theme)         │ (embedded in view)   │
├─────────────┼──────────────────────┼──────────────────────┤
│ /reports    │ Navbar.vue           │ App.vue              │
│             │ (light theme)        │ (conditional render) │
├─────────────┼──────────────────────┼──────────────────────┤
│ /hr         │ Navbar.vue           │ App.vue              │
│             │ (light theme)        │ (conditional render) │
└─────────────┴──────────────────────┴──────────────────────┘
```

---

## Component Hierarchy

```
src/
├── App.vue
│   └── <Navbar v-if="!isSCADARoute()" />
│   └── <router-view />
│       ├── HomeView.vue
│       ├── ProductionReportView.vue
│       ├── HumanResourcesView.vue
│       └── SCADADashboardView.vue
│           └── <ScadaNavbar />
│           └── Dashboard content
│
├── components/
│   ├── Navbar.vue
│   │   └── Router links (Home, SCADA, Reports, HR)
│   │   └── Light theme styling
│   │
│   └── ScadaNavbar.vue
│       └── Router links (Home, Monitoring, Reports)
│       └── Dark theme styling
│       └── Status indicator
│
└── views/
    ├── HomeView.vue
    ├── ProductionReportView.vue
    ├── HumanResourcesView.vue
    └── SCADADashboardView.vue
```

---

## Styling Comparison

### Navbar.vue (Regular Navbar)
```
┌─────────────────────────────────────────────────┐
│  📊 PM Dashboard                                │
│  [Home] [SCADA] [Laporan] [HR]                  │
│                                                 │
│  Background: white (#ffffff)                    │
│  Text: gray-800 (active), gray-500 (inactive)   │
│  Border: bottom gray-200, top shadow            │
│  Border active: purple-500                      │
└─────────────────────────────────────────────────┘
```

### ScadaNavbar.vue (SCADA Navbar)
```
┌─────────────────────────────────────────────────┐
│  🔨 SCADA Dashboard  [Home] [Monitoring] [Rept]│
│  Pengolahan Pakan Ternak             🟢 ONLINE │
│                                                 │
│  Background: gradient slate-800→900             │
│  Text: gray-400 (inactive), white (default)     │
│  Border: bottom slate-700                       │
│  Border active: cyan-500                        │
│  Status: green pulse animation                  │
│  Position: sticky (stays at top)                │
└─────────────────────────────────────────────────┘
```

---

## Data Flow

```
User navigates to /scada
        ↓
Router updates route
        ↓
App.vue checks: isSCADARoute('/scada')?
        ↓ YES
Conditional render: v-if="!isSCADARoute"
        ↓ FALSE (don't render Navbar.vue)
<router-view /> renders SCADADashboardView
        ↓
SCADADashboardView imports ScadaNavbar
        ↓
ScadaNavbar displays with dark theme


User navigates to /reports
        ↓
Router updates route
        ↓
App.vue checks: isSCADARoute('/reports')?
        ↓ NO
Conditional render: v-if="!isSCADARoute"
        ↓ TRUE (render Navbar.vue)
Navbar.vue displays with light theme
<router-view /> renders ProductionReportView
```

---

## CSS Classes Used

### Navbar.vue
```css
/* Container */
bg-white shadow-md

/* Navigation */
text-gray-800 (default)
text-gray-500 (inactive)
border-transparent → border-purple-500 (active)
hover:border-gray-300 hover:text-gray-700
```

### ScadaNavbar.vue
```css
/* Container */
bg-gradient-to-r from-slate-800 to-slate-900
border-b border-slate-700
shadow-lg
sticky top-0 z-50

/* Navigation */
text-white (default)
text-gray-400 (inactive)
border-transparent → border-cyan-500 (active)
hover:text-gray-200

/* Status */
bg-green-500/20
border border-green-500/50
animate-pulse
```

---

## Responsive Breakpoints

### Mobile (< sm: 640px)
- Navigation hidden
- Logo visible
- Can add hamburger menu in future

### Tablet (sm - 1024px)
- Full navigation visible
- Optimized spacing

### Desktop (> lg: 1024px)
- Full navigation visible
- Maximum width container
- Optimal spacing

---

## Future Considerations

### Planned Features
1. Mobile hamburger menu
2. User profile dropdown
3. Notifications bell
4. Search functionality
5. Dark mode toggle
6. Breadcrumb navigation
7. Quick links
8. Language selector

### Architecture Ready For
- Additional custom navbars
- Themed navbar variants
- Navbar state management
- Multi-tenant layouts
- Whitelabeling

---

## Key Advantages

✅ **Clear Separation**
- SCADA has distinct visual identity
- No confusion between sections

✅ **Maintainability**
- Each navbar is independent
- Easy to update individually

✅ **Flexibility**
- Add new navbars easily
- Customize per route

✅ **Performance**
- Light component structure
- Conditional rendering optimizes load

✅ **User Experience**
- Visual cues for current section
- Consistent styling within section

---

**Version:** 1.0
**Last Updated:** 27 January 2026
**Status:** ✅ Production Ready
