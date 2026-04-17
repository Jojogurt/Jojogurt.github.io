# Prompt: Generate Landing Page Website

Copy-paste this prompt into Claude Code in your **landing page project directory**.

---

## Prompt

```
Build a single-page landing page for a mobile game using data from an external project.

## Data sources

Read these files from the game project:
- `../follow-the-trail/screenshots/landing.json` — structured game data (name, tagline, description, features, colors, platforms, etc.)
- `../follow-the-trail/screenshots/output/*.png` — generated screenshots (720x1280 each)
- `../follow-the-trail/assets/icon.png` — app icon
- `../follow-the-trail/assets/flat/logo/logo.png` — game logo (optional, use if exists)

Copy screenshots and icon into this project's `public/images/<slug>/` directory (slug from landing.json).

## Page structure

Build a responsive single-page site with these sections, in order:

1. **Hero** — game logo (big, centered, ~80% width, up to 620px) + tagline + CTA button. NO screenshot in the hero — keep it clean and focused on the logo. Background uses the game's color scheme with subtle radial gradients.
2. **Screenshots carousel** — horizontal scrollable row of all gameplay screenshots in phone mockup frames. Mobile: swipeable. Desktop: scroll arrows.
3. **Features** — grid of feature cards (icon + title + short description). Use the features array from landing.json. 3 columns desktop, 1 column mobile.
4. **Download / CTA** — platform badges (App Store, Google Play) linked to store URLs from landing.json. If store_url is null, show "Coming Soon" badge instead of a link.
5. **Footer** — minimal: game name, year, optional links.

## Design rules

- Use colors from landing.json (`colors.primary`, `colors.secondary`, `colors.background`, `colors.text`)
- Dark theme by default (background color from JSON)
- Phone mockup: CSS border-radius + border + shadow simulating a phone bezel around screenshots — NO external image frames
- Typography: system font stack, or import one clean sans-serif (Inter, Space Grotesk, or similar)
- Mobile-first responsive. Breakpoints: 480px, 768px, 1024px
- Smooth scroll between sections
- Rich animations:
  - Hero: logo fades in with scale (fadeInScale), then subtle glow pulse loop. Tagline and CTA fade-in-up with staggered delays
  - Sections: titles, feature cards, carousel items, and store badges all animate on scroll via IntersectionObserver
  - Feature cards and carousel items use staggered transition-delays for a cascading reveal
  - Respect `prefers-reduced-motion` — disable all animations when set
- No frameworks — plain HTML + CSS + vanilla JS
- Single index.html + style.css + script.js (if needed)
- All images referenced as relative paths from public/

## Multi-game support (future)

Structure the code so a second game can be added later as another page or card on a main index.
Use the slug from landing.json for directory naming: `public/images/<slug>/`.
Keep CSS variables for colors so each game page can override them.

## Quality checklist

- [ ] Lighthouse performance > 90
- [ ] All images have alt text
- [ ] Works without JS (screenshots still visible, just no animations)
- [ ] No horizontal scroll on mobile
- [ ] Phone mockups look good on both mobile and desktop
- [ ] CTA buttons are prominent and above the fold on mobile
```

---

## Usage

1. Create your landing page project directory
2. Open Claude Code in that directory
3. Paste the prompt above, replacing `../follow-the-trail` with the absolute path to the game project (e.g. `/Users/kked/Projects/follow-the-trail`)
4. Claude reads landing.json, copies assets, generates the site
5. For a second game — run the same prompt with a different `../follow-the-trail`

## Adding a main index with cards

Once you have 2+ game pages, use this follow-up prompt:

```
Create a main index.html that shows all games as cards.
Scan public/images/*/  for game directories.
For each, read the corresponding landing.json to get name, tagline, icon, slug, and status.
Each card shows: icon, name, tagline, status badge, and links to /<slug>.html.
Grid layout: 2 columns desktop, 1 column mobile.
Same dark theme, use a neutral color scheme for the index page.
```
