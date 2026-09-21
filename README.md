# PMS Frontend

Property Management System (PMS) web client built with Angular 15, AG Grid, and Tabler UI. The application manages property portfolios, buildings, units, tenant leasing lifecycles, fee schedules, rent receipts, and financial ledgers.

---

## Tech Stack

- **Framework:** Angular 15 (TypeScript)
- **UI Kit & Styling:** Tabler Core, Bootstrap, SCSS
- **Grid Engine:** AG Grid Angular (`ag-grid-community`)
- **Data & Reactive Utilities:** RxJS, Moment.js
- **Charts & Reports:** Chart.js, ng2-charts, html2pdf.js, xlsx
- **Icons:** FontAwesome Free

---

## Key Modules

- **Dashboard:** Portfolio metrics, real-time occupancy rates, revenue collection summary, and recent transactions.
- **Property Master:** Hierarchical asset setup covering Properties, Buildings, Floors, and Units/Rooms with custom amenity configurations.
- **Tenant Management:** Tenant onboarding, identity verification, room allotments, dynamic fee structuring, and service charge scheduling.
- **Tenant Ledger & Accounts:** Real-time ledger balances, debit/credit tracking, date-filtered transaction history, Excel export, and printable tenant statements.
- **Fee Receipts:** Rent collection, payment mode recording, and customizable PDF receipt generation.
- **Room Release:** Tenancy termination, inspection checklist, and security deposit reconciliation.
- **Reports:** Tenant registers, occupancy analytics, and collection reporting.

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js:** v18.x or v20.x
- **npm:** v9.x or higher
- **Angular CLI:** `@angular/cli@^15.2.0` (optional, can also run via `npx ng`)

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `src/environments/environment.ts` with your backend API base URL:

```typescript
export const environment = {
  production: false,
  apiBasePath: "http://localhost:5000/api/",
  appName: "PMS",
  env: "local",
};
```

### 3. Start Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Runs local dev server on `http://localhost:4200/` |
| `npm run build` | Compiles the production build into the `dist/` directory |
| `npm run prettier` | Formats codebase using Prettier |
| `npm run lint` | Checks code formatting and syntax |
| `npm run test:unit` | Executes unit tests via Jest |

---

## Project Structure

```text
pms-frontend/
├── src/
│   ├── app/
│   │   ├── landing/              # Public portal and property showcase
│   │   ├── login/                # Authentication & session handling
│   │   ├── main/                 # Shell layout (header, sidebar, navigation)
│   │   ├── pages/
│   │   │   ├── dashboard/        # Analytics & summary widgets
│   │   │   ├── properties/       # Property portfolio configuration
│   │   │   ├── buildings/        # Building management
│   │   │   ├── floors/           # Floor layout configuration
│   │   │   ├── units/            # Room & unit specifications
│   │   │   ├── tenant-management # Tenant onboarding, allotments & ledger
│   │   │   ├── fee-receipts/     # Payment entry & receipt generation
│   │   │   ├── release-room/     # Tenancy exit & room release workflow
│   │   │   └── reports/          # Tenant register & audit reports
│   │   └── utils/
│   │       ├── guards/           # Auth and route guards
│   │       ├── interceptors/     # JWT token & error handling interceptors
│   │       └── services/         # Core API services & toast utilities
│   ├── assets/                   # Logos, imagery, and static files
│   └── environments/             # Environment configs (local, QA, Prod)
├── angular.json                  # Angular CLI configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## Production Build

To generate an optimized production bundle:

```bash
npm run build
```

The output bundles will be located in the `dist/` directory, ready for deployment on Nginx, Apache, or static hosting providers (Vercel, AWS S3, Render).
