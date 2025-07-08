const api = "https://api.github.com/users/";
const main = document.getElementById("main");
const inputForm = document.getElementById("userInput");
const inputBox = document.getElementById("inputBox");
const toast = document.getElementById("toast");
const historyList = document.getElementById("historyList");

const showLoader = () => {
  main.innerHTML = `<div class="loader"></div>`;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
};

const userGetFunction = (username) => {
  axios(api + username)
    .then((res) => {
      userCard(res.data);
      repoGetFunction(username);
      updateHistory(username);
    })
    .catch(() => showToast("User not found."));
};

const repoGetFunction = (username) => {
  axios(`${api}${username}/repos?sort=created`)
    .then((res) => repoCardFunction(res.data))
    .catch(() => showToast("Couldn't fetch repos."));
};

const userCard = (user) => {
  const name = user.name || user.login;
  const bio = user.bio ? `<p>${user.bio}</p>` : `<p><em>No bio provided.</em></p>`;
  const joinDate = new Date(user.created_at).toLocaleDateString();

  main.innerHTML = `
    <div class="card">
      <div>
        <img src="${user.avatar_url}" alt="${name}" class="avatar">
        <a href="${user.html_url}" target="_blank">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style="width:30px; margin-top:10px;">
        </a>
      </div>
      <div class="user-info">
        <h2>${name}</h2>
        ${bio}
        <p><strong>Joined:</strong> ${joinDate}</p>
        <ul>
          <li>${user.followers} <strong>Followers</strong></li>
          <li>${user.following} <strong>Following</strong></li>
          <li>${user.public_repos} <strong>Repos</strong></li>
        </ul>
        <div id="repos"></div>
      </div>
    </div>`;
};

const repoCardFunction = (repos) => {
  const reposElement = document.getElementById("repos");
  reposElement.innerHTML = ""; // Clear old
  repos.slice(0, 5).forEach(repo => {
    const a = document.createElement("a");
    a.classList.add("repo");
    a.href = repo.html_url;
    a.target = "_blank";
    a.innerText = repo.name;
    reposElement.appendChild(a);
  });
};

const updateHistory = (username) => {
  const currentUser = localStorage.getItem("user");
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.username === currentUser);

  if (index !== -1) {
    if (!Array.isArray(users[index].history)) users[index].history = [];

    // Add new history with timestamp
    users[index].history.unshift({
      name: username,
      time: new Date().toLocaleString()
    });

    if (users[index].history.length > 10) {
      users[index].history.pop(); // limit to 10 entries
    }

    // Set status to old if more than one search
    if (users[index].history.length > 1) {
      users[index].status = "Old";
    }

    localStorage.setItem("users", JSON.stringify(users));
  }

  renderHistory();
};

const renderHistory = () => {
  const currentUser = localStorage.getItem("user");
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === currentUser);

  if (!user || !Array.isArray(user.history)) return;

  historyList.innerHTML = "";
  user.history.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = entry.name;
    li.onclick = () => {
      inputBox.value = entry.name;
      inputForm.dispatchEvent(new Event("submit"));
    };
    historyList.appendChild(li);
  });
};

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = inputBox.value.trim();
  if (user) {
    showLoader();
    userGetFunction(user);
    inputBox.value = "";
  }
});

window.onload = () => {
  inputBox.focus();
  renderHistory();
};
