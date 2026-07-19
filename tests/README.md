# Delay Watch Test Suite (Playwright)

We use **Playwright Test Runner** (`@playwright/test`) as the single, unified testing framework across the entire `delay-watch` project. It executes all unit tests (`tests/unit/*.spec.ts`), API integration tests (`tests/integration/*.spec.ts`), and browser-based E2E web tests (`tests/e2e/*.spec.ts`).

---

## 🏗️ Architectural Conventions (`mocks.ts` & `helpers.ts`)

To maintain a clean, maintainable, and DRY test architecture, all test files must adhere to the following file layout rules:

1. **All Mock Payloads MUST be defined in [`tests/mocks.ts`](file:///home/snuffish/Projects/delay-watch/tests/mocks.ts)**:
   - Contains all mock JSON structures (`mockStationTrafficPayload`, `mockTrainTrafficPayload`, `mockScanResultPayload`, `mockPaybackResponse`).
   - Spec files must never hardcode inline mock JSON payloads.

2. **All Helper & Utility Functions MUST be defined in [`tests/helpers.ts`](file:///home/snuffish/Projects/delay-watch/tests/helpers.ts)**:
   - Contains shared test utilities (`startTestServer`, `stopTestServer`, `mockRouteJson`).
   - Keeps spec files focused purely on test assertions.

---

## Quick Start Commands

Run all commands from the project root (`/home/snuffish/Projects/delay-watch`):

```bash
# 1. Run the entire test suite (unit, integration, and E2E specs)
npm test

# 2. Run specific test categories
npx playwright test tests/unit          # Unit tests only
npx playwright test tests/integration   # Express server & API integration tests only
npx playwright test tests/e2e           # Playwright Chromium E2E web tests only

# 3. Run a single spec file
npx playwright test tests/e2e/live_sj_web.spec.ts

# 4. Debugging & UI modes
npx playwright test --ui                # Interactive Playwright UI mode
npx playwright test --headed            # Watch browser execution
npx playwright test --debug             # Step-by-step inspector
npx playwright show-report              # Open HTML test report of last run
```

---

## 🌐 Port Architecture & Isolation

To prevent port collisions when running E2E web tests alongside active development servers, `delay-watch` uses separate ports:

| Service / Server | Port | Command / Launcher | Description |
|---|---|---|---|
| **Vite Web Dashboard** | `5173` | `npm run dev` | Manual dev web server (`http://localhost:5173`) |
| **Express API Server** | `3000` | `npm run server` | Backend API server (`http://localhost:3000`) |
| **Playwright DevServer** | `5174` | `playwright.config.ts` | Isolated test server (`http://localhost:5174`) managed automatically during `npm test` |

---

## 📂 Directory Layout

```
tests/
├── mocks.ts                    # MANDATORY: Centralized mock data payloads
├── helpers.ts                  # MANDATORY: Shared test helpers & server utilities
├── unit/                       # Pure-logic unit specs (No browser needed)
│   ├── date.spec.ts            # Date formatting, overnight trip delay calculations
│   ├── file.spec.ts            # JSON data loading & error handling
│   ├── traffic.spec.ts         # O(1) station name & location code lookups
│   └── scan_hits.spec.ts       # Train delay hit capture, threshold filtering & SJ URLs
├── integration/                # API & Server integration specs
│   ├── server.spec.ts          # Express API routes (/api/scan, /api/stations, /api/payback)
│   └── sj_live_api.spec.ts     # Live HTTP status 200 checks against active prod-api.adp.sj.se
└── e2e/                        # Playwright browser E2E specs (Desktop Chrome)
    ├── web.spec.ts             # Mock-first E2E web flows (Autocomplete, Router navigation)
    └── live_sj_web.spec.ts     # Live unmocked E2E web integration against real prod-api.adp.sj.se
```

---

## 🔬 Kinds of Specs

### 1. Pure-Logic Unit Specs (`tests/unit/*.spec.ts`)
- Directly import modules from `src/` (`ScanLocation`, `date`, `file`, `traffic`) and assert outcomes.
- Fast, deterministic, and execute without browser overhead or backend dependencies.

### 2. Integration Specs (`tests/integration/*.spec.ts`)
- **Express Server API Specs** (`server.spec.ts`): Exercise Express controllers (`/api/scan`, `/api/stations`, `/api/payback`). Uses server lifecycle helpers from `tests/helpers.ts`.
- **Live SJ API Specs** (`sj_live_api.spec.ts`): Perform live HTTP GET requests against SJ's active API (`https://prod-api.adp.sj.se/public/trafficinfo-api/v2/rest/remarks/announcements?lang=sv`).

### 3. E2E Web Specs (`tests/e2e/*.spec.ts`)
- **Mock-First Specs** (`web.spec.ts`): Intercept endpoints via `mockRouteJson` from `tests/helpers.ts` for fast, deterministic UI testing.
- **Live SJ Web Specs** (`live_sj_web.spec.ts`): Perform live unmocked station scans on the React web UI against SJ's live endpoint (`prod-api.adp.sj.se`), verifying real rendered delay cards and valid modern SJ URLs (`https://www.sj.se/trafikinformation/tag/...`).

---

## 📏 Testing Guidelines & Conventions

1. **Mock & Helper Centralization**:
   - All mock payloads must reside in `tests/mocks.ts`.
   - All helper/utility functions must reside in `tests/helpers.ts`.
2. **No `waitForTimeout`**:
   - Use Playwright's built-in auto-waiting (`page.waitForSelector`, `expect(locator).toBeVisible()`).
3. **Explicit & Precise Locators**:
   - Prefer role-based or exact text locators (`page.getByRole('button', { name: 'Start Scan' })`, `page.getByText('Göteborg C', { exact: true })`).
4. **Modern SJ Traffic Links**:
   - Verify specific train URLs follow modern format: `https://www.sj.se/trafikinformation/tag/${trainNumber}?date=${date}`.
   - Verify station URLs follow: `https://www.sj.se/trafikinformation/station/${stationName}?station=${stationName}&date=${date}`.
