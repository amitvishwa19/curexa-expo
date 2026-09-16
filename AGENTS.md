# curexa-expo — AGENTS.md

## Stack
- **Expo SDK 54** (new arch enabled), **expo-router** (file-based routing), **React Native 0.81**, **React 19.1**
- **NativeWind v4** + Tailwind CSS v3 — classes go on `className`. Babel: `{ jsxImportSource: 'nativewind' }`. Metro: `withNativeWind(config, { input: './global.css' })`
- **TypeScript** + **JavaScript** mixed — tsconfig extends `expo/tsconfig.base`, path alias `~/*` → `src/*`

## Commands
| Command | Purpose |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android device/emulator (dev client) |
| `npm run ios` | Run on iOS simulator (dev client) |
| `npm run web` | Start Expo with web target |
No test/lint/typecheck scripts in `package.json`. To typecheck: `npx tsc --noEmit`. No CI pipeline configured.

## Key scripts in repo
- `strip-types.js` — converts `.ts/.tsx` → `.js/.jsx` and deletes originals (one-time migration tool)
- `scrub_keys.js` — redacts API keys from `src/utils/constants.js`

## Architecture

### Application Overview
**Curexa** is a comprehensive Super Specialty Hospital Management System (HMS), Clinic Management System, and Patient Care Portal with dual portal modes (Doctor/Hospital Staff vs Patient Portal), AI Clinical Assistant & Triage, ICU Telemetry & Vitals monitoring, OPD Queue management, Inpatient Wards & Bed allocation, e-Prescriptions (e-Rx), Pharmacy inventory, Diagnostic Laboratory orders, Billing & Invoicing, SBAR Handovers & Roster, Bedside QR scanner, and Telemedicine video OPD.

### Routing (expo-router file-based, directly under `src/app/`)
- `(auth)/` — login, signup, forgot-password, verify
- `(misc)/` — SplashScreen (session gateway), `onboarding-hospital.jsx`, `onboarding-patient.jsx`, `notifications.jsx`, `sharedpref.jsx`
- `(tabs)/` — Main navigation tabs:
  - `index.jsx` (Health Hub / Overview Command Center)
  - `patients.jsx` (Patient EMR Directory / My Medical Records)
  - `appointments.jsx` (OPD Scheduler & Queue / My Visits)
  - `settings.jsx` (App Purpose Mode & Clinical Settings)
- `beds.jsx` — IPD Wards & Bed Matrix
- `pharmacy.jsx` — Pharmacy & Drug Stock Inventory
- `laboratory.jsx` — Diagnostic Lab Orders & Reports
- `billing.jsx` — Invoices, Payments & POS
- `departments.jsx` — Clinical Departments & Doctor Directory
- `prescriptions.jsx` — e-Prescriptions (e-Rx)
- `workflow.jsx` — Clinical Journey Kanban
- `reports.jsx` — Hospital Statistics & Revenue Analytics
- `crm.jsx` — Patient Care CRM & Retention
- `ai-assistant.jsx` — AI Clinical Triage & Differential Diagnosis
- `scanner.jsx` — Bedside Barcode / QR Scanner
- `telemetry.jsx` — Live ICU Telemetry & Vitals Monitor
- `messaging-automation.jsx` — WhatsApp/SMS Notifications
- `telemedicine.jsx` — Telemedicine Virtual OPD Consultation
- `roster.jsx` — On-Call Doctor Roster & Shift Handovers
- Entrypoint: `src/app/_layout.jsx` (imports `global.css` first). The index route `src/app/index.jsx` acts as the session & onboarding gateway.

### Providers & Components
- `CurexaProvider` (`src/providers/CurexaProvider.jsx`) — Central state store for patients, appointments, wards, beds, pharmacy, lab orders, invoices, AI assistant, and telemetry.
- `CurexaDrawer` & `CurexaDrawerProvider` (`src/components/curexa/CurexaDrawer.jsx`) — Hospital navigation drawer.
- `CurexaHeader` (`src/components/curexa/CurexaHeader.jsx`) — Header bar with safe drawer trigger & iOS portal switcher dialog.
- `IosPortalSwitcherModal` (`src/components/curexa/IosPortalSwitcherModal.jsx`) — iOS-style bottom sheet action picker to switch between Hospital/Doctor and Patient portals.
- `CurexaModals` (`src/components/curexa/CurexaModals.jsx`) — Reusable clinical action modals (Patient details, OPD booking, e-Rx, Lab orders, Invoices).
- `curexa.js` (`src/services/curexa.js`) — Backend API integration & clinical data service.

### Auth
- JWT stored in **SecureStore** (access token) + **AsyncStorage** (session object)
- Axios interceptor auto-attaches `Authorization: Bearer` header via `src/utils/axios.js`
- Google Sign-In supported; Firebase Cloud Messaging for push notifications

### API
- Base URL: `https://dev.devlomatix.com/api/v5` (set in `src/utils/api.js`)
- All API calls go through `src/utils/axios.js` (configured axios instance)
- **EXPO_PUBLIC_*** environment variables used for: Google Maps API key, OpenAI key, Gemini key

### Theme
- Custom `AppTheme` context (`src/theme/AppTheme.jsx`) — persists mode to AsyncStorage under `devlomatix.theme-mode`
- The `palette` object provides Tailwind class names + raw color values for both light/dark modes
- Used via `useAppTheme()` hook

### EAS Build
- projectId: `8f5ef678-be7b-4d55-b0a8-90096d1d6a77`, owner: `devlomatixsolutions`
- Profiles: `development` (dev client APK, internal), `preview` (standalone APK, internal), `production`

### Patches
- `patches/@react-native-google-signin+google-signin+16.1.4.patch` — applied via `postinstall` script

### VS Code
- On-save: fix all, organize imports, sort members
- Recommended extension: `expo.vscode-expo-tools`

## Coding Style

### Layout (UI density)
- **Compact by default** — prefer `p-3` over `p-4`, `px-3` over `px-4`, `py-2` over `py-3`, `gap-2` over `gap-3`, `text-[13px]` over `text-[15px]`
- Reduce avatar sizes (`h-9 w-9`), border radius (`rounded-[16px]`), and title sizes (`text-[22px]`)
- Use tighter margins (`mb-2` / `mb-2.5` / `mt-1.5`) and smaller chevron/icons (`size={16}`)

### List items (contact rows)
- `flex-row items-center` with avatar on left, then `flex-1 flex-row justify-between` for content:
  - **Left column**: name, phone, email, groups stacked vertically
  - **Right column**: type/category badges stacked `items-end`

### Campaign cards
- `flex-row items-center` card with `flex-1` left content and delete icon on far right
- Row 1: campaign title
- Row 2 (below): status badge + action (Start for DRAFT/PAUSED)
- Row 3 (below): progress bar
- Delete icon is standalone on the right edge, not in the bottom action row
