# QuickCard: App Spec and Agent Rules

Working name: **QuickCard** (placeholder; check the name is free before branding).
Version 1.0 · 2 November 2026 · Status: planning

**Read this whole file at the start of every task.** It has two parts: Part A says what the app is. Part B is the rules every human and AI helper must follow. If a task conflicts with a rule, stop and ask.

---

# PART A: THE APP

## A1. What it is

An **offline Android app** that turns a few typed lines into a good-looking card, notice, list or simple record, then helps the user send it on WhatsApp, including a personalised version for each person on a list.

- **Offline** means it opens and works fully with no internet, once installed.
- **Template** means a ready-made design with blanks (title, date, place, message) the user fills in.

**It is:** a fill-in-the-blank card and notice maker with personalised sending.
**It is not:** a drag-and-drop design tool, a bulk-message robot, or an app that stores contacts online.

## A2. Who uses it and for what

| Occasion | User types | Output |
|---|---|---|
| Church midweek notice, Holy Week programme | Day, time, place, message | Notice picture for the group |
| Wedding or kitchen-party invitation | Names, date, venue, RSVP number | Invitation card, optionally with each guest's name |
| Funeral notice | Name, dates, viewing, service, burial | Calm, respectful notice |
| Birthday, school or class notice | Event details | Card or notice |
| Savings-group meeting notice, contributions record | Names, amounts | Notice or table with auto total |
| Grocery list, plain note | Text or items | Tidy list or page |

## A3. Version 1 scope (MVP: the smallest useful, payable version)

**In:**
1. Six occasion groups, about 12 templates (list in A9).
2. Editor: short form, 4 colour sets and 2 font pairs per template, live preview.
3. Export as **JPG** (for WhatsApp). PDF comes in v1.1.
4. Recipient list: paste lines like `Rudo, 0771234567`. Message may contain `{name}`.
5. Send queue: one person at a time, the user taps Send in WhatsApp.
6. Lists and notes using the same editor.
7. Drafts saved on the phone.
8. Small "Made with QuickCard" tag on free cards.
9. Unlock code (removes the tag, raises limits). Works offline.

**Out (do not build in v1):** ads, accounts or logins, cloud storage, drag-and-drop or resizing, reading the phone's contact book, AI features, in-app payments, analytics or tracking.

## A4. Free and paid

| Product | Price | What it does |
|---|---|---|
| Free | $0 | All templates, tag on cards, up to 5 recipients per personalised send |
| Unlock (one-time) | $2 | No tag, all templates, up to 100 recipients per list |
| Event pass | $1 to $1.50 | Unlimited recipients for 30 days |
| Done-for-you card | $2 to $5 | Service made by hand (not in the app) |
| Sponsor template | $10 to $20/month | Business logo on a template category (sold by hand) |

Prices are suggestions to be confirmed by real sales.

## A5. How sending works

Golden rule: **the user always taps Send. The app never sends anything by itself.**

| Way | How |
|---|---|
| Same card to many | Share the JPG; the user selects several chats or a group in WhatsApp's own share screen |
| Personalised text | App opens each chat with a `wa.me` link (`https://wa.me/<number>?text=<encoded message>`); user taps Send, returns for the next |
| Personalised picture | App draws the card with that person's name, shows "Next: Rudo", user shares to that chat via the share sheet |

Numbers are stored as **text** and normalised to international format (Zimbabwe: country code 263, drop a leading 0, strip spaces and symbols). Invalid numbers are flagged, not silently dropped.

## A6. Tech stack

| Need | Tool |
|---|---|
| Language and UI | TypeScript, React, Vite, Tailwind CSS |
| Android wrapper | Capacitor (all assets bundled, fully offline) |
| Drawing cards | Canvas 2D API with our own text-wrapping code |
| Local storage | Dexie (IndexedDB) |
| Data checking | Zod |
| Unlock-code signatures | tweetnacl (Ed25519) |
| Phone features | Capacitor plugins: Share, Filesystem, App Launcher, Clipboard |
| Tests | Vitest |
| Build and sign | Android Studio (or GitHub Actions) |
| Screens | Google Stitch (reference designs only) |
| Fonts | 3 to 4 open-licence (OFL) fonts, subset to Latin, bundled |
| Decorations | SVG (borders, florals, rings, balloons, crosses) drawn by us |

