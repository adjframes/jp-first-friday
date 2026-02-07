// ── Configuration ────────────────────────────────────────────
// Replace these URLs with your published Google Sheet CSV links.
// Each sheet tab is published separately:
// Google Sheets → File → Share → Publish to the web → select tab → CSV
const LOCATIONS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzyVUNJKGeXlVD--ZT8VS9hIE7pG8eXJRW5VCaTXKrbpn4T9hZpSp5nGMpVixLrzibHEDm1H-wbOnh/pub?output=csv";
const SHOWS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRpVaWHft5OzPQfEttKA6RVgGpGB6wJWJRBP671U_CiwqEbtZmYO7ye0i1ZyNq1AwPqmezhNnQfxyb/pub?output=csv";

// ── Fallback / default data ─────────────────────────────────

var DEFAULT_LOCATIONS = [
  { id: "jt",        name: "Jameson & Thompson Picture Framers", address: "18 Bartlett Sq, Jamaica Plain",  lat: 42.3098, lng: -71.1138, website: "https://jamesonandthompson.com", instagram: "", contact: "", image_url: "" },
  { id: "gspc",      name: "Green Street Photo Collective",      address: "186 Green St, Jamaica Plain",    lat: 42.3114, lng: -71.1085, website: "",                               instagram: "", contact: "", image_url: "" },
  { id: "ula",       name: "Ula Cafe",                           address: "284 Amory St, Jamaica Plain",    lat: 42.3082, lng: -71.1100, website: "",                               instagram: "", contact: "", image_url: "" },
  { id: "eliot",     name: "Eliot School Annex",                  address: "253 Amory St, Jamaica Plain",    lat: 42.3088, lng: -71.1094, website: "",                               instagram: "", contact: "", image_url: "" },
  { id: "cyberarts", name: "Boston Cyberarts Gallery",            address: "141 Green St, Jamaica Plain",    lat: 42.3120, lng: -71.1070, website: "",                               instagram: "", contact: "", image_url: "" }
];

var DEFAULT_SHOWS = [
  { location_id: "jt",        current_show: "Group Show",              show_description: "A rotating selection of works by local artists.",              start_date: "2026-02-01", end_date: "2026-02-28", image_url: "", url: "" },
  { location_id: "gspc",      current_show: "Member Exhibition",       show_description: "Photography by collective members exploring urban landscapes.", start_date: "2026-02-01", end_date: "2026-02-28", image_url: "", url: "" },
  { location_id: "ula",       current_show: "Walls of Ula",            show_description: "Rotating art on the cafe walls featuring neighborhood artists.", start_date: "2026-02-01", end_date: "2026-02-28", image_url: "", url: "" },
  { location_id: "eliot",     current_show: "Student & Faculty Show",  show_description: "Works from Eliot School classes and workshops.",               start_date: "2026-02-01", end_date: "2026-02-28", image_url: "", url: "" },
  { location_id: "cyberarts", current_show: "New Media Exhibition",    show_description: "Digital and technology-driven art from Boston-area artists.",   start_date: "2026-02-01", end_date: "2026-02-28", image_url: "", url: "" }
];

// ── Google Maps globals ─────────────────────────────────────
var map;
var infoWindow;

// ── Map init (called by Google Maps API callback) ───────────
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 42.309, lng: -71.111 },
    zoom: 15
  });
  infoWindow = new google.maps.InfoWindow();
  loadGalleries();
}

// ── Data loading ────────────────────────────────────────────

