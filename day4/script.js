// Select elements
var noteText = document.getElementById("note-text");
var charCount = document.getElementById("char-count");
var wordCount = document.getElementById("word-count");
var clearBtn = document.getElementById("clear-btn");
var themeToggle = document.getElementById("theme-toggle");

var MAX_CHARS = 200;
var WARN_AT = 180;
var DRAFT_KEY = "noteDraft";
var THEME_KEY = "noteTheme";

// Update both counters and the warning classes
function updateCounts() {
  var text = noteText.value;
  var chars = text.length;
  var trimmed = text.trim();
  var words = 0;
  if (trimmed !== "") {
    words = trimmed.split(" ").filter(function (w) {
      return w !== "";
    }).length;
  }

  charCount.textContent = chars + " / " + MAX_CHARS + " characters";
  wordCount.textContent = words + " words";

  charCount.classList.remove("warning");
  charCount.classList.remove("over");
  if (chars > MAX_CHARS) {
    charCount.classList.add("over");
  } else if (chars > WARN_AT) {
    charCount.classList.add("warning");
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, noteText.value);
}

// Clear the note, the counters and the saved draft
function clearNote() {
  noteText.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
}

// Switch between light and dark
function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }
}

// Events
noteText.addEventListener("input", function () {
  updateCounts();
  saveDraft();
});

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearNote();
  }
});

themeToggle.addEventListener("click", function () {
  var isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  if (isDark) {
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    localStorage.setItem(THEME_KEY, "light");
  }
});

// On page load: restore the draft and theme, then update the counters
var savedDraft = localStorage.getItem(DRAFT_KEY);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
updateCounts();