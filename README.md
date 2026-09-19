# AMC SIGNAL PRO

A mobile forex signal app. Installable PWA, single HTML file, no build step,
deployed on GitHub Pages and packaged to an Android APK.

Signals have exactly three states: **BUY**, **SELL**, **EXIT**.

> **Risk warning.** Trading forex and CFDs carries a high level of risk and can
> result in the loss of all your capital. This app is informational only. It is
> not investment advice. The developer is not registered with SEBI, FCA, ASIC or
> any other regulator. Past performance does not indicate future results.

---

## What works right now

| Feature | Status |
|---|---|
| BUY / SELL / EXIT signal feed | Built |
| Demo mode (runs with no backend) | Built |
| Firebase Realtime Database reader | Built |
| History with win rate, profit factor, expectancy | Built |
| Pair filter, auto refresh, offline cache | Built |
| Install to home screen | Built |
| Local notification on new signal | Built |
| Signal generation engine (MQL5) | **Not included — Phase 2** |

The app is a **display client**. It does not calculate signals. Until you
connect an engine, keep Demo mode on.

---

## Quick start

1. Create a repo on GitHub, e.g. `amc-signal-pro`.
2. Copy `app/`, `README.md` and `.gitignore` into it.
3. Settings → Pages → Source: *Deploy from a branch* → `main` → `/app`.
4. Open `https://<username>.github.io/amc-signal-pro/`.
5. Accept the disclaimer. Demo mode is on by default, so signals appear immediately.

No npm, no bundler, no local server needed. You can do every step from the
GitHub mobile web editor.

---

## Connecting a live signal source

### 1. Firebase setup

Create a Realtime Database (free Spark plan is plenty) and set read rules:

```json
{
  "rules": {
    "signals": { ".read": true,  ".write": "auth != null" },
    "history": { ".read": true,  ".write": "auth != null" },
    "meta":    { ".read": true,  ".write": "auth != null" }
  }
}
```

Public read is fine for a signal feed. If you want it private, use a token and
paste it in the app's Settings tab.

### 2. Data shape the app expects

`/signals/{PAIR}` — one node per pair, overwritten on every change:

```json
{
  "action": "BUY",
  "entry": 1.08650,
  "sl": 1.08080,
  "tp": 1.09600,
  "ts": 1789412400,
  "tf": "H1",
  "atr": 0.00380,
  "spread": 9,
  "note": ""
}
```

- `action` — `BUY`, `SELL` or `EXIT`. Delete the node when the pair goes flat.
- `ts` — unix seconds, UTC.
- For `EXIT`, `entry` is the close price; `sl` and `tp` can be null.

`/history/{autoId}` — one node per closed trade:

```json
{
  "pair": "EURUSD",
  "action": "BUY",
  "r": 1.67,
  "closeTs": 1789498800
}
```

`r` is the result in R multiples (`+1.67` = made 1.67× the risk, `-1` = full stop
loss hit). The app computes win rate, profit factor and expectancy from this.

### 3. Point the app at it

Settings tab → paste the database URL → Save → turn Demo mode off → Test connection.

The URL and token live in `localStorage` on the device. They are never written
to the repo.

---

## Building the Android APK

No laptop required.

1. Confirm the PWA passes install checks (Chrome → menu → Install app should appear).
2. Open [pwabuilder.com](https://www.pwabuilder.com) and paste your Pages URL.
3. Package for stores → Android → Generate.
4. Download the zip. It contains:
   - `app-release-signed.apk` — sideload this to test
   - `app-release-bundle.aab` — upload this to Play Console
   - `assetlinks.json` — **required**
   - `signing.keystore` + password — **back this up, you cannot re-issue updates without it**
5. Commit `assetlinks.json` to `app/.well-known/assetlinks.json` and push. Without
   it the app opens with a browser address bar visible.
6. Publish the APK under GitHub → Releases for direct download.

### Play Store notes

- $25 one-time developer registration.
- A privacy policy URL is mandatory. Host it as `app/privacy.html`.
- Finance category apps get extra review. Do not claim accuracy percentages,
  guaranteed profit, or use urgency language in the listing or notifications.
- Fill the Data Safety form honestly: this app stores settings locally and reads
  a database. It collects no personal data.

## iOS

Safari → Share → Add to Home Screen works and is free. A real App Store build
needs a Mac and a $99/year Apple Developer account. Not worth it for v1.

---

## Repository layout

```
amc-signal-pro/
├── README.md
├── .gitignore
├── DISCLAIMER.md
└── app/                      ← GitHub Pages root
    ├── index.html            single file: markup, styles, logic
    ├── manifest.json
    ├── sw.js                 network-first, never caches signal data
    ├── privacy.html          add before Play Store submission
    ├── icons/
    │   ├── icon-192.png
    │   ├── icon-512.png
    │   └── icon-512-maskable.png
    └── .well-known/
        └── assetlinks.json   add after PWABuilder generates it
```

---

## Versioning

The version lives in three places and all three must be bumped together:

1. `index.html` — the changelog header block at the top
2. `index.html` — `const VERSION = 'v1.01'` (bumping this re-shows the disclaimer)
3. `sw.js` — `const CACHE = 'amc-signal-pro-v1.01'` (bumping this forces a cache refresh)

If users report seeing an old build, it is almost always step 3.

---

## Roadmap

- **v1.00** — display client, demo mode, Firebase reader
- **v1.01** — renamed to AMC SIGNAL PRO *(current)*
- **v1.10** — MQL5 `SignalPublisher.mq5` pushing real signals from MT5
- **v1.20** — Firebase Cloud Messaging push, so alerts arrive with the app closed
- **v1.30** — chart snapshot per signal, session and news filters shown in the card
- **v2.00** — device-lock licensing if the app is ever distributed to others

## License

MIT. See `LICENSE`.
