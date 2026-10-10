# VAGA

A 16-week body-recomposition app in one HTML file. Training log, four-week meal
rotation, shopping lists, progress photos, body metrics and a diary. No build
step, no framework, no backend, no tracking.

*Vaga* is Croatian for **scale** — the app weighs the three things that matter:
your food, your body, and the bar.

---

## Install it on your phone

1. Open the published URL **in a browser on the phone**
2. **iPhone:** Share → *Add to Home Screen*. **Android:** menu → *Install app*
3. Open it from the icon, not from the browser

From then on it runs full-screen with no address bar and works with no signal.

> **Use the icon, not a tab.** An installed web app gets its own private storage.
> Sets you log in a browser tab do not appear in the installed app, and Brave,
> Chrome and the installed app each keep their own copy. The app shows a banner
> while you are in a tab for exactly this reason.

On iPhone, Brave and Chrome both render with WebKit underneath, so all three
browsers behave identically here. If a browser's *Add to Home Screen* produces
something that still opens in a tab, install once from Safari instead — after
that the browser you installed from is irrelevant.

---

## Never losing your progress

This is the part worth understanding, because it is the one thing a static web
app does not get for free.

Browser storage is **not durable**. iOS evicts data from web apps that go unused.
"Clear browsing data" wipes it. A new phone starts empty. Nothing about the code
changes that — it is how browsers work.

So VAGA keeps the real copy in **a private GitHub repo of yours**, and treats the
browser as a cache:

- Every change is committed a few seconds after you make it
- Opening the app pulls anything newer down first
- Progress photos go up as individual JPEGs
- Each write is a commit, so even a mistake is recoverable from the repo history

### Setting it up (two minutes, once)

1. Create a **private** repo for your data — e.g. `yourname/vaga-data`.
   Keep it separate from the repo this app is published from.
2. github.com → Settings → Developer settings → **Fine-grained tokens** →
   Generate new token.
   - Repository access: **Only select repositories** → your data repo
   - Permissions: **Contents → Read and write**. Nothing else.
3. In the app: **Me → Cloud backup**, paste the repo name and the token, Connect.

The token is kept in its own browser key. It is never committed, never included
in an exported backup, and never leaves your device except as an `Authorization`
header to `api.github.com`. If you lose the phone, revoke the token on GitHub and
the data is untouched.

If you would rather not use a token at all, **Me → Manual backup** exports
everything as a JSON file you can keep in iCloud or Drive, and imports it back.
That works — it just relies on you remembering to do it.

### How conflicts resolve

Each save stamps `updatedAt`. On sync the newer side wins as a whole: if the
cloud is ahead, the app adopts the cloud copy; otherwise it pushes. For one
person across a phone and a laptop this is right, and it is why the app re-pulls
whenever you bring it back to the foreground. It is not built for two people
editing the same block at once.

---

## What's inside

| Tab | What it does |
|---|---|
| **Today** | Session for the day, daily non-negotiables, a 12-week trained/didn't calendar, streak |
| **Train** | 4-day upper/lower split, set logging with last week's numbers underneath, rest timer, session stopwatch |
| **Food** | 4-week meal rotation, recipes (7 built in, plus your own), generated and custom shopping lists |
| **Photos** | Front / side / back folders, stories-style viewer, side-by-side and wipe comparison, day-vs-day across all three angles |
| **Diary** | A line a day, plus energy and sleep |
| **Me** | Weight and waist, estimated 1RM on the four main lifts, cloud backup, units, theme |

Three things it does that most logging apps don't:

- **Session score** — total load moved, against the same session last week
- **Stall detector** — watches estimated 1RM per lift and tells you what to change when one stops moving for two weeks
- **Wipe comparison** — drag a line across two progress photos of the same pose

Weights, waist and food can each be switched between metric and imperial. Everything
is **stored metric** and converted only for display, so switching back and forth
can never corrupt what you already logged.

---

## Working on it

```
src/shell.html   markup, CSS, the light/dark themes
src/data.js      the programme: training split, 4 meal weeks, shopping lists
src/recipes.js   food macro table, built-in recipes, recipe editor, custom list
src/sync.js      GitHub backup
src/app.js       everything else
build.js         concatenates src/* into index.html
```

```bash
node build.js        # rebuild index.html after editing anything in src/
python3 -m http.server 8080   # then open http://localhost:8080
```

`index.html` is committed, so GitHub Pages serves it directly with no CI.
Edit `index.html` by hand and `node build.js` will overwrite you — change `src/`.

Nutrition lookups use [Open Food Facts](https://world.openfoodfacts.org) — free,
no key, no signup. It covers barcoded supermarket products; raw staples come from
a 37-item offline table in `recipes.js`, so the recipe builder works with no signal.

## Privacy

No analytics, no third-party scripts, no cookies. The only outbound requests are
to `api.github.com` (your backup, your token) and `world.openfoodfacts.org` (only
when you search for a food). The service worker never touches either.

## Licence

MIT. It's yours.
