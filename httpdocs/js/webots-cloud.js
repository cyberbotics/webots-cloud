import Project from './project.js';
import ModalDialog from './modal_dialog.js';

document.addEventListener('DOMContentLoaded', function() {
  let scenePage = 1;
  let animationPage = 1;
  let simulationPage = 1;
  let serverPage = 1;
  Project.run('webots.cloud', footer(), [
    {
      url: '/',
      setup: homePage
    },
    {
      url: '/animation',
      setup: homePage
    },
    {
      url: '/scene',
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
        <div class="content has-text-centered" id="footer-github" style="margin-bottom:14px">
          <p>
            <a class="has-text-white" target="_blank" href="https://github.com/cyberbotics/webots"><i class="fab fa-github is-size-6"></i> open-source robot simulator</a>
          </p>
        </div>
        <div class="footer-right">
          <div class="content is-size-7" id="footer-terms-of-service">
            <p><a class="has-text-white" href="terms-of-service">Terms</a></p>
          </div>
          <div class="content is-size-7" id="footer-privacy-policy">
            <p><a class="has-text-white" href="privacy-policy">Privacy</a></p>
          </div>
          <div class="content is-size-7" id="footer-cyberbotics">
            <p><a class="has-text-white" target="_blank" href="https://cyberbotics.com">Cyberbotics&nbsp;Ltd.</a></p>
          </div>
        </div>
      </footer>`;
    return template.content.firstChild;
  }

  function setPages(activeTab, page) {
    if (activeTab === 'scene')
      scenePage = page;
    else if (activeTab === 'animation')
      animationPage = page;
    else if (activeTab === 'simulation')
      simulationPage = page;
    else if (activeTab === 'server')
      serverPage = page;
  }

  function getPage(activeTab) {
    if (activeTab === 'scene')
      return scenePage;
    if (activeTab === 'animation')
      return animationPage;
    if (activeTab === 'simulation')
      return simulationPage;
    if (activeTab === 'server')
      return serverPage;
  }

  function homePage(project) {
    let activeTab = document.location.pathname.substring(1);
    let page = parseInt(new URL(document.location.href).searchParams.get('p'));
    if (!page)
      page = 1;

    setPages(activeTab, page);

    const pageLimit = 10;
    if (activeTab === '')
      activeTab = 'animation';

    mainContainer(project, activeTab);
    initTabs();

    project.content.querySelector('#add-a-new-scene').addEventListener('click', function(event) { addAnimation('S'); });
    project.content.querySelector('#add-a-new-animation').addEventListener('click', function(event) { addAnimation('A'); });
    project.content.querySelector('#add-a-new-project').addEventListener('click', function(event) { addSimulation(); });

    listAnimations('S', scenePage);
    listAnimations('A', animationPage);
    listSimulations(simulationPage);
    listServers(serverPage);

    function updatePagination(tab, current, max) {
      let nav = document.querySelector(`section[data-content="${tab}"] > nav`);
      let content = {};
      const previousDisabled = (current === 1) ? ' disabled' : ` href="${(current === 2)
        ? ('/' + tab) : ('/' + tab + '?p=' + (current - 1))}"`;
      const nextDisabled = (current === max) ? ' disabled' : ` href="/${tab}?p=${current + 1}"`;
      const oneIsCurrent = (current === 1) ? ' is-current" aria-label="Page 1" aria-current="page"'
        : `" aria-label="Goto page 1" href="/${tab}"`;
      content.innerHTML =
        `<a class="pagination-previous"${previousDisabled}>Previous</a>
        <ul class="pagination-list"><li>
        <a class="pagination-link${oneIsCurrent}>1</a></li>`;
      for (let i = 2; i <= max; i++) {
        if (i === current - 2 || (i === current + 2 && i !== max)) {
          content.innerHTML += `<li><span class="pagination-ellipsis">&hellip;</span></li>`;
          continue;
        }
        if (i < current - 2 || (i > current + 2 && i !== max))
          continue;
        if (i === current)
          content.innerHTML += `<li><a class="pagination-link is-current" aria-label="Page ${i}"` +
            ` aria-current="page">${i}</a></li>`;
        else
          content.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}" href="/${tab}?p=${i}">${i}</a></li>`;
      }
      content.innerHTML += `</ul>` + `<a class="pagination-next"${nextDisabled}>Next page</a>`;
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
      const admin = project.email ? project.email.endsWith('@cyberbotics.com') : false;
      const typeName = (data.duration === 0) ? 'scene' : 'animation';
      const url = data.url.startsWith('https://webots.cloud') ? document.location.origin + data.url.substring(20) : data.url;
      const thumbnailUrl = url.slice(0, url.lastIndexOf('/')) + '/storage' + url.slice(url.lastIndexOf('/')) + '/thumbnail.jpg';
      const defaultThumbnailUrl = document.location.origin + '/images/thumbnail_not_available.jpg';
      const versionUrl = `https://github.com/cyberbotics/webots/releases/tag/${data.version}`;
      const style = (data.user === 0) ? ' style="color:grey"' : (parseInt(project.id) === data.user
        ? ' style="color:#007acc"' : (admin ? ' style="color:red"' : ''));
      const tooltip = (data.user === 0) ? `Delete this anonymous ${typeName}` : (parseInt(project.id) === data.user
        ? `Delete your ${typeName}` : (admin ? `Delete this ${typeName} as administrator` : ''));
      const deleteIcon = (data.user === 0 || parseInt(project.id) === data.user || admin)
        ? `<i${style} class="is-clickable far fa-trash-alt" id="${typeName}-${data.id}" title="${tooltip}"></i>` : '';
      const uploaded = data.uploaded.replace(' ', `<br>${deleteIcon} `);
      const title = data.title === '' ? '<i>anonymous</i>' : data.title;
      let row = `<td class="has-text-centered">${data.viewed}</td>`;
      row += `<td>
                <a class="table-title has-text-dark" href="${url}">${title}</a>
                <div class="thumbnail">
                  <div class="thumbnail-container">
                    <img class="thumbnail-image" src="${thumbnailUrl}" onerror="this.src='${defaultThumbnailUrl}';"/>
                    <p class="thumbnail-description">${data.description}<div class="thumbnail-description-fade"/></p>
                  </div>
                </div>
              </td>`;
      row += `<td><a class="has-text-dark" href="${versionUrl}" target="_blank"
        title="View Webots release">${data.version}</a></td>`;
      if (data.duration !== 0)
        row += `<td class="has-text-right">${duration}</td>`;
      row += `<td class="has-text-right">${size}</td><td class="has-text-right is-size-7">${uploaded}</td>`;
      return row;
    }

    function simulationRow(data) {
      const admin = project.email ? project.email.endsWith('@cyberbotics.com') : false;
      const words = data.url.substring(19).split('/');
      const dotIndex = data.url.lastIndexOf('/') + 1;
      const thumbnailUrl = (data.url.slice(0, dotIndex) + "." + data.url.slice(dotIndex)).replace('github.com', 'raw.githubusercontent.com').replace('/blob', '').replace('.wbt', '.jpg');
      const defaultThumbnailUrl = document.location.origin + '/images/thumbnail_not_available.jpg';
      const repository = `https://github.com/${words[0]}/${words[1]}`;
      const title = data.title === '' ? '<i>anonymous</i>' : data.title;
      const updated = data.updated.replace(' ',
        `<br><i class="is-clickable fas fa-sync" id="sync-${data.id}" data-url="${data.url}" title="Re-synchronize now"></i> `
      );
      let icon;
      if (data.type === 'demo')
        icon = 'chalkboard-teacher';
      else if (data.type === 'benchmark')
        icon = 'award';
      else if (data.type === 'competition')
        icon = 'trophy';
      else
        icon = 'question';
      const type = `<i class="fas fa-${icon} fa-lg" title="${data.type}"></i>`;
      const deleteIcon = `<i style="color: red" class="is-clickable far fa-trash-alt fa-sm" id="delete-${data.id}"
        title="Delete ${data.type} as administrator"></i>`;
      const deleteProject = admin ? `<td class="has-text-centered">${deleteIcon}</td>` : ``;
      const versionUrl = `https://github.com/cyberbotics/webots/releases/tag/${data.version}`;
      let row = `<td class="has-text-centered"><a class="has-text-dark" href="${repository}/stargazers" target="_blank"
        title="GitHub stars"> ${data.stars}</a></td>`;
      row += `<td class="title-cell">
                <a class="table-title has-text-dark" href="/run?version=${data.version}&url=${data.url}">${title}</a>
                <div class="thumbnail">
                  <div class="thumbnail-container">
                    <img class="thumbnail-image" src="${thumbnailUrl}" onerror="this.src='${defaultThumbnailUrl}';"/>
                    <p class="thumbnail-description">${data.description}<div class="thumbnail-description-fade"/></p>
                  </div>
                </div>
              </td>`;
      row += `<td><a class="has-text-dark" href="${data.url}" target="_blank" title="View GitHub repository">${words[3]}</a></td>` +
        `<td><a class="has-text-dark" href="${versionUrl}" target="_blank" title="View Webots release">${data.version}</a></td>` +
        `<td class="has-text-centered">${type}</td>` +
        `<td class="has-text-right is-size-7" title="Last synchronization with GitHub">${updated}</td>` +
        `${deleteProject}`;
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
        `<br><i class="is-clickable fas fa-sync" id="sync-server-${data.id}" data-url="${data.url}" ` +
        ` title="Re-synchronize now"></i> `
      );
      const started = data.started.replace(' ', `<br>`);
      const name = data.url.startsWith('https://') ? data.url.substring(8) : data.url.substring(7);
      const accept = (data.load < data.share) ? 'Is accepting public simulations'
        : 'Is not accepting public simulations';
      const color = (data.load < data.share) ? 'green' : 'red';
      const row =
        `<td><a class="has-text-dark" href="${data.url}/monitor" target="_blank">${name}</a></td>` +
        `<td class="has-text-right is-size-7" title="Start time">${started}</td>` +
        `<td class="has-text-right is-size-7" title="Last synchronization">${updated}</td>` +
        `<td class="has-text-centered" style="color:${color}" title="${accept}">${data.share}%</td>` +
        `<td class="has-text-centered" title="Current server load">${percent(data.load)}</td>`;
      return row;
    }

    function mainContainer(project, activeTab) {
      const template = document.createElement('template');
      template.innerHTML =
        `<div id="tabs" class="tabs is-centered is-small-medium">
          <ul>
            <li data-tab="scene" ${(activeTab === 'scene') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Scene</a>
            </li>
            <li data-tab="animation" ${(activeTab === 'animation') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Animation</a>
            </li>
            <li data-tab="simulation" ${(activeTab === 'simulation') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Simulation</a>
            </li>
            <li data-tab="server" ${(activeTab === 'server') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Server</a>
            </li>
          </ul>
        </div>
        <div id="tab-content">
          <section class="section${(activeTab === 'scene') ? ' is-active' : ''}" data-content="scene">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th title="Popularity" style="text-align:center"><i class="fas fa-chart-column"></i></th>
                    <th title="Title of the scene" style="min-width: 120px;">Title</th>
                    <th title="Webots release of the scene">Version</th>
                    <th title="Total size of the scene files" style="text-align: right; min-width: 65px;">Size</th>
                    <th title="Upload date and time">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container is-fullhd">
              <div class="buttons">
                <button class="button" id="add-a-new-scene">Add a new scene</button>
              </div>
            </div>
          </section>
          <section class="section${(activeTab === 'animation') ? ' is-active' : ''}" data-content="animation">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th title="Popularity" style="text-align:center"><i class="fas fa-chart-column"></i></th>
                    <th title="Title of the animation" style="min-width: 120px;">Title</th>
                    <th title="Webots release of the animation">Version</th>
                    <th title="Duration of the animation">Duration</th>
                    <th title="Total size of the animation files" style="text-align: right; min-width: 65px;">Size</th>
                    <th title="Upload date and time">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container is-fullhd">
              <div class="buttons">
                <button class="button" id="add-a-new-animation">Add a new animation</button>
              </div>
            </div>
          </section>
          <section class="section${(activeTab === 'simulation') ? ' is-active' : ''}" data-content="simulation">
            <div class="table-container">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th style="text-align:center" title="Number of GitHub stars"><i class="far fa-star"></i></th>
                    <th title="Title of the simulation">Title</th>
                    <th title="Branch or Tag of the simulation">Branch/Tag</th>
                    <th title="Webots release of the simulation">Version</th>
                    <th title="Type of simulation">Type</th>
                    <th title="Last update time">Updated</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="container is-fullhd">
              <div class="buttons">
                <button class="button" id="add-a-new-project">Add a new simulation</button>
              </div>
            </div>
          </section>
          <section class="section${(activeTab === 'server') ? ' is-active' : ''}" data-content="server">
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
            <div class="container is-fullhd">
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
      const TABS = [...document.querySelectorAll('#tabs li')];
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
          activeTab = tab.getAttribute('data-tab');
          page = getPage(activeTab);
          window.history.pushState(null, document.title, '/' + activeTab + ((page === 1) ? '' : '?p=' + page));
          document.head.querySelector('#title').innerHTML = 'webots.cloud - ' + activeTab;
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

    function synchronizeSimulation(event) {
      const id = event.target.id.substring(5);
      event.target.classList.add('fa-spin');
      const url = event.target.getAttribute('data-url');
      fetch('ajax/project/create.php', {method: 'post', body: JSON.stringify({url: url, id: id})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          const old = document.querySelector('#sync-' + id).parentNode.parentNode;
          const parent = old.parentNode;
          if (data.error) {
            let errorMsg = data.error;
            if (errorMsg.startsWith('YAML file error:')) {
              errorMsg = errorMsg +
                `<div class="help">More information at:
                  <a target="_blank" href="https://cyberbotics.com/doc/guide/webots-cloud#yaml-file">
                    cyberbotics.com/doc/guide/webots-cloud#yaml-file
                  </a>
                </div>`;
            }
            let dialog = ModalDialog.run('Project sync error', errorMsg);
            dialog.error('Project has been deleted.');
            dialog.querySelector('form').addEventListener('submit', function(e) {
              e.preventDefault();
              dialog.querySelector('button[type="submit"]').classList.add('is-loading');
              dialog.close();
            });
            event.target.classList.remove('fa-spin');
            project.load(`/simulation${(page > 1) ? ('?p=' + page) : ''}`);
          } else {
            let tr = document.createElement('tr');
            tr.innerHTML = simulationRow(data);
            parent.replaceChild(tr, old);
            parent.querySelector('#sync-' + data.id).addEventListener('click', synchronizeSimulation);
            if (parent.querySelector('#delete-' + id) !== null)
              parent.querySelector('#delete-' + id).addEventListener('click',
                function(event) { deleteSimulation(event, project); });
            event.target.classList.remove('fa-spin');
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updatePagination('simulation', page, total);
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
      if (type === 'A')
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
          <label class="label">Webots thumbnail</label>
          <div class="control has-icons-left">
            <input id="thumbnail-file" name="thumbnail-file" class="input" type="file" accept=".jpg">
            <span class="icon is-small is-left">
              <i class="fas fa-upload"></i>
            </span>
          </div>
          <div class="help">Upload the thumbnail file: <em>thumbnail.jpg</em></div>
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
      let cancelled = false;
      const title = (type === 'A') ? 'Add an animation' : 'Add a scene';
      let modal = ModalDialog.run(title, content.innerHTML, 'Cancel', 'Add');
      const typeName = (type === 'A') ? 'animation' : 'scene';
      let input = modal.querySelector(`#${typeName}-file`);
      input.focus();
      modal.querySelector('button.cancel').addEventListener('click', function() { cancelled = true; });
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
            else if (!cancelled) {
              const id = data.id;
              const total = data.total;
              fetch('/ajax/animation/create.php', {method: 'post', body: JSON.stringify({uploading: 0, uploadId: id})})
                .then(function(response) {
                  return response.json();
                })
                .then(function(data) {
                  if (data.status !== 'uploaded')
                    modal.error(data.error);
                  else {
                    modal.close();
                    if (!project.id) {
                      ModalDialog.run(`Anonymous ${typeName} uploaded`,
                        `The ${typeName} you just uploaded may be deleted anytime by anyone.<br>` +
                        `To prevent this, you should associate it with your webots.cloud account: ` +
                        `log in or sign up for a new account now from this browser.`);
                      let uploads = JSON.parse(window.localStorage.getItem('uploads'));
                      if (uploads === null)
                        uploads = [];
                      uploads.push(id);
                      window.localStorage.setItem('uploads', JSON.stringify(uploads));
                    }
                  }
                });
              const p = (total === 0) ? 1 : Math.ceil(total / pageLimit);
              project.load(`/${typeName}${(p > 1) ? ('?p=' + p) : ''}`);
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
            if (data.error) {
              let errorMsg = data.error;
              if (errorMsg.startsWith('YAML file error:')) {
                errorMsg = errorMsg +
                  `<div class="help">More information at:
                    <a target="_blank" href="https://cyberbotics.com/doc/guide/webots-cloud#yaml-file">
                      cyberbotics.com/doc/guide/webots-cloud#yaml-file
                    </a>
                  </div>`;
              }
              modal.error(errorMsg);
            } else {
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + simulationRow(data) + '</tr>';
              document.querySelector('section[data-content="simulation"] > div > table > tbody').insertAdjacentHTML(
                'beforeend', tr);
              const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
              updatePagination('simulation', page, total);
              project.load(`/simulation${(page > 1) ? ('?p=' + page) : ''}`);
            }
          });
      });
    }

    function listAnimations(type, page) {
      const typeName = (type === 'A') ? 'animation' : 'scene';
      const capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      const offset = (page - 1) * pageLimit;
      fetch('/ajax/animation/list.php', {method: 'post', body: JSON.stringify({offset: offset, limit: pageLimit, type: type})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run(`${capitalizedTypeName} listing error`, data.error);
          else {
            let line = ``;
            for (let i = 0; i < data.animations.length; i++)
              line += '<tr>' + animationRow(data.animations[i]) + '</tr>';
            let parent = project.content.querySelector(`section[data-content="${typeName}"] > div > table > tbody`);
            parent.innerHTML = line;
            for (let i = 0; i < data.animations.length; i++) {
              let node = parent.querySelector(`#${typeName}-${data.animations[i].id}`);
              if (node) {
                let p = (data.animations.length === 1) ? page - 1 : page;
                if (p === 0)
                  p = 1;
                node.addEventListener('click', function(event) { deleteAnimation(event, type, project, p); });
              }
            }
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updatePagination(typeName, page, total);
          }
        });
    }

    function listSimulations(page) {
      let offset = (page - 1) * pageLimit;
      fetch('/ajax/project/list.php', {method: 'post', body: JSON.stringify({offset: offset, limit: pageLimit})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run('Project listing error', data.error);
          else {
            if (project.email && project.email.endsWith('@cyberbotics.com'))
              project.content.querySelector('section[data-content="simulation"] > div > table > thead > tr')
                .appendChild(document.createElement('th'));
            let line = ``;
            for (let i = 0; i < data.projects.length; i++) // compute the GitHub repo URL from the simulation URL.
              line += '<tr>' + simulationRow(data.projects[i]) + '</tr>';
            project.content.querySelector('section[data-content="simulation"] > div > table > tbody').innerHTML = line;
            for (let i = 0; i < data.projects.length; i++) {
              let id = data.projects[i].id;
              project.content.querySelector('#sync-' + id).addEventListener('click', synchronizeSimulation);
              if (project.content.querySelector('#delete-' + id) !== null)
                project.content.querySelector('#delete-' + id)
                  .addEventListener('click', function(event) { deleteSimulation(event, project); });
            }
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updatePagination('simulation', page, total);
          }
        });
    }

    function listServers(page) {
      let offset = (page - 1) * pageLimit;
      fetch('/ajax/server/list.php', {method: 'post', body: JSON.stringify({offset: offset, limit: pageLimit})})
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
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updatePagination('server', page, total);
          }
        });
    }

    function deleteAnimation(event, type, project, page) {
      const animation = parseInt(event.target.id.substring((type === 'A') ? 10 : 6)); // skip 'animation-' or 'scene-'
      const typeName = (type === 'A') ? 'animation' : 'scene';
      const capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      let dialog = ModalDialog.run(`Really delete ${typeName}?`, '<p>There is no way to recover deleted data.</p>', 'Cancel',
        `Delete ${capitalizedTypeName}`, 'is-danger');
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
              ModalDialog.run(`${capitalizedTypeName} deletion error`, data.error);
            else if (data.status === 1) {
              let uploads = JSON.parse(window.localStorage.getItem('uploads'));
              if (uploads !== null && uploads.includes(animation)) {
                uploads.splice(uploads.indexOf(animation), 1);
                if (uploads.length === 0)
                  uploads = null;
              }
              window.localStorage.setItem('uploads', JSON.stringify(uploads));
              project.load(`/${typeName}${(page > 1) ? ('?p=' + page) : ''}`);
            }
          });
      });
    }

    function deleteSimulation(event, project) {
      const id = event.target.id.substring(7);
      let dialog = ModalDialog.run(`Really delete simulation?`, '<p>There is no way to recover deleted data.</p>', 'Cancel',
        `Delete simulation`, 'is-danger');
      dialog.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        dialog.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('ajax/project/delete.php', {method: 'post',
          body: JSON.stringify({user: project.id, password: project.password, id: id})})
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            dialog.close();
            if (data.error)
              ModalDialog.run(`Simulation deletion error`, data.error);
            else if (data.status === 1)
              project.load(`/simulation${(page > 1) ? ('?p=' + page) : ''}`);
          });
      });
    }
  }

  function runPage(project) {
    project.runWebotsView();
  }
});
