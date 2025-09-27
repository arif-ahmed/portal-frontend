# 🚀 Portal Dev Setup — Quickstart & Reference

**Audience:** Candidates & contributors working on the branding-assets challenge for Eclipse Tractus‑X Portal.  
**Goal:** Get a reliable local environment for **portal-backend** (APIs) and **portal-frontend** (React) with minimal friction — then keep a full reference in the appendices.

---

## TL;DR (10‑Minute Setup)

1. **Fork & clone** three repos into a `Challenge` folder:

```bash
mkdir Challenge && cd Challenge
git clone git@github.com:your-username/portal-backend.git
git clone git@github.com:your-username/portal-frontend.git
git clone git@github.com:your-username/portal-assets.git
```

2. **Spin up infra** (Postgres, pgAdmin, Nginx API gateway) from **portal-backend** root:

- Create `docker-compose.yml` and `nginx.conf` (see **Appendix A**).

```bash
cd portal-backend
docker-compose -p portal up -d
```

3. **Migrate DB:**

```bash
dotnet tool install --global dotnet-ef
dotnet restore src && dotnet build src
cd src/portalbackend/PortalBackend.Migrations && dotnet run
```

4. **Run backend services:**

- Create appsettings & launch settings (see **Appendix B–E**).

```bash
# Administration
cd ../../administration/Administration.Service
dotnet build && dotnet run  # -> http://localhost:5000

# Registration
cd ../../registration/Registration.Service
# create appsettings.Development.json (Appendix F)
dotnet build && dotnet run  # -> http://localhost:5010
```

5. **Run assets & frontend:**

```bash
# Assets (separate terminal)
cd ../../../../portal-assets
yarn install && yarn build:release && yarn build && yarn start:assets

# Frontend (separate terminal)
cd ../portal-frontend
# Edit index.html ENV (see **Appendix G**)
yarn install && yarn start  # -> http://localhost:3001
```

6. **Login via Central IDP:**

- User: `cx-operator@tx.test`
- Pass: `tractusx-umbr3lla!`

**Verify:**

- Admin API: http://localhost:5000/api/administration/swagger/index.html
- Registration API: http://localhost:5010/api/registration/swagger/index.html
- API Gateway: http://localhost:8000/health

---

## 1) What You’re Building (Context)

The **Portal** is a dataspace management platform under **Eclipse Tractus‑X** (Catena‑X reference impl.). For this challenge, you’ll wire up a **dynamic branding assets** flow:

- **Backend (.NET 6+):** Microservices (Administration, Registration, etc.), EF Core, PostgreSQL, Docker.
- **Frontend (React 18+):** TypeScript, Redux Toolkit, MUI, Vite.
- **Assets:** Currently static; you’ll **replace/augment** with dynamic APIs.

### Key Repositories

- **Backend:** https://github.com/eclipse-tractusx/portal-backend
- **Frontend:** https://github.com/eclipse-tractusx/portal-frontend
- **Assets (reference):** https://github.com/eclipse-tractusx/portal-assets

---

## 2) Prerequisites

- Node.js **18+**
- .NET **6+ SDK**
- **Docker** & **Docker Compose**
- **Git**
- IDE (VS Code or similar)

---

## 3) Step‑by‑Step (Expanded)

### 3.1 Fork & Clone

See **TL;DR** commands above.

### 3.2 Infra (Postgres, pgAdmin, Nginx)

- Add **`docker-compose.yml`** and **`nginx.conf`** to `portal-backend/` root (exact content in **Appendix A**).
- Start containers:

```bash
cd portal-backend
docker-compose -p portal up -d
```

- Optional DB UI: http://localhost:8080 (pgAdmin)
  - Master password: `portal`
  - Host: `postgres`, Port: `5432`, DB: `postgres`, User: `portal`, Pass: `dbpasswordportal`

### 3.3 Configure Backend

- Create **Administration** appsettings (**Appendix B**).
- Create **Migrations** appsettings (**Appendix C**).
- Install EF tools, restore, build, **run migrations**.
- Replace **launchSettings.json** for **Administration** and **Registration** to **disable CORS** in services (Nginx handles CORS). See **Appendix D–E**.
- Create **Registration** appsettings (**Appendix F**).

### 3.4 Run Backend Services

- Administration: `dotnet build && dotnet run` → http://localhost:5000
- Registration: `dotnet build && dotnet run` → http://localhost:5010

### 3.5 Assets & Frontend

- Assets: `yarn install && yarn build:release && yarn build && yarn start:assets`
- Frontend:
  - Update `index.html` ENV (see **Appendix G**).
  - `yarn install && yarn start` → http://localhost:3001
  - You’ll be redirected to Central IDP → choose **CX‑Operator**.

### 3.6 Sign In (Test User)

- **Username:** `cx-operator@tx.test`
- **Password:** `tractusx-umbr3lla!`

---

## 4) Troubleshooting (Common Pitfalls)

- **CORS errors in browser:** Ensure backend service env vars set `DisableCors=true` and **only Nginx** manages CORS. Use the provided `nginx.conf` and access APIs via `http://localhost:8000` from the frontend.
- **DB connection failures:** Check container name `postgres`, port mapping `5432:5432`, and credentials in appsettings match docker-compose. Use `docker ps` & `docker logs portal-postgres`.
- **Migrations don’t run:** Verify `dotnet-ef` installed and `PortalDb` connection string points to **localhost:5432** with correct user/password.
- **Frontend can’t reach APIs:** Confirm Nginx container running (`docker ps`), `http://localhost:8000/health` returns `healthy`, and ENV `PORTAL_BACKEND_URL` matches `http://localhost:8000`.
- **Keycloak issues:** If redirect/login loops occur, double-check `REALM`, `CLIENT_ID`, and Central IDP URL in `index.html` ENV.

