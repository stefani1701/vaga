# Giving VAGA to a friend

Send them the URL. That's it — there is nothing to install for you, no server to
run, no account to create for them on your side, and no bill that grows with
however many people use it.

## Why their data can never reach you

VAGA has no backend. The page is a static file; every byte of data a person
produces is written either to their own browser or to **their own private GitHub
repo, using their own token**.

That means:

- You cannot see their logs, photos, weights or diary. There is nowhere for you
  to look.
- They cannot see yours.
- If they never set up cloud backup, their data never leaves their phone at all.
- You are not storing anyone else's personal data, so there is no GDPR position
  to take and nothing to breach.

This is a real architectural property, not a promise — it holds because no
shared storage exists in the first place.

## What to tell them

> 1. Open <URL> on your phone.
> 2. iPhone: Share → Add to Home Screen. Android: menu → Install app.
> 3. Open it from the icon from then on, not from a browser tab.
> 4. Optional but strongly recommended: Me → Cloud backup. Make yourself a
>    private GitHub repo and a fine-grained token with Contents: Read and write
>    on that one repo. Without this, clearing your browser loses everything.

Step 4 needs a GitHub account, which is fine for developers and a real hurdle
for everyone else. For a non-technical friend, point them at **Me → Manual
backup** instead: Export produces a JSON file they can drop in iCloud or Drive,
and Import restores it. It works; it just depends on them remembering.

## The programme is yours, the app is generic

`src/data.js` holds the training split, the four meal weeks and the shopping
lists. Anyone forking this for a different body, goal or country edits that one
file and runs `node build.js`. Nothing else in the app knows what a chicken
breast is.

## What sharing the URL does expose

Anyone who can open the app can read its source — markup, styles and all the
JavaScript — through their browser's developer tools. That is true of every
website; a static web app has no private half. Keeping the repo private stops
people browsing, forking and finding the code on GitHub, but it does not and
cannot hide the code from someone running the page.

Nothing sensitive lives in the source: no keys, no credentials, no personal
data. The only secret in the system is each person's own GitHub token, and that
is typed in on their device and stored only there.
