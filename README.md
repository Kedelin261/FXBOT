# FXBOT – FX Algorithmic Trading Platform

A full-stack algorithmic forex trading platform with a modern dark-theme web dashboard.

## Project Structure
\`\`\`
├── src/                     # Frontend (Hono + Vite + Cloudflare Pages)
│   └── index.tsx            # Full SPA dashboard
├── backend-src/             # Java Spring Boot backend
│   └── main/java/com/kenneth/fxbot/
│       ├── api/             # REST controllers (backtest, paper)
│       ├── analytics/       # Performance stats, leaderboards
│       ├── backtest/        # Backtest engine
│       ├── domain/          # Trade, Candle, Instrument domain models
│       ├── paper/           # Paper trading service + broker
│       ├── strategy/        # ThreeCandleMomentum, NakedLiquiditySweep
│       └── risk/            # Daily risk governor
├── pom.xml                  # Maven build for Spring Boot backend
├── vite.config.ts           # Vite build config
├── wrangler.jsonc           # Cloudflare Pages config
└── ecosystem.config.cjs     # PM2 config for local dev
\`\`\`

## Frontend Dashboard Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Equity curve, P&L stats, win rate, profit factor, drawdown, symbol/strategy breakdown |
| **Paper Trading** | Start/stop sessions, live 2s polling, risk governor panel, symbol status grid, live equity chart |
| **Backtesting** | Multi-symbol CSV backtest runner with per-instrument stats and trade list |
| **Trade Log** | Filterable, paginated trade table with CSV export |
| **Leaderboard** | Strategy & symbol rankings by composite score |
| **Settings** | API URL configuration + connection tester |

## Backend API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/backtest` | Run backtest with `{csvPaths: {SYMBOL: "/path"}}` |
| POST | `/api/paper/start` | Start paper trading |
| POST | `/api/paper/stop` | Stop paper trading |
| GET | `/api/paper/status` | Live session status |
| GET | `/api/paper/trades` | Closed trades (optional `?symbol=`) |
| GET | `/api/paper/trades/export` | Download CSV |
| GET | `/api/paper/performance` | Aggregate stats |
| GET | `/api/paper/equity` | Equity curve points |
| GET | `/api/paper/leaderboard/strategies` | Strategy rankings |
| GET | `/api/paper/leaderboard/symbols` | Symbol rankings |

## Supported Instruments
`EURUSD`, `GBPUSD`, `AUDUSD`, `USDJPY`, `USDCAD`, `USDCHF`, `XAUUSD`, `NAS100`

## Strategies
- **ThreeCandleMomentumStrategy** — 3 consecutive same-direction candles signal
- **NakedLiquiditySweepStrategy** — Liquidity pool sweep detection

## Quick Start

### Backend
\`\`\`bash
mvn spring-boot:run
# Starts on http://localhost:8080
\`\`\`

### Frontend (Local Dev)
\`\`\`bash
npm install
npm run build
npm run dev:sandbox   # or pm2 start ecosystem.config.cjs
# Dashboard at http://localhost:3000
\`\`\`

### Frontend (Deploy to Cloudflare Pages)
\`\`\`bash
npm run deploy
\`\`\`

## Tech Stack
- **Frontend**: Hono, Vite, TailwindCSS, Chart.js, Cloudflare Pages/Workers
- **Backend**: Java 17, Spring Boot, Maven
- **Data**: CSV-based OHLCV candle data (M1/M5 timeframes)
