# BACKLOG

Persistent record of design discussions, decisions, and phase status. New entries on top; completed (collapsed) at the bottom.

---

## Phase 1 — Apps polish: /apps/ home, nav, NextLeg fixes (2026-11-07)

Context: NextLeg added; /apps/ looked gloomy; no way to switch between apps; Games ↔ Apps switch was inconsistent.

Decisions:
- /apps/ stays dark (follows system scheme), no big games-style hero (only 2 apps): gradient-accent headline, soft glow background, richer cards (status, tags, per-app accent), principles row.
- Games ↔ Apps: on Games the "Apps →" pill sits top-right aligned to the content edge (main.games-root box); on Apps the "← Games" pill sits top-left (mirrored).
- Product pages (MedBinder, NextLeg) get a games-style switcher: ← to /apps/ + app icons (current one highlighted); Privacy/Support/lang stay on the right.
- NextLeg H1: "as a team." / "w grupie." forced onto its own line; size unchanged.
- NextLeg activity tiles: solid colour tile, large white centred SF-Symbols-style glyph; root cause of "broken" icons was `.nl-type span` overriding the tile's `display:grid`.

- [x] Discussed
- [ ] Researched
- [ ] Planned
- [x] Executed
- [ ] Committed

---

## Deferred (parking lot)

## Completed (collapsed)
