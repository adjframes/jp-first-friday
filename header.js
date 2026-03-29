// Shared header functions for date box on all pages

function getNextFirstFriday() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var first = new Date(year, month, 1);
  var dow = first.getDay();
  var fridayDate = dow <= 5 ? 1 + (5 - dow) : 1 + (12 - dow);
  var firstFriday = new Date(year, month, fridayDate);
  var today = new Date(year, now.getMonth(), now.getDate());
  if (today > firstFriday) {
    month++;
    first = new Date(year, month, 1);
    dow = first.getDay();
    fridayDate = dow <= 5 ? 1 + (5 - dow) : 1 + (12 - dow);
    firstFriday = new Date(year, month, fridayDate);
  }
  return firstFriday;
}

function setNextFirstFriday() {
  var el = document.getElementById("next-date");
  if (!el) return;
  var firstFriday = getNextFirstFriday();
  el.textContent = firstFriday.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today.getTime() === firstFriday.getTime()) {
    var box = document.getElementById("next-date-box");
    var label = document.getElementById("next-label");
    if (box) box.classList.add("is-today");
    if (label) label.textContent = "Tonight";
  }
}

function updateCalendarLink() {
  var calLink = document.getElementById("next-cal");
  if (!calLink) return;
  var firstFriday = getNextFirstFriday();
  var y = firstFriday.getFullYear();
  var m = String(firstFriday.getMonth() + 1).padStart(2, "0");
  var d = String(firstFriday.getDate()).padStart(2, "0");
  var start = y + m + d + "T173000";
  var end = y + m + d + "T203000";
  var details = "Galleries and art spaces open their doors for an evening of art, community, and conversation. 5:30\u20138:30 pm.";
  calLink.href = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent("JP First Fridays")
    + "&dates=" + start + "/" + end
    + "&ctz=America/New_York"
    + "&details=" + encodeURIComponent(details)
    + "&location=" + encodeURIComponent("Jamaica Plain, Boston, MA");
}

setNextFirstFriday();
updateCalendarLink();
