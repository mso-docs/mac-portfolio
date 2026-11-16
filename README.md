# mac-portfolio

Portfolio of Mackenzie O'Brien, AI safety researcher and builder at Mac Labs AI.

**Live site → [mso-docs.github.io/mac-portfolio](https://mso-docs.github.io/mac-portfolio/)**

## What is on the page

1. **Flagship MCP tools:** DocsNavigator MCP and Docs Navigator MCP: SUSE Edition.
2. **Research:** Lexsi (unlearning vs. hiding), the Apart AI x Epistemics sprint project, a SPAR Fall 2026 project in progress, and JEPA-style world models research in a research collaboration (in progress), covering time-series event forecasting, calibration when event rates change, and work that builds on KITE. The SPAR and world-models cards are hardcoded in `index.html`. They are not hackathon entries or papers, so they do not change the computed hackathon or paper counts.
3. **Hackathon projects:** a filterable grid and a dated timeline, driven by [`data/projects.json`](data/projects.json). The total is computed from that file. The full list with every event, submission, code, and video link is at `/hackathons/`.
4. **Other Spaces**, **selected earlier work**, and **contact** links.

A light/dark toggle in the nav follows the system setting by default and remembers the visitor's choice in `localStorage`.

## How to add a hackathon

All hackathon data lives in [`data/projects.json`](data/projects.json). Append one object to `projects`, and these update on their own:

- the hackathon grid and compact timeline on the main page,
- the shareable list at [`/hackathons/`](https://mso-docs.github.io/mac-portfolio/hackathons/) (link to this one from LinkedIn),
- every count (hero, section header, timeline, and the totals on `/hackathons/`).

Example entry:

```json
{
  "id": "my-project",
  "name": "My Project",
  "summary": "One or two sentences taken from the README.",
  "categories": ["Research", "Tools"],
  "event": "Event name exactly as the organizer writes it",
  "eventType": "Online hackathon",
  "eventUrl": "https://example.org/the-official-event-page",
  "submissionUrl": "https://example.org/your-writeup-or-submission",
  "videoUrl": "https://youtu.be/xxxxxxxxxxx",
  "date": "2026-12-01",
  "dateLabel": "Dec 1, 2026",
  "dateBasis": "where the date came from",
  "verified": true,
  "image": "assets/img/p-my-project.jpg",
  "links": { "repo": "https://github.com/mso-docs/my-project", "demo": "https://mso-docs.github.io/my-project/", "space": "" }
}
```

Notes:

- `playlistUrl` (top of the file) is the YouTube playlist with every hackathon video. It powers the "Watch all hackathon videos" buttons.
- `eventUrl` is the official event page. `submissionUrl` is your writeup or submission (Kaggle, Devpost, DEV, Apart, and so on). `videoUrl` is optional. Use `""` when there is no link, and the button is simply left out.
- `date` (ISO) sorts every list. `dateLabel` is the text shown.
- Categories must be one of `Research`, `Agents`, `Tools`, `Apps` (see `categoriesOrder`).
- `image` is optional. Cards without one get neutral art. Screenshots go in `assets/img/`.
- Set `"verified": false` to keep an entry in the file but hide it everywhere until the event is confirmed.
- Check each URL before you add it: `curl -s -o /dev/null -w "%{http_code}\n" -L "<url>"`.

## Stack

- Plain HTML, CSS, and vanilla JavaScript. No framework and no build step.
- Fonts are self-hosted (Inter, Source Serif 4, JetBrains Mono; SIL OFL 1.1).
- Design tokens come from the Lexsi and Apart landing pages.
- Hosted on GitHub Pages (main branch, root).

## Running locally

The hackathon grid loads `data/projects.json` with `fetch`, so use a static server rather than opening the file directly:

```bash
python3 -m http.server 4173
# then open http://127.0.0.1:4173
```
