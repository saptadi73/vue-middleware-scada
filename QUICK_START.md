# 🚀 Quick Start Guide - Dashboard Pakan Ternak

## Instalasi & Setup (2 Menit)

```bash
# 1. Navigate ke project
cd e:\projek_b\vue-dashboard-project

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Browser akan otomatis membuka di `http://localhost:5173`

---

## 🗺️ Navigation Map

```
HOME (/)
├── Dashboard utama dengan Project Management metrics
│
├── SCADA (/scada) ← NEW
│   ├── Real-time monitoring sistem pabrik
│   ├── Live charts & metrics
│   ├── Material & inventory tracking
│   ├── Alarm management
│   └── Control panel
│
├── Laporan (/reports) ← NEW
│   ├── Toggle: Mingguan / Bulanan
│   ├── Production analysis charts
│   ├── Material consumption per silo
│   ├── Recipe breakdown
│   ├── Cost analysis (bulanan)
│   ├── Export Excel button
│   └── Print button
│
└── Human Resources (/hr)
    └── HR metrics & management
```

---

## 📊 Dashboard SCADA - Features

### Top Section
- **Plant Status**: RUNNING dengan pulse indicator
- **Current Time**: Real-time clock (update setiap 1 detik)

### KPI Cards (4 metrics)
```
┌─────────────────┬──────────────────┬─────────────┬────────────────┐
│  Produksi Hari  │  Batch Selesai   │  Kualitas   │  Batch Aktif   │
│     95.4 Ton    │   18 / 22        │   94.2 %    │  62% Progress  │
└─────────────────┴──────────────────┴─────────────┴────────────────┘
```

### Charts
1. **Trend Proses** - Temperature & Motor Current over time
2. **Tren Deviasi Kualitas** - Quality deviation per batch

### Data Sections
1. **Material Table** - Current batch materials status
2. **Inventory Status** - Silo levels untuk 4 materials
3. **Active Alarms** - Real-time alerts (HIGH/MEDIUM/LOW)
4. **Control Panel** - Start/Pause/Abort buttons

---

## 📈 Production Report - Features

### Header Controls
```
┌──────────────────────────────────────────┐
│ [● Mingguan] [○ Bulanan] [Export] [Print]│
└──────────────────────────────────────────┘
```

### Summary Cards
- Total Production (Ton)
- Total Batches
- Quality OK (%)
- Downtime (Hours)

### Charts (4 Total)
1. **Production Chart** - Bar chart Produksi vs Target
2. **Material Consumption** - Konsumsi per material
3. **Recipe Distribution** - Pie chart recipe breakdown
4. **Cost Analysis** - Donut chart cost breakdown (monthly only)

### Tables
1. **Production Detail** - Daily/Weekly breakdown
2. **Material Consumption** - Stock flow per silo
3. **Recipe Breakdown** - Production per recipe
4. **Cost Analysis** - (Monthly only)

### Export Format
```
File: Laporan_Produksi_[Mingguan/Bulanan]_2026-01-27.xlsx

Sheets:
├── Summary (KPI overview)
├── Produksi (daily/weekly detail)
├── Konsumsi Material (per silo)
└── Resep (recipe breakdown)
```

---

## 🎯 Key Features

### Real-time Monitoring
- Clock updates every second
- Live status indicators
- Pulse animations
- Dynamic progress bars

### Interactive Charts
- Hover tooltips
- Color-coded data
- Responsive sizing
- Dark mode theme

### Data Export
- Multi-sheet Excel
- Professional formatting
- Complete data capture
- One-click download

### Print Support
- Browser print-friendly
- Professional layout
- All data included
- Media queries optimized

---

## 🔧 Customization Guide

### Mengubah Data
Edit file JSON di `src/assets/data/`:
```javascript
// Example: DashboardScada.json
{
  "dashboard": "overview",
  "widgets": [
    {
      "id": "production_today",
      "label": "Production Today (Ton)",
      "target": 120,
      "actual": 95.4,  // ← Ubah nilai ini
      "achievement_percent": 79.5
    }
  ]
}
```

