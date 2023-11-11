// get gitub

// memo
const repoCache = JSON.parse(localStorage.getItem('repoCache')) || {};
const clickedReposCache = JSON.parse(localStorage.getItem('clickedReposCache')) || {};

async function fetchGitHubRepos(username) {
  // Check if the data is already in the cache
  if (repoCache[username]) {
    console.log('Returning cached data');
    return repoCache[username];
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    
    if (!response.ok) {
      throw new Error(`Error fetching repos: ${response.statusText}`);
    }

    const repos = await response.json();

    // Cache the result and save to local storage
    repoCache[username] = repos;
    localStorage.setItem('repoCache', JSON.stringify(repoCache));

    return repos;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

function updateRepoListDisplay() {
  const repoList = document.getElementById('repoList');
  const titleContainer = document.querySelector('.title-container');

  if (repoList.innerHTML.trim() === '') {
    // Show the title container if repoList is empty
    titleContainer.style.display = 'block';
  } else {
    // Hide the title container if repoList has content
    titleContainer.style.display = 'none';
  }
}


// function displayRepos(repos, username) {
//   const repoList = document.getElementById('repoList');
//   const repoListTitle = document.getElementById('repoListTitle'); // Get the title element

//   repoList.innerHTML = ''; // Clear previous results

//   if (repos && repos.length) {
//       repos.forEach(repo => {
//           const div = document.createElement('div');
//           // Add a clickable link for each repository
//           div.innerHTML = `<strong><a href="${repo.html_url}" target="_blank" data-repo-id="${repo.id}">${repo.name}</a></strong>: ${repo.description || 'No description'}`;
//           // Add event listener to each link
//           div.querySelector('a').addEventListener('click', function(event) {
//               event.preventDefault(); // Prevent the default link behavior
//               memoizeRepoClick(repo);
//               window.open(repo.html_url, '_blank'); // Open the repository in a new tab
//           });
//           repoList.appendChild(div);
//       });
//       repoListTitle.style.display = 'none'; // Hide the title when repos are displayed
//   } else {
//       repoList.innerHTML = `No repositories found for ${username}`;
//       repoListTitle.style.display = 'block'; // Show the title when no repos are found
//   }
// }

function displayRepos(repos, username) {
  const repoList = document.getElementById('repoList');
  repoList.innerHTML = ''; // Clear previous results

  if (repos && repos.length) {
    repos.forEach(repo => {
      const div = document.createElement('div');
      div.innerHTML = `<strong><a href="${repo.html_url}" target="_blank" data-repo-id="${repo.id}">${repo.name}</a></strong>: ${repo.description || 'No description'}`;
      div.querySelector('a').addEventListener('click', function(event) {
        event.preventDefault();
        memoizeRepoClick(repo);
        window.open(repo.html_url, '_blank');
      });
      repoList.appendChild(div);
    });
  } else {
    repoList.innerHTML = `No repositories found for ${username}`;
  }

  updateRepoListDisplay(); // Update the display
}



function memoizeRepoClick(repo) {
  if (!clickedReposCache[repo.id]) {
    console.log('Memoizing:', repo.name);
    clickedReposCache[repo.id] = repo;
    // Save to local storage
    localStorage.setItem('clickedReposCache', JSON.stringify(clickedReposCache));
  }
}
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('fetchRepos').addEventListener('click', function() {
      const username = document.getElementById('githubUsername').value;
      fetchGitHubRepos(username).then(repos => displayRepos(repos, username));
  });
    
  document.getElementById('showUsernames').addEventListener('click', function() {
    displayUsernames();
  });

  document.getElementById('showVisitedProjects').addEventListener('click', function() {
    displayVisitedProjects();
  });

  document.getElementById('showAllProjects').addEventListener('click', function() {
    displayAllProjects();
  });
  const tabButtons = document.querySelectorAll('.tabButton');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

// function displayUsernames() {
//   const repoList = document.getElementById('repoList');
//   repoList.innerHTML = '';
//   Object.keys(repoCache).forEach(username => {
//     const userDiv = document.createElement('div');
//     const userUrl = `https://github.com/${username}`;
//     userDiv.innerHTML = `<a href="${userUrl}" target="_blank">${username}</a>`;
//     repoList.appendChild(userDiv);
//   });
// }

// function displayVisitedProjects() {
//   const repoList = document.getElementById('repoList');
//   repoList.innerHTML = '';
//   Object.values(clickedReposCache).forEach(repo => {
//     const repoDiv = document.createElement('div');
//     repoDiv.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
//     repoList.appendChild(repoDiv);
//   });
// }
function displayAllProjects() {
  const repoList = document.getElementById('repoList');
  repoList.innerHTML = '';
  Object.entries(repoCache).forEach(([username, repos]) => {
    repos.forEach(repo => {
      const repoDiv = document.createElement('div');
      repoDiv.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a> <button onclick="deleteProjectFromAll('${username}', '${repo.id}')">Delete</button>`;
      repoList.appendChild(repoDiv);
    });
  });
  updateRepoListDisplay(); // Update the display
}


function displayUsernames() {
  const repoList = document.getElementById('repoList');
  repoList.innerHTML = '';
  Object.keys(repoCache).forEach(username => {
    const userUrl = `https://github.com/${username}`;
    const listItem = `<div>${username} <a href="${userUrl}" target="_blank">[link]</a> <button onclick="deleteUsername('${username}')">Delete</button></div>`;
    repoList.innerHTML += listItem;
  });
  updateRepoListDisplay(); // Update the display
}

function displayVisitedProjects() {
  const repoList = document.getElementById('repoList');
  repoList.innerHTML = '';
  Object.values(clickedReposCache).forEach(repo => {
    const listItem = `<div>${repo.name} <a href="${repo.html_url}" target="_blank">[link]</a> <button onclick="deleteVisitedProject('${repo.id}')">Delete</button></div>`;
    repoList.innerHTML += listItem;
  });
  updateRepoListDisplay(); // Update the display
}

function deleteUsername(username) {
  delete repoCache[username];
  localStorage.setItem('repoCache', JSON.stringify(repoCache));
  displayUsernames(); // Refresh the list
  updateRepoListDisplay(); // Update the display
}

function deleteVisitedProject(repoId) {
  delete clickedReposCache[repoId];
  localStorage.setItem('clickedReposCache', JSON.stringify(clickedReposCache));
  displayVisitedProjects(); // Refresh the list
  updateRepoListDisplay(); // Update the display
}

function deleteProjectFromAll(username, repoId) {
  const repos = repoCache[username];
  if (repos) {
    const updatedRepos = repos.filter(repo => repo.id.toString() !== repoId);
    repoCache[username] = updatedRepos;

    // If no more projects under this username, delete the username from the cache
    if (updatedRepos.length === 0) {
      delete repoCache[username];
    }

    localStorage.setItem('repoCache', JSON.stringify(repoCache));
    displayAllProjects(); // Refresh the list
  }
  updateRepoListDisplay(); // Update the display
}


// Example usage
// fetchGitHubRepos('cre8ture').then(repos => console.log(repos));