## A7. Template format

A template is a small JSON file, **validated with Zod before use**. It describes the card; it contains no code.

```json
{
  "version": 1,
  "id": "church-midweek-01",
  "occasion": "church",
  "name": "Midweek Service",
  "size": { "width": 1080, "height": 1080 },
  "background": { "type": "color", "value": "#FFFFFF" },
  "decorations": [{ "svg": "border-simple", "x": 0, "y": 0, "width": 1080, "height": 1080 }],
  "fields": [
    { "key": "title", "label": "Title", "default": "Midweek Service",
      "box": { "x": 90, "y": 140, "width": 900, "height": 160 },
      "font": "heading", "maxSize": 96, "minSize": 48, "align": "center", "maxLines": 2 },
    { "key": "when", "label": "Day and time", "default": "Wednesday, 18:00",
      "box": { "x": 90, "y": 380, "width": 900, "height": 120 },
      "font": "body", "maxSize": 64, "minSize": 32, "align": "center", "maxLines": 2 }
  ],
  "palettes": [
    { "id": "green", "background": "#FFFFFF", "text": "#1B2A49", "accent": "#0F766E" }
  ]
}
```

Rules for templates: text must wrap inside its box and shrink toward `minSize` if too long; if it still does not fit, show a clear "text too long" hint, never clip silently. Every palette must pass a readable-contrast check.

## A8. Unlock codes (no server)

Think of a stamp: only the owner has the stamp (private key); anyone can check a stamp is real (public key).

1. App shows a **device ID** and opens WhatsApp to the seller with it prefilled.
2. User pays (EcoCash). Seller confirms.
3. Seller runs a **local script on their laptop** that signs the device ID (plus plan and optional expiry) with the **private key** and prints a code.
4. User pastes the code. The app verifies the signature with the **public key built into the app**, offline.
5. If valid and not expired, unlock. Re-issue a lost code once for free.

The **private key never enters the app, the repo or any chat.** Only the public key ships.

## A9. Twelve starter templates

1. Church midweek notice · 2. Church Holy Week programme · 3. Church event poster · 4. Wedding invitation · 5. Kitchen-party invitation · 6. Funeral notice (calm colours, no cartoons) · 7. Birthday invitation · 8. School or class notice · 9. Savings-group meeting notice · 10. Contributions record (auto total) · 11. Grocery list · 12. Plain note.

Wording starts in English. **Shona and Ndebele versions must be written and checked by native speakers** before release.

## A10. Build order (about 4 weeks)

| Week | Do | Done when |
|---|---|---|
| 1 | Project, Capacitor, bundled fonts, card renderer, 3 templates | 3 cards export as correct JPGs on a real phone in airplane mode |
| 2 | All 12 templates, editor form, palettes, drafts | A new user makes a card unaided in under 2 minutes |
| 3 | Recipient list, `{name}` merge, send queue, share flow, unlock codes | Personalised send to 5 numbers works; signed code unlocks the app |
| 4 | Polish, 3-phone test, signed build, privacy policy, Play closed test, first sales | Testers install it; 5 people have paid |

**Release:** (1) direct APK sold with unlock codes; (2) Google Play (new personal accounts need a closed test with 12 or more testers for 14 days **[verify current rule]**; developer fee about $25 **[verify]**).

---

# PART B: RULES FOR EVERY HELPER (HUMAN OR AI)

## B1. How to work

1. **One small task at a time.** Do exactly what was asked. No extra features, no refactoring unrelated files, no renaming.
2. **Plan first** for anything bigger than a small fix: list the files you will change and why.
3. **Tests with every change.** Add or update Vitest tests. Run `npm run test` and `npx tsc --noEmit` before finishing. Never delete or weaken a test to make it pass.
4. **Never guess.** If a requirement, rule or fact is unclear, ask. Do not invent prices, legal wording or platform rules.
5. **Report honestly:** files changed, tests run, what you could not verify, any rule you bent.
6. **Stop and ask** before: adding a dependency, touching unlock-code or sharing code, changing the template format, or deleting data.
7. **Save a restore point first:** commit to git before each task.

