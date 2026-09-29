<p align="center">
  <img src="./logo1.png" alt="NumeriX Logo" width="180">
</p>

# NumeriX — Professional Financial Calculator & Audit Tape

> **Version:** 2.3.0  
> **Target:** Modern Web, Desktop PWA, and Dockerized Self-Hosted Appliance  
> **Author:** N.Shaaeri (ShirazOffice)

A desktop-grade financial and accounting calculator application tailored for accountants, auditors, financial controllers, and office professionals. Designed for high precision, keyboard ergonomics, 32-digit decimal mathematics (`Decimal.js`), real-time 20-line paper audit tape, one-click Excel `.xlsx` and PDF report generation, analog clock, and resilient persistent storage.

---

## 🌟 Key Features

- **High-Precision Decimal Engine**: 32-digit floating-point error-free calculations via `Decimal.js` (eliminates JavaScript `0.1 + 0.2` rounding inaccuracies).
- **20-Line Paper Tape / Audit History**: Real-time record of all mathematical expressions, timestamps, operations, and intermediate results. Supports line reuse, single-item copying, and clearing.
- **Configurable 3-Digit Number Formatting**:
  - `1,234,567.89` (Standard US/UK/International)
  - `1.234.567,89` (European / Latin)
  - `1 234 567.89` (International SI)
  - `1'234'567.89` (Swiss Accounting)
- **Decimal Precision Controls**: Instant `DEC −` and `DEC +` buttons to adjust precision dynamically (0 to 8 decimal places).
- **Accounting & Tax Functions**:
  - `TAX+` (Add tax percentage)
  - `TAX−` (Extract pre-tax net amount from gross)
  - `MU%` (Markup on cost)
  - `MAR%` (Gross margin selling price)
  - `DISC` (Discount percentage)
  - Memory Registers (`MC`, `MR`, `M+`, `M−`, `MS`) with on-display indicator `[M = ...]`
  - Grand Total (`GT`) and Subtotal (`ST`)
- **Excel & Spreadsheet Integration**:
  - One-click client-side export to formatted Excel `.xlsx` workbook with columnar metadata and summary statistics.
  - **Copy for Excel (TSV)**: Paste directly into Excel columns with `Ctrl+V`.
  - **Raw # Copy**: Copy unformatted numbers without commas for formula pasting.
- **Accountant-Grade PDF Audit Reports**: Print-ready PDF reports with organization branding, date/time, structured audit table, and official sign-off footer.
- **Resilient Persistent Storage (Outside Project Directory)**: All tape history, custom branding, and settings automatically synchronize to safe storage (`~/.numerix` or Docker volume) so data is never lost on application updates or deletions.
- **Progressive Web App (PWA)**: Installable as a native desktop or mobile application with full offline support.

---

## 🚀 Docker Deployment

The application is completely containerized with a production multi-stage Alpine Node.js container.

### Option A: Using Docker Compose (Recommended)

1. **Start the application**:
   ```bash
   docker compose up -d --build
   ```

2. **Access in browser**:
   ```text
   http://localhost:9330
   ```
   *(Or on your server: `http://<SERVER_IP>:9330`)*

3. **Stop the container**:
   ```bash
   docker compose down
   ```

> **Data Persistence**: Docker Compose automatically provisions a persistent named volume (`numerix_data_persistent` mapped to `/data/numerix`). All calculations, paper tape records, and settings remain safe across container teardowns, rebuilds, and updates.

### Option B: Using Docker CLI

1. **Build the image**:
   ```bash
   docker build -t numerix-calculator:2.3.0 .
   ```

2. **Run container with persistent volume**:
   ```bash
   docker run -d \
     --name numerix-calculator \
     -p 9330:3000 \
     -v numerix_data:/data/numerix \
     --restart unless-stopped \
     numerix-calculator:2.3.0
   ```

3. **Check container health**:
   ```bash
   docker ps
   ```

### Custom Port Configuration

To bind the calculator to a different host port (e.g. `8080` instead of `9330`):
```bash
PORT=8080 docker compose up -d
```

---

## 📦 How to Push to GitHub

Follow these steps to send this project to a new or existing GitHub repository:

### Step 1: Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "feat: release NumeriX v2.3.0 production ready"
```

### Step 2: Link to Your GitHub Repository
Replace `<YOUR_USERNAME>` and `<REPO_NAME>` with your GitHub information:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
git branch -M main
```

### Step 3: Push to GitHub
```bash
git push -u origin main
```

### Step 4: Create a Release Tag (Optional)
The included GitHub Actions workflow (`.github/workflows/release.yml`) automatically generates a GitHub Release whenever you push a version tag:
```bash
git tag v2.3.0
git push origin v2.3.0
```

---

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 20+
- npm 10+

### Steps
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

---

## ⌨️ Keyboard Shortcuts Cheatsheet

| Key / Shortcut | Action |
|---|---|
| `0 – 9`, `.` | Enter digits and decimal point |
| `+`, `−`, `*`, `/` | Basic arithmetic operators |
| `Enter` or `=` | Execute calculation & record to tape |
| `Escape` | **AC** (All Clear) – Reset calculation |
| `Delete` | **CE** (Clear Entry) – Clear current input |
| `Backspace` | Erase last typed character |
| `%` | Calculate percentage |
| `(`, `)` | Parentheses for nested order of operations |
| `[` / `]` | Decrease / Increase decimal places (`DEC −` / `DEC +`) |
| `T` | **TAX+** (Add configured Tax %) |
| `Shift + T` | **TAX−** (Deduct Tax % from Gross) |
| `M` / `Shift + M` | **M+** (Memory Add) / **M−** (Memory Subtract) |
| `R` | **MR** (Memory Recall) |
| `C` | **MC** (Memory Clear) |
| `G` | **GT** (Grand Total) |
| `S` | **ST** (Subtotal) |
| `F1` or `?` | Open Help & Keyboard Guide |

---

## 🏢 Organization & License

- **Organization**: ShirazOffice
- **Developer / Author**: N.Shaaeri
- **License**: MIT