function loadGalleries() {
  if (!LOCATIONS_CSV_URL && !SHOWS_CSV_URL) {
    render(mergeData(DEFAULT_LOCATIONS, DEFAULT_SHOWS));
    return;
  }

  var locations = null;
  var shows = null;

  function tryRender() {
    if (locations === null || shows === null) return;
    if (locations.length > 0) {
      render(mergeData(locations, shows));
    } else {
      render(mergeData(DEFAULT_LOCATIONS, DEFAULT_SHOWS));
    }
  }

  // Fetch locations
  if (LOCATIONS_CSV_URL) {
    Papa.parse(LOCATIONS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {

        locations = (results.data || []).map(function (row) {
          return {
            id: (row.id || "").trim(),
            name: (row.name || "").trim(),
            address: (row.address || "").trim(),
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            website: (row.website || "").trim(),
            instagram: (row.instagram || "").trim(),
            contact: (row.contact || "").trim(),
            image_url: (row.img_url || row.image_url || "").trim()
          };
        }).filter(function (loc) {
          return loc.id && loc.name && !isNaN(loc.lat) && !isNaN(loc.lng);
        });

        tryRender();
      },
      error: function () {
        locations = DEFAULT_LOCATIONS;
        tryRender();
      }
    });
  } else {
    locations = DEFAULT_LOCATIONS;
  }

  // Fetch shows
  if (SHOWS_CSV_URL) {
    Papa.parse(SHOWS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {

        shows = (results.data || []).map(function (row) {
          return {
            location_id: (row.location_id || "").trim(),
            current_show: (row.current_show || "").trim(),
            show_description: (row.show_description || "").trim(),
            start_date: (row.start_date || "").trim(),
            end_date: (row.end_date || "").trim(),
            image_url: (row.img_url || row.image_url || "").trim(),
            url: (row.url || "").trim()
          };
        }).filter(function (s) {
          return s.location_id;
        });

        tryRender();
      },
      error: function () {
        shows = DEFAULT_SHOWS;
        tryRender();
      }
    });
  } else {
    shows = DEFAULT_SHOWS;
  }

  if (locations !== null && shows !== null) {
    tryRender();
  }
}

// ── Merge locations + shows by id ───────────────────────────

function mergeData(locations, shows) {
  var friday = nextFirstFridayStr();

  var activeShows = shows.filter(function (s) {
    return isShowActive(s, friday);
  });

  var showsByLocationId = {};
  activeShows.forEach(function (s) {
    showsByLocationId[s.location_id] = s;
  });

  return locations
    .filter(function (loc) {
      return showsByLocationId[loc.id];
    })
    .map(function (loc) {
      var show = showsByLocationId[loc.id];
      return {
        name: loc.name,
        address: loc.address,
        lat: loc.lat,
        lng: loc.lng,
        website: loc.website,
        instagram: loc.instagram,
        contact: loc.contact,
        current_show: show.current_show || "",
        show_description: show.show_description || "",
        start_date: show.start_date || "",
        end_date: show.end_date || "",
        image_url: show.image_url || "",
        show_url: show.url || ""
      };
    });
}

// ── Rendering ───────────────────────────────────────────────

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function render(galleries) {
  shuffle(galleries);
  addMarkers(galleries);
  renderCards(galleries);
  updateCalendarLink(galleries);
}

function addMarkers(galleries) {
  var bounds = new google.maps.LatLngBounds();

  galleries.forEach(function (g) {
    var position = { lat: g.lat, lng: g.lng };
    bounds.extend(position);

    var marker = new google.maps.Marker({
      position: position,
      map: map,
      title: g.name
    });

    var content =
      "<strong>" + escapeHtml(g.name) + "</strong>";
    if (g.current_show) {
      content += "<br>" + escapeHtml(g.current_show);
    }
    if (g.start_date || g.end_date) {
      content += "<br><small>" + escapeHtml(formatDate(g.start_date) + " \u2013 " + formatDate(g.end_date)) + "</small>";
    }
    var markerLink = g.show_url || g.website;
    if (markerLink) {
      content +=
        '<br><a href="' + encodeURI(markerLink) + '" target="_blank" rel="noopener">Website</a>';
    }
    if (g.instagram) {
      content +=
        ' &middot; <a href="https://instagram.com/' + encodeURIComponent(g.instagram) + '" target="_blank" rel="noopener">@' + escapeHtml(g.instagram) + '</a>';
    }
    if (g.contact) {
      content += "<br>" + escapeHtml(g.contact);
    }

    marker.addListener("click", function () {
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });
  });

  if (galleries.length > 1) {
    map.fitBounds(bounds, 50);
  } else if (galleries.length === 1) {
    map.setCenter(bounds.getCenter());
    map.setZoom(16);
  }
}

