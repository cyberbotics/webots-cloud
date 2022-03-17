import Project from './project.js';
import ModalDialog from './modal_dialog.js';

document.addEventListener('DOMContentLoaded', function() {
  let scene_page = 1;
  let animation_page = 1;
  let simulation_page = 1;
  let server_page = 1;
  Project.run('webots.cloud', footer(), [
    {
      url: '/',
      setup: homePage
    },
    {
      url: '/scene',
      setup: homePage
    },
    {
      url: '/animation',
      setup: homePage
    },
    {
      url: '/simulation',
      setup: homePage
    },
    {
      url: '/server',
      setup: homePage
    },
    {
      url: '/run',
      setup: runPage
    }]);

  function footer() {
    let template = document.createElement('template');
    template.innerHTML =
      `<footer class="footer">
        <div class="content has-text-centered" style="margin-bottom:14px">
          <p>
            <a class="has-text-white" target="_blank" href="https://github.com/cyberbotics/webots"><i class="fab fa-github is-size-6"></i> open-source robot simulator</a>
          </p>
        </div>
        <div class="content is-size-7">
          <p style="margin-top:12px"><a class="has-text-white" target="_blank" href="https://cyberbotics.com">Cyberbotics&nbsp;Ltd.</a></p>
        </div>
      </footer>`;
    return template.content.firstChild;
  }

  function setPages(active_tab, page) {
    if (active_tab === 'scene')
      scene_page = page;
    else if (active_tab === 'animation')
      animation_page = page;
    else if (active_tab === 'simulation')
      simulation_page = page;
    else if (active_tab === 'server')
      server_page = page;
  }

  function getPage(active_tab) {
    if (active_tab === 'scene')
      return scene_page;
    if (active_tab === 'animation')
      return animation_page;
    if (active_tab === 'simulation')
      return simulation_page;
    if (active_tab === 'server')
      return server_page;
  }

  function homePage(project) {
    let active_tab = document.location.pathname.substring(1);
    let page = parseInt(new URL(document.location.href).searchParams.get('p'));
    if (!page)
      page = 1;

    setPages(active_tab, page);

    const page_limit = 10;
    if (active_tab === '')
      active_tab = 'animation';

    mainContainer(project, active_tab);
    initTabs();

    project.content.querySelector('#add-a-new-scene').addEventListener('click', function(event) {addAnimation('S');});
    project.content.querySelector('#add-a-new-animation').addEventListener('click', function(event) {addAnimation('A');});
    project.content.querySelector('#add-a-new-project').addEventListener('click', function(event) {addSimulation();});

    listAnimations('S', scene_page);
    listAnimations('A', animation_page);
    listSimulations(simulation_page);
    listServers(server_page);

    function updatePagination(tab, current, max) {
      let nav = document.querySelector(`section[data-content="${tab}"] > nav`);
      let content = {};
      const previous_disabled = (current == 1) ? ' disabled': ` href="${(current == 2) ? ('/' + tab) : ('/' + tab + '?p=' + (current - 1))}"`;
      const next_disabled = (current == max) ? ' disabled' : ` href="/${tab}?p=${current + 1}"`;
      const one_is_current = (current == 1) ? ' is-current" aria-label="Page 1" aria-current="page"' : `" aria-label="Goto page 1" href="/${tab}"`;
      content.innerHTML =
        `<a class="pagination-previous"${previous_disabled}>Previous</a>
        <a class="pagination-next"${next_disabled}>Next page</a><ul class="pagination-list"><li>
        <a class="pagination-link${one_is_current}>1</a></li>`;
      for (let i = 2; i <= max; i++) {
        if (i == current - 2 || (i == current + 2 && i != max)) {
          content.innerHTML += `<li><span class="pagination-ellipsis">&hellip;</span></li>`;
          continue;
        }
        if (i < current - 2 || (i > current + 2 && i != max))
          continue;
        if (i == current)
          content.innerHTML += `<li><a class="pagination-link is-current" aria-label="Page ${i}" aria-current="page">${i}</a></li>`;
        else
          content.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}" href="/${tab}?p=${i}">${i}</a></li>`;
      }
      content.innerHTML += '</ul>';
      nav.innerHTML = content.innerHTML;
    }

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
      const type_name = (data.duration === 0) ? 'scene' : 'animation';
      const url = data.url.startsWith('https://webots.cloud') ? document.location.origin + data.url.substring(20) : data.url
      const style = (data.user == 0) ? ' style="color:grey"' : '';
      const tooltip = (data.user == 0) ? `Delete this anonymous ${type_name}` : `Delete your ${type_name}`;
      const delete_icon = (data.user == 0 || project.id == data.user) ? `<i${style} class="far fa-trash-alt" id="${type_name}-${data.id}" title="${tooltip}"></i>` : '';
      const uploaded = data.uploaded.replace(' ',`<br>${delete_icon} `);
      const title = data.title === '' ? '<i>anonymous</i>' : data.title;
      let row = `<td class="has-text-centered">${data.viewed}</td>` +
        `<td><a class="has-text-dark" href="${url}" title="${data.description}">${title}</a></td>`;
      if (data.duration !== 0)
        row += `<td class="has-text-right">${duration}</td>`;
      row += `<td class="has-text-right">${size}</td><td class="has-text-right is-size-7">${uploaded}</td>`;
      return row;
    }

    function simulationRow(data) {
      const words = data.url.substring(19).split('/');
      const repository = `https://github.com/${words[0]}/${words[1]}`;
      const animation = `https://${words[0]}.github.io/${words[1]}/${words[3]}`;
      const title = data.title === '' ? '<i>anonymous</i>' : data.title;
      const updated = data.updated.replace(' ',
        `<br><i style="color:grey" class="is-clickable far fa-trash-alt" id="delete-${data.id}" title="Delete '${title}' simulation"></i> `
      );
      let type;
      if (data.type == 'demo') {
        type = `<i class="fas fa-chalkboard-teacher fa-lg" title="${data.type}"></i>`;
      } else {
        const icon = (data.type == 'benchmark') ? 'chart-line' : 'question';
        type = `<i class="fas fa-${icon} fa-lg" title="${data.type}"></i>`;
      }
      const row =
        `<td class="has-text-centered"><a class="has-text-dark" href="${repository}/stargazers" target="_blank" title="GitHub stars">` +
        `${data.stars}</a></td>` +
        `<td><a class="has-text-dark" href="/run?url=${data.url}" title="${data.description}">${title}</a></td>` +
        `<td><a class="has-text-dark" href="${data.url}" target="_blank" title="View GitHub repository">${words[3]}</a></td>` +
        `<td class="has-text-centered">${type}</td>` +
        `<td class="has-text-right is-size-7" title="Last synchronization with GitHub">${updated}</td>` +
        `<td><i class="is-clickable fas fa-sync fa-m synchronizable-icon" id="sync-${data.id}" data-url="${data.url}" title="Re-synchronize now"></i></td>`;
      return row;
    }

    function percent(value) {
      const level = 150 + value;
      let red, green;
      if (value <= 50) {
        red = Math.round(level * value / 50).toString(16).padStart(2, '0');
        green = Math.round(level).toString(16).padStart(2, '0');
      } else {
        red = Math.round(level).toString(16).padStart(2, '0');
        green = Math.round(level - level * (value - 50) / 50).toString(16).padStart(2, '0');
      }
      return '<font color="#' + red + green + '00">' + value + '%</font>';
    }

    function serverRow(data) {
      const updated = data.updated.replace(' ',
        `<br><i class="is-clickable fas fa-sync" id="sync-server-${data.id}" data-url="${data.url}" title="Re-synchronize now"></i> `
      );
      const started = data.started.replace(' ', `<br>`);
      const name = data.url.startsWith('https://') ? data.url.substring(8) : data.url.substring(7);
      const accept = (data.load < data.share) ? "Is accepting public simulations" : "Is not accepting public simulations";
      const color = (data.load < data.share) ? "green" : "red";
      const row =
        `<td><a class="has-text-dark" href="${data.url}/monitor" target="_blank">${name}</a></td>` +
        `<td class="has-text-right is-size-7" title="Start time">${started}</td>` +
        `<td class="has-text-right is-size-7" title="Last synchronization">${updated}</td>` +
        `<td class="has-text-centered" style="color:${color}" title="${accept}">${data.share}%</td>` +
        `<td class="has-text-centered" title="Current server load">${percent(data.load)}</td>`;
      return row;
    }
    
    function mainContainer(project, active_tab) {
      const template = document.createElement('template');
      template.innerHTML =
        `<div id="tabs" class="panel-tabs">
          <a${(active_tab == 'scene') ? ' class="is-active"' : ''} data-tab="scene">Scene</a>
          <a${(active_tab == 'animation') ? ' class="is-active"' : ''} data-tab="animation">Animation</a>
          <a style="pointer-events:none;cursor:default;color:grey" data-tab="proto">Proto</a>
          <a${(active_tab == 'simulation') ? ' class="is-active"' : ''} data-tab="simulation">Simulation</a>
          <a${(active_tab == 'server') ? ' class="is-active"' : ''} data-tab="server">Server</a>
        </div>
        <div id="tab-content">
          <section class="section${(active_tab == 'scene') ? ' is-active' : ''}" data-content="scene">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th style="text-align:center" title="Popularity"><i class="fas fa-chart-bar"></i></th>
                    <th title="Title of the scene">Title</th>
                    <th title="Total size of the scene files">Size</th>
                    <th title="Upload date and time">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container">
              <div class="buttons">
                <button class="button" id="add-a-new-scene">Add a new scene</button>
              </div>
            </div>
          </section>
          <section class="section${(active_tab == 'animation') ? ' is-active' : ''}" data-content="animation">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th style="text-align:center" title="Popularity"><i class="fas fa-chart-bar"></i></th>
                    <th title="Title of the animation">Title</th>
                    <th title="Duration of the animation">Duration</th>
                    <th title="Total size of the animation files">Size</th>
                    <th title="Upload date and time">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container">
              <div class="buttons">
                <button class="button" id="add-a-new-animation">Add a new animation</button>
              </div>
            </div>
          </section>
          <section class="section${(active_tab == 'simulation') ? ' is-active' : ''}" data-content="simulation">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th style="text-align:center" title="Number of GitHub stars"><i class="far fa-star"></i></th>
                    <th title="Title of the simulation">Title</th>
                    <th title="Version of the simulation">Version</th>
                    <th title="Type of simulation">Type</th>
                    <th title="Last update time">Updated</th>
                    <th colspan="1"></th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container">
              <div class="buttons">
                <button class="button" id="add-a-new-project">Add a new simulation</button>
              </div>
            </div>
          </section>
          <section class="section${(active_tab == 'server') ? ' is-active' : ''}" data-content="server">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th title="Fully qualified domain name of server">Server</th>
                    <th title="Start time">Started</th>
                    <th title="Last update time">Updated</th>
                    <th style="text-align:center" title="Maximum load for public usage">Share</th>
                    <th style="text-align:center" title="Server load">Load</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container">
              <div class="buttons">
                <button class="button" onclick="window.open('https://github.com/cyberbotics/webots-cloud/wiki')">Add your own server</button>
              </div>
            </div>
          </section>
        </div>`;
      const title = (document.location.pathname.length > 1) ? document.location.pathname.substring(1) : 'home';
      project.setup(title, [], template.content);
    }

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
          active_tab = tab.getAttribute('data-tab');
          page = getPage(active_tab);
          window.history.pushState(null, document.title, '/' + active_tab + ((page == 1) ? '' : '?p=' + page));
          document.head.querySelector('#title').innerHTML = 'webots.cloud - ' + active_tab;
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

    function synchronize(event) {
      const id = event.target.id.substring(5);
      event.target.classList.add('fa-spin');
      event.target.style.color = '#333';
      const url = event.target.getAttribute('data-url');
      fetch('ajax/project/create.php', {method: 'post', body: JSON.stringify({url: url, id: id})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          const old = document.querySelector('#sync-' + id).parentNode.parentNode;
          const parent = old.parentNode;
          if (data.error) {
            let dialog = ModalDialog.run('Project creation error', data.error, 'Cancel', `Delete Simulation`, 'is-danger');
            dialog.querySelector('form').addEventListener('submit', function(event) {
              event.preventDefault();
              dialog.querySelector('button[type="submit"]').classList.add('is-loading');
              parent.removeChild(old);
            });
          } else {
            let tr = document.createElement('tr');
            tr.innerHTML = simulationRow(data);
            parent.replaceChild(tr, old);
            parent.querySelector('#sync-' + data.id).addEventListener('click', synchronize);
            event.target.classList.remove('fa-spin');
            updatePagination('simulation', 1, 1);
          }
        });
    }

    function synchronizeServer(event) {
      const id = event.target.id.substring(12);
      event.target.classList.add('fa-spin');
      const url = event.target.getAttribute('data-url');
      fetch('ajax/server/update.php', {method: 'post', body: JSON.stringify({url: url, id: id})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          const old = document.querySelector('#sync-server-' + id).parentNode.parentNode;
          const parent = old.parentNode;
          if (data.error) {
            ModalDialog.run('Server synchronization error', data.error);
            parent.removeChild(old);
          } else {
            let tr = document.createElement('tr');
            tr.innerHTML = serverRow(data);
            parent.replaceChild(tr, old);
            parent.querySelector('#sync-server-' + data.id).addEventListener('click', synchronizeServer);
            event.target.classList.remove('fa-spin');
            updatePagination('server', 1, 1);
          }
        });
    }

    function addAnimation(type) {
      let content = {};
      if (type == 'A')
        content.innerHTML = `<div class="field">
          <label class="label">Webots animation</label>
          <div class="control has-icons-left">
            <input id="animation-file" name="animation-file" class="input" type="file" required accept=".json">
            <span class="icon is-small is-left">
              <i class="fas fa-upload"></i>
            </span>
          </div>
          <div class="help">Upload the Webots animation file: <em>animation.json</em></div>
        </div>`;
      else
        content.innerHTML = '';
      content.innerHTML += `<div class="field">
          <label class="label">Webots scene</label>
          <div class="control has-icons-left">
            <input id="scene-file" name="scene-file" class="input" type="file" required accept=".x3d">
            <span class="icon is-small is-left">
              <i class="fas fa-upload"></i>
            </span>
          </div>
          <div class="help">Upload the Webots X3D scene file: <em>scene.x3d</em></div>
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
      const title = (type == 'A') ? 'Add an animation' : 'Add a scene';
      let modal = ModalDialog.run(title, content.innerHTML, 'Cancel', 'Add');
      const type_name = (type == 'A') ? 'animation' : 'scene';
      let input = modal.querySelector(`#${type_name}-file`);
      input.focus();
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        let body = new FormData(modal.querySelector('form'));
        body.append('type', type);
        body.append('user', project.id);
        body.append('password', project.password);
        fetch('/ajax/animation/create.php', {method: 'post', body: body})
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              modal.error(data.error);
            else {
              modal.close();
              if (!project.id) {
                ModalDialog.run(`Anonymous ${type_name} uploaded`,
                                `The ${type_name} you just uploaded may be deleted anytime by anyone. ` +
                                `To prevent this, you should associate it with your webots.cloud account: ` +
                                `log in or sign up for a new account now from this browser.`);
                let uploads = JSON.parse(window.localStorage.getItem('uploads'));
                if (uploads === null)
                  uploads = [];
                uploads.push(data.id);
                window.localStorage.setItem('uploads', JSON.stringify(uploads));
              }
              const p = (data.total == 0) ? 1 : Math.ceil(data.total / page_limit);
              project.load(`/${type_name}${(p > 1) ? ('?p=' + p) : ''}`);
            }
          });
      });
    }

    function addSimulation() {
      let content = {};
      content.innerHTML =
        `<div class="field">
          <label class="label">Webots world file</label>
          <div class="control has-icons-left">
            <input id="world-file" class="input" type="url" required placeholder="https://github.com/my_name/my_project/blob/tag/worlds/file.wbt" value="https://github.com/">
            <span class="icon is-small is-left">
              <i class="fab fa-github"></i>
            </span>
          </div>
          <div class="help">Blob reference in a public GitHub repository, including tag information, for example:<br>
            <a target="_blank" href="https://github.com/cyberbotics/webots/blob/R2021b/projects/languages/python/worlds/example.wbt">
              https://github.com/cyberbotics/webots/blob/R2021b/projects/languages/python/worlds/example.wbt
            </a>
          </div>
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
        const content = {
          method: 'post',
          body: JSON.stringify({
            url: worldFile
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
              document.querySelector('section[data-content="simulation"] > div > table > tbody').insertAdjacentHTML(
                'beforeend', tr);
              const total = (data.total == 0) ? 1 : Math.ceil(data.total / page_limit);
              updatePagination('simulation', page, total);
            }
          });
      });
    }

    function listAnimations(type, page) {
      const type_name = (type == 'A') ? 'animation' : 'scene';
      const capitalized_type_name = type_name.charAt(0).toUpperCase() + type_name.slice(1);
      const offset = (page - 1) * page_limit;
      fetch('/ajax/animation/list.php', {method: 'post', body: JSON.stringify({offset: offset, limit: page_limit, type: type})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run(`${capitalized_type_name} listing error`, data.error);
          else {
            let line = ``;
            for (let i = 0; i < data.animations.length; i++)
              line += '<tr>' + animationRow(data.animations[i]) + '</tr>';
            let parent = project.content.querySelector(`section[data-content="${type_name}"] > div > table > tbody`);
            parent.innerHTML = line;
            for (let i = 0; i < data.animations.length; i++) {
              let node = parent.querySelector(`#${type_name}-${data.animations[i].id}`);
              if (node) {
                let p = (data.animations.length === 1) ? page - 1 : page;
                if (p === 0)
                  p = 1;
                node.addEventListener('click', function(event) { deleteAnimation(event, type, project, p); });
              }
            }
            const total = (data.total == 0) ? 1 : Math.ceil(data.total / page_limit);
            updatePagination(type_name, page, total);
          }
        });
    }

    function listSimulations(page) {
      let offset = (page - 1) * page_limit;
      fetch('/ajax/project/list.php', {method: 'post', body: JSON.stringify({offset: offset, limit: page_limit})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run('Project listing error', data.error);
          else {
            let line = ``;
            for (let i = 0; i < data.projects.length; i++) // compute the GitHub repo URL from the simulation URL.
              line += '<tr>' + simulationRow(data.projects[i]) + '</tr>';
            project.content.querySelector('section[data-content="simulation"] > div > table > tbody').innerHTML = line;
            for (let i = 0; i < data.projects.length; i++) {
              project.content.querySelector('#sync-' + data.projects[i].id).addEventListener('click', synchronize);
              project.content.querySelector('#delete-' + data.projects[i].id).addEventListener('click', function(event) { deleteSimulation(event, project, page);});
            }
            const total = (data.total == 0) ? 1 : Math.ceil(data.total / page_limit);
            updatePagination('simulation', page, total);
          }
        });
    }

    function listServers(page) {
      let offset = (page - 1) * page_limit;
      fetch('/ajax/server/list.php', {method: 'post', body: JSON.stringify({offset: offset, limit: page_limit})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run('Server listing error', data.error);
          else {
            let line = ``;
            for (let i = 0; i < data.servers.length; i++)
              line += '<tr>' + serverRow(data.servers[i]) + '</tr>';
            project.content.querySelector('section[data-content="server"] > div > table > tbody').innerHTML = line;
            for (let i = 0; i < data.servers.length; i++)
              project.content.querySelector('#sync-server-' + data.servers[i].id).addEventListener('click', synchronizeServer);
            const total = (data.total == 0) ? 1 : Math.ceil(data.total / page_limit);
            updatePagination('server', page, total);
          }
        });
    }
  }

  function runPage(project) {
    project.runPage();
  }

  function deleteSimulation(event, project, page) {
    console.log("Target: "+event.target);
    const url = event.target.getAttribute('data-url');
    const id = event.target.id.substring(7);
    let dialog = ModalDialog.run(`Really delete simulation?`, '<p>There is no way to recover deleted data.</p>', 'Cancel', `Delete Simulation`, 'is-danger');
    dialog.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      dialog.querySelector('button[type="submit"]').classList.add('is-loading');
      fetch('ajax/project/delete.php', {method: 'post', body: JSON.stringify({url: url, id: id})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          dialog.close();
          if (data.error)
            ModalDialog.run(`Simulation deletion error`, data.error);
            else if (data.status == 1)
              project.load(`/simulation${(page > 1) ? ('?p=' + page) : ''}`);
        });
    });
  }

  function deleteAnimation(event, type, project, page) {
    console.log(JSON.stringify(project));
    const animation = parseInt(event.target.id.substring((type == 'A') ? 10 : 6)); // skip 'animation-' or 'scene-'
    const type_name = (type == 'A') ? 'animation' : 'scene';
    const capitalized_type_name = type_name.charAt(0).toUpperCase() + type_name.slice(1);
    let dialog = ModalDialog.run(`Really delete ${type_name}?`, '<p>There is no way to recover deleted data.</p>', 'Cancel', `Delete ${capitalized_type_name}`, 'is-danger');
    dialog.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      dialog.querySelector('button[type="submit"]').classList.add('is-loading');
      const content = {
        method: 'post',
        body: JSON.stringify({
          type: type,
          animation: animation,
          user: project.id,
          password: project.password
        })
      };
      fetch('ajax/animation/delete.php', content)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          dialog.close();
          if (data.error)
            ModalDialog.run(`${capitalized_type_name} deletion error`, data.error);
          else if (data.status == 1)
            project.load(`/${type_name}${(page > 1) ? ('?p=' + page) : ''}`);
        });
    });
  }

});
