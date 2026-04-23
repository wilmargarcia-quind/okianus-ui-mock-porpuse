Acá está el prompt completo para V0:

---

## Prompt para V0 — Okianus Terminal Management System

```
Build a complete, production-ready web application called "Okianus Terminal Management System" for a bulk liquid port terminal in Cartagena, Colombia. This is a multi-role inventory management system.

---

## TECH STACK
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui components
- React Router v6 (client-side routing)
- Recharts for all data visualizations
- React Query (TanStack Query) for API state management
- Axios for HTTP calls (base URL from env: VITE_API_URL)
- react-hook-form + zod for all forms
- date-fns for date formatting
- lucide-react for icons

---

## BRAND & DESIGN SYSTEM

Color palette (CSS variables):
- Primary: #0D2137 (dark navy — main brand color from okianus.com)
- Primary light: #1A3A5C
- Accent: #1E88E5 (blue)
- Accent hover: #1565C0
- Success: #2E7D32
- Warning: #E65100
- Danger: #C62828
- Background: #F4F6FA
- Surface: #FFFFFF
- Border: #E0E7EF
- Text primary: #0D2137
- Text secondary: #5C7391
- Text muted: #9BAEC8

Typography: Inter font (Google Fonts)

Sidebar width: 260px, collapsible to 64px icon-only on mobile
Top navbar height: 64px
Border radius: 8px for cards, 6px for buttons, 4px for inputs
Shadows: subtle (0 1px 4px rgba(0,0,0,0.08))

---

## AUTHENTICATION

### /login — Login Page
Full-screen split layout:
- Left half: dark navy (#0D2137) background with Okianus logo (ship + "Okianus Terminals" text in white), tagline "Terminal de Granel Líquido · Zona Franca Cartagena", and a subtle background pattern of hexagons or wave lines
- Right half: white card centered with:
  - "Bienvenido" heading
  - "Inicia sesión en tu cuenta" subheading
  - Email input with label
  - Password input with show/hide toggle
  - "Iniciar Sesión" primary button (full width, navy background)
  - Error alert if credentials fail (red border, error message)
  - Footer: "Okianus S.A.S. © 2026 · Zona Franca Cartagena"

Mock users for demo (store in localStorage after "login"):
- admin@okianus.com / admin123 → role: ADMIN, name: "Administrador Okianus"
- operador@okianus.com / op123 → role: OPERATOR, name: "Carlos Mendoza"
- bioenergía@cliente.com / cli123 → role: CLIENT, clientId: "CLI-001", name: "BioEnergía S.A.", clientName: "BioEnergía S.A."
- petroandina@cliente.com / cli123 → role: CLIENT, clientId: "CLI-002", name: "PetroAndina LTDA", clientName: "PetroAndina LTDA"

After login store JWT token + user object in localStorage, redirect to /dashboard

---

## LAYOUT — Authenticated Shell

### Sidebar (left, 260px)
Top: Okianus logo (small ship icon + "Okianus" text in white, "Terminals" in accent blue)
Navigation items vary by role:

ADMIN + OPERATOR roles see:
- Dashboard (LayoutDashboard icon) → /dashboard
- Inventario (ArrowLeftRight icon) → /inventory
- Movimientos (Activity icon) → /movements
- Reportes (FileText icon) → /reports
- [ADMIN only] Administración (Settings icon) → /admin (with sub-items):
  - Clientes → /admin/clients
  - Productos y Calidades → /admin/products
  - Tanques → /admin/tanks
  - Usuarios → /admin/users

CLIENT role sees:
- Mi Inventario (Package icon) → /client/inventory
- Mis Reportes (FileText icon) → /client/reports

Bottom of sidebar: 
- Current user avatar circle (initials), name, role badge
- Cerrar Sesión button (LogOut icon)

### Top Navbar (64px)
- Left: Hamburger menu (collapse sidebar on mobile)
- Center: Page title (dynamic based on current route)
- Right: 
  - Bell icon with notification badge (static "3")
  - Date badge: "Jue 23 Abr 2026"
  - User avatar with dropdown (Ver perfil, Cerrar sesión)

---

## MOCK DATA (use this throughout all screens)

### Clients (10 total)
```
CLI-001: BioEnergía S.A. — bioenergia@cliente.com
CLI-002: PetroAndina LTDA — petroandina@cliente.com  
CLI-003: Palmas del Norte S.A.S. — palmasnorte@cliente.com
CLI-004: Combustibles del Caribe — caribe@cliente.com
CLI-005: Refinería Costa S.A. — refineria@cliente.com
CLI-006: Agro Industrial del Golfo — agrogolfo@cliente.com
CLI-007: Energía Verde Colombia — energiaverde@cliente.com
CLI-008: Distribuidora Nacional — disnacional@cliente.com
CLI-009: Petrochemicals S.A.S. — petrochem@cliente.com
CLI-010: Terminal Atlántico LTDA — terminlatl@cliente.com
```

### Products & Qualities
```
PROD-001: Aceite de Palma
  - Q-A: Alta Pureza (FFA < 3%)
  - Q-B: Estándar (FFA 3-5%)
  - Q-C: Industrial (FFA > 5%)

