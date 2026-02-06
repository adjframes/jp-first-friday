# JP First Friday Art Walk — Landing Page

## Overview

A single static landing page for Jamaica Plain's monthly First Friday art walk. Shows an interactive Google Map of participating galleries and cards with current exhibition info. Gallery data is managed via two Google Sheet tabs — one for locations (rarely changes) and one for shows (updated monthly).

## File Structure

```
jp-first-friday/
├── index.html    # Main page — CDN links for Google Maps and PapaParse
├── style.css     # All styles — responsive, mobile-friendly
├── script.js     # Map init, data fetch, card rendering
└── CLAUDE.md     # This file
```

## How It Works

1. Page loads Google Maps API and PapaParse (CSV parser) from CDNs
2. Google Maps calls `initMap()` once loaded, which initializes the map and triggers data loading
3. `script.js` fetches two published Google Sheet CSV URLs: **Locations** and **Shows**
4. Both sheets are fetched in parallel; rows are joined on `id` ↔ `location_id`
5. Shows are filtered by date — only shows where today falls between `start_date` and `end_date` are active
6. Only locations with an active show get a map marker and a card
7. If fetches fail or no URLs are set, hardcoded fallback data is used

## Google Maps API Key

A Google Maps JavaScript API key is required. To set it up:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. Enable the **Maps JavaScript API**
4. Create an API key under **Credentials**
5. Replace the key in the Google Maps `<script>` tag in `index.html`

## Google Sheet Setup

Use a single Google Sheets workbook with **two tabs** (sheets). Each tab is published separately as CSV.

### Tab 1: Locations

Columns:

| id | name | address | lat | lng | website | instagram | contact |
|----|------|---------|-----|-----|---------|-----------|---------|

- `lat` / `lng` are decimal coordinates (e.g. `42.3098`, `-71.1138`)
- `instagram` is the handle without the @ (e.g. `jamesonandthompson`)
- `contact` is free-text — email, phone, or any contact info you want displayed

Pre-filled data:

| id | name | address | lat | lng |
|----|------|---------|-----|-----|
| jt | Jameson & Thompson Picture Framers | 18 Bartlett Sq, Jamaica Plain | 42.3098 | -71.1138 |
| gspc | Green Street Photo Collective | 186 Green St, Jamaica Plain | 42.3114 | -71.1085 |
| ula | Ula Cafe | 284 Amory St, Jamaica Plain | 42.3082 | -71.1100 |
| eliot | Eliot School Annex | 253 Amory St, Jamaica Plain | 42.3088 | -71.1094 |
| cyberarts | Boston Cyberarts Gallery | 141 Green St, Jamaica Plain | 42.3120 | -71.1070 |

### Tab 2: Shows

Columns:

| location_id | current_show | show_description | start_date | end_date | image_url |
|-------------|-------------|-----------------|------------|----------|-----------|

- `location_id` must match an `id` from the Locations tab
- `start_date` / `end_date` use **YYYY-MM-DD** format (e.g. `2026-02-01`)
- A show only appears on the map and in cards when today is within the date range
- Either date can be left blank for open-ended ranges (e.g. no `end_date` means the show stays active indefinitely)
- Update this tab each month with new exhibition info

### Publishing

1. **File → Share → Publish to the web**
2. In the dropdown, select the **Locations** tab → CSV → Publish → copy URL
3. Repeat for the **Shows** tab → CSV → copy URL
4. Paste both URLs into `script.js`:
   - `LOCATIONS_CSV_URL` — the Locations tab URL
   - `SHOWS_CSV_URL` — the Shows tab URL

## Deployment

Fully static site — no server or build step. Host on any static provider (GitHub Pages, Netlify, Vercel, etc.) or open `index.html` directly in a browser. Requires a Google Maps API key to display the map.

## Making Changes

- **Add/remove a gallery**: Add a row to the Locations tab (with a unique `id`, lat, and lng), then add a matching row in Shows
- **Update exhibitions**: Edit only the Shows tab — change `current_show`, `show_description`, `start_date`, `end_date`, `image_url`
- **Change map center/zoom**: Edit the `center` and `zoom` in the `initMap()` function in `script.js`
- **Styling**: All styles are in `style.css` — layout uses CSS Grid for the cards
- **Header text**: Edit directly in `index.html`
