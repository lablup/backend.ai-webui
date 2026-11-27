# react/src/pages

- Each folder here holds one route component (`<Name>Page/<Name>Page.tsx`) and the code placed with it (`components/`, `hooks/`, `helper/`). Its `CLAUDE.md` describes the page.
- A module used by one to three pages lives in a page folder; four or more pages, or any import from shared code, makes it shared. Placement and how to count: ADR 0024.
