## Quick orientation for AI coding agents

This repository is a small static frontend project (plain HTML, CSS, JS). There is no build system, package.json, or server code in the tree. The guidance below focuses on patterns and conventions you can rely on when making edits or generating code.

Key facts (big picture)
- Static site: source files live under `frontend/` with HTML in `frontend/html/`, JS in `frontend/js/`, and CSS in `frontend/css/`.
- No backend: pages are standalone and conditionally run page-specific JS via URL checks (see `frontend/js/scripts.js`).
- Repo README suggests a `develop` branch in the workflow; follow existing git flow used by humans (see `README.md` quick-start).

Important files to reference
- `frontend/html/home.html` — homepage layout, product listing example (look under the `<section>` with multiple `<div class="product">` entries).
- `frontend/js/scripts.js` — central JS. Patterns to note:
  - Uses `window.onload` and checks `window.location.href.includes("about")`, `"contact"`, `"logIn"` to run page-specific logic.
  - Manipulates specific element IDs: `container`, `board`, `textbox1`, `textbox2`, `textbox3`, `errorMessage`, `thankYouMessage`, `logInMessage`.
  - Contains a small canvas-based snake game that only initializes on the `about` page.
- `frontend/css/styles.css` — global styles. Key classes/IDs: `.homeBody`, `.container`, `.container-visible`, `.product`, `.image-placeholder`, `#board`, `#textbox1` etc.

Conventions and project-specific patterns
- Navigation and linking: HTML uses relative paths like `../css/styles.css` and `../js/scripts.js`; preserve those relative links when moving files.
- Page detection in JS: do not replace the `includes("about")` style guards unless you update all pages and file names consistently; these are how page-specific code runs.
- DOM IDs are relied-on across files: keep `textbox1`, `textbox2`, `textbox3`, `container`, `board` stable when editing markup or JS.
- Product entries are static HTML blocks in `home.html`. To add a product, replicate a `<div class="product">` block and include an `<img class="myImg" src="...">`.
- Visual reveal: the `.container` element becomes visible when JS adds `.container-visible` to it (see `scripts.js`). Keep that animation class when changing layout.

Integration & external dependencies
- Fonts and images are loaded from external URLs (Google Fonts and external CDNs). Expect network requests; changes to those URLs will affect rendering.
- No package manager or CI config discovered; assume local, manual testing.

Developer workflows an AI should follow (explicit steps)
1. When making changes, run unit tests only if the project adds them later — currently none exist. Validate by opening updated HTML pages in a browser and using DevTools.
2. Preserve the repository's git flow: branch from `main` or `develop` per README; include concise commit messages that explain the UI/behavior change.
3. For JS changes touching page detection, update all affected pages and document the reason in the PR description.

Examples (copyable) — how to do common edits
- Add a homepage product: edit `frontend/html/home.html` and add another
  `<div class="product"><div class="image-placeholder"><img class="myImg" src="https://..."></div></div>`
- Change home background image: edit `.homeBody { background-image: url(...) }` in `frontend/css/styles.css`.
- Make `container` reveal faster: update transition timing in `.container` → `transition: opacity 0.5s, transform 0.5s;` and keep JS that toggles `container-visible`.

What not to change without human review
- File/URL names relied on by `scripts.js` page checks (e.g., changing `about.html` to `about-us.html`) — update JS accordingly and note in PR.
- IDs used by JS: `textbox1/2/3`, `errorMessage`, `board`, `container`.

If you need more context or constraints
- Ask for: preferred branch naming, any planned build tooling (if maintainers want a modern workflow), or whether product data will move to a JSON/API (that will change the editing approach).

End of file — keep this short (20–50 lines) and update if repository structure changes.
