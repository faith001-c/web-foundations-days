onst noteInput = document.getElementById("note-input");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
  const text = noteInput.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  charCount.textContent = ${chars} character${chars !== 1 ? 's' : ''};
  wordCount.textContent = ${words} word${words !== 1 ? 's' : ''};

  noteInput.classList.remove("warning", "over-limit");
  if (chars >= 200) {
    noteInput.classList.add("over-limit");
  } else if (chars >= 150) {
    noteInput.classList.add("warning");
  }

  localStorage.setItem("day4_draft", text);
}

noteInput.addEventListener("input", updateCounts);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  localStorage.setItem("day4_theme", isDark ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
  const savedDraft = localStorage.getItem("day4_draft");
  if (savedDraft) {
    noteInput.value = savedDraft;
  }

  const savedTheme = localStorage.getItem("day4_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
  }

  updateCounts();
});