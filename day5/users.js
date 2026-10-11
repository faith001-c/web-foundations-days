// Select elements
var loadBtn = document.getElementById("load-users");
var filterInput = document.getElementById("filter-input");
var statusEl = document.getElementById("status");
var usersList = document.getElementById("users-list");

var API_URL = "https://jsonplaceholder.typicode.com/users";

// The loaded users are stored here so filtering needs no new request
var allUsers = [];

// Draw any array of users
function renderUsers(list) {
  usersList.innerHTML = "";

  if (list.length === 0) {
    var empty = document.createElement("li");
    empty.textContent = "No users match your filter.";
    usersList.appendChild(empty);
    return;
  }

  list.forEach(function (user) {
    var li = document.createElement("li");

    var name = document.createElement("p");
    var strong = document.createElement("strong");
    strong.textContent = user.name;
    name.appendChild(strong);

    var email = document.createElement("p");
    email.textContent = "Email: " + user.email;

    var city = document.createElement("p");
    city.textContent = "City: " + user.address.city;

    var company = document.createElement("p");
    company.textContent = "Company: " + user.company.name;

    li.appendChild(name);
    li.appendChild(email);
    li.appendChild(city);
    li.appendChild(company);
    usersList.appendChild(li);
  });
}

// Show only the users whose name includes the typed text
function filterUsers() {
  var term = filterInput.value.trim().toLowerCase();
  var matches = allUsers.filter(function (user) {
    return user.name.toLowerCase().includes(term);
  });
  renderUsers(matches);
}

// Fetch the users from the API
async function loadUsers() {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading users...";

  try {
    var response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    allUsers = await response.json();
    filterUsers();
    statusEl.textContent = "Loaded " + allUsers.length + " users.";
  } catch (error) {
    statusEl.textContent = "Error: could not load users. " + error.message;
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", function () {
  if (allUsers.length === 0) {
    return;
  }
  filterUsers();
});