# TASK: Create coordination file "AGENTS.md" for frontend development
# PURPOSE: Define and orchestrate specialized subagents assisting in the Next.js + Tailwind frontend implementation for NexusCouncil.
# LOCATION: /AGENTS.md

---------------------------------------------
## OVERVIEW
This document establishes the structure, scope, and responsibilities of each subagent participating in the **Next.js frontend** development for NexusCouncil.

---------------------------------------------
## FRONTEND AGENTS

### UI Agent (`@ui_agent.yaml`)
**Purpose:** Create, style, and maintain reusable React components using TailwindCSS.  
**Capabilities:**
- Build atomic UI components (buttons, cards, navbars, modals).  
- Ensure responsiveness and accessibility (ARIA + dark mode).  
- Align with design tokens: `--nexus-green`, `--background-light`, `--background-dark`.

---

### Layout Agent (`@layout_agent.yaml`)
**Purpose:** Handle global structure: header, footer, navigation, sidebar, and page composition.  
**Capabilities:**
- Create layout templates for landing page, blog, and dashboard views.  
- Integrate metadata (`next/head`) and SEO tags.  
- Manage shared layout context (theme, scroll, modal states).

---

### API Agent (`@api_agent.yaml`)
**Purpose:** Connect frontend to Django REST API.  
**Capabilities:**
- Define base Axios client (`/lib/api.ts`).  
- Generate TypeScript types from OpenAPI schema (future step).  
- Implement `fetch` hooks (SWR or React Query) for CMS endpoints.  
- Handle authentication tokens (JWT).

---

### Page Agent (`@page_agent.yaml`)
**Purpose:** Create page-level structures under `/src/app/`.  
**Capabilities:**
- Implement dynamic sections (`Hero`, `Solutions`, `FAQ`, `FinalCTA`, etc.) using CMS data.  
- Define mock data fallback if API is offline.  
- Ensure smooth navigation and anchor-based scrolling.

---

### Config Agent (`@config_agent.yaml`)
**Purpose:** Maintain global configuration and environment management.  
**Capabilities:**
- Manage `.env.local` variables (API_URL, TOKEN).  
- Define Next.js config overrides.  
- Sync environment variables with backend (CORS alignment).

---

### Fixture Agent (`@fixture_agent.yaml`)
**Purpose:** Create local mock JSON files to simulate CMS endpoints during early frontend development.  
**Capabilities:**
- Store data in `/src/mocks/`.  
- Mirror structure of backend models.  
- Provide sample data to test layout and component rendering before API integration.

---------------------------------------------
## WORKFLOW

1. **UI Agent** -> builds base components.  
2. **Layout Agent** -> assembles pages.  
3. **Fixture Agent** -> provides mock data.  
4. **API Agent** -> connects live data from Django backend.  
5. **Page Agent** -> integrates all sections.  
6. **Config Agent** -> keeps everything synced via environment variables.

---------------------------------------------
EXPECTED OUTPUT
---------------------------------------------
"AGENTS.md created at project root - frontend subagents defined for structured Next.js + Tailwind CMS development."


## Project-Specific Rules (from `tfs-backend-rules.md`)
- Commit format: `[YYYY-MM-DD] Brief summary`; include a bullet list of detailed changes in the body when committing.
- Code comments: add a descriptive English comment, immediately followed by its Spanish equivalent on the next line.
- Environment commands: provide Windows 11 Command Prompt-compatible commands for installs, file ops, and tooling.
- Unit tests: for every new function or class, add a corresponding `pytest` test under `tests/`; cover typical inputs and edge cases. If `tests/` does not exist yet, create it; do not relocate existing tests unless explicitly requested.
- Code style: PEP 8 conventions, `snake_case`, 4-space indents, max line length 88, and docstrings (Google/NumPy style) for every function and class.