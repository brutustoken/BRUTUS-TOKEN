# AGENTS.md — Brutus.Finance

## Project Overview

**Brutus.Finance** is a DeFi platform built on the TRON blockchain. It is a React SPA (Vite) that provides energy/bandwidth rental, token trading, staking, NFTs, a lottery, and provider/API management panels. Smart contracts are written in Solidity (targeting the TRON network via TRC20/TRC721/TRC1155 standards).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7 (`@vitejs/plugin-react-swc`) |
| Blockchain | TRON mainnet |
| Wallet | TronLink via `@tronweb3/tronwallet-adapters` + TronWeb CDN |
| Web3 | `tronweb` v6 (npm) + `window.tronWeb` (CDN) |
| Charts | AmCharts 5 |
| i18n | i18next + react-i18next (EN / ES / PT) |
| Encryption | CryptoJS v4 (AES) |
| Big numbers | BigNumber.js |
| UI | Bootstrap 5 (CDN), Bootstrap Icons, Font Awesome |
| Routing | Hash-based custom router (`/#/route`) — no React Router |
| SEO | react-helmet-async |
| Smart contracts | Solidity (^0.4.18 – >=0.8.17) |
| Backend (stub) | Node.js + Express 5 |
| CI/CD | GitHub Actions |

---

## Repository Structure

```
BRUTUS-TOKEN/
├── src/                        # React frontend (Vite)
│   ├── App.jsx                 # Root component, router, wallet manager
│   ├── main.jsx                # Entry point
│   ├── i18n.jsx                # i18next setup
│   ├── pages/                  # Page components (one per route)
│   ├── components/             # Shared UI components
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # TronWeb, rental, encryption services
│   ├── config/                 # Contract addresses, API URLs, constants
│   └── assets/abi/             # ABI JSON files for all contracts
├── contracts/                  # Solidity source contracts
├── server/                     # Express backend skeleton (stubs)
├── public/                     # Static assets, locales (en/es/pt)
├── docs/                       # Vite build output → GitHub Pages
├── .github/workflows/          # CI/CD: build → web / web-beta branches
├── vite.config.js
├── package.json
└── .env.example
```

---

## Pages & Routes

| Route | File | Description |
|---|---|---|
| `/` (default) | `src/pages/EBOT.jsx` | Energy & Bandwidth Rental — main product |
| `/#/ebot`, `/#/rent` | `src/pages/EBOT.jsx` | Same as default |
| `/#/wallet`, `/#/portfolio` | `src/pages/Home.jsx` | Portfolio dashboard — token balances |
| `/#/brut` | `src/pages/BRUT.jsx` | Buy/sell BRUT token vs USDT |
| `/#/brst` | `src/pages/BRST-Proxy.jsx` | BRST staking — stake/unstake BRST↔TRX |
| `/#/brgy` | `src/pages/BRGY.jsx` | NFT Gallery — BRGY TRC-721 collection |
| `/#/brlt` | `src/pages/BRLT.jsx` | Lottery — buy BRLT tickets, view draws |
| `/#/pro` | `src/pages/PRO.jsx` | Provider Panel — manage energy resources |
| `/#/api` | `src/pages/API.jsx` | API Panel — API key management, history |

---

## Smart Contracts

All contracts target the **TRON blockchain** (TRC standards). Key contracts:

| Contract | Location | Purpose |
|---|---|---|
| `BruTusToKen` (BRUT) | `contracts/TRC20-Token/BRUT/BruTusToKen.sol` | Primary BRUT TRC20 token. Upgradeable, blacklist, pause, fee, mint/burn. Deployed: `TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU` |
| `Token-TRC20` (BRST) | `contracts/TRC20-3.0_proxy/Token-TRC20.sol` | Modern proxy-based TRC20 (BRST). Blacklist, upgradeability. Deployed: `TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3` |
| `PoolBRSTv4` | `contracts/BRST POOL/Pool-normal/Pool-BRST-v4.sol` | Core staking pool. Users deposit BRST to earn TRX. Request queue, 17-day time-lock, whitelist, BSL-1.1 licensed. |
| `simpleSwapV4` | `contracts/BRST POOL/Pool-fast/simpleSwapV4.sol` | Fast swap: BRST→TRX at a discounted RATE, reads RATE from normal pool. |
| `Lottery` | `contracts/Loteria-TRX/lottery.sol` | Lottery: users buy BRLT NFT tickets (100 TRX each), pseudo-random winner per 15-day cycle. |
| `NFT-Brutus` (BRGY) | `contracts/TRC721-NFT/NFT-Brutus.sol` | TRC-721, 10,000 BRGY robot NFTs. Deployed: `TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7` |
| `MisteryBoxNFT` | `contracts/Mistery-Box/MisteryBoxNFT.sol` | Mystery Box: pay APENFT to receive a random BRGY NFT. Deployed: `TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk` |
| `DaoBrutus` | `contracts/Dao/Dao.sol` | DAO governance: lock BRST to vote on proposals, quadratic + standard voting, 30-day periods. |