PROD-002: GLP (Gas Licuado de Petróleo)
  - Q-A: Propano Puro
  - Q-B: Mezcla Comercial
```

### Tanks (6 physical tanks)
```
TQ-001: Tanque Norte 1 — capacity: 2,000 t
TQ-002: Tanque Norte 2 — capacity: 2,000 t
TQ-003: Tanque Sur 1 — capacity: 3,500 t
TQ-004: Tanque Sur 2 — capacity: 3,500 t
TQ-005: Tanque GLP-A — capacity: 1,200 t
TQ-006: Tanque GLP-B — capacity: 1,200 t
```

### Inventory Balances (current state)
```
BioEnergía S.A. | Aceite de Palma | Q-A: 1,850.500 t
BioEnergía S.A. | Aceite de Palma | Q-B: 420.000 t
BioEnergía S.A. | GLP | Q-A: 380.200 t
PetroAndina LTDA | Aceite de Palma | Q-C: 2,100.750 t
PetroAndina LTDA | GLP | Q-B: 615.000 t
Palmas del Norte | Aceite de Palma | Q-A: 980.300 t
Palmas del Norte | Aceite de Palma | Q-B: 210.000 t
Combustibles del Caribe | GLP | Q-A: 450.100 t
Combustibles del Caribe | GLP | Q-B: 280.500 t
Refinería Costa | Aceite de Palma | Q-A: 1,200.000 t
Agro Industrial | Aceite de Palma | Q-C: 750.200 t
Energía Verde | GLP | Q-A: 320.000 t
Distribuidora Nacional | Aceite de Palma | Q-B: 890.400 t
Petrochemicals | GLP | Q-B: 445.000 t
Terminal Atlántico | Aceite de Palma | Q-A: 1,100.000 t
```

### Last 30 movements (mix of ENTRADA, SALIDA, AJUSTE for the charts)
Generate realistic movement data for the past 30 days. Mix of entries (+500 to +2000 t), exits (-200 to -800 t), and 2-3 adjustments. Use dates from Apr 1 to Apr 23, 2026.

---

## PAGES

---

### /dashboard — Panel Principal (ADMIN + OPERATOR)

Page title: "Panel Principal"
Subtitle: "Visión operativa en tiempo real del terminal"

**Row 1 — KPI Cards (4 cards, grid 4 cols)**
1. "Inventario Total" — 12,992.950 t — icon: Package — blue
2. "Clientes Activos" — 10 — icon: Users — green
3. "Movimientos Hoy" — 7 — icon: ArrowLeftRight — orange
4. "Capacidad Utilizada" — 64.8% — icon: Gauge — navy (show as progress bar inside card)

Each KPI card: white background, subtle left border in accent color, icon in colored circle, big number, label, small trend indicator (+2.3% vs ayer in green/red)

**Row 2 — Two charts side by side**

LEFT (60% width): "Movimientos de los Últimos 30 Días"
- Recharts AreaChart or ComposedChart
- X-axis: dates (last 30 days, show every 5 days)
- Y-axis: toneladas
- Three area/bar series: ENTRADA (blue), SALIDA (orange), AJUSTE (gray)
- Tooltip showing all three values on hover
- Legend at bottom

RIGHT (40% width): "Distribución por Producto"
- Recharts PieChart (donut style)
- Segments: Aceite de Palma Q-A (navy), Aceite de Palma Q-B (blue), Aceite de Palma Q-C (light blue), GLP Q-A (orange), GLP Q-B (yellow-orange)
- Center: total "12,992 t"
- Legend on right with colors, name, tonnage, percentage

**Row 3 — Two panels side by side**

LEFT (55% width): "Saldo por Cliente" — Bar chart (horizontal)
- Recharts HorizontalBarChart
- Y-axis: client names (all 10)
- X-axis: toneladas
- Bars colored by product type
- Sorted descending by total balance

RIGHT (45% width): "Últimos Movimientos"
- Table: last 8 movements
- Columns: Fecha, Tipo (badge: ENTRADA=green, SALIDA=red, AJUSTE=gray), Cliente, Producto/Calidad, Toneladas (colored: + green, - red)
- No pagination, just last 8
- "Ver todos →" link

---

### /inventory — Gestión de Inventario (ADMIN + OPERATOR)

Page title: "Gestión de Inventario"
Subtitle: "Motor M1 · El sistema impide saldos negativos a nivel de base de datos"

**Top section — Register movement panel**
White card with title "Registrar Movimiento"
Form in 2-column grid:
Row 1: 
- Tipo (Select): ENTRADA, SALIDA, AJUSTE (with icons: ArrowDown green, ArrowUp red, SlidersHorizontal gray)
- Cliente (Select): all 10 clients
Row 2:
- Producto (Select): Aceite de Palma, GLP
- Calidad (Select, dynamic based on product): Q-A, Q-B, Q-C
Row 3:
- Toneladas (Number input with step 0.001): label changes to "Toneladas" with current balance shown below: "Saldo actual: 1,850.500 t" in blue
- Notas / Justificación (Textarea, required for AJUSTE type)

When SALIDA is selected and tons > current balance: show inline error in red before submitting: "⚠ Saldo insuficiente. Disponible: X.XXX t"

Submit button: "Registrar Movimiento" (full width, primary navy)

After submit: show success toast "Movimiento registrado correctamente" + update the balance display

**Bottom section — Inventory table + audit log tabs**

Two tabs: "Saldos Actuales" | "Log de Auditoría"

**Tab "Saldos Actuales":**
Filters bar: search by cliente name, filter by producto, filter by calidad
Table columns: Cliente, Producto, Calidad, Saldo (t) [right-aligned, bold], Último Movimiento, Estado (badge: OK in green if >0, BAJO in yellow if <100t, CRÍTICO in red if 0)
All 15 balance rows, sorted by client name
Export button (Download icon): "Exportar Excel" (disabled/mock)

**Tab "Log de Auditoría":**
Filters: date range picker (from/to), tipo, cliente
Table columns: Fecha y Hora, Tipo (badge), Cliente, Producto, Calidad, Toneladas (+ or -), Saldo Anterior, Saldo Nuevo, Usuario, Notas
Show last 20 movements
Pagination at bottom (mock)

---

### /movements — Movimientos (ADMIN + OPERATOR)

Page title: "Historial de Movimientos"

**Top: filter bar (horizontal)**
- Date range (from/to date pickers)
- Tipo multiselect (ENTRADA, SALIDA, AJUSTE)
- Cliente select
- Producto select
- Button: "Aplicar Filtros" + "Limpiar"

**Main: full table**
Same columns as audit log above
Paginated: 20 per page, show pagination controls
Total count: "Mostrando 20 de 127 movimientos"

**Right panel (collapsible): Summary stats for current filter**
- Total Entradas: X.XXX t
- Total Salidas: X.XXX t  
- Balance Neto: X.XXX t (green if positive)
- Movimientos: N

---

### /reports — Reportes Automáticos (ADMIN + OPERATOR)

Page title: "Reportes Automáticos"
Subtitle: "Módulo M2 · Cierre de día automático con envío por email a cada cliente"

**Top: Scheduler config card (blue border)**
"⏰ Cierre Automático Diario configurado a las 23:59"
"Se generan reportes individuales PDF + Excel para cada cliente activo y se envían a su email registrado."
Button: "Generar Reporte Ahora" (secondary outline button with Play icon) — shows confirmation modal before executing

**Main: Reports history table**
Filters: month selector (Apr 2026 default), client filter, status filter

Table columns: Fecha Operativa, Estado (badge: PENDIENTE=gray, GENERADO=blue, ENVIADO=green, FALLIDO=red), Clientes Incluidos, PDF (icon button to "download" — shows toast "Descargando..."), Excel (icon button), Reenviar (only if ENVIADO or FALLIDO)

Show data for Apr 1-23 with realistic statuses (most ENVIADO, today PENDIENTE)

**Bottom: Email configuration card**
"Configuración de envío" 
Shows list of all 10 clients with their email + toggle (active/inactive for report sending)
"Hora de envío:" input "23:59" with save button

---

### /admin/clients — Administración · Clientes (ADMIN only)

Page title: "Clientes"

Button: "+ Nuevo Cliente" (top right, primary button)

Table: all 10 clients
Columns: Código, Nombre, Email de Reportes, Usuarios Asociados (count badge), Estado (Active/Inactive toggle), Acciones (Edit, Deactivate)

Clicking Edit opens a slide-over (sheet) panel from right with form:
- Código (disabled)
- Nombre completo
- Email de reportes
- Teléfono contacto
- Notas

Clicking "+ Nuevo Cliente" opens same sheet with empty form + "Guardar" button

Deactivate shows confirmation dialog: "¿Desactivar este cliente? Los movimientos históricos no se verán afectados."

---

### /admin/products — Administración · Productos y Calidades (ADMIN only)

Page title: "Productos y Calidades"

Two-column layout:
LEFT: Products list
- Card for each product: name, code, status badge, "3 calidades" count
- "+ Nuevo Producto" button
- Edit/Deactivate actions per product

RIGHT: Qualities for selected product
- Title: "Calidades de [product name]"
- List of qualities with code, name, description, status toggle
- "+ Nueva Calidad" button
- Note at bottom: "ℹ️ Inactivar una calidad no afecta movimientos históricos"

---

### /admin/tanks — Administración · Tanques (ADMIN only)

Page title: "Tanques Físicos"

Grid of cards (3 per row), one per tank:
Card shows:
- Tank code badge (TQ-001)
- Tank name
- Capacity in tons (big number)
- Status indicator
- Edit button

Note card at bottom: "💡 El inventario se gestiona por cliente/producto/calidad, no por tanque físico asignado. Los tanques son referencia operativa del terminal."

---

### /admin/users — Administración · Usuarios (ADMIN only)

Page title: "Usuarios del Sistema"

Table: all users
Columns: Nombre, Email, Rol (badge: ADMIN=navy, OPERADOR=blue, CLIENTE=gray), Cliente Asociado (only for CLIENT role, shows client name), Último Acceso, Estado, Acciones

"+ Nuevo Usuario" opens sheet with:
- Nombre completo
- Email
- Contraseña temporal (with auto-generate button)
- Rol (Select: ADMIN, OPERADOR, CLIENTE)
- Cliente Asociado (Select, only visible when CLIENTE role is selected): dropdown of all active clients
- "Guardar Usuario" button

---

### /client/inventory — Mi Inventario (CLIENT role only)

Page title: "Mi Inventario"
Subtitle: "BioEnergía S.A." (dynamic client name from user session)

**Top KPI strip (3 cards)**
- Total en Toneladas: sum of this client's balances
- Productos: count of product/quality combinations
- Último Movimiento: date of last movement

**Chart row (2 charts)**
LEFT: "Evolución de Inventario — Últimos 30 días" 
- Line chart showing this client's total balance over time
- One line per product/quality combination (max 3-4 lines)
RIGHT: "Distribución Actual"
- Donut pie chart showing current balance distribution by product/quality

**Bottom: Saldos detallados table**
Only this client's data
Columns: Producto, Calidad, Saldo Actual (t), Último Movimiento, Tendencia (small sparkline or up/down arrow)

**Bottom: Últimos movimientos (this client only)**
Last 15 movements
Same audit log columns but simplified (no "Cliente" column since it's always this client)

---

### /client/reports — Mis Reportes (CLIENT role only)

Page title: "Mis Reportes"
Subtitle: "Reportes diarios generados automáticamente cada día a las 23:59"

Filter: month selector

Table: only this client's reports
Columns: Fecha, Estado (badge), Saldo Inicial (t), Entradas (t), Salidas (t), Saldo Final (t), Descargar PDF, Descargar Excel

"Descargando..." toast on click of download buttons

---

## GLOBAL COMPONENTS

### Toasts / Notifications
Use Sonner or shadcn/ui toast
- Success: green check "Operación exitosa"
- Error: red X with error message
- Info: blue info icon

### Confirmation Modal
Used for destructive actions (deactivate, delete)
Dialog with warning icon, message, Cancel + Confirm buttons

### Empty States
When tables have no data: centered icon + "No hay datos disponibles" + optional action button

### Loading States
Skeleton loaders for tables and cards while data loads (use shadcn Skeleton)

### Error Boundary
Generic error page with "Algo salió mal" + retry button

---

## API INTEGRATION LAYER

Create an `/src/api/` folder with:
- `axios.ts` — axios instance with base URL from env, auth interceptor (adds Bearer token from localStorage), 401 interceptor (redirect to login)
- `auth.api.ts` — login, me, logout functions
- `inventory.api.ts` — all inventory endpoints
- `movements.api.ts` — movements CRUD
- `reports.api.ts` — reports endpoints
- `clients.api.ts`, `products.api.ts`, `tanks.api.ts`, `users.api.ts` — admin endpoints
- `dashboard.api.ts` — stats and chart data

Each API function should be typed with TypeScript interfaces. Use React Query hooks (useQuery, useMutation) in a `/src/hooks/` folder.

For demo mode: if API call fails or VITE_API_URL is not set, fall back to the mock data defined above.

---

## ROUTING

```
/ → redirect to /login if not authenticated, else /dashboard
/login → Login page (public)
/dashboard → Panel Principal (ADMIN, OPERATOR)
/inventory → Gestión de Inventario (ADMIN, OPERATOR)
/movements → Historial de Movimientos (ADMIN, OPERATOR)
/reports → Reportes Automáticos (ADMIN, OPERATOR)
/admin → redirect to /admin/clients (ADMIN only)
/admin/clients → Clientes
/admin/products → Productos y Calidades
/admin/tanks → Tanques
/admin/users → Usuarios
/client/inventory → Mi Inventario (CLIENT only)
/client/reports → Mis Reportes (CLIENT only)
* → 404 page
```

Route guard: if user.role === 'CLIENT' and tries to access /dashboard → redirect to /client/inventory
If user.role !== 'ADMIN' and tries to access /admin/* → redirect to /dashboard with toast "Acceso restringido"

---

## RESPONSIVE BEHAVIOR

- Desktop (>1280px): full sidebar always visible
- Tablet (768-1280px): sidebar collapsible, toggle via hamburger
- Mobile (<768px): sidebar as overlay drawer, charts stack vertically, tables become card-list format
- All forms: single column on mobile, two columns on desktop
- KPI cards: 2-col grid on mobile, 4-col on desktop

---

## ADDITIONAL DETAILS

1. All monetary/weight values formatted with Colombian locale (period as thousands separator, comma as decimal): "1.850,500 t"
2. All dates in format "23 abr 2026 · 14:32"  
3. The word "toneladas" abbreviated as "t" in tables, spelled out in forms
4. Sidebar active item: white text + accent blue left border (3px) + slightly lighter background
5. All delete/deactivate actions require confirmation dialog
6. Form validations in Spanish: "Este campo es requerido", "Debe ser mayor a 0", etc.
7. Page transitions: subtle fade-in (150ms opacity transition)
8. Favicon: ship emoji or blue circle with "OK" text
9. Document title: "[Page Name] · Okianus Terminal"
10. No dark mode (terminal operations require consistent readability)
```

---

**Instrucciones adicionales para pegar en V0:**
- Pega el prompt completo
- Si V0 pide que elijas entre "App" o "Component" → elige **App**
- Cuando genere, pídele: *"Ahora genera la página /admin/users completa con el sheet de crear usuario"* para que complete lo que falta
- Descarga el zip, descomprime en `app/frontend/`

¿Seguimos con el backend?