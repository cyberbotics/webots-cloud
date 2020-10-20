import Project from './project.js';
import Simulation from './simulation.js';
import ModalDialog from './modal_dialog.js';

document.addEventListener('DOMContentLoaded', function() {
  let simulation = new Simulation('webots');
  Project.run('webots.cloud', footer(), [
    {
      url: '/',
      setup: homePage
    },
    {
      url: '/simulation',
      setup: simulationPage
    }]);

  function footer() {
    let template = document.createElement('template');
    template.innerHTML =
      `<footer class="footer">
  <div class="content has-text-centered">
    <p><strong><a class="has-text-white" href="/">webots.cloud</a></strong></p>
    <p class="has-text-white">webots simulations running in the cloud</p>
    <p><a class="has-text-white" href="https://github.com/cyberbotics/webots-cloud" target="_blank">
    <i class="fab fa-github"></i> 100% free and open source software</a></p>
  </div>
</footer>`;
    return template.content.firstChild;
  }

  function homePage(project) {
    function simulationRow(data) {
      const words = data.url.substring(20).split('/');
      const repository = `https://github.com/${words[0]}/${words[1]}`;
      const animation = `https://${words[0]}.github.io/${words[1]}`;
      const updated = data.updated.replace(' ',
        `<br><i class="is-clickable fas fa-sync" id="sync-${data.id}" data-url="${data.url}" title="Re-synchronize now"></i> `
      );
      const row =
        `<td class="has-text-centered"><a class="has-text-dark" href="${repository}/stargazers" target="_blank" title="GitHub stars">` +
        `${data.stars}</a></td>` +
        `<td><a class="has-text-dark" href="${repository}" target="_blank">${data.title}</a></td>` +
        `<td><a class="has-text-dark" href="${repository}/search?l=${encodeURIComponent(data.language)}" target="_blank">${data.language}</td>` +
        `<td class="has-text-right is-size-7" title="Last synchronization with GitHub">${updated}</td>` +
        `<td><a href="${animation}" target="_blank">` +
        `<i title="Playback saved simulation run" class="fas fa-film fa-lg has-text-dark"></i></a></td>` +
        `<td><i title="Run interactive simulation (not available)" class="fas fa-robot fa-lg has-text-grey-light"></i></td>`;
      return row;
    }
    const template = document.createElement('template');
    template.innerHTML =
      `<section class="section">
  <div class="container">
    <table class="table">
      <thead>
        <tr>
          <th style="text-align:center" title="Number of GitHub stars"><i class="far fa-star"></i></th>
          <th title="Title of the simulation">Title</th>
          <th title="Main programming language">Language</th>
          <th title="Last update time">Updated</th>
          <th colspan="2"></th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
    <div class="buttons">
      <button class="button" id="add-a-new-project">Add a new simulation</button>
      <button class="button" id="add-a-new-server" disabled>Add a new server</button>
    </div>
  </div>
</section>`;
    project.setup('home', [], template.content);
    const content = {
      method: 'post',
      body: JSON.stringify({
        offset: 0,
        limit: 10
      })
    };

    function synchronize(event) {
      const id = event.target.id.substring(5);
      event.target.classList.add('fa-spin');
      const url = event.target.getAttribute('data-url');
      let content = {
        method: 'post',
        body: JSON.stringify({
          url: url,
          id: id
        })
      };
      fetch('ajax/create.php', content)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          const old = document.querySelector('#sync-' + data.id).parentNode.parentNode;
          const parent = old.parentNode;
          if (data.error) {
            console.log(data.error);
            parent.removeChild(old);
          } else {
            let tr = document.createElement('tr');
            tr.innerHTML = simulationRow(data);
            parent.replaceChild(tr, old);
            parent.querySelector('#sync-' + data.id).addEventListener('click', synchronize);
            event.target.classList.remove('fa-spin');
          }
        });
    }
    fetch('/ajax/list.php', content)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.error)
          console.log(data.error);
        else {
          let line = ``;
          for (let i = 0; i < data.length; i++) // compute the GitHub repo URL from the simulation URL.
            line += '<tr>' + simulationRow(data[i]) + '</tr>';
          project.content.querySelector('section > div > table > tbody').innerHTML = line;
          for (let i = 0; i < data.length; i++)
            project.content.querySelector('#sync-' + data[i].id).addEventListener('click', synchronize);
        }
      });
    project.content.querySelector('#add-a-new-project').addEventListener('click', function(event) {
      let content = {};
      content.innerHTML =
        `<div class="field">
  <label class="label">Webots world file</label>
  <div class="control has-icons-left">
    <input id="world-file" class="input" type="url" required placeholder="https://github.com/my_name/my_project/blob/tag_or_branch/worlds/file.wbt" value="https://github.com/">
    <span class="icon is-small is-left">
      <i class="fab fa-github"></i>
    </span>
  </div>
  <div class="help">Blob reference in a public GitHub repository, including tag or branch information, for example:<br>
    <a target="_blank" href="https://github.com/cyberbotics/webots/blob/R2020a/projects/languages/python/worlds/example.wbt">
      https://github.com/cyberbotics/webots/blob/R2020a/projects/languages/python/worlds/example.wbt
    </a>
  </div>
</div>
<div class="field">
  <label class="label">Tag or Branch?</label>
  <div class="control">
    <span class="icon is-small is-left"><i class="fas fa-code-branch"></i></span><span> &nbsp; </span>
    <label class="radio">
      <input type="radio" name="branch" required checked> Tag
    </label>
    <label class="radio">
      <input type="radio" name="branch" required> Branch
    </label>
  </div>
  <div class="help">Specify if the above blob corresponds to a git tag (recommended) or a git branch.</div>
</div>`;
      let modal = ModalDialog.run('Add a project', content.innerHTML, 'Cancel', 'Add');
      let input = modal.querySelector('#world-file');
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        const worldFile = modal.querySelector('#world-file').value.trim();
        if (!worldFile.startsWith('https://github.com/')) {
          modal.error('The world file should start with "https://github.com/".');
          return;
        }
        const branchOrTag = modal.querySelector('input[type="radio"]').checked ? 'tag' : 'branch';
        const n = worldFile.split('/', 5).join('/').length;
        const url = 'webots' + worldFile.substring(5, n + 1) + branchOrTag + worldFile.substring(n + 5); // skipping "/blob"
        const content = {
          method: 'post',
          body: JSON.stringify({
            url: url
          })
        };
        fetch('/ajax/create.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              modal.error(data.error);
            else {
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + simulationRow(data) + '</tr>';
              document.querySelector('section > div > table > tbody').insertAdjacentHTML('beforeend', tr);
            }
          });
      });
    });
  }

  function simulationPage(project) {
    project.setup('simulation', [], simulation.content(), true);
    simulation.run();
  }
});
