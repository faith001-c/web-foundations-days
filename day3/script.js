const notes = [
  { id: 1, text: "Learn HTML semantics", category: "Study" },
  { id: 2, text: "Buy groceries", category: "Personal" },
  { id: 3, text: "Finish CSS Flexbox layout", category: "Study" }
];

console.log("Initial Notes Array:", notes);

function addNote(text, category) {
  const newNote = {
    id: notes.length + 1,
    text: text,
    category: category
  };
  notes.push(newNote);
  console.log(Added note: "${text}");
}

function displayNotes() {
  console.log("--- All Notes ---");
  notes.forEach((note) => {
    console.log([${note.id}] (${note.category}) ${note.text});
  });
}

function getNotesByCategory(category) {
  return notes.filter((note) => note.category.toLowerCase() === category.toLowerCase());
}

// Test Execution
addNote("Review JavaScript console methods", "Study");
displayNotes();

console.log("--- Study Notes Only ---");
console.log(getNotesByCategory("Study"));