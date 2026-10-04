const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
  const text = noteText.value;
  const numChars = text.length;

  const trimmedText = text.trim();
  const numWords = trimmedText === "" ? 0 : trimmedText.split(/\s+/).length;

  charCount.textContent = ${numChars} / 200 characters;
  wordCount.textContent = ${numWords} words;

  charCount.classList.remove("warning", "over");
  if (numChars > 200) {
    charCount.classList.add("over");
  } else if (numChars > 180) {
    charCount.classList.add("warning");
  }
}

function clearAll() {
  noteText.value = "";
  localStorage.removeItem("draftText");
  updateCounts();
}

noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem("draftText", noteText.value);
});

clearBtn.addEventListener("click", clearAll);

noteText.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearAll();
  }
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("themeMode", isDark ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
  const savedDraft = localStorage.getItem("draftText");
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }

  const savedTheme = localStorage.getItem("themeMode");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }

  updateCounts();
});