## B2. Offline first (non-negotiable)

- Every core feature works with **no internet**: make, preview, save, export, share, merge, unlock.
- **No CDNs, remote fonts, remote images, remote scripts, analytics or ad SDKs.** Everything is bundled.
- Do not make network calls at startup or while drawing.
- If something online is ever added, it must fail gracefully and never block offline use.
- Test in **airplane mode on a real phone** before calling anything done.

## B3. WhatsApp and messaging

- **The user taps Send for every message.** Never automate sending.
- **Never** use Accessibility services, simulated taps, or any trick that presses Send for the user.
- **Never** use undocumented shortcuts to preselect a chat for pictures. They can break and put users at risk.
- Show a consent reminder before a personalised send: "Only message people who expect to hear from you."
- Suggest sending in small batches. Do not build speed-ups that encourage mass sending.
- Do not tell users to install unofficial WhatsApp apps.
- Use official `wa.me` links and the Android share sheet only. Read WhatsApp's help pages before launch **[verify]**.

## B4. Privacy and data

- Recipient names and numbers stay **on the phone**. Never upload, log or print them to a console in release builds.
- Do not ask for the contacts permission in v1. Users paste "Name, number" lines.
- Ask only for permissions the feature truly needs, and explain why in the app and the privacy policy.
- Phone numbers are **text**, never numbers.
- The privacy policy and Google Play's Data safety form must match what the app really does.
- Provide a "Delete all data" button.

## B5. Secrets and unlock codes

- **No password, key or secret in the code or repo.** The unlock-code **private key never enters this project.** Only the public key ships.
- The seller's signing script lives outside this repo, on the seller's laptop.
- Verify unlock codes with a real signature check (Ed25519 via tweetnacl). Never compare against a hardcoded list, a flag in storage, or a simple checksum.
- Unlock state is derived from a verified code; a plain "premium" value in storage must never be trusted by itself.
- The Android signing keystore is never committed.
- Before finishing any security-related task, search the build output for private keys, passwords and test codes.

## B6. Templates and drawing

- Templates are JSON validated with Zod. Reject invalid, oversized or unknown-version files with a clear message.
- Never run or evaluate anything found inside a template or an imported file.
- Preview and saved picture come from the **same drawing code** so they always match.
- Text wraps inside its box, shrinks toward `minSize`, then shows a "too long" hint. Never clip silently.
- Every colour palette passes a readable-contrast check (aim for WCAG AA).
- Fonts are bundled and loaded before drawing. Test names with accents and apostrophes.
- Funeral templates use calm colours and no cartoons.
- Output size is set per template (default 1080 x 1080). Keep JPG file size reasonable for WhatsApp.

## B7. Content and copyright

- Use only artwork we drew and fonts with an open licence (OFL), after reading the licence.
- No photos from the internet, no cartoon or brand characters, no logos of banks, EcoCash, churches or schools without permission.
- No hymn or song words and no Bible text from translations we do not have the right to reproduce. Let users type their own.
- Shona and Ndebele wording must be checked by native speakers. Mark unchecked strings `needs native review`.
- If unsure, leave it out.

## B8. UI and performance

- Target low-end Android phones with 2 GB RAM. Aim for an app under about **15 MB** and a cold start under about **3 seconds**.
- Minimum tap target 48 px. Body text 16 px or larger. High contrast.
- Layout works at 360 x 800 and larger. Respect safe areas. Do not block pinch-zoom.
- Handle empty, loading, error and "too long" states on every screen.
- Android back button behaves correctly everywhere.
- Simple, solid backgrounds. No heavy animations or blur effects.
- Stitch HTML is a **visual reference only**: rebuild screens in our own components. Remove Tailwind CDN links, Google Fonts links and demo scripts. Use bundled fonts and icons.
- No hardcoded user-facing text in components. Keep strings in translation files (English now; Shona and Ndebele later).

## B9. Code quality