---

## Environment Variables

Defined in `.env` (gitignored). See `.env.example` for all variables:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_API_PROVIDERS_URL` | Provider management API |
| `VITE_BOT_URL` | Energy bot price/availability API |
| `VITE_API_NFT` | NFT metadata API |
| `VITE_WALLET_API` | Payment wallet address for energy rentals |
| `VITE_LIST_TRONQL` | Comma-separated TronQL node IDs for TronWeb RPC |
| `VITE_SECRET` | AES key — encrypts rental request payloads |
| `VITE_USER_ID`, `VITE_TOKEN` | API authentication credentials |

---

## Development Scripts

```bash
# Frontend
npm run dev        # Vite dev server (HMR)
npm run build      # Production build → docs/
npm run lint       # ESLint
npm run preview    # Preview production build

# Backend (server/)
npm start          # Run Express server
npm run dev        # Run with --watch (auto-restart)
```

---

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `.github/workflows/main.yml` | Push to `main` (changes in `docs/`) | Sync `docs/` → `web` branch (GitHub Pages production) |
| `.github/workflows/develop.yml` | Push to `develop` (changes in `docs/`) | Sync `docs/` → `web-beta` branch (GitHub Pages staging) |

---

## Key Conventions

- **Language**: Code comments and UI strings are bilingual (Spanish / English). Translation files live in `public/locales/{en,es,pt}/`.
- **ABI files**: Stored in `src/assets/abi/` as JSON. Import directly in pages/services.
- **Contract addresses**: Centralized in `src/config/env.js`. Never hardcode addresses in components.
- **Encryption**: Rental API requests must be AES-encrypted using `src/services/encrypt.js` before transmission.
- **Big numbers**: Use `BigNumber.js` for all on-chain token amount arithmetic to avoid precision loss.
- **Wallet state**: Managed in `App.jsx`. Pages receive wallet/address as props. Always handle the viewer (disconnected) mode.
- **Routing**: Hash-based (`/#/route`). Add new routes in the switch logic inside `App.jsx`.
- **Build output**: Always targets `docs/` (configured in `vite.config.js`). Do not change the output directory.
- **Chunk splitting**: `vite.config.js` manually splits AmCharts → `charts.js`, tronweb/crypto → `web3-crypto.js`, rest → `libs.js`. Keep heavy imports in the appropriate chunk.
- **Backend**: The `server/` directory is a skeleton. External APIs (not in this repo) handle the actual energy rental logic, provider management, and pricing.

---

## Agent Guidelines

When modifying this project, agents should:

1. **Never commit `.env`** — it contains secrets. Reference `.env.example` for required variables.
2. **Run `npm run build` after frontend changes** to verify the Vite build succeeds and outputs to `docs/`.
3. **Run `npm run lint` after JS/JSX changes** to catch ESLint errors before committing.
4. **For new pages**: create the file in `src/pages/`, add translation keys to all three locale files (`public/locales/{en,es,pt}/translation.json`), and register the route in `App.jsx`.
5. **For new contracts**: add the ABI JSON to `src/assets/abi/`, add the deployed address to `src/config/env.js`, and expose the address via `VITE_*` env var if it must be configurable.
6. **TronWeb calls** must handle both `window.tronWeb` (injected by TronLink) and the fallback TronQL node RPC. See `src/services/` for the established pattern.
7. **Do not use React Router** — the project uses a custom hash-based router. Keep routing logic in `App.jsx`.
8. **Solidity contracts**: The project does not include Hardhat/Truffle in this repo. Compiled ABIs and deployed addresses are tracked manually. Do not introduce a compile pipeline without discussion.
9. **Translations**: All user-facing strings must use `t('key')` from `react-i18next`. Add keys to all three locale files simultaneously.
10. **Charts**: Use AmCharts 5 patterns already established in `BRUT.jsx` and `BRST-Proxy.jsx` as reference for new chart implementations.