### Mengubah Colors
Edit Tailwind classes di component:
```vue
<!-- Change dari cyan ke pink -->
<div class="bg-gradient-to-r from-cyan-500 to-blue-500">
  <!-- Ubah menjadi: -->
  <div class="bg-gradient-to-r from-pink-500 to-rose-500">
```

### Menambah Chart Baru
1. Tambah series data di computed
2. Buat chartOptions baru
3. Tambah `<apexchart>` component

### Integration dengan API
```javascript
// Ganti import static JSON dengan API call:
import { ref, onMounted } from 'vue'

const scadaData = ref(null)

onMounted(async () => {
  const response = await fetch('/api/scada')
  scadaData.value = await response.json()
})
```

---

## 📦 Project Structure

```
vue-dashboard-project/
├── src/
│   ├── views/
│   │   ├── SCADADashboardView.vue      (550 lines)
│   │   ├── ProductionReportView.vue    (500 lines)
│   │   ├── HomeView.vue
│   │   └── HumanResourcesView.vue
│   ├── assets/
│   │   └── data/
│   │       ├── Dashboard*.json         (7 files)
│   │       ├── ProductionReport*.json  (2 files)
│   │       └── ...
│   ├── router/
│   │   └── index.js                    (Updated)
│   ├── App.vue                         (Updated)
│   └── main.js
├── package.json                        (Updated with xlsx)
├── vite.config.js
├── index.html
└── ...
```

---

## 💡 Usage Examples

### Export ke Excel
```
1. Open http://localhost:5173/reports
2. Select "Mingguan" atau "Bulanan"
3. Click "Export Excel"
4. File "Laporan_Produksi_Mingguan_2026-01-27.xlsx" di-download
5. Open di Excel atau Google Sheets
```

### Monitor Real-time
```
1. Open http://localhost:5173/scada
2. View live metrics dan charts
3. Check inventory levels
4. Monitor active alarms
5. Control batch process
```

### Print Report
```
1. Open http://localhost:5173/reports
2. Click "Print"
3. Select printer dalam print dialog
4. PDF akan generated dengan proper formatting
```

---

## 🐛 Troubleshooting

### Charts tidak muncul
- Install dependencies: `npm install`
- Restart dev server: `npm run dev`
- Clear browser cache: Ctrl+Shift+Delete

### Export Excel error
- Check nodejs version: `node --version` (need ^20.19.0)
- Reinstall xlsx: `npm install xlsx --save`

### Data tidak update
- Check JSON file di `src/assets/data/`
- Verify syntax valid JSON
- Reload browser page

### Print hasil jelek
- Use Chrome/Edge (better print support)
- Adjust print margins
- Test print preview dulu

---

## 📊 Data Dictionary

### DashboardScada.json
```
- plant_status: Status pabrik (RUNNING/STOPPED)
- production_today: Produksi hari ini
- batch_progress: Batch selesai vs total
```

### ProductionReportWeekly.json
```
- summary: KPI mingguan
- daily_data: 7 hari data
- material_consumption: Per material per silo
- recipe_breakdown: Produksi per recipe
```

### ProductionReportMonthly.json
```
- summary: KPI bulanan
- weekly_data: 4 minggu data
- material_consumption_monthly: Aggregated data
- cost_analysis: Biaya per material
```

---

## 🎨 Color System

| Usage | Color | Tailwind |
|-------|-------|----------|
| Primary | Cyan | #06b6d4 |
| Secondary | Purple | #a855f7 |
| Success | Green | #10b981 |
| Warning | Orange | #f97316 |
| Error | Red | #ef4444 |
| Background | Slate | #1e293b |

---

## 📞 Support

### Common Tasks
- **Add new metric**: Edit JSON + add card in template
- **Change layout**: Modify grid classes (grid-cols-*)
- **New chart type**: Use ApexCharts documentation
- **API integration**: Replace static imports dengan fetch calls

### Resources
- Vue 3 Docs: https://vuejs.org
- Tailwind CSS: https://tailwindcss.com
- ApexCharts: https://apexcharts.com
- XLSX: https://github.com/SheetJS/sheetjs

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-01-27
**Version**: 1.0