function renderCards(galleries) {
  var grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  if (galleries.length === 0) {
    grid.innerHTML = '<p class="no-shows">No shows are currently on view. Check back soon!</p>';
    return;
  }

  galleries.forEach(function (g) {
    var cardLink = g.show_url || g.website;
    var card;
    if (cardLink) {
      card = document.createElement("a");
      card.href = cardLink;
      card.target = "_blank";
      card.rel = "noopener";
      card.className = "gallery-card gallery-card--link";
    } else {
      card = document.createElement("div");
      card.className = "gallery-card";
    }

    var html = "";

    if (g.image_url) {
      html += '<img src="' + encodeURI(g.image_url) + '" alt="' + escapeHtml(g.current_show || g.name) + '">';
    }

    html += '<div class="card-body">';
    html += "<h3>" + escapeHtml(g.name) + "</h3>";
    html += '<p class="card-address">' + escapeHtml(g.address) + "</p>";

    if (g.current_show) {
      html += '<p class="card-show">' + escapeHtml(g.current_show) + "</p>";
    }
    if (g.start_date || g.end_date) {
      html += '<p class="card-dates">' + escapeHtml(formatDate(g.start_date) + " \u2013 " + formatDate(g.end_date)) + "</p>";
    }
    if (g.show_description) {
      html += '<p class="card-description">' + escapeHtml(g.show_description) + "</p>";
    }
    var links = [];
    var mainLink = g.show_url || g.website;
    if (mainLink) {
      links.push('<a href="' + encodeURI(mainLink) + '" target="_blank" rel="noopener">Website</a>');
    }
    if (g.instagram) {
      links.push('<a href="https://instagram.com/' + encodeURIComponent(g.instagram) + '" target="_blank" rel="noopener">@' + escapeHtml(g.instagram) + '</a>');
    }
    if (links.length > 0) {
      html += '<p class="card-links">' + links.join(" &middot; ") + "</p>";
    }
    if (g.contact) {
      html += '<p class="card-contact">' + escapeHtml(g.contact) + "</p>";
    }

    html += "</div>";

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

// ── Helpers ─────────────────────────────────────────────────

function todayStr() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

function getNextFirstFriday() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var first = new Date(year, month, 1);
  var dow = first.getDay();
  var fridayDate = dow <= 5 ? 1 + (5 - dow) : 1 + (12 - dow);
  var firstFriday = new Date(year, month, fridayDate);
  // If today is past this month's first Friday, advance to next month
  var today = new Date(year, now.getMonth(), now.getDate()); // midnight today
  if (today > firstFriday) {
    month++;
    first = new Date(year, month, 1);
    dow = first.getDay();
    fridayDate = dow <= 5 ? 1 + (5 - dow) : 1 + (12 - dow);
    firstFriday = new Date(year, month, fridayDate);
  }
  return firstFriday;
}

function nextFirstFridayStr() {
  var d = getNextFirstFriday();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

function isShowActive(show, today) {
  if (show.start_date && today < show.start_date) return false;
  if (show.end_date && today > show.end_date) return false;
  return true;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ── Update Google Calendar link with show details ────────────

function updateCalendarLink(galleries) {
  var calLink = document.getElementById("next-cal");
  if (!calLink) return;

  var firstFriday = getNextFirstFriday();
  var y = firstFriday.getFullYear();
  var m = String(firstFriday.getMonth() + 1).padStart(2, "0");
  var d = String(firstFriday.getDate()).padStart(2, "0");
  var start = y + m + d + "T180000";
  var end = y + m + d + "T200000";

  var details = "Galleries and art spaces open their doors for an evening of art, community, and conversation. 6\u20138 pm.";

  if (galleries && galleries.length > 0) {
    details += "\n\n\ud83d\uddbc\ufe0f What\u2019s on:\n";
    galleries.forEach(function (g) {
      details += "\n\u2022 " + g.name;
      if (g.current_show) details += " \u2014 " + g.current_show;
    });
  }

  calLink.href = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent("JP First Fridays")
    + "&dates=" + start + "/" + end
    + "&ctz=America/New_York"
    + "&details=" + encodeURIComponent(details)
    + "&location=" + encodeURIComponent("Jamaica Plain, Boston, MA");
}

// Calculate and display the next First Friday
function setNextFirstFriday() {
  var el = document.getElementById("next-date");
  if (!el) return;
  var firstFriday = getNextFirstFriday();
  el.textContent = firstFriday.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  // Highlight if today is First Friday
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today.getTime() === firstFriday.getTime()) {
    var box = document.getElementById("next-date-box");
    var label = document.getElementById("next-label");
    if (box) box.classList.add("is-today");
    if (label) label.textContent = 'Tonight';
    var heading = document.querySelector(".map-section h2");
    if (heading) heading.textContent = "Tonight\u2019s Events";
  }
}
setNextFirstFriday();
