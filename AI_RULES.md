# AI Rules

## Tech stack

- React is the UI framework for the app.
- TypeScript should be used for all application code.
- React Router handles client-side routing, and routes should stay in `src/App.tsx`.
- Tailwind CSS is the default styling system.
- shadcn/ui is the preferred source for UI building blocks.
- Radix UI powers accessible primitives used by shadcn/ui components.
- `lucide-react` is the default icon library.
- Source code belongs in `src/`, with pages in `src/pages/` and reusable components in `src/components/`.

## Library usage rules

- Use **React + TypeScript** for all new components, hooks, pages, and app logic.
- Use **React Router** for navigation and route definitions. Do not introduce another routing library.
- Keep route declarations in **`src/App.tsx`**. Do not scatter routing across unrelated files.
- Use **Tailwind CSS** for all styling, layout, spacing, colors, and responsive behavior.
- Use **shadcn/ui** components first for buttons, cards, dialogs, inputs, forms, tabs, sheets, tables, and other common UI patterns.
- Use **Radix-based behavior through shadcn/ui** for accessible interactive UI. Do not build custom replacements when a shadcn/ui component already fits.
- Use **`lucide-react`** for icons. Do not mix in other icon libraries unless there is a clear requirement that lucide cannot satisfy.
- Put **pages** in `src/pages/` and **shared/reusable components** in `src/components/`.
- Prefer small, focused components over large multi-purpose files.
- Do not edit generated or library source just to restyle it; wrap or compose shadcn/ui components in app components instead.
- Avoid adding new dependencies if the existing stack already covers the need.
- If a feature needs forms, dialogs, menus, drawers, popovers, or similar UI, check **shadcn/ui** before creating custom implementations.
- Keep solutions simple and consistent with the existing stack instead of introducing parallel patterns.
