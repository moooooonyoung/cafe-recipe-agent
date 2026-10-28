# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

`PLAN.md` is the source of truth for the design: read it before building anything, and keep it updated if a decision changes. Deadline is 2026-11-01, solo project; the day-by-day schedule and the feature freeze on 10/31 are in `PLAN.md` §5. Step 1 (project setup) is done; check `git log` for how far the steps have progressed.

## Working rules

- Implement in the step order given in `PLAN.md` §5.
- When a step is done, run `npm run check` (type-check, tests, build) and show the user the results first, then commit.
- Keep the code simple enough that the author can explain it themselves.
- Create and edit files with the file tools (Write/Edit), not shell commands (heredocs, `sed`, scripts that rewrite files).

## Commands

Node is installed through nvm, so a non-interactive shell needs `. ~/.nvm/nvm.sh` first.

- `npm run dev`: Vite dev server
- `npm run build`: type-check (`tsc`) then production build into `dist/`
- `npm run check`: type-check (`tsc --noEmit`), run all Vitest tests, then production build. Use this one to verify a change instead of running the three separately.
- `npm test`: run all Vitest tests once; `npm run test:watch` for watch mode
- Single test file: `npx vitest run src/i18n/i18n.test.ts`; by test name: `npx vitest run -t "<name>"`

## What this is

A Korean-language drink recipe guide for cafe part-timers, used on a landscape tablet (touch-only) in a busy store. Readability and tap speed matter more than features. It must also work with a mouse on a laptop, because demos may happen there. It is rule-based: no LLM in the MVP.

## Architecture constraints (from PLAN.md)

- **Pure rules layer, separate from UI.** Option-to-quantity calculation, menu/option status (정상 / 대체 필요 / 제조 불가), and substitution suggestion are pure functions with Vitest tests. Screens only render their results.
- **Option interpretation is a seam.** Buttons produce an "option object" (온도, 사이즈, 샷 추가, 당도). A later LLM free-text input (stretch) must produce the same object without touching the rules layer.
- **Stock is binary** (있음/품절), with no quantities. It is kept in `localStorage`, with a reset-to-default button.
- **Recipe data is hand-authored, not computed.** Steps exist once per menu × temperature. Ingredient amounts hold regular and large values explicitly, with no scaling math. A menu may override steps for large only where they really differ. Step sentences reference ingredients (`{에스프레소}`) rather than hardcoding numbers.
- **Substitutions are defined per ingredient** as an ordered candidate list with a short note each. Menus may mark specific ingredients as non-substitutable. Cancelling a suggestion advances to the next candidate. No candidates left, all candidates sold out, or a non-substitutable ingredient sold out means 제조 불가.
- **Menu card status** is computed from default options. If the default fails but another option works, show 대체 필요 rather than 제조 불가. The yellow badge always carries a short reason (e.g. `얼음 품절 · HOT만 가능`). The option screen recomputes on every choice and disables impossible choices with the reason.
- **i18n-ready.** UI strings and name/step text live in per-language files (Korean first). Ids, amounts, and temperatures live in language-independent data.
- **Keep dependencies minimal.** No routing library (screen state in React state), no state library, plain CSS, light mode only.

## UI rules

- Touch targets at least 48px (prefer 56px). Landscape tablet is primary; portrait and phone are out of scope.
- Ice is blue with the text `ICE ❄️`; hot is orange with `HOT 🔥`. Never rely on color alone.
- Red is reserved for warnings (품절 / 제조 불가). Yellow is for the 대체 필요 badge.
- The guide screen shows a large option summary at the top, ingredients on the left, steps on the right. Tapping a step toggles its checkmark, and tapping again undoes it. Substituted ingredients get a visible badge.

## Testing conventions

- Test names are Korean scenario sentences (e.g. `오트밀크 품절이면 우유를 제안한다`).
- Data-validation tests are required. Substitute ids must exist, every recipe must have its required fields, step placeholders must refer to that recipe's ingredients, and non-substitutable markers must refer to real ingredients.
- Screens are checked by eye against the checklist in `PLAN.md` §4 (tablet landscape and laptop sizes). There are no UI tests.

## Data caveats

Data values carry a source comment. `근무 경험 기준` means it comes from the author's own cafe work (a value they were unsure of is marked `추정`). `샘플 값` means a placeholder Claude made up, including the `PLAN.md` §6 items marked `[샘플 값]` (menu lineup, syrup pumps per sweetness level, default options). Sample values stay placeholders until the owner reviews them against the real store, so don't treat them as final. Don't change a `근무 경험 기준` value without asking.
