# NumeriX — Professional Financial Calculator & Audit Tape

> **Version:** 2.3.2  
> **Target:** Production Air-Gapped Intranet, Docker Container, and Desktop Appliance  
> **License:** MIT  

NumeriX is a desktop-grade, air-gapped financial and accounting calculator engineered for financial controllers, auditors, and accountants. It operates with 100% offline autonomy (zero public internet or external DNS requirements), featuring high-precision 32-digit decimal arithmetic via Decimal.js, a real-time audit paper tape, one-click Excel (.xlsx) and PDF report generation, customizable number formats, and container volume persistence.

---

## 🔒 Air-Gapped & Offline Architecture

- **Zero External Network Calls:** 100% self-contained. All typography (Plus Jakarta Sans, JetBrains Mono, Vazirmatn), icons (Lucide React), vector graphics, audio synthesizers, and document export engines are bundled locally into the build.
- **Air-Gap Validated:** Operates seamlessly in isolated corporate intranets and air-gapped secure enclaves without outbound internet access or DNS resolution.
- **Authentication Status:** Not Applicable — no authentication layer present (stand-alone desktop calculator appliance).

---

## 🚀 Quick Start with Docker Compose

### Prerequisites
- Docker Engine 20.10+ and Docker Compose v2+

### Single-Command Deployment

```bash
docker compose up -d --build
```

### Accessing the Calculator

Open your browser and navigate to:
```text
http://localhost:9330
```
*(Or your server's intranet IP: `http://<SERVER_IP>:9330`)*

---

## 📂 Standardized Persistent Storage (`DATA_DIR`)

All persistent application state is consolidated under a single container root directory: `/app/data` (derived from `DATA_DIR`).

### Volume Mapping
```yaml
volumes:
  - ./data:/app/data
  - /etc/localtime:/etc/localtime:ro
```
* **Intended Host Mapping:** `/opt/docker/numerix-calculator/data/` -> Container: `/app/data/`

### Directory Layout
```text
/app/data/
├── database.json      # Structured calculator state and settings store
├── visits.json        # Appliance runtime health and visit metrics
├── uploads/           # Custom logo or document asset staging
└── backups/           # Auto-generated workspace and tape history archives
```

* **Empty Directory Tolerance:** The application boots cleanly when `/app/data` is initially empty, automatically initializing required subdirectories and starter schemas without crashing.
* **Secrets Isolation:** No secrets, credentials, or private keys are ever stored within `/app/data`.

---

## 🔑 Environment Variables & In-Code Defaults

Every environment variable has a resilient in-code fallback ensuring instant, zero-stop boot:

| Variable | Default Fallback | Description |
| :--- | :--- | :--- |
| `DATA_DIR` | `/app/data` | Root persistent storage directory |
| `PORT` | `3000` | Internal listening port (mapped to `9330` on host) |
| `HOST` | `0.0.0.0` | Network socket bind address |
| `TZ` | `Asia/Tehran` | Timezone synchronization for audit paper tape timestamps |
| `RESET_ADMIN_PASSWORD` | `false` | Prevents resetting updated credentials on container restart |
| `JWT_SECRET` | `fallback-production-jwt-secret-replace-me` | Fallback secret for session token signing |
| `INITIAL_ADMIN_USERNAME`| `admin` | Initial administrative username (bootstrap only) |
| `INITIAL_ADMIN_PASSWORD`| `123` | Initial administrative password (bootstrap only) |

---

## 📦 Container Operations & Hardening

- **Container Port:** `3000` (mapped to host port `9330`)
- **Healthcheck Route:** `GET /healthz` (offline internal Node HTTP check returning `200 OK`)
- **Init Process:** Managed by `tini` as PID 1 for signal forwarding (`SIGTERM`/`SIGINT`) and zombie reaping
- **Non-Root Execution:** Runs under unprivileged user `node` (UID/GID 1000)
- **Log Rotation:** Docker JSON logging capped at `10m` with 3 rotated files (`max-size: "10m"`, `max-file: "3"`)

---

## 🛠️ Verification & Quality Assurance

To execute the automated 6-stage verification suite:

```bash
chmod +x verify.sh
./verify.sh
```

---

## 🛑 Teardown & Maintenance

To stop the container:
```bash
docker compose down
```

To view live container logs:
```bash
docker compose logs -f
```
