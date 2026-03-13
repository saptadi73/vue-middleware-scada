# Dashboard Pengolahan Pakan Ternak - Dokumentasi

## 📊 Fitur yang Telah Dibuat

### 1. **Dashboard SCADA** (`/scada`)
Halaman monitoring real-time sistem pengolahan pakan ternak dengan tampilan modern dan elegan.

#### Komponen:
- **Top Stats Cards** (4 KPI utama):
  - Produksi Hari Ini (Ton)
  - Batch Selesai
  - Kualitas OK (%)
  - Batch Aktif dengan Progress Bar

- **Charts**:
  - Trend Proses (Temperature & Motor Current)
  - Tren Deviasi Kualitas

- **Data Monitoring**:
  - Tabel Material Batch dengan Detail Konsumsi
  - Status Inventory per Silo
  - Alarm Aktif (High, Medium, Low severity)
  - Panel Kontrol (Start/Pause/Abort Batch)

#### Data Sources:
- `DashboardScada.json` - Status pabrik & produksi
- `DashboardBatching.json` - Data batch aktif
- `DashboardKualitasKPI.json` - Metrik kualitas
- `DashboardAlarm.json` - Daftar alarm
- `DashboardTrend.json` - Trend proses
- `DashboardInventory.json` - Status stok material
- `DashboardControl.json` - Action buttons

---

### 2. **Laporan Produksi** (`/reports`)
Halaman analisis komprehensif dengan view mingguan dan bulanan.

#### Fitur:
- **Toggle View**: Pilih antara laporan Mingguan atau Bulanan
- **Export Excel**: Download data dalam format .xlsx dengan multiple sheets
- **Print Report**: Cetak laporan dengan format profesional

#### Sheets Excel yang Dihasilkan:
1. **Summary** - KPI ringkas
2. **Produksi** - Detail harian/mingguan
3. **Konsumsi Material** - Per silo consumption analysis
4. **Resep** - Breakdown produksi per recipe

#### Dashboard Charts:
- **Production Chart**: Bar chart produksi vs target
- **Material Consumption**: Konsumsi material per silo
- **Recipe Distribution**: Pie chart distribusi recipe
- **Cost Analysis** (Monthly only): 
  - Total cost breakdown
  - Cost per material dengan percentage

#### Detail Tables:
- Daily/Weekly production dengan quality metrics
- Material consumption detail per silo
- Recipe breakdown
- Cost analysis (untuk monthly)

#### Data Sources:
- `ProductionReportWeekly.json` - Data mingguan
- `ProductionReportMonthly.json` - Data bulanan

---

## 🎨 Design & UI Features

### Color Scheme:
- **Background**: Gradient dari slate-900 hingga slate-800
- **Accent Colors**: 
  - Cyan/Blue: Primary actions & production
  - Purple: Batches & secondary
  - Green: Quality & positive
  - Orange/Red: Warnings & downtime
  - Emerald/Teal: Reports

### Interactive Elements:
- ✨ Gradient backgrounds dan hover effects
- 📊 Real-time charts dengan ApexCharts
- 🎯 Progress bars dengan animasi
- 📱 Responsive grid layout
- 🔔 Status indicators dengan pulse animation

---

## 📁 File Structure

```
src/
├── views/
│   ├── SCADADashboardView.vue          # Dashboard SCADA
│   ├── ProductionReportView.vue        # Laporan Produksi
│   ├── HomeView.vue                    # Dashboard awal
│   └── HumanResourcesView.vue
├── assets/
│   └── data/
│       ├── DashboardScada.json
│       ├── DashboardBatching.json
│       ├── DashboardKualitasKPI.json
│       ├── DashboardAlarm.json
│       ├── DashboardTrend.json
│       ├── DashboardInventory.json
│       ├── DashboardControl.json
│       ├── ProductionReportWeekly.json
│       └── ProductionReportMonthly.json
├── router/
│   └── index.js                        # Updated dengan routes baru
└── App.vue                             # Updated dengan navbar links
```

---

## 🚀 Cara Menggunakan

### Development:
```bash
npm install
npm run dev
```

### Build:
```bash
npm run build
```

### Export ke Excel:
1. Buka halaman Laporan (`/reports`)
2. Pilih Mingguan atau Bulanan
3. Klik "Export Excel"
4. File akan otomatis didownload

---

## 📦 Dependencies

Tambahan yang diinstall:
- **xlsx** ^0.18.5 - Untuk export Excel
- **apexcharts** - Untuk chart visualization
- **vue3-apexcharts** - Vue wrapper untuk ApexCharts

---

## 🔧 Customization

### Menambah Chart Baru:
Edit `trendChartOptions`, `consumptionChartOptions`, atau `recipeChartOptions` di dalam component.

### Mengubah Colors:
Semua color scheme menggunakan Tailwind classes yang bisa dimodifikasi.

### Update Data:
Update JSON files di `src/assets/data/` dan data akan otomatis reflect di charts.

---

## ✅ Checklist Fitur

- [x] Dashboard SCADA dengan real-time monitoring
- [x] 7 dummy JSON data files
- [x] Halaman Laporan Produksi Mingguan
- [x] Halaman Laporan Produksi Bulanan
- [x] Chart untuk konsumsi raw material per silo
- [x] Export ke Excel dengan multiple sheets
- [x] Print functionality
- [x] Responsive design
- [x] Modern UI dengan gradients & animations
- [x] Navigation di App.vue

---

## 📝 Notes

- Semua charts menggunakan ApexCharts untuk interaktivitas tinggi
- Data dummy dapat diganti dengan API integration
- Excel export otomatis menggunakan XLSX library
- Responsive design tested untuk mobile, tablet, dan desktop
