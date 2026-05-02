# Cross-Module Communication

When one feature needs data from another feature, do NOT import directly from
`@/features/other-feature/...`. Instead:

1. Create a shared abstraction in `src/lib/` or `src/services/`
2. Or use React Context / Zustand store in `src/contexts/`
3. Or pass data down via page-level server components in `src/app/`

This keeps feature modules decoupled and boundaries clean.
