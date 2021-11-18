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
    function animationRow(data) {
      let size = data.size;
      let unit;
      if (size < 1024)
        unit = 'bytes';
      else if (size < 1024 * 1014) {
        size = size / 1024;
        unit = 'K';
      } else if (size < 1024 * 1024 * 1024) {
        size = size / (1024 * 1024);
        unit = 'M';
      } else {
        size = size / (1024 * 1024 * 1024);
        unit = 'G';
      }
      if (size < 100)
        size = Math.round(10 * size) / 10;
      else
        size = Math.round(size);
      size += ' <small>' + unit + '</small>';
      let millisecond = data.duration % 1000;
      let second = Math.trunc(data.duration / 1000) % 60;
      let minute = Math.trunc(data.duration / 60000) % 60;
      let hour = Math.trunc(data.duration / 3600000);
      if (millisecond < 10)
        millisecond = '00' + millisecond;
      else if (millisecond < 100)
        millisecond = '0' + millisecond;
      let duration = second + ':' + millisecond;
      if (data.duration >= 60000) {
        if (second < 10)
          duration = '0' + duration;
        duration = minute + ':' + duration;
        if (data.duration > 3600000) {
          if (minute < 10)
            duration = '0' + duration;
          duration = hour + duration;
        }
      }
      const url = data.url.startsWith('https://webots.cloud') ? document.location.origin + data.url.substring(20) : data.url
      const delete_icon = (data.user > 0 && project.id == data.user) ? `<i class="far fa-trash-alt" id="animation-${data.id}" title="Delete this animation"></i>` : '';
      const row =
        `<td class="has-text-centered">${data.viewed}</td>` +
        `<td><a class="has-text-dark" href="${url}" title="${data.description}">${data.title}</a></td>` +
        `<td class="has-text-right">${duration}</td>` +
        `<td class="has-text-right">${size}</td>` +
        `<td>${data.updated}</td>` +
        `<td>${delete_icon}</td>`;
      return row;
    }

    function simulationRow(data) {
      const words = data.url.substring(20).split('/');
      const repository = `https://github.com/${words[0]}/${words[1]}/tree/${words[3]}`;
      const animation = `https://${words[0]}.github.io/${words[1]}/${words[3]}`;
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

    function serverRow(data) {
      const updated = data.updated.replace(' ',
        `<br><i class="is-clickable fas fa-sync" id="sync-${data.id}" data-url="${data.url}" title="Re-synchronize now"></i> `
      );
      const row =
        `<td><a class="has-text-dark" href="${data.url}" target="_blank">${data.url.substring(8)}</a></td>` +
        `<td class="has-text-right is-size-7" title="Last synchronization with GitHub">${updated}</td>` +
        `<td class="has-text-centered"><a href="${data.url}/monitor" target="_blank">` +
        `<i title="Check server status details" class="fas fa-server fa-lg has-text-dark"></i></a></td>`;
      return row;
    }
    const template = document.createElement('template');
    template.innerHTML =
      `<div id="tabs" class="panel-tabs">
  <a class="is-active" data-tab="animations">Animations</a>
  <a data-tab="demos">Demos</a>
  <a data-tab="servers">Servers</a>
</div>
<div id="tab-content">
  <section class="section is-active" data-content="animations">
    <div class="container">
      <table class="table">
        <thead>
          <tr>
            <th style="text-align:center" title="Popularity"><i class="fas fa-chart-bar"></i></th>
            <th title="Title of the animation">Title</th>
            <th title="Duration of the animation">Duration</th>
            <th title="Total size of the animation files">Size</th>
            <th title="Last update time">Updated</th>
            <th colspan="1"></th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      <div class="buttons">
        <button class="button" id="add-a-new-animation">Add a new animation</button>
      </div>
    </div>
  </section>
  <section class="section" data-content="demos">
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
        <button class="button" id="add-a-new-project">Add a new demo</button>
      </div>
    </div>
  </section>
  <section class="section" data-content="servers">
    <div class="container">
      <table class="table">
        <thead>
          <tr>
            <th title="Fully qualified domain name of server">Server</th>
            <th title="Last update time">Updated</th>
            <th style="text-align:center" title="Server status">Status</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      <div class="buttons">
        <button class="button" id="add-a-new-server">Add a new server</button>
      </div>
    </div>
  </section>
</div>`;
    project.setup('home', [], template.content);

    function initTabs() {
      const TABS = [...document.querySelectorAll('#tabs a')];
      const CONTENT = [...document.querySelectorAll('#tab-content section')];
      const ACTIVE_CLASS = 'is-active';
      TABS.forEach((tab) => {
        tab.addEventListener('click', (e) => {
          let selected = tab.getAttribute('data-tab');
          TABS.forEach((t) => {
            if (t && t.classList.contains(ACTIVE_CLASS))
              t.classList.remove(ACTIVE_CLASS);
          });
          tab.classList.add(ACTIVE_CLASS);
          CONTENT.forEach((item) => {
            if (item && item.classList.contains(ACTIVE_CLASS))
              item.classList.remove(ACTIVE_CLASS);
            let data = item.getAttribute('data-content');
            if (data === selected)
              item.classList.add(ACTIVE_CLASS);
          });
        });
      });
    }

    initTabs();

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
      fetch('ajax/project/create.php', content)
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
    fetch('/ajax/project/list.php', content)
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
          project.content.querySelector('section[data-content="demos"] > div > table > tbody').innerHTML = line;
          for (let i = 0; i < data.length; i++)
            project.content.querySelector('#sync-' + data[i].id).addEventListener('click', synchronize);
        }
      });
    project.content.querySelector('#add-a-new-animation').addEventListener('click', function(event) {
      let content = {};
      content.innerHTML =
        `<div class="field">
  <label class="label">Webots animation</label>
  <div class="control has-icons-left">
    <input id="animation-file" name="animation-file" class="input" type="file" required accept=".json">
    <span class="icon is-small is-left">
      <i class="fas fa-upload"></i>
    </span>
  </div>
  <div class="help">Upload the Webots animation file: <em>animation.json</em></div>
</div>
<div class="field">
  <label class="label">Webots model</label>
  <div class="control has-icons-left">
    <input id="model-file" name="model-file" class="input" type="file" required accept=".x3d">
    <span class="icon is-small is-left">
      <i class="fas fa-upload"></i>
    </span>
  </div>
  <div class="help">Upload the Webots X3D model file: <em>model.x3d</em></div>
</div>
<div class="field">
  <label class="label">Texture files</label>
  <div class="control has-icons-left">
    <input id="texture-files" name="textures[]" class="input" type="file" multiple accept=".jpg, .jpeg, .png, .hrd">
    <span class="icon is-small is-left">
      <i class="fas fa-upload"></i>
    </span>
  </div>
  <div class="help">Upload all the texture files: <em>image.png</em>, <em>image.jpg</em> and <em>image.hdr</em></div>
</div>`;
      let modal = ModalDialog.run('Add an animation', content.innerHTML, 'Cancel', 'Add');
      let input = modal.querySelector('#animation-file');
      input.focus();
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        const content = {
          method: 'post',
          body: new FormData(modal.querySelector('form'))
        };
        fetch('/ajax/animation/create.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              modal.error(data.error);
            else {
              console.log('answer: ' + JSON.stringify(data));
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + animationRow(data) + '</tr>';
              let parent = document.querySelector('section[data-content="animations"] > div > table > tbody');
              parent.insertAdjacentHTML('beforeend', tr);
              parent.querySelector('#animation-' + data.id).addEventListener('click', function(event) {
                deleteAnimation(event, project);
              });
            }
          });
      });
    });
    fetch('/ajax/animation/list.php', content)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.error)
          console.log(data.error);
        else {
          let line = ``;
          for (let i = 0; i < data.length; i++)
            line += '<tr>' + animationRow(data[i]) + '</tr>';
          let parent = project.content.querySelector('section[data-content="animations"] > div > table > tbody');
          parent.innerHTML = line;
          console.log("user = " + project.id + " " + project.email + " " + project.password);
          for (let i = 0; i < data.length; i++)
            parent.querySelector('#animation-' + data[i].id).addEventListener('click', function(event) {
              deleteAnimation(event, project);
            });
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
        fetch('/ajax/project/create.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              modal.error(data.error);
            else {
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + simulationRow(data) + '</tr>';
              document.querySelector('section[data-content="demos"] > div > table > tbody').insertAdjacentHTML(
                'beforeend', tr);
            }
          });
      });
    });

    fetch('/ajax/server/list.php', content)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.error)
          console.log(data.error);
        else {
          let line = ``;
          for (let i = 0; i < data.length; i++)
            line += '<tr>' + serverRow(data[i]) + '</tr>';
          project.content.querySelector('section[data-content="servers"] > div > table > tbody').innerHTML = line;
          for (let i = 0; i < data.length; i++)
            project.content.querySelector('#sync-' + data[i].id).addEventListener('click', synchronize);
        }
      });

    project.content.querySelector('#add-a-new-server').addEventListener('click', function(event) {
      let content = {};
      content.innerHTML =
        `<div class="field">
  <label class="label">Server URL</label>
  <div class="control has-icons-left">
    <input id="server-url" class="input" type="url" required placeholder="https://cyberbotics1.epfl.ch" value="">
    <span class="icon is-small is-left">
      <i class="fas fa-server"></i>
    </span>
  </div>
  <div class="help">URL of the machine running a session server for Webots simulations, for example:<br>
    <a target="_blank" href="https://cyberbotics1.epfl.ch">
      https://cyberbotics1.epfl.ch
    </a>
  </div>
</div>`;
      let modal = ModalDialog.run('Add a simulation server', content.innerHTML, 'Cancel', 'Add');
      let input = modal.querySelector('#server-url');
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        const serverUrl = input.value.trim();
        if (!serverUrl.startsWith('https://')) {
          modal.error('The server URL should start with "https://".');
          return;
        }
        const content = {
          method: 'post',
          body: JSON.stringify({
            url: serverUrl
          })
        };
        fetch('/ajax/server/create.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              modal.error(data.error);
            else {
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + serverRow(data) + '</tr>';
              document.querySelector('section[data-content="servers"] > div > table > tbody').insertAdjacentHTML(
                'beforeend', tr);
            }
          });
      });
    });
  }

  function simulationPage(project) {
    project.setup('simulation', [], simulation.content(), true);
    simulation.run();
  }

  function deleteAnimation(event, project) {
    const that = this;
    const animation = parseInt(event.target.id.substring(10)); // skip 'animation-'
    console.log("Delete amination " + animation + ' ' + project.id + ' ' + project.password);
    /*
    let dialog = ModalDialog.run('Really delete animation?', '<p>There is no way to recover deleted data.</p>', 'Cancel', 'Delete Animation', 'is-danger');
    dialog.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      dialog.querySelector('button[type="submit"]').classList.add('is-loading');
      let content = {
        method: 'post',
        body: JSON.stringify({
          animation: animation,
          user: that.id,
          password: that.password
        })
      };
      fetch('ajax/animation/delete.php', content)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          dialog.close();
          const old = event.target.parentNode.parentNode;
          const parent = old.parentNode;
          if (data.error)
            modal.error(data.error);
          else if (data.status == 1) {
            parent.removeChild(old);
            ModalDialog.run('Animation deleted',
              '<p>Your animation was successfully deleted.</p><p>All data about it was erased.</p>');
          }
        });
    }
    */
  }
});
