# Derthona Basket Brand Manual — maintenance rules

## Required brand.md synchronization

`brand.md` is the machine-readable companion to the visual brand manual in
`index.html`. It must remain aligned with the website.

For every change to this project:

1. Read `brand.md` before editing brand content or assets.
2. Check whether the change affects any brand fact, rule, name, message, asset,
   color, typeface, logo configuration, usage instruction, tone-of-voice rule,
   manifesto text, visual-language principle, or download path.
3. When it does, update `brand.md` in the same change. Do not leave the website
   and `brand.md` describing different systems.
4. When it does not, explicitly verify that `brand.md` still matches before
   considering the work complete.
5. Increment the integer `version` in the `brand.md` frontmatter for a
   substantial identity, messaging, or system update. Small corrections and
   link repairs do not require a version increase.

## Source-of-truth model

- `index.html` and its linked assets are the complete visual reference for
  people.
- `brand.md` is the concise operational reference for AI tools and text-based
  workflows.
- Do not embed binary files in `brand.md`. Link to the approved masters in
  `assets/` using paths relative to the project root.
- When the two references appear to conflict, stop and reconcile them rather
  than choosing one silently.

## Completion check

Before handing off a brand-related update, confirm:

- terminology and section names match;
- color values and typography roles match;
- logo names, configurations, usage rules, and asset links match;
- voice, manifesto, and visual-language statements match;
- every path added to `brand.md` resolves to an existing file.