- TypeScript strict mode. No `any` without a comment explaining why.
- Validate data at the edges with Zod: pasted lists, templates, unlock codes, saved drafts.
- Put pure logic (merge, number cleaning, text fitting, code checking) in small testable functions in `src/lib/`, away from screens.
- Handle errors in plain sight: no silent catches. Friendly messages for users, details only in development.
- Comments explain **why**, not what.
- Keep the existing structure and naming. Do not reformat unrelated files.

## B10. Required tests

- Phone number cleaning (Zimbabwe formats, spaces, `+263`, leading `0`, junk, too short).
- `{name}` merge (missing name, extra spaces, special characters, empty list, very long list).
- Text wrapping and shrinking (short, long, very long, accents, no spaces).
- Template validation (valid, missing field, bad type, unknown version, oversized).
- Unlock codes (valid, wrong device, tampered, expired, wrong key, empty).
- Free-tier limits (5 recipients free, 100 unlocked, event pass expiry).
- Draft save and load (including after an app update).

## B11. Git and files

- Small commits with clear messages (`feat:`, `fix:`, `test:`, `chore:`, `security:`).
- Never commit `.env` files, keys, keystores, build output, user data or sales records.
- Keep `.env.example` current with variable names only.

## B12. Things you must NOT do

- Do not add ads, trackers, analytics or any network calls.
- Do not send WhatsApp messages automatically or simulate taps.
- Do not upload or log recipient data.
- Do not put secrets, private keys or test unlock codes in the repo.
- Do not use copyrighted fonts, pictures, characters, lyrics or logos.
- Do not trust a stored "premium" flag.
- Do not add features outside the current task or outside the v1 scope in A3.
- Do not remove or weaken tests.
- Do not guess about rules from Google, WhatsApp or the law. Ask.

## B13. Definition of done (all must be true)

- [ ] The task does exactly what was asked and nothing else.
- [ ] Works in airplane mode on a real phone (for features that run in the app).
- [ ] `npm run test` passes and `npx tsc --noEmit` shows zero errors.
- [ ] New logic has tests, including bad-input cases.
- [ ] No network calls, remote assets, secrets or unrelated edits.
- [ ] Tap targets 48 px or larger, text readable, empty and error states handled.
- [ ] App size and speed still within the targets in B8.
- [ ] A short summary is written: files changed, tests run, what could not be checked, any rule bent.

## B14. Prompt pattern for tasks

Every task should be written with four parts:

```text
GOAL: (one sentence)
CONTEXT: (what already exists, which files)
RULES: Follow QUICKCARD.md Part B.
DONE WHEN: (a test or check you can see pass)
```

**Example first task:**

```text
GOAL: Draw a card on a canvas from a template and save it as a 1080x1080 JPG.
CONTEXT: New React + TypeScript + Vite project with Capacitor. Template format is in A7.
RULES: Follow QUICKCARD.md Part B. Bundle fonts. No network calls. Text wraps and shrinks.
DONE WHEN: Three sample templates export correct JPGs on a real phone in airplane mode,
and tests for text wrapping and template validation pass.
```

## B15. Review prompt (run after every task)

> Review your last changes against QUICKCARD.md Part B. List any violations (network calls, remote assets, secrets, automatic sending, uploaded recipient data, missing tests, copyright risk, unrelated edits) and fix them. Then run the tests and report the results.

---

## Glossary (plain English)

- **APK / AAB:** an APK is the file that installs an Android app. An AAB is the upload file Google Play uses.
- **Canvas:** a blank drawing area in code where text and shapes are painted, then saved as a picture.
- **Capacitor:** a tool that wraps a web-built app into a real Android app.
- **Device ID:** a code that identifies one phone's copy of the app.
- **Digital signature:** proof, made with a private key, that something came from you and was not changed.
- **Dexie / IndexedDB:** storage inside the phone for drafts and lists.
- **MVP:** the smallest useful version of the product.
- **OFL:** an open font licence that allows bundling a font in an app for free.
- **SVG:** a small vector drawing that stays sharp and tiny.
- **Template:** a ready-made design with blanks to fill in.
- **wa.me link:** a web address that opens a WhatsApp chat with a number, optionally with a typed message.
- **Zod:** a tool that checks data has the right shape and rejects bad data.
