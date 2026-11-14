# Brain Brawl ⚡

A party trivia game. The big screen (laptop or TV) shows the board, and everyone plays on their phone as a buzzer.

## Run it on your computer

```
npm install
npm run dev
```

Open the address Vite prints (for example `http://localhost:5173`).

Without Firebase the game runs in **local test mode**: the host and the players have to be tabs in the same browser. Open "Host a game" in one tab and the join link in other tabs.

## Set up Firebase (needed for phones)

1. Go to https://console.firebase.google.com and create a project (Google Analytics is not needed).
2. **Build → Realtime Database → Create database.** Pick a location near you and start in **locked mode**.
3. In the database, open the **Rules** tab, paste the contents of `database.rules.json` and press **Publish**.
4. **Project settings (gear icon) → Your apps → Web (`</>`)**. Register the app; you don't need Firebase Hosting.
5. Copy the `firebaseConfig` values into `src/firebase-config.js`. Make sure `databaseURL` is there; if it's missing, copy the URL from the top of the Realtime Database page.

These keys are not secret: every web app that uses Firebase has them in its code.

Now restart `npm run dev`. Phones on the same Wi-Fi can open the network address Vite prints (`http://192.168.x.x:5173`) and join.

## Publish on GitHub Pages

1. Create a new GitHub repository and push this folder to it (without `node_modules` and `dist`).
2. Move `deploy.yml` from the project root into a `.github/workflows/` folder (create it), so the path is `.github/workflows/deploy.yml`.
3. In the repository: **Settings → Pages → Source: GitHub Actions**.
4. Every push to `main` now builds and publishes the game automatically (see `.github/workflows/deploy.yml`).

## Project layout

- `src/pages/` Home, Host (big screen), Play (phone), How to play
- `src/components/` board, avatar, drawing pad, logo
- `src/lib/party.js` the game rules for Party mode (runs on the big screen)
- `src/lib/questions.js` the question sets
- `src/lib/db.js` Firebase and local test mode
- `src/lib/brand.js` game and developer name

## Next up

Host mode, the final round with bets, teams for 5+ players, more questions.
