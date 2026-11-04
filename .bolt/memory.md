# Project memory

## Product intent & audience

- **«I CAN»** — client-only web app to help overcome learned helplessness via small achievable actions.
- Ukrainian-language UI throughout. Audience: people feeling powerless, needing gentle support to regain control.
- Goal: restore belief in own abilities through 1–10 min actionable steps, positive reinforcement, progress tracking.
- Slogan: «Тобі не потрібно змінювати все одразу. Почни з одного маленького кроку!»

## Brand personality & voice

- Warm, supportive, non-critical, psychologically safe.
- Calm, reassuring tone; never dismisses user feelings.
- Encouraging messages after each completed step.

## Visual design & UX direction

- **Palette:** sky `#BFDBFE`, lavender `#EDE9FE`, mint `#A7F3D0`, white `#F9FAFB`.
- Rounded cards, soft shadows, smooth animations, large buttons.
- Mobile + desktop responsive.
- Three main UI states: Empty (sprout illustration + example situations), Success (AI response + 3 steps + control circle + progress bar), Error (soft validation message, auto-fallback to Mock).
- Components: header w/ logo + tagline + settings modal; situation input; emotion selector (3 states with emoji); difficulty selector (light/medium/high); action button; 3 interactive step cards (start + done checkbox); progress bar 0→33→66→100%; Control Circle (can/cannot control); My Small Wins (localStorage history w/ dates + clear option).
- Settings modal includes API key field and AI model picker (dropdown/select).
- Icons from lucide-react (per global prompt).

## Decisions, constraints & rationale

- Client-side only, no backend. All persistence via localStorage (API key, selected AI model, progress, wins history).
- OpenRouter integration; user-selectable model with fallback to `xingchen-agi/xing4.0-29b-a4b:free`.
- Available models: Gemini 2.0 Flash (default), GPT-4o mini, Claude 3.5 Haiku, Llama 3.3 70B.
- Auto-fallback to Mock generation when API key missing or AI fails — no technical error shown to user.
- AI must return: analysis, what user can/cannot control, exactly 3 realistic steps (1–10 min each).
- Input validation: reject empty or <3 chars.
- New situation button allows reset without page reload.
- Framework: Vite + React + TailwindCSS. Path alias `@/` → `src/`. No extra UI/icon packages.

## Open questions & assumptions

- Cross-device sync not required (localStorage only) — assumed acceptable.
- Emoji vs custom icons for emotion states — user used emoji in spec; can refine later.
- Mock mode diversity: assumed per-emotion + per-difficulty variation sufficient; richness TBD.
- Browser testing of model picker not done; should verify selected model is actually used by OpenRouter.