# JP First Friday Art Walk

## Overview

A static multi-page site for Jamaica Plain's monthly First Friday art walk. The home page shows an interactive Google Map and cards for current exhibitions. The Venues page lists all participating locations. The Contact page provides email info and a newsletter signup form.

## File Structure

```
jp-first-friday/
├── index.html    # Home page — map, current shows, Google Maps + PapaParse CDNs
├── venues.html   # Venues page — all locations as cards (no show filtering)
├── contact.html  # Contact page — email link + Google Form newsletter iframe
├── style.css     # All styles — shared across all pages
├── script.js     # Home page JS — map init, data fetch, card rendering
├── venues.js     # Venues page JS — fetches Locations CSV, renders venue cards
└── CLAUDE.md     # This file
```

## Navigation

All three pages share a `<nav class="site-nav">` with links to Home, Venues, and Contact. The current page's link gets the `nav-link--active` class. The header/footer HTML is duplicated across pages (no build step, no templating).

- **Home** (`index.html`): Full-height header with nav, next-date box, title, tagline
- **Venues** (`venues.html`): Compact header (`site-header--compact`) with nav + page title
- **Contact** (`contact.html`): Compact header with nav + page title

## How It Works

### Home Page
1. Page loads Google Maps API and PapaParse (CSV parser) from CDNs
2. Google Maps calls `initMap()` once loaded, which initializes the map and triggers data loading
3. `script.js` fetches two published Google Sheet CSV URLs: **Locations** and **Shows**
4. Both sheets are fetched in parallel; rows are joined on `id` ↔ `location_id`
5. Shows are filtered by date — only shows where today falls between `start_date` and `end_date` are active
6. Only locations with an active show get a map marker and a card
7. If fetches fail or no URLs are set, hardcoded fallback data is used

### Venues Page
1. `venues.js` fetches the **Locations** CSV via PapaParse
2. All locations are rendered as cards — no show filtering, no map
3. Cards show a venue image if `image_url` is set, otherwise a placeholder with initials
4. Falls back to `DEFAULT_LOCATIONS` if the fetch fails

### Contact Page
- Email mailto link to `info@firstfridaysjp.com`
- Newsletter signup form that POSTs to a Google Apps Script web app (appends email + timestamp to a Google Sheet)
- `SIGNUP_URL` in the inline `<script>` must be set to the deployed Apps Script URL

## Duplicated Constants

`LOCATIONS_CSV_URL` and `DEFAULT_LOCATIONS` are defined in both `script.js` and `venues.js`. If you change the Locations CSV URL or add/remove default locations, update both files.

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

| id | name | address | lat | lng | website | instagram | contact | image_url |
|----|------|---------|-----|-----|---------|-----------|---------|-----------|

- `lat` / `lng` are **optional** decimal coordinates (e.g. `42.3098`, `-71.1138`). If omitted, the address is auto-geocoded via the Google Maps Geocoding service
- `address` should be specific enough for geocoding (include city and state, e.g. "18 Bartlett Sq, Jamaica Plain, MA")
- `instagram` is the handle without the @ (e.g. `jamesonandthompson`)
- `contact` is free-text — email, phone, or any contact info you want displayed
- `image_url` is an optional photo URL for the venue (used on the Venues page; shows a placeholder if empty)

Pre-filled data:

| id | name | address |
|----|------|---------|
| jt | Jameson & Thompson Picture Framers | 18 Bartlett Sq, Jamaica Plain, MA |
| gspc | Green Street Photo Collective | 186 Green St, Jamaica Plain, MA |
| ula | Ula Cafe | 284 Amory St, Jamaica Plain, MA |
| eliot | Eliot School Annex | 253 Amory St, Jamaica Plain, MA |
| cyberarts | Boston Cyberarts Gallery | 141 Green St, Jamaica Plain, MA |

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
4. Paste both URLs into `script.js` **and** `venues.js`:
   - `LOCATIONS_CSV_URL` — the Locations tab URL (both files)
   - `SHOWS_CSV_URL` — the Shows tab URL (script.js only)

## Newsletter Signup (Google Sheet + Apps Script)

The contact page has an email form that POSTs to a Google Apps Script web app, which appends the email to a Google Sheet.

### Setup

1. Create a new Google Sheet (or add a tab to the existing workbook) with columns: **timestamp** | **email**
2. Open **Extensions → Apps Script**
3. Replace the contents with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([new Date(), e.parameter.email]);
  return ContentService.createTextOutput("ok");
}
```

4. Click **Deploy → New deployment**
5. Type = **Web app**, Execute as = **Me**, Who has access = **Anyone**
6. Click **Deploy**, authorize when prompted, and copy the web app URL
7. In `contact.html`, paste the URL into the `SIGNUP_URL` variable at the top of the `<script>` block

## Deployment

Fully static site — no server or build step. Host on any static provider (GitHub Pages, Netlify, Vercel, etc.) or open `index.html` directly in a browser. Requires a Google Maps API key to display the map.

## Making Changes

- **Add/remove a gallery**: Add a row to the Locations tab (with a unique `id`, lat, and lng), then add a matching row in Shows. Update `DEFAULT_LOCATIONS` in both `script.js` and `venues.js`.
- **Update exhibitions**: Edit only the Shows tab — change `current_show`, `show_description`, `start_date`, `end_date`, `image_url`
- **Change map center/zoom**: Edit the `center` and `zoom` in the `initMap()` function in `script.js`
- **Styling**: All styles are in `style.css` — layout uses CSS Grid for the cards
- **Header text**: Edit directly in the HTML files — header/footer are duplicated across pages
- **Add a new page**: Copy the compact header pattern from `venues.html` or `contact.html`, add a nav link to all 3 existing pages
