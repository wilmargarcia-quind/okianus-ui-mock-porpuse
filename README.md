# Okianus Terminal Management System

Sistema de gestión de inventario para terminal de granel líquido en Zona Franca Cartagena.

## Stack

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Vite + shadcn/ui (generado con V0)
- **Base de datos**: PostgreSQL 16 (Docker)
- **Auth**: JWT (Passport)

## Inicio rápido

### 1. Levantar la base de datos
```bash
cd app
docker compose up -d postgres
```

### 2. Iniciar el backend
```bash
cd app/backend
cp .env.example .env
npm install
npm run start:dev
```

### 3. Cargar datos iniciales
```bash
curl -X POST http://localhost:3000/api/seed
```

### 4. Iniciar el frontend
```bash
cd app/frontend
npm install
npm run dev
```

## Usuarios de prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@okianus.com | admin123 | ADMIN |
| operador@okianus.com | op123 | OPERATOR |
| bioenergia@cliente.com | cli123 | CLIENT |
| petroandina@cliente.com | cli123 | CLIENT |

## API Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuario actual |
| GET | /api/dashboard/stats | KPIs del dashboard |
| GET | /api/dashboard/charts | Datos de gráficas |
| GET | /api/inventory | Saldos de inventario |
| POST | /api/movements | Registrar movimiento |
| GET | /api/movements | Historial de movimientos |
| GET | /api/reports | Reportes diarios |
| POST | /api/reports/generate | Generar reporte ahora |
| GET | /api/clients | Clientes |
| GET | /api/products | Productos y calidades |
| GET | /api/tanks | Tanques físicos |
| GET | /api/users | Usuarios (ADMIN) |
| POST | /api/seed | Cargar datos iniciales |

## Skills de Claude disponibles

- `/start-dev` — Levanta Docker + backend
- `/seed-db` — Carga datos iniciales
- `/new-module <nombre>` — Genera nuevo módulo NestJS
- `/check-api` — Verifica que la API funcione