---

## 5) Optional — Admin Consoles

| Component   | URL                                             | Username | Password                   |
| ----------- | ----------------------------------------------- | -------- | -------------------------- |
| Central IDP | http://centralidp.b.dsaas.tvsdevops.co.uk/auth/ | `admin`  | `adminconsolepwcentralidp` |
| Shared IDP  | http://sharedidp.b.dsaas.tvsdevops.co.uk/auth/  | `admin`  | `adminconsolepwsharedidp`  |

---

# Appendices (Canonical Content)

## Appendix A — Docker & Nginx

**`portal-backend/docker-compose.yml`**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: portal-postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: portal
      POSTGRES_PASSWORD: dbpasswordportal
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U portal -d postgres']
      interval: 10s
      timeout: 5s
      retries: 5
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: portal-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - '8080:80'
    depends_on:
      - postgres
    volumes:
      - pgadmin_data:/var/lib/pgadmin
  nginx-proxy:
    image: nginx:alpine
    container_name: portal-nginx-proxy
    ports:
      - '8000:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    extra_hosts:
      - 'host.docker.internal:host-gateway'
volumes:
  postgres_data:
  pgadmin_data:
```

**`portal-backend/nginx.conf`**

```nginx
events { worker_connections 1024; }
http {
  upstream administration_service { server host.docker.internal:5000; }
  upstream registration_service { server host.docker.internal:5010; }

  server {
    listen 80; server_name localhost;

    location /api/administration {
      if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:3001';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
      }
      proxy_pass http://administration_service;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_hide_header 'Access-Control-Allow-Origin';
      add_header 'Access-Control-Allow-Origin' 'http://localhost:3001' always;
      add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
      add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    location /api/registration {
      if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:3001';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
      }
      proxy_pass http://registration_service;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_hide_header 'Access-Control-Allow-Origin';
      add_header 'Access-Control-Allow-Origin' 'http://localhost:3001' always;
      add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
      add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    location /health { access_log off; return 200 "healthy\n"; add_header Content-Type text/plain; }
  }
}
```

---

## Appendix B — Administration Service `appsettings.Development.json`

```json
REPLACED_WITH_FULL_JSON_FROM_SOURCE_FOR_ADMINISTRATION_SERVICE_APPSETTINGS
```

> Paste the full JSON from the source guide here.

## Appendix C — Migrations `appsettings.Development.json`

```json
REPLACED_WITH_FULL_JSON_FROM_SOURCE_FOR_MIGRATIONS_APPSETTINGS
```

## Appendix D — Administration Service `launchSettings.json`

```json
REPLACED_WITH_FULL_JSON_FROM_SOURCE_FOR_ADMINISTRATION_LAUNCHSETTINGS
```

## Appendix E — Registration Service `launchSettings.json`

```json
REPLACED_WITH_FULL_JSON_FROM_SOURCE_FOR_REGISTRATION_LAUNCHSETTINGS
```

## Appendix F — Registration Service `appsettings.Development.json`

```json
REPLACED_WITH_FULL_JSON_FROM_SOURCE_FOR_REGISTRATION_SERVICE_APPSETTINGS
```

## Appendix G — Frontend ENV (`portal-frontend/index.html`)

```js
const ENV = {
  REQUIRE_HTTPS_URL_PATTERN: 'true',
  CLEARINGHOUSE_CONNECT_DISABLED: 'false',
  PORTAL_ASSETS_URL: 'http://localhost:3003/assets',
  PORTAL_BACKEND_URL: 'http://localhost:8000',
  CENTRALIDP_URL: 'https://centralidp.b.dsaas.tvsdevops.co.uk/auth',
  SSI_CREDENTIAL_URL: 'https://ssi-credential-issuer.b.dsaas.tvsdevops.co.uk',
  BPDM_POOL_API_URL:
    'https://business-partners.b.dsaas.tvsdevops.co.uk/pool/v6',
  BPDM_GATE_API_URL:
    'https://business-partners.b.dsaas.tvsdevops.co.uk/companies/test-company/v6',
  SEMANTICS_URL: 'https://semantics.b.dsaas.tvsdevops.co.uk',
  MANAGED_IDENTITY_WALLETS_NEW_URL:
    'https://managed-identity-wallets-new.example.org',
  REALM: 'CX-Central',
  CLIENT_ID: 'Cl2-CX-Portal',
  CLIENT_ID_REGISTRATION: 'Cl1-CX-Registration',
  CLIENT_ID_SEMANTIC: 'Cl3-CX-Semantic',
  CLIENT_ID_BPDM: 'Cl7-CX-BPDM',
  CLIENT_ID_MIW: 'Cl5-CX-Custodian',
  CLIENT_ID_SSI_CREDENTIAL: 'Cl24-CX-SSI-CredentialIssuer',
}
```

---

## Verification Links (for convenience)

- Administration API — Swagger: http://localhost:5000/api/administration/swagger/index.html
- Registration API — Swagger: http://localhost:5010/api/registration/swagger/index.html
- API Gateway Health: http://localhost:8000/health

---

### Notes

- **Security:** Provided secrets are **dev/demo** values. Do not reuse for production.
- **CORS:** Keep disabled in services; Nginx is your single source of truth.
- **Containers:** `docker ps`, `docker logs <name>`, `docker-compose -p portal down -v` for a clean slate.
