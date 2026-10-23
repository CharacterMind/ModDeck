# Deploying ModDeck to Render.com

The whole app is a Next.js 16 site with **no database** — favorites, the 5-hour
limit, Owner mode, everything lives in each visitor's browser (localStorage).
That makes deployment a simple push-to-GitHub, connect-on-Render flow.
A production build and the standalone server (`node .next/standalone/server.js`)
have both been tested successfully.

## What you need

1. A [GitHub](https://github.com) account (free)
2. A [Render](https://render.com) account (free — sign in *with GitHub*)

## Step 1 — Put the code on GitHub

From this project folder run:

```bash
git remote add origin https://github.com/<your-username>/moddeck.git
git push -u origin main
```

(Create the empty repo `moddeck` on github.com first — no README, no .gitignore.)

> Private repos work fine; Render just needs permission during sign-up.

## Step 2 — Deploy on Render

**Easy way (Blueprint):** this repo contains a `render.yaml`, so go to

```
https://render.com/deploy?repo=https://github.com/<your-username>/moddeck
```

and Render reads the blueprint and creates the service with the right
commands automatically.

**Manual way:** dashboard → **New + → Web Service** → pick your repo →
choose **Free** instance → use:

| Setting        | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Runtime        | Node                                                         |
| Build Command  | `npm install --include=dev --legacy-peer-deps && npm run build` |
| Start Command  | `NODE_ENV=production node .next/standalone/server.js`         |
| Env var        | `NODE_VERSION` = `22`                                         |

Click **Deploy Web Service**. First build takes ~3–5 minutes, then your app
is live at `https://moddeck-xxxx.onrender.com`.

## Step 3 — Ship updates

Every `git push` to `main` triggers an automatic redeploy
(dashboard → Manual Deploy → "Deploy latest commit" also works).

## Good to know

- **Free tier sleeps**: after 15 minutes with no visitors the service
  pauses; the next visit wakes it in ~30–60 seconds. Upgrade to Starter
  ($7/mo) in the Render dashboard for always-on.
- **No environment variables or database needed** — nothing to configure.
- The in-app **"Download trainer" button is simulated** demo UI (it shows a
  toast, like WeMod). It does not fetch a real file.
- `bun.lock` is included; if you prefer Bun on Render, you can set runtime
  `bun` with build `bun install && bun run build` and start
  `bun .next/standalone/server.js` instead — but the Node setup above is the
  best-tested path.
