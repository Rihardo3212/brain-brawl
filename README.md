# Party Pit 🎉

A party game for friends. The big screen (laptop or TV) shows the game, and everyone plays on their phone.

## Game modes

- **🧠 Brain Board**: pick a tile, buzz first, answer fast. Ends with a betting final round.
- **🥧 Wedge Rush**: spin the wheel, everyone answers at once, the best answer grabs the wedge. Fill your pie to win.
- **🤥 Fake Out**: write a believable lie for a weird true fact, then try to find the truth.
- **✏️ Doodle Dash**: one player draws a secret word live, everyone else guesses.

Up to 4 players play solo; with 5 or more, everyone picks a team. The first player is the VIP (picks the game and starts it), or one phone can join as the host.

## Run it on your computer

```
npm install
npm run dev
```

Open the address Vite prints. For phones on the same Wi-Fi, open the "Network" address on the big screen so the QR code works.

Without Firebase config the game runs in **local test mode**: host and players have to be tabs in the same browser.

## Firebase (needed for phones)

1. https://console.firebase.google.com → create a project.
2. **Build → Realtime Database → Create database** (locked mode).
3. **Rules** tab: paste `database.rules.json`, press **Publish**.
4. **Project settings → Your apps → Web (`</>`)**, register the app.
5. Put the config in `src/firebase-config.js` (with `databaseURL`).

These keys are public by design; the database rules decide what is allowed.

## Publish on GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`
(**Settings → Pages → Source: GitHub Actions**).

## Project layout

- `src/pages/` Home, Host (big screen), Play (phone), How to play
- `src/views/host/` big screen views: lobby, team drawing, one stage per mode, end, scoreboard
- `src/views/phone/` phone views per mode
- `src/components/` logo, avatar, board, wheel, pie, marquee, live canvas, effects, mode picker…
- `src/engine/` game rules: `core.js` (lobby, teams, end) and one file per mode
- `src/content/` questions, Fake Out facts, Doodle words
- `src/lib/` database, sounds, music, themes, modes, room helpers
- `src/lib/brand.js` game and developer name
