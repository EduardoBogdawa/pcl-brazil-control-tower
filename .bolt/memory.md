# Project memory

## Product intent & audience

- 1:1 rebuild of the **Advanced PC&L Control Tower** application from an existing HTML source of truth.
- Goal: preserve all visual design and functional behavior exactly while migrating to Vite + React.
- Internal operational users; UI text and labels are in **Portuguese**.

## Brand personality & voice

- Professional, industrial control-tower aesthetic; data-dense but clean.
- Production-grade quality; avoid generic/cookie-cutter look.

## Visual design & UX direction

- Stack: **Vite + React (JSX)**, **Tailwind CSS**, **lucide-react** icons, `@/` path alias for imports.
- **Panel cards** are the core UI unit, organized by area; each area has its own accent color used for badges/highlights.
- Cards show **status badges** on the face: attachments badge and instruction badge.
  - Instruction badge: book icon + label "Instrução"; for CM panels the label is "Conhecimento".
  - Combined display when both exist: e.g. "Instrução · 2 anexos".
  - No badge shown when neither instruction nor attachments exist.
- Badge is clickable to open the instruction directly (shortcut vs. using the gear/settings icon).
- Panel settings accessed via gear icon.
- Original HTML file is the visual/behavioral source of truth — match it closely.

## Decisions, constraints & rationale

- Do not install extra UI/icon packages beyond the template defaults unless explicitly requested.
- All CM panels automatically receive a default orientation text, so they always show the "Conhecimento" badge.
- Instruction badge added because users needed a visible signal that a panel contains an instruction without opening settings.
- Build is verified via successful compile; visual confirmation in preview is recommended after changes.

## Open questions & assumptions

- Assume the original HTML file remains the reference for exact layout, colors, and interactions; if unavailable, reverse-engineer from current React output.
- Need to confirm all panel areas and their accent colors are fully mapped from source.
- Pending visual verification of instruction badge rendering in preview.