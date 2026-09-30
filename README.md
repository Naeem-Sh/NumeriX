# NumeriX — Professional Financial Calculator & Audit Tape

> **Version:** 2.3.1  
> **Target:** Production Air-Gapped Intranet, Docker Container, and Desktop Appliance  
> **License:** MIT  

NumeriX is a desktop-grade, air-gapped financial and accounting calculator engineered for financial controllers, auditors, and accountants. It operates with 100% offline autonomy (zero public internet or external DNS requirements), featuring high-precision 32-digit decimal arithmetic via Decimal.js, a real-time audit paper tape, one-click Excel (.xlsx) and PDF report generation, customizable number formats, and container volume persistence.

---

## 🔒 Air-Gapped & Offline Architecture

- **Zero External Network Calls:** 100% self-contained. All fonts (Plus Jakarta Sans, JetBrains Mono, Vazirmatn), icons, vector graphics, audio synthesizers, and export engines are bundled locally into the container build.
- **Air-Gap Validated:** Operates seamlessly in isolated corporate intranets and air-gapped secure enclaves without outbound internet access.
- **Persistent Storage:** All calculation history, settings, and workspace preferences persist inside the `/data/numerix` volume.

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

## 🔑 Administrative Defaults & Environment

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `ADMIN_USERNAME` | `admin` | Default administrative account username |
| `ADMIN_PASSWORD` | `123` | Default administrative account password |
| `PORT` | `3000` | Internal application listening port (mapped to `9330` on host) |
| `HOST` | `0.0.0.0` | Server bind host address |
| `TZ` | `Asia/Tehran` | Timezone synchronization for audit timestamps |
| `NUMERIX_DATA_DIR` | `/data/numerix` | Persistent volume path for calculation records |

---

## 📦 Container Specifications

- **Container Port:** `3000` (mapped to host port `9330` by default)
- **Healthcheck Route:** `GET /healthz` (returns `200 OK` with uptime JSON)
- **Volume Mount:** `numerix_data:/data/numerix` (named Docker volume)
- **Timezone Sync:** Synchronized with `/etc/localtime:ro`
- **Log Management:** Standard JSON logging limited to 10MB per file with 3 file rotation (`max-size: "10m"`, `max-file: "3"`)
- **Signal Handling:** Managed by `tini` init system for zero-data-loss graceful shutdowns (`SIGTERM` / `SIGINT`)

---

## 🛠️ Verification & Quality Assurance

To execute automated type check, bundle compilation, and air-gap sanity check:

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
