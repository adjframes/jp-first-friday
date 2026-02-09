// ── Configuration (duplicated from script.js — see CLAUDE.md) ──
const LOCATIONS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzyVUNJKGeXlVD--ZT8VS9hIE7pG8eXJRW5VCaTXKrbpn4T9hZpSp5nGMpVixLrzibHEDm1H-wbOnh/pub?output=csv";

var DEFAULT_LOCATIONS = [
  { id: "jt",        name: "Jameson & Thompson Picture Framers", address: "18 Bartlett Sq, Jamaica Plain",  website: "https://jamesonandthompson.com", instagram: "", contact: "", image_url: "", description: "" },
  { id: "gspc",      name: "Green Street Photo Collective",      address: "186 Green St, Jamaica Plain",    website: "",                               instagram: "", contact: "", image_url: "", description: "" },
  { id: "ula",       name: "Ula Cafe",                           address: "284 Amory St, Jamaica Plain",    website: "",                               instagram: "", contact: "", image_url: "", description: "" },
  { id: "eliot",     name: "Eliot School Annex",                  address: "253 Amory St, Jamaica Plain",    website: "",                               instagram: "", contact: "", image_url: "", description: "" },
  { id: "cyberarts", name: "Boston Cyberarts Gallery",            address: "141 Green St, Jamaica Plain",    website: "",                               instagram: "", contact: "", image_url: "", description: "" }
];

// ── Helpers ──────────────────────────────────────────────────

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function linkifyContact(str) {
  return escapeHtml(str).replace(
    /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g,
    '<a href="mailto:$1">$1</a>'
  );
}

function getInitials(name) {
  return name.split(/\s+/).map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 3);
}

// ── Load & Render ────────────────────────────────────────────

function loadVenues() {
  if (!LOCATIONS_CSV_URL) {
    renderVenues(DEFAULT_LOCATIONS);
    return;
  }

  Papa.parse(LOCATIONS_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      var venues = (results.data || []).map(function (row) {
        return {
          id: (row.id || "").trim(),
          name: (row.name || "").trim(),
          address: (row.address || "").trim(),
          website: (row.website || "").trim(),
          instagram: (row.instagram || "").trim(),
          contact: (row.contact || "").trim(),
          image_url: (row.img_url || row.image_url || "").trim(),
          description: (row.description || "").trim()
        };
      }).filter(function (v) {
        return v.id && v.name;
      });

      renderVenues(venues.length > 0 ? venues : DEFAULT_LOCATIONS);
    },
    error: function () {
      renderVenues(DEFAULT_LOCATIONS);
    }
  });
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function renderVenues(venues) {
  shuffle(venues);
  var grid = document.getElementById("venues-grid");
  grid.innerHTML = "";

  venues.forEach(function (v) {
    var card;
    if (v.website) {
      card = document.createElement("a");
      card.href = v.website;
      card.target = "_blank";
      card.rel = "noopener";
      card.className = "gallery-card gallery-card--link";
    } else {
      card = document.createElement("div");
      card.className = "gallery-card";
    }

    var html = "";

    if (v.image_url) {
      html += '<img src="' + encodeURI(v.image_url) + '" alt="' + escapeHtml(v.name) + '">';
    } else {
      html += '<div class="venue-placeholder-img">' + escapeHtml(getInitials(v.name)) + '</div>';
    }

    html += '<div class="card-body">';
    html += "<h3>" + escapeHtml(v.name) + "</h3>";
    html += '<p class="card-address">' + escapeHtml(v.address) + "</p>";

    if (v.description) {
      html += '<p class="card-description">' + escapeHtml(v.description) + "</p>";
    }

    var links = [];
    if (v.website) {
      links.push('<a href="' + encodeURI(v.website) + '" target="_blank" rel="noopener">Website</a>');
    }
    if (v.instagram) {
      links.push('<a href="https://instagram.com/' + encodeURIComponent(v.instagram) + '" target="_blank" rel="noopener">@' + escapeHtml(v.instagram) + '</a>');
    }
    if (links.length > 0) {
      html += '<p class="card-links">' + links.join(" &middot; ") + "</p>";
    }
    if (v.contact) {
      html += '<p class="card-contact">' + linkifyContact(v.contact) + "</p>";
    }

    html += "</div>";

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

loadVenues();
