import Project from './project.js';
import ModalDialog from './modal_dialog.js';
import countryCodes from './country_codes.js';

document.addEventListener('DOMContentLoaded', function() {
  let scenePage = 1;
  let animationPage = 1;
  let simulationPage = 1;
  let protoPage = 1;
  let serverPage = 1;
  let competitionPage = 1;

  let sceneSort = 'default';
  let animationSort = 'default';
  let simulationSort = 'default';
  let protoSort = 'default';
  let competitionSort = 'default';

  let keywordSearch = '';
  let keywordParentSearch = '';
  let keywordIsFirst = false;

  let sceneSearch = '';
  let animationSearch = '';
  let simulationSearch = '';
  let protoSearch = '';
  let competitionSearch = '';
  let delaySearch = false;

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
      url: '/proto',
      setup: homePage
    },
    {
      url: '/simulation',
      setup: homePage
    },
    {
      url: '/competition',
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
    const template = document.createElement('template');
    template.innerHTML =
      `<footer class="footer">
        <div class="content has-text-centered" id="footer-github" style="margin-bottom:14px">
          <p>
            <a class="has-text-white" target="_blank" href="https://github.com/cyberbotics/webots">
              <i class="fab fa-github is-size-6"></i> open-source robot simulator</a>
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
    else if (activeTab === 'proto')
      protoPage = page;
    else if (activeTab === 'server')
      serverPage = page;
    else if (activeTab === 'competition')
      competitionPage = page;
  }

  function getPage(activeTab) {
    if (activeTab === 'scene')
      return scenePage;
    if (activeTab === 'animation')
      return animationPage;
    if (activeTab === 'simulation')
      return simulationPage;
    if (activeTab === 'proto')
      return protoPage;
    if (activeTab === 'server')
      return serverPage;
    if (activeTab === 'competition')
      return competitionPage;
  }

  function setSorts(activeTab, sort) {
    if (activeTab === 'scene')
      sceneSort = sort;
    else if (activeTab === 'animation')
      animationSort = sort;
    else if (activeTab === 'simulation')
      simulationSort = sort;
    else if (activeTab === 'proto')
      protoSort = sort;
    else if (activeTab === 'competition')
      competitionSort = sort;
  }

  function getSort(activeTab) {
    if (activeTab === 'scene')
      return sceneSort;
    if (activeTab === 'animation')
      return animationSort;
    if (activeTab === 'simulation')
      return simulationSort;
    if (activeTab === 'proto')
      return protoSort;
    if (activeTab === 'competition')
      return competitionSort;
  }

  function setSearches(activeTab, search) {
    if (activeTab === 'scene')
      sceneSearch = search;
    else if (activeTab === 'animation')
      animationSearch = search;
    else if (activeTab === 'simulation')
      simulationSearch = search;
    else if (activeTab === 'proto')
      protoSearch = search;
    else if (activeTab === 'competition')
      competitionSearch = search;
    else if (activeTab === 'delay')
      delaySearch = search;
  }

  function getSearch(activeTab) {
    if (activeTab === 'scene')
      return sceneSearch;
    if (activeTab === 'animation')
      return animationSearch;
    if (activeTab === 'simulation')
      return simulationSearch;
    if (activeTab === 'proto')
      return protoSearch;
    if (activeTab === 'competition')
      return competitionSearch;
    if (activeTab === 'delay')
      return delaySearch;
  }

  function homePage(project) {
    const pageLimit = 10;
    const protoPageLimit = 120;

    let activeTab = document.location.pathname.substring(1) !== '' ? document.location.pathname.substring(1) : 'animation';

    let page = new URL(document.location.href).searchParams.get('p')
      ? parseInt(new URL(document.location.href).searchParams.get('p')) : 1;
    let search = new URL(document.location.href).searchParams.get('search')
      ? (new URL(document.location.href).searchParams.get('search')).toString() : getSearch(activeTab);
    let sort = new URL(document.location.href).searchParams.get('sort')
      ? (new URL(document.location.href).searchParams.get('sort')).toString() : getSort(activeTab);
    let keyword = new URL(document.location.href).searchParams.get('keyword')
      ? (new URL(document.location.href).searchParams.get('keyword')).toString() : '';

    if (keyword.includes('/')) {
      keyword = keyword.split('/');
      keywordParentSearch = keyword[0];
      keywordSearch = keyword[1];
    } else
      keywordSearch = keyword;
    setPages(activeTab, page);
    setSorts(activeTab, sort);
    setSearches(activeTab, search);

    mainContainer(project, activeTab);
    initTabs();
    initSort(sort, activeTab);
    initSearch(search);
    updateSearchIcon();

    project.content.querySelector('#add-a-new-scene').addEventListener('click', function(event) { addAnimation('S'); });
    project.content.querySelector('#add-a-new-animation').addEventListener('click', function(event) { addAnimation('A'); });
    project.content.querySelector('#add-a-new-simulation').addEventListener('click', function(event) { addSimulation('D'); });
    project.content.querySelector('#add-a-new-competition').addEventListener('click', function(event) { addSimulation('C'); });
    project.content.querySelector('#add-a-new-proto').addEventListener('click', function(event) { addProto(); });

    listAnimations('S', scenePage, getSort('scene'), getSearch('scene'));
    listAnimations('A', animationPage, getSort('animation'), getSearch('animation'));
    listSimulations('D', simulationPage, getSort('simulation'), getSearch('simulation'));
    listSimulations('C', competitionPage, getSort('competition'), getSearch('competition'));
    listProtos(protoPage, getSort('proto'), getSearch('proto'));
    bindKeywords();
    listServers(serverPage);

    if (project.email && project.email.endsWith('@cyberbotics.com')) {
      project.content.querySelector('section[data-content="simulation"] > div > table > thead > tr')
        .appendChild(document.createElement('th'));
    }

    function updatePagination(tab, current, max) {
      // The url is used only to generate the correct list of parameters
      const url = new URL('https://example.com');
      if (getSort(tab) && getSort(tab) !== 'default')
        url.searchParams.append('sort', getSort(tab));
      if (getSearch(tab) && getSearch(tab) !== '')
        url.searchParams.append('search', getSearch(tab));
      if (tab === 'proto' && keywordSearch !== '') {
        let keyword = '';
        if (keywordIsFirst)
          keyword = keywordSearch;
        else
          keyword = keywordParentSearch + '/' + keywordSearch;
        url.searchParams.append('keyword', keyword);
      }

      const nav = document.querySelector(`section[data-content="${tab}"] > nav`);
      const content = {};
      const oneIsCurrent = (current === 1) ? ' is-current" aria-label="Page 1" aria-current="page"'
        : `" aria-label="Goto page 1" href="${tab + url.search}"`;
      url.searchParams.set('p', current - 1);
      const previousDisabled = (current === 1) ? ' disabled' : ` href="${tab + url.search}"`;
      url.searchParams.set('p', current + 1);
      const nextDisabled = (current === max) ? ' disabled' : ` href="${tab + url.search}"`;
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
        else {
          url.searchParams.set('p', i);
          content.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}"
            href="${tab + url.search}">${i}</a></li>`;
        }
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
      const second = Math.trunc(data.duration / 1000) % 60;
      const minute = Math.trunc(data.duration / 60000) % 60;
      const hour = Math.trunc(data.duration / 3600000);
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
      let row = `
<td class="has-text-centered">${data.viewed}</td>
<td>
  <a class="table-title has-text-dark" href="${url}">${title}</a>
  <div class="thumbnail">
    <div class="thumbnail-container">
      <img class="thumbnail-image" src="${thumbnailUrl}" onerror="this.src='${defaultThumbnailUrl}';"/>
      <p class="thumbnail-description">${data.description}<div class="thumbnail-description-fade"/></p>
    </div>
  </div>
</td>
<td><a class="has-text-dark" href="${versionUrl}" target="_blank" title="View Webots release">${data.version}</a></td>`;
      if (data.duration !== 0)
        row += `<td class="has-text-right">${duration}</td>`;
      row += `<td class="has-text-right">${size}</td><td class="has-text-right is-size-7">${uploaded}</td>`;
      return row;
    }

    function githubRow(data, proto) {
      const admin = project.email ? project.email.endsWith('@cyberbotics.com') : false;
      const words = data.url.substring(19).split('/');
      let thumbnailUrl;
      if (data.type === 'demo') {
        const dotIndex = data.url.lastIndexOf('/') + 1;
        thumbnailUrl = (data.url.slice(0, dotIndex) + '.' + data.url.slice(dotIndex)).replace('github.com',
          'raw.githubusercontent.com').replace('/blob', '').replace('.wbt', '.jpg');
      } else if (data.type === 'competition') {
        const [, , , username, repo, , branch] = data.url.split('/');
        thumbnailUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/preview/thumbnail.jpg`;
      } else if (proto) {
        const prefix = data.url.substr(0, data.url.lastIndexOf('/') + 1).replace('github.com',
          'raw.githubusercontent.com').replace('/blob', '') + 'icons/';
        const imageName = data.url.substr(data.url.lastIndexOf('/') + 1).replace('.proto', '.png');
        thumbnailUrl = prefix + imageName;
      }
      const defaultThumbnailUrl = document.location.origin + '/images/thumbnail_not_available.jpg';
      const repository = `https://github.com/${words[0]}/${words[1]}`;
      const title = data.title === '' ? '<i>anonymous</i>' : data.title;
      const encodedUrl = encodeURIComponent(data.url);
      if (proto) {
        let element = `<a href="/run?version=${data.version}&url=${encodedUrl}" class="result-element">`;
        element += `<img class="result-thumbnail" title='${data.description}' src="${thumbnailUrl}" onerror="this.src='${defaultThumbnailUrl}';"/>`;
        element += `<div class="result-title" title='${title}'>${title}</div>`;
        element += `<div class="result-details">`;
        element += `<div class="result-views"><img src="images/views.png"/>`;
        element += `<div>${data.viewed}</div></div>`;
        element += `<div class="result-version">${data.version}</div>`;
        element += `</div>`;
        element += `<div class="description-container">
              <p class="thumbnail-description">${data.description}</p>
            </div>`;
        element += '</a>';
        return element;
      }
      const updated = data.updated.replace(' ',
        `<br><i class="is-clickable fas fa-sync" id="sync-${data.id}" data-url="${data.url}" title="Re-synchronize now"></i> `
      );
      const deleteIcon = `<i style="color: red" class="is-clickable far fa-trash-alt fa-sm" id="delete-${data.id}"
        title="Delete row as administrator"></i>`;
      const deleteProject = admin ? `<td class="has-text-centered">${deleteIcon}</td>` : ``;
      const versionUrl = `https://github.com/cyberbotics/webots/releases/tag/${data.version}`;
      const secondColumn = (data.type === 'competition') ? data.participants : data.viewed;
      let row = `
<td class="has-text-centered">
  <a class="has-text-dark" href="${repository}/stargazers" target="_blank" title="GitHub stars">${data.stars}</a>
</td>
<td class="has-text-centered"><a class="has-text-dark" target="_blank"> ${secondColumn}</a></td>
<td class="title-cell">`;
      row += `<a class="table-title has-text-dark" href="/run?version=${data.version}&url=${encodedUrl}&type=${data.type}">${title}</a>`;
      row += `
  <div class="thumbnail">
    <div class="thumbnail-container">
      <img class="thumbnail-image" src="${thumbnailUrl}" onerror="this.src='${defaultThumbnailUrl}';"/>
      <p class="thumbnail-description">${data.description}<div class="thumbnail-description-fade"/></p>
    </div>
  </div>
</td>
<td><a class="has-text-dark" href="${data.url}" target="_blank" title="View GitHub repository">${words[3]}</a></td>
<td><a class="has-text-dark" href="${versionUrl}" target="_blank" title="View Webots release">${data.version}</a></td>
<td class="has-text-right is-size-7" title="Last synchronization with GitHub">${updated}</td>
${deleteProject}`;
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
            <li data-tab="proto" ${(activeTab === 'proto') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Proto</a>
            </li>
            <li data-tab="animation" ${(activeTab === 'animation') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Animation</a>
            </li>
            <li data-tab="simulation" ${(activeTab === 'simulation') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Simulation</a>
            </li>
            <li data-tab="competition" ${(activeTab === 'competition') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Competition</a>
            </li>
            <li data-tab="server" ${(activeTab === 'server') ? ' class="data-tab is-active"' : 'class="data-tab"'}>
              <a>Server</a>
            </li>
          </ul>
        </div>
        <div id="tab-content">
          <section class="section${(activeTab === 'scene') ? ' is-active' : ''}" data-content="scene">
            <div class="table-container">
              <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
                <div class="control has-icons-right">
                  <input class="input is-small" id="scene-search-input" type="text" placeholder="Search for scenes...">
                  <span class="icon is-small is-right is-clickable" id="scene-search-click">
                    <i class="fas fa-search" id="scene-search-icon"></i>
                  </span>
                </div>
              </div>
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th class="is-clickable column-title" id="scene-sort-viewed" title="Number of views"
                      style="text-align:center; width: 65px;">
                      <i class="fas fa-chart-column"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="scene-sort-title" title="Title of the scene"
                      style="min-width: 120px;">
                      Title<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="scene-sort-version" title="Webots release of the scene"
                      style="width: 85px;">
                      Version<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="scene-sort-size" title="Total size of the scene files"
                      style="text-align: right; width: 75px;">
                      Size<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="scene-sort-uploaded" title="Upload date and time"
                      style="text-align: right; width: 115px;">
                      Uploaded<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              <div class="empty-search" id="scene-empty-search" style="display: none;">
                <i class="fas fa-xl fa-search" style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;">
                </i>
                <p id="scene-empty-search-text"></p>
              </div>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="buttons">
              <button class="button" id="add-a-new-scene">Add a new scene</button>
            </div>
          </section>
          <section class="section${(activeTab === 'animation') ? ' is-active' : ''}" data-content="animation">
            <div class="table-container">
              <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
                <div class="control has-icons-right">
                  <input class="input is-small" id="animation-search-input" type="text" placeholder="Search for animations...">
                  <span class="icon is-small is-right is-clickable" id="animation-search-click">
                    <i class="fas fa-search" id="animation-search-icon"></i>
                  </span>
                </div>
              </div>
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th class="is-clickable column-title" id="animation-sort-viewed" title="Number of views"
                      style="text-align:center; width: 65px;">
                      <i class="fas fa-chart-column"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-title" title="Title of the animation"
                      style="min-width: 120px;">
                      Title<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-version" title="Webots release of the animation"
                      style="width: 85px;">
                      Version<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-duration" title="Duration of the animation"
                      style="text-align: right; width: 75px;">
                      Duration<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-size" title="Total size of the animation files"
                      style="text-align: right; width: 75px;">
                      Size<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-uploaded" title="Upload date and time"
                      style="text-align: right; width: 115px;">
                      Uploaded<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              <div class="empty-search" id="animation-empty-search" style="display: none;">
                <i class="fas fa-xl fa-search" style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;">
                </i>
                <p id="animation-empty-search-text"></p>
              </div>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="buttons">
              <button class="button" id="add-a-new-animation">Add a new animation</button>
            </div>
          </section>
          <section class="section${(activeTab === 'simulation') ? ' is-active' : ''}" data-content="simulation">
            <div class="table-container">
              <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
                <div class="control has-icons-right">
                  <input class="input is-small" id="simulation-search-input" type="text"
                    placeholder="Search for simulations...">
                  <span class="icon is-small is-right is-clickable" id="simulation-search-click">
                    <i class="fas fa-search" id="simulation-search-icon"></i>
                  </span>
                </div>
              </div>
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th class="is-clickable column-title" id="simulation-sort-stars" title="Number of GitHub stars"
                      style="text-align: center;">
                      <i class="far fa-star"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="simulation-sort-viewed" title="Number of runs"
                      style="text-align:center; width: 65px;">
                      <i class="fas fa-chart-column"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="simulation-sort-title" title="Title of the simulation"
                      style="min-width: 120px;">
                      Title<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="column-title" id="simulation-sort-title" title="Branch or Tag of the simulation">
                      Branch/Tag
                    </th>
                    <th class="is-clickable column-title" id="simulation-sort-version" title="Webots release of the simulation"
                      style="width: 85px;">
                      Version<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="simulation-sort-updated" title="Last update time"
                      style="text-align: right;">
                      Updated<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              <div class="empty-search" id="simulation-empty-search" style="display: none;">
                <i class="fas fa-xl fa-search" style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;">
                </i>
                <p id="simulation-empty-search-text"></p>
              </div>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="buttons">
              <button class="button" id="add-a-new-simulation">Add a new simulation</button>
            </div>
          </section>
          <section class="section${(activeTab === 'competition') ? ' is-active' : ''}" data-content="competition">
            <div class="table-container">
              <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
                <div class="control has-icons-right">
                  <input class="input is-small" id="competition-search-input" type="text"
                    placeholder="Search for competitions...">
                  <span class="icon is-small is-right is-clickable" id="competition-search-click">
                    <i class="fas fa-search" id="competition-search-icon"></i>
                  </span>
                </div>
              </div>
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th class="is-clickable column-title" id="competition-sort-stars" title="Number of GitHub stars"
                      style="text-align: center;">
                      <i class="far fa-star"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="competition-sort-participants" title="Number of participants"
                      style="text-align:center; width: 65px;">
                      <i class="fa-solid fa-users"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="competition-sort-title" title="Title of the competition"
                      style="min-width: 120px;">
                      Title<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="column-title" id="competition-sort-title" title="Branch or Tag of the competition">
                      Branch/Tag
                    </th>
                    <th class="is-clickable column-title" id="competition-sort-version" title="Webots release of the competition"
                      style="width: 85px;">
                      Version<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="competition-sort-updated" title="Last update time"
                      style="text-align: right;">
                      Updated<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              <div class="empty-search" id="competition-empty-search" style="display: none;">
                <i class="fas fa-xl fa-search" style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;">
                </i>
                <p id="competition-empty-search-text"></p>
              </div>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="buttons">
              <button class="button" id="add-a-new-competition">Add a new competition</button>
              <button class="button" id="what-is-a-competition">What is a competition?</button>
            </div>
          </section>
          <section style="padding-top: 20px" class="section${(activeTab === 'proto') ? ' is-active' : ''}" data-content="proto">
            <div class="first-level-keyword-container">
              <div class="first-level-keyword" title="robot"><img src="../images/proto/robot.png"><p>Robot</p></div>
              <div class="first-level-keyword" title="sensor"><img src="../images/proto/sensor.png"><p>Sensor</p></div>
              <div class="first-level-keyword" title="actuator"><img src="../images/proto/actuator.png"><p>Actuator</p></div>
              <div class="first-level-keyword" title="industrial"><img src="../images/proto/industrial.png"><p>Industrial</p></div>
              <div class="first-level-keyword" title="household"><img src="../images/proto/household.png"><p>Household</p></div>
              <div class="first-level-keyword" title="vehicle"><img src="../images/proto/vehicle.png"><p>Vehicle</p></div>
              <div class="first-level-keyword" title="furniture"><img src="../images/proto/furniture.png"><p>Furniture</p></div>
              <div class="first-level-keyword" title="building"><img src="../images/proto/building.png"><p>Building</p></div>
              <div class="first-level-keyword" title="animal"><img src="../images/proto/animal.png"><p>Animal</p></div>
              <div class="first-level-keyword" title="exterior"><img src="../images/proto/exterior.png"><p>Exterior</p></div>
              <div class="first-level-keyword" title="traffic"><img src="../images/proto/traffic.png"><p>Traffic</p></div>
              <div class="first-level-keyword" title="appearance"><img src="../images/proto/appearance.png"><p>Appearance</p></div>
              <div class="first-level-keyword" title="primitive"><img src="../images/proto/primitive.png"><p>Primitive</p></div>
            </div>
            <div class="second-level-keyword-container"></div>
            <div class="table-container">
              <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
                <div class="control has-icons-right">
                  <input class="input is-small" id="proto-search-input" type="text"
                    placeholder="Search for protos...">
                  <span class="icon is-small is-right is-clickable" id="proto-search-click">
                    <i class="fas fa-search" id="proto-search-icon"></i>
                  </span>
                </div>
                <div class="sort-by-div">
                  Sort by
                  <select class="sort-by-select">
                    <option value=viewed-desc>Most viewed</option>
                    <option value=viewed-asc>Less viewed</option>
                    <option value=title-desc>A-Z</option>
                    <option value=title-asc>Z-A</option>
                  <select>
                </div>
              </div>
              <div class="search-results" id="protos-list">
              </div>
              <div class="empty-search" id="proto-empty-search" style="display: none;">
                <i class="fas fa-xl fa-search" style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;">
                </i>
                <p id="proto-empty-search-text"></p>
              </div>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="buttons">
              <button class="button" id="add-a-new-proto">Add a new proto</button>
            </div>
          </section>
          <section class="section${(activeTab === 'server') ? ' is-active' : ''}" data-content="server">
            <div class="table-container" style="margin-top:50px">
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th title="Fully qualified domain name of server">Server</th>
                    <th style="text-align:right" title="Start time">Started</th>
                    <th style="text-align:right" title="Last update time">Updated</th>
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
            <div class="buttons">
              <button class="button" onclick="window.open('https://cyberbotics.com/doc/guide/web-server')">
                Add your own server</button>
            </div>
          </section>
        </div>`;
      const title = (document.location.pathname.length > 1) ? document.location.pathname.substring(1) : 'home';
      project.setup(title, template.content);
      document.getElementsByClassName('sort-by-select')[0].onchange = e =>
        sortProtoBy(e.target.options[e.target.selectedIndex].value);
      document.getElementById('what-is-a-competition').onclick = whatIsCompetitionPopUp;
    }

    function sortProtoBy(sort) {
      setSorts('proto', sort);
      searchAndSortTable('proto');
    }

    function initSort(sortBy, activeTab) {
      if (sortBy && sortBy !== 'default') {
        if (activeTab === 'proto') {
          const options = document.getElementsByClassName('sort-by-select')[0].getElementsByTagName('option');
          for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.value === sortBy) {
              option.selected = 'selected';
              break;
            }
          }
        } else {
          const columnTitle = document.getElementById(activeTab + '-sort-' + sortBy.split('-')[0]);
          if (columnTitle) {
            const sortIcon = columnTitle.querySelector('.sort-icon');
            columnTitle.querySelector('.sort-icon').style.display = 'inline';
            if (sortBy.split('-')[1] === 'asc' && sortIcon.classList.contains('fa-sort-down')) {
              sortIcon.classList.toggle('fa-sort-down');
              sortIcon.classList.toggle('fa-sort-up');
            }
          }
        }
      }
      document.querySelectorAll('.column-title').forEach((title) => {
        title.addEventListener('click', function(e) {
          const sortIcon = title.querySelector('.sort-icon');
          const type = title.id.split('-')[0];
          const previousSort = getSort(type).split('-')[0];
          let sort = title.id.split('-')[2];

          if (previousSort === sort) {
            sortIcon?.classList.toggle('fa-sort-down');
            sortIcon?.classList.toggle('fa-sort-up');
            sort += sortIcon?.classList.contains('fa-sort-down') ? '-desc' : '-asc';
          } else if (previousSort !== 'default') {
            document.getElementById(type + '-sort-' + previousSort).querySelector('.sort-icon').style.display = 'none';
            if (sortIcon?.classList.contains('fa-sort-up')) {
              sortIcon.classList.toggle('fa-sort-down');
              sortIcon.classList.toggle('fa-sort-up');
            }
            sort += '-desc';
          } else
            sort += '-desc';
          const icon = title.querySelector('.sort-icon');
          if (icon)
            icon.style.display = 'inline';
          setSorts(type, sort);
          searchAndSortTable(type);
        });
      });
    }

    function initSearch(searchString) {
      if (activeTab !== 'server')
        document.getElementById(activeTab + '-search-input').value = searchString;
      for (const type of ['scene', 'animation', 'simulation', 'competition', 'proto']) {
        document.getElementById(type + '-search-input').addEventListener('keyup', function(event) {
          if (!getSearch('delay')) {
            setSearches('delay', true);
            setTimeout(() => {
              setSearches(type, document.getElementById(type + '-search-input').value);
              setPages(type, 1);
              updateSearchIcon(type);
              searchAndSortTable(type);
              setSearches('delay', false);
            }, '300');
          }
        });
        document.getElementById(type + '-search-click').addEventListener('click', function(event) {
          if (document.getElementById(type + '-search-icon').classList.contains('fa-xmark')) {
            document.getElementById(type + '-search-input').value = '';
            setSearches(type, document.getElementById(type + '-search-input').value);
            setPages(type, 1);
            updateSearchIcon(type);
            searchAndSortTable(type);
          }
        });
      }
    }

    function initTabs() {
      const TABS = [...document.querySelectorAll('#tabs li')];
      const CONTENT = [...document.querySelectorAll('#tab-content section')];
      const ACTIVE_CLASS = 'is-active';
      TABS.forEach((tab) => {
        tab.addEventListener('click', (e) => {
          const selected = tab.getAttribute('data-tab');
          document.querySelector('a.navbar-item').href = `/${selected}`;
          TABS.forEach((t) => {
            if (t && t.classList.contains(ACTIVE_CLASS))
              t.classList.remove(ACTIVE_CLASS);
          });
          tab.classList.add(ACTIVE_CLASS);
          activeTab = tab.getAttribute('data-tab');
          page = getPage(activeTab);
          sort = getSort(activeTab);
          search = getSearch(activeTab);
          const url = new URL(document.location.origin + '/' + activeTab);
          if (getPage(activeTab) !== 1)
            url.searchParams.append('p', getPage(activeTab));
          if (getSort(activeTab) && getSort(activeTab) !== 'default')
            url.searchParams.append('sort', getSort(activeTab));
          if (getSearch(activeTab) && getSearch(activeTab) !== '')
            url.searchParams.append('search', getSearch(activeTab));
          if (activeTab === 'proto' && keywordSearch !== '') {
            let keyword = '';
            if (keywordIsFirst)
              keyword = keywordSearch;
            else
              keyword = keywordParentSearch + '/' + keywordSearch;
            url.searchParams.append('keyword', keyword);
          }
          updateSearchIcon(activeTab);
          window.history.pushState(null, '', (url.pathname + url.search).toString());
          document.head.querySelector('#title').innerHTML = 'webots.cloud - ' + activeTab;
          CONTENT.forEach((item) => {
            if (item && item.classList.contains(ACTIVE_CLASS))
              item.classList.remove(ACTIVE_CLASS);
            const data = item.getAttribute('data-content');
            if (data === selected)
              item.classList.add(ACTIVE_CLASS);
          });
        });
      });
    }

    function searchAndSortTable(type, isSearch) {
      const url = new URL(document.location.origin + document.location.pathname);
      if (getPage(type) !== 1 && !isSearch)
        url.searchParams.append('p', getPage(type));
      else
        setPages(type, 1);
      if (getSort(type) && getSort(type) !== 'default')
        url.searchParams.append('sort', getSort(type));
      if (getSearch(type) && getSearch(type) !== '')
        url.searchParams.append('search', getSearch(type));
      if (type === 'proto' && keywordSearch !== '') {
        let keyword = '';
        if (keywordIsFirst)
          keyword = keywordSearch;
        else
          keyword = keywordParentSearch + '/' + keywordSearch;

        url.searchParams.append('keyword', keyword);
      }
      window.history.replaceState(null, '', (url.pathname + url.search).toString());

      if (type === 'scene')
        listAnimations('S', scenePage, getSort(type), getSearch(type));
      else if (type === 'animation')
        listAnimations('A', animationPage, getSort(type), getSearch(type));
      else if (type === 'simulation')
        listSimulations('D', simulationPage, getSort(type), getSearch(type));
      else if (type === 'competition')
        listSimulations('C', competitionPage, getSort(type), getSearch(type));
      else if (type === 'proto')
        listProtos(protoPage, getSort(type), getSearch(type));
    }

    function updateSearchIcon(type) {
      if (type && type !== 'server') {
        const searchIcon = document.getElementById(type + '-search-icon');
        if (searchIcon.classList.contains('fa-search') && getSearch(type).length > 0) {
          searchIcon.classList.remove('fa-search');
          searchIcon.classList.add('fa-xmark');
        } else if (searchIcon.classList.contains('fa-xmark') && getSearch(type).length === 0) {
          searchIcon.classList.add('fa-search');
          searchIcon.classList.remove('fa-xmark');
        }
      } else {
        updateSearchIcon('scene');
        updateSearchIcon('animation');
        updateSearchIcon('simulation');
        updateSearchIcon('competition');
        updateSearchIcon('proto');
      }
    }

    function synchronizeGithub(event, proto) {
      let searchString;
      let script;
      let typeName;
      if (proto) {
        searchString = getSearch('proto');
        script = 'ajax/proto/create.php';
        typeName = 'proto';
      } else {
        typeName = document.location.pathname.substring(1); // either 'simulation' or 'competition'
        searchString = getSearch(typeName);
        script = 'ajax/project/create.php';
      }
      const id = event.target.id.substring(5);
      event.target.classList.add('fa-spin');
      const url = event.target.getAttribute('data-url');
      fetch(script, { method: 'post', body: JSON.stringify({ url: url, id: id, search: searchString }) })
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
                `<div class="help">
                  More information at: <a target="_blank" href="https://cyberbotics.com/doc/guide/webots-cloud#yaml-file">
                  cyberbotics.com/doc/guide/webots-cloud#yaml-file</a>
                </div>`;
            }
            const dialog = ModalDialog.run('Project deletion from synchronization', errorMsg);
            dialog.error('Project has been deleted.');
            dialog.querySelector('form').addEventListener('submit', function(e) {
              e.preventDefault();
              dialog.querySelector('button[type="submit"]').classList.add('is-loading');
              dialog.close();
            });
            event.target.classList.remove('fa-spin');
            project.load(`/${typeName}${(page > 1) ? ('?p=' + page) : ''}`);
          } else {
            const tr = document.createElement('tr');
            tr.innerHTML = githubRow(data, proto);
            parent.replaceChild(tr, old);
            parent.querySelector('#sync-' + data.id).addEventListener('click', _ => synchronizeGithub(_, proto));
            if (parent.querySelector('#delete-' + id) !== null) {
              parent.querySelector('#delete-' + id).addEventListener('click',
                function(event) { deleteSimulation(event, project); });
            }

            event.target.classList.remove('fa-spin');
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updatePagination(typeName, page, total);
          }
        });
    }

    function synchronizeServer(event) {
      const id = event.target.id.substring(12);
      event.target.classList.add('fa-spin');
      const url = event.target.getAttribute('data-url');
      fetch('ajax/server/update.php', { method: 'post', body: JSON.stringify({ url: url, id: id }) })
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
            const tr = document.createElement('tr');
            tr.innerHTML = serverRow(data);
            parent.replaceChild(tr, old);
            parent.querySelector('#sync-server-' + data.id).addEventListener('click', synchronizeServer);
            event.target.classList.remove('fa-spin');
            updatePagination('server', 1, 1);
          }
        });
    }

    function addAnimation(type) {
      const content = {};
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
          <div class="help">Upload all the texture files: <em>*.png</em>, <em>*.jpg</em> and/or <em>*.hdr</em></div>
        </div>
        <div class="field">
          <label class="label">Mesh files</label>
          <div class="control has-icons-left">
            <input id="texture-files" name="meshes[]" class="input" type="file" multiple accept=".stl, .obj, .mtl, .dae">
            <span class="icon is-small is-left">
              <i class="fas fa-upload"></i>
            </span>
          </div>
          <div class="help">Upload all the meshes files: <em>*.obj</em>, <em>*.mtl</em>,
            <em>*.dae</em> and/or <em>*.stl</em></div>
        </div>`;
      let cancelled = false;
      const title = (type === 'A') ? 'Add an animation' : 'Add a scene';
      const modal = ModalDialog.run(title, content.innerHTML, 'Cancel', 'Add');
      const typeName = (type === 'A') ? 'animation' : 'scene';
      const input = modal.querySelector(`#${typeName}-file`);
      input.focus();
      modal.querySelector('button.cancel').addEventListener('click', function() { cancelled = true; });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        const body = new FormData(modal.querySelector('form'));
        body.append('user', project.id);
        body.append('password', project.password);
        fetch('/ajax/animation/create.php', { method: 'post', body: body })
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              modal.error(data.error);
            else if (!cancelled) {
              const id = data.id;
              const total = data.total;
              fetch('/ajax/animation/create.php', { method: 'post', body: JSON.stringify({ uploading: 0, uploadId: id }) })
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

    function addSimulation(type) {
      const demoExample = 'https://github.com/cyberbotics/webots/blob/R2022b/projects/languages/python/worlds/example.wbt';
      const competitionExample = 'https://github.com/cyberbotics/robot-programming-competition/blob/main/worlds/robot_programming.wbt';
      const content = {};
      content.innerHTML =
        `<div class="field">
          <div style="padding-bottom: 10px;">Please enter the full URL link to the world file of your project's repository:
          </div>
          <label class="label">Webots world file</label>
          <div class="control has-icons-left">
            <input id="world-file" class="input" type="url" required placeholder="https://github.com/my_name/my_project/blob/tag/worlds/file.wbt">
            <span class="icon is-small is-left">
              <i class="fab fa-github"></i>
            </span>
          </div>
          <div class="help">Blob reference to a public GitHub repository, including tag information, for example:<br>
            <a target="_blank" href="${(type === 'D') ? demoExample : competitionExample}">
              ${(type === 'D') ? demoExample : competitionExample}
            </a>
            WARNING: your world must be from version R2022b or newer.
          </div>
        </div>`;
      const typeName = (type === 'D') ? 'simulation' : 'competition';
      const modal = ModalDialog.run(`Add a ${typeName}`, content.innerHTML, 'Cancel', 'Add');
      const input = modal.querySelector('#world-file');
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
                  `<div class="help">
                    More information at: <a target="_blank" href="https://cyberbotics.com/doc/guide/webots-cloud#yaml-file">
                    cyberbotics.com/doc/guide/webots-cloud#yaml-file</a>
                  </div>`;
              }
              modal.error(errorMsg);
            } else {
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + githubRow(data) + '</tr>';
              document.querySelector('section[data-content="simulation"] > div > table > tbody').insertAdjacentHTML(
                'beforeend', tr);
              const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
              updatePagination(typeName, page, total);
              project.load(`/${typeName}${(page > 1) ? ('?p=' + page) : ''}`);
            }
          });
      });
    }

    function addProto() {
      const content = {};
      content.innerHTML =
        `<div class="field">
          <label class="label">Webots proto file</label>
          <div class="control has-icons-left">
            <input id="proto-file" class="input" type="url" required placeholder="https://github.com/my_name/my_repository/blob/tag/protos/my_proto.proto" value="https://github.com/">
            <span class="icon is-small is-left">
              <i class="fab fa-github"></i>
            </span>
          </div>
          <div class="help">Blob reference to a public GitHub repository, including tag information, for example:<br>
            <a target="_blank" href="https://github.com/cyberbotics/webots/blob/R2022b/projects/robots/dji/mavic/protos/Mavic2Pro.proto">
              https://github.com/cyberbotics/webots/blob/R2022b/projects/robots/dji/mavic/protos/Mavic2Pro.proto
            </a>
            WARNING: your proto must be from version R2022b or newer.
          </div>
        </div>`;
      const modal = ModalDialog.run('Add a proto', content.innerHTML, 'Cancel', 'Add');
      const input = modal.querySelector('#proto-file');
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        const protoFile = modal.querySelector('#proto-file').value.trim();
        if (!protoFile.startsWith('https://github.com/')) {
          modal.error('The world file should start with "https://github.com/".');
          return;
        }
        const content = {
          method: 'post',
          body: JSON.stringify({
            url: protoFile
          })
        };
        fetch('/ajax/proto/create.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error) {
              let errorMsg = data.error;
              if (errorMsg.startsWith('YAML file error:')) {
                errorMsg = errorMsg +
                  `<div class="help">
                    More information at: <a target="_blank" href="https://cyberbotics.com/doc/guide/webots-cloud#yaml-file">
                    cyberbotics.com/doc/guide/webots-cloud#yaml-file</a>
                  </div>`;
              }
              modal.error(errorMsg);
            } else {
              modal.close();
              const tr = '<tr class="has-background-warning-light">' + githubRow(data, true) + '</tr>';
              document.querySelector('section[data-content="simulation"] > div > table > tbody').insertAdjacentHTML(
                'beforeend', tr);
              const total = (data.total === 0) ? 1 : Math.ceil(data.total / protoPageLimit);
              page = total;
              updatePagination('proto', page, total);

              project.load(`/proto${(page > 1) ? ('?p=' + page) : ''}`);
            }
          });
      });
    }

    function listAnimations(type, page, sortBy, searchString) {
      const typeName = (type === 'A') ? 'animation' : 'scene';
      const capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      const offset = (page - 1) * pageLimit;
      fetch('/ajax/animation/list.php', {
        method: 'post',
        body: JSON.stringify({ offset: offset, limit: pageLimit, type: type, sortBy: sortBy, search: searchString })
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run(`${capitalizedTypeName} listing error`, data.error);
          else {
            if (data.total === 0 && searchString) {
              const message = 'Your search - <strong>' + searchString + '</strong> - did not match any ' + typeName + 's.';
              document.getElementById(typeName + '-empty-search-text').innerHTML = message;
              document.getElementById(typeName + '-empty-search').style.display = 'flex';
            } else
              document.getElementById(typeName + '-empty-search').style.display = 'none';
            let line = ``;
            for (let i = 0; i < data.animations.length; i++)
              line += '<tr>' + animationRow(data.animations[i]) + '</tr>';
            const table = project.content.querySelector(`section[data-content="${typeName}"] > div > table`);
            table.style.marginBottom = (50 * (pageLimit - data.animations.length)) + 'px';
            const tbody = table.querySelector(`tbody`);
            tbody.innerHTML = line;
            for (let i = 0; i < data.animations.length; i++) {
              const node = tbody.querySelector(`#${typeName}-${data.animations[i].id}`);
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

    function listSimulations(type, page, sortBy, searchString) {
      const typeName = (() => {
        if (type === 'D')
          return 'simulation';
        else if (type === 'C')
          return 'competition';
      })();
      const capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      const offset = (page - 1) * pageLimit;
      fetch('/ajax/project/list.php', {
        method: 'post',
        body: JSON.stringify({ offset: offset, limit: pageLimit, type: type, sortBy: sortBy, search: searchString })
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run(`${capitalizedTypeName} listing error`, data.error);
          else {
            if (data.total === 0 && searchString) {
              const message = 'Your search - <strong>' + searchString + '</strong> - did not match any simulations.';
              document.getElementById(typeName + '-empty-search-text').innerHTML = message;
              document.getElementById(typeName + '-empty-search').style.display = 'flex';
            } else
              document.getElementById(typeName + '-empty-search').style.display = 'none';
            let line = ``;
            for (let i = 0; i < data.projects.length; i++) // compute the GitHub repo URL from the simulation URL.
              line += '<tr>' + githubRow(data.projects[i]) + '</tr>';
            const table = project.content.querySelector(`section[data-content="${typeName}"] > div > table`);
            table.style.marginBottom = (50 * (pageLimit - data.projects.length)) + 'px';
            table.querySelector('tbody').innerHTML = line;
            for (let i = 0; i < data.projects.length; i++) {
              const id = data.projects[i].id;
              project.content.querySelector('#sync-' + id).addEventListener('click', synchronizeGithub);
              if (project.content.querySelector('#delete-' + id) !== null)
                project.content.querySelector('#delete-' + id)
                  .addEventListener('click', function(event) { deleteSimulation(event, project); });
            }
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updatePagination(typeName, page, total);
            document.getElementById(typeName + '-search-input').value = searchString;
          }
        });
    }

    function listProtos(page, sortBy, searchString) {
      if (keywordIsFirst)
        keywordParentSearch = '';
      const offset = (page - 1) * protoPageLimit;
      fetch('/ajax/proto/list.php', {
        method: 'post',
        body: JSON.stringify({ offset: offset,
          limit: protoPageLimit,
          sortBy: sortBy,
          search: searchString,
          keyword: keywordSearch,
          keyword_parent: keywordParentSearch})
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error)
            ModalDialog.run('Proto listing error', data.error);
          else {
            if (data.total === 0 && searchString) {
              const message = 'Your search - <strong>' + searchString + '</strong> - did not match any protos.';
              document.getElementById('proto-empty-search-text').innerHTML = message;
              document.getElementById('proto-empty-search').style.display = 'flex';
            } else
              document.getElementById('proto-empty-search').style.display = 'none';
            let line = ``;
            for (let i = 0; i < data.protos.length; i++) // compute the GitHub repo URL from the simulation URL.
              line += githubRow(data.protos[i], true);
            const protosList = document.getElementById('protos-list');
            protosList.innerHTML = line;
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / protoPageLimit);
            updatePagination('proto', page, total);
          }
        });

      if (keywordSearch && keywordSearch !== '') {
        fetch('/ajax/proto/sub_keywords.php', {
          method: 'post',
          body: JSON.stringify({ parent: keywordSearch })
        })
          .then(response => response.json())
          .then(data => {
            if (data.error)
              ModalDialog.run('Keyword listing error', data.error);
            else {
              const container = document.getElementsByClassName('second-level-keyword-container')[0];
              if (data.length > 1) {
                container.innerHTML = '';
                container.style.display = 'block';
                keywordParentSearch = keywordSearch;
                const atTheEnd = [];
                // The keywords arrived sorted by number of elements
                for (let i = 0; i < data.length; i++) {
                  const keywordSpan = document.createElement('span');
                  keywordSpan.className = 'second-level-keyword';
                  keywordSpan.textContent = data[i].name.charAt(0).toUpperCase() + data[i].name.slice(1);
                  keywordSpan.onclick = () => {
                    const alltags = document.getElementsByClassName('second-level-keyword');
                    for (let j = 0; j < alltags.length; j++)
                      alltags[j].classList.remove('is-active');
                    keywordSpan.classList.add('is-active');
                    keywordSearch = data[i].name;
                    keywordIsFirst = false;
                    setPages('proto', 1);
                    searchAndSortTable('proto');
                  };
                  if (data[i].name !== 'other' && data[i].name !== 'accessory' && data[i].name !== 'extension')
                    container.appendChild(keywordSpan);
                  else
                    atTheEnd.push(keywordSpan);
                }
                for (let i = 0; i < atTheEnd.length; i++)
                  container.appendChild(atTheEnd[i]);
              } else if (keywordIsFirst)
                container.innerHTML = '';
            }
          });
      }
    }

    function listServers(page) {
      const offset = (page - 1) * pageLimit;
      fetch('/ajax/server/list.php', { method: 'post', body: JSON.stringify({ offset: offset, limit: pageLimit }) })
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
            const table = project.content.querySelector('section[data-content="server"] > div > table');
            table.style.marginBottom = (50 * (pageLimit - data.servers.length)) + 'px';
            table.querySelector('tbody').innerHTML = line;
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
      const dialog = ModalDialog.run(`Really delete ${typeName}?`, '<p>There is no way to recover deleted data.</p>', 'Cancel',
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
      const dialog = ModalDialog.run(`Really delete simulation?`, '<p>There is no way to recover deleted data.</p>', 'Cancel',
        `Delete simulation`, 'is-danger');
      dialog.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        dialog.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('ajax/project/delete.php', {
          method: 'post',
          body: JSON.stringify({ user: project.id, password: project.password, id: id })
        })
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

    function whatIsCompetitionPopUp() {
      const content = {};
      content.innerHTML =
        `<div class="field">
          A competition is a simulation scenario which proposes a challenge.
          A robot has to address a problem and its behavior is evaluated against a performance metric.
          <br><br>
          The performance metric may be either absolute or relative:
          <br><br>
          An absolute performance metric is a scalar value measuring the performance of a robot on a given task.
          For example, the time spent running a 100 meters race is an absolute performance metric.
          <br><br>
          A relative performance metric is a ranking of the performance of a robots against others.
          For example, the tennis ATP ranking is a relative performance metric.
          <br><br>
          To create your own competition, follow the instructions on <a href="https://github.com/cyberbotics/competition-template"> this repository</a>.
        </div>`;
      ModalDialog.run(`What is a competition?`, content.innerHTML);
    }

    function bindKeywords() {
      const tags = document.getElementsByClassName('first-level-keyword');
      for (let i = 0; i < tags.length; i++) {
        tags[i].onclick = _ => {
          const alltags = document.getElementsByClassName('first-level-keyword');
          for (let j = 0; j < alltags.length; j++)
            alltags[j].classList.remove('is-active');
          tags[i].classList.add('is-active');
          listByKeyword(_);
        };
      }
    }

    function listByKeyword(event) {
      keywordSearch = event.target.title;
      keywordIsFirst = true;
      setPages('proto', 1);
      searchAndSortTable('proto');
    }
  }

  function runPage(project) {
    // discriminate between demos and competition using search parameters
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get('type');
    if (type === 'demo')
      project.runWebotsView();
    else if (type === 'competition') {
      const url = searchParams.get('url').replace('/blob/competition/worlds/', '/blob/main/worlds/');
      project.competitionUrl = url;
      const context = searchParams.get('context');
      switch (context) {
        case 'try':
          createCompetitionPageButton();
          project.runWebotsView();
          break;
        case 'view':
          viewEntryRun(searchParams.get('id'));
          break;
        default:
          mainContainer(project);
          break;
      }
    } else // proto
      protoContainer(project, searchParams);

    function protoContainer(proto, searchParams) {
      const url = searchParams.get('url');
      const urlParts = url.split('/');
      const protoName = decodeURIComponent(urlParts[urlParts.length - 1].split('.proto')[0]);

      const contentHtml =
        `<div id="tabs" class="tabs is-centered is-small-medium">
      <ul>
        <li data-tab="scene" class="data-tab">
          <a href="/scene">Scene</a>
        </li>
        <li data-tab="proto" class="data-tab is-active">
          <a href="/proto">Proto</a>
        </li>
        <li data-tab="animation" class="data-tab">
          <a href="/animation">Animation</a>
        </li>
        <li data-tab="simulation" class="data-tab">
          <a href="/simulation">Simulation</a>
        </li>
        <li data-tab="competition" class="data-tab">
          <a href="/competition">Competition</a>
        </li>
        <li data-tab="server" class="data-tab">
          <a href="/server">Server</a>
        </li>
      </ul>
      </div>
      <div class="container is-widescreen">
        <section class="section is-active">
        <h1 class='proto-title'>${protoName}</h1>
        <div id='proto-webots-container'></div>
        <div class='proto-doc'></div>
        </section>
      </div>`;
      const template = document.createElement('template');
      template.innerHTML = contentHtml;
      project.setup('proto', template.content);
      fetch('ajax/proto/documentation.php', { method: 'post', body: JSON.stringify({ url: url }) })
        .then(response => response.json())
        .then(response => {
          if (response && response.no_3d_view === '0')
            project.runWebotsView(undefined, undefined, response.needs_robot_ancestor);
          else {
            project.updateProtoAndSimulationViewCount(url);
            const container = document.getElementById('proto-webots-container');

            const image = document.createElement('img');
            const prefix = url.substr(0, url.lastIndexOf('/') + 1).replace('github.com',
              'raw.githubusercontent.com').replace('/blob', '') + 'icons/';
            const imageName = url.substr(url.lastIndexOf('/') + 1).replace('.proto', '.png');
            image.src = prefix + imageName;
            image.style.display = 'block';
            image.style.margin = 'auto';
            container.appendChild(image);

            const message = document.createElement('div');
            message.innerText = 'This proto has no 3D representation.';
            container.style.height = '150px';
            container.appendChild(message);
          }
          loadMd(url, response);
        });
    }

    function loadMd(url, information) {
      const protoURl = url;
      if (url.includes('github.com')) {
        url = url.replace('github.com', 'raw.githubusercontent.com');
        url = url.replace('blob/', '');
      }
      const prefix = url.substr(0, url.lastIndexOf('/') + 1) + 'docs/';
      const protoName = url.substr(url.lastIndexOf('/') + 1).replace('.proto', '');
      const mdUrl = prefix + protoName.toLowerCase() + '.md';
      fetch(url).then(response => response.text())
        .then(proto => {
          fetch(mdUrl)
            .then(response => {
              if (!response.ok)
                throw new Error('');
              return response.text();
            })
            .then(async function(content) {
              const results = parseProtoHeader(proto);
              const infoArray = createProtoArray(results[0], results[1], results[2], protoURl, information);
              const { populateProtoViewDiv } = await import('https://cyberbotics.com/wwi/' + checkProtoVersion(results[0]) + '/proto_viewer.js');
              populateProtoViewDiv(content, prefix, infoArray);
            }).catch(() => {
              // No md file, so we read the description from the proto file
              fetch(url)
                .then(response => response.text())
                .then(content => {
                  createMdFromProto(protoURl, proto, protoName, prefix, information);
                });
            });
        });
    }

    function parseProtoHeader(proto) {
      let version, license, licenseUrl;
      for (const line of proto.split('\n')) {
        if (!line.startsWith('#'))
          break;

        if (line.startsWith('#VRML_SIM') || line.startsWith('# VRML_SIM'))
          version = line.substring(line.indexOf('VRML_SIM') + 9).split(' ')[0];
        else if (line.startsWith('# license:') || line.startsWith('#license:'))
          license = line.substring(line.indexOf('license:') + 9);
        else if (line.startsWith('# license url:') || line.startsWith('#license url:'))
          licenseUrl = line.substring(line.indexOf('license url:') + 13);
      }

      return [version, license, licenseUrl];
    }

    function createProtoArray(version, license, licenseUrl, protoUrl, information) {
      const infoGrid = document.createElement('div');
      infoGrid.className = 'proto-info-array';

      const versionP = document.createElement('p');
      versionP.textContent = 'Version';
      versionP.className = 'info-array-cell first-column-cell first-row-cell';
      versionP.style.gridRow = 1;
      versionP.style.gridColumn = 1;
      infoGrid.appendChild(versionP);

      const versionContentA = document.createElement('a');
      versionContentA.textContent = version;
      versionContentA.href = 'https://github.com/cyberbotics/webots/releases/tag/' + version;
      versionContentA.target = '_blank';
      versionContentA.className = 'info-array-cell last-column-cell first-row-cell';
      versionContentA.style.gridRow = 1;
      versionContentA.style.gridColumn = 2;
      infoGrid.appendChild(versionContentA);

      const licenseP = document.createElement('p');
      licenseP.textContent = 'License';
      licenseP.className = 'info-array-cell first-column-cell';
      licenseP.style.gridRow = 2;
      licenseP.style.gridColumn = 1;
      licenseP.style.backgroundColor = '#fafafa';
      infoGrid.appendChild(licenseP);

      const licenseContentA = document.createElement('a');
      licenseContentA.textContent = license;
      licenseContentA.className = 'info-array-cell last-column-cell';
      licenseContentA.href = licenseUrl;
      licenseContentA.target = '_blank';
      licenseContentA.style.backgroundColor = '#fafafa';
      licenseContentA.style.gridRow = 2;
      licenseContentA.style.gridColumn = 2;
      infoGrid.appendChild(licenseContentA);

      const sourceP = document.createElement('p');
      sourceP.textContent = 'Source';
      sourceP.className = 'info-array-cell first-column-cell';
      sourceP.style.gridRow = 3;
      sourceP.style.gridColumn = 1;
      infoGrid.appendChild(sourceP);

      const sourceContentA = document.createElement('a');
      sourceContentA.href = protoUrl;
      sourceContentA.className = 'info-array-cell last-column-cell';
      sourceContentA.textContent = protoUrl;
      sourceContentA.target = '_blank';
      sourceContentA.style.gridRow = 3;
      sourceContentA.style.gridColumn = 2;
      infoGrid.appendChild(sourceContentA);

      const updatedP = document.createElement('p');
      updatedP.textContent = 'Updated';
      updatedP.className = 'info-array-cell first-column-cell';
      updatedP.style.gridRow = 4;
      updatedP.style.gridColumn = 1;
      updatedP.style.backgroundColor = '#fafafa';
      infoGrid.appendChild(updatedP);

      const updatedContent = document.createElement('div');
      updatedContent.className = 'info-array-cell last-column-cell';
      updatedContent.textContent = information.updated;
      updatedContent.style.gridRow = 4;
      updatedContent.style.gridColumn = 2;

      const updatedButton = document.createElement('i');
      updatedButton.className = 'is-clickable fas fa-sync update-proto';
      updatedButton.id = `sync-${information.id}`;
      updatedButton.setAttribute('data-url', protoUrl);
      updatedButton.title = 'Re-synchronize now';
      updatedContent.appendChild(updatedButton);
      updatedButton.onclick = _ => synchronizeProto(_, true);

      const admin = project.email ? project.email.endsWith('@cyberbotics.com') : false;
      if (admin) {
        const deleteButton = document.createElement('i');
        deleteButton.className = 'is-clickable far fa-trash-alt fa-sm update-proto';
        deleteButton.style.color = 'red';
        deleteButton.id = `delete-${information.id}`;
        deleteButton.title = 'Delete row as administrator';
        updatedContent.appendChild(deleteButton);
        deleteButton.onclick = _ => deleteProto(_, project);
      }

      infoGrid.appendChild(updatedContent);
      fetch('ajax/proto/get_keywords.php', { method: 'post', body: JSON.stringify({id: information.id}) })
        .then(response => response.json())
        .then(data => {
          const keywordP = document.createElement('p');
          keywordP.textContent = 'Keywords';
          keywordP.className = 'info-array-cell first-column-cell';
          keywordP.style.gridRow = 5;
          keywordP.style.gridColumn = 1;
          infoGrid.appendChild(keywordP);

          const keywordContentDiv = document.createElement('div');
          keywordContentDiv.className = 'info-array-cell last-column-cell';
          keywordContentDiv.style.gridRow = 5;
          keywordContentDiv.style.gridColumn = 2;
          infoGrid.appendChild(keywordContentDiv);

          for (let i = 0; i < data.length; i++) {
            const keywordContentA = document.createElement('a');

            const parent = data[i].parent_name;
            let keywordString = data[i].name;
            if (parent !== null)
              keywordString = parent + '/' + keywordString;
            keywordContentA.href = '/proto?keyword=' + keywordString;
            keywordContentA.textContent = keywordString;
            keywordContentA.target = '_blank';
            keywordContentDiv.appendChild(keywordContentA);

            if (i !== data.length - 1) {
              const separator = document.createElement('span');
              separator.textContent = ', ';
              keywordContentDiv.appendChild(separator);
            }
          }
        });

      return infoGrid;
    }

    function synchronizeProto(event, proto) {
      let searchString;
      let script;
      let typeName;
      script = 'ajax/proto/create.php';
      typeName = 'proto';

      const id = event.target.id.substring(5);
      event.target.classList.add('fa-spin');
      const url = event.target.getAttribute('data-url');
      fetch(script, { method: 'post', body: JSON.stringify({ url: url, id: id, search: searchString }) })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error) {
            let errorMsg = data.error;
            if (errorMsg.startsWith('YAML file error:')) {
              errorMsg = errorMsg +
                `<div class="help">
                  More information at: <a target="_blank" href="https://cyberbotics.com/doc/guide/webots-cloud#yaml-file">
                  cyberbotics.com/doc/guide/webots-cloud#yaml-file</a>
                </div>`;
            }
            const dialog = ModalDialog.run('Project deletion from synchronization', errorMsg);
            dialog.querySelector('form').addEventListener('submit', function(e) {
              e.preventDefault();
              dialog.querySelector('button[type="submit"]').classList.add('is-loading');
              dialog.close();
            });
            event.target.classList.remove('fa-spin');
            project.load(`/${typeName}`);
          } else
            project.load(`/run?version=${data.version}&url=${data.url}`);
        });
    }

    function deleteProto(event, project) {
      const id = event.target.id.substring(7);
      const dialog = ModalDialog.run(`Really delete proto?`, '<p>There is no way to recover deleted data.</p>', 'Cancel',
        `Delete proto`, 'is-danger');
      dialog.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        dialog.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('ajax/proto/delete.php', {
          method: 'post',
          body: JSON.stringify({ user: project.id, password: project.password, id: id })
        })
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            dialog.close();
            if (data.error)
              ModalDialog.run(`Proto deletion error`, data.error);
            else if (data.status === 1)
              project.load(`/proto`);
          });
      });
    }

    async function createMdFromProto(protoURl, proto, protoName, prefix, information) {
      const fieldRegex = /\[\n((.*\n)*)\]/mg;
      let matches = proto.matchAll(fieldRegex);
      let fieldsDefinition = '';
      const fieldEnumeration = new Map();
      const describedField = [];
      let fields = '';
      let file = '';
      for (const match of matches) {
        fieldsDefinition = match[1];
        break;
      }

      // remove enumerations
      const removeEnumRegex = /.*ield\s+([^ ]*?)(\{(?:[^\[\n]*\,?\s?)(?<!(\{))\})\s+([^ ]*)\s+([^#\n]*)(#?)(.*)/mg;
      matches = fieldsDefinition.matchAll(removeEnumRegex);
      for (const match of matches) {
        fieldEnumeration.set(match[4], match[2].slice(1, -1).split(','));
        if (match[0].includes('\n')) {
          const string = ' '.repeat(match[0].indexOf(match[2]));
          fieldsDefinition = fieldsDefinition.replace(string + match[4], match[4]);
          fieldsDefinition = fieldsDefinition.replace(match[2] + '\n', '');
        }

        if (match[2].length < 40)
          fieldsDefinition = fieldsDefinition.replace(match[2], ' '.repeat(match[2].length));
        else
          fieldsDefinition = fieldsDefinition.replace(match[2], '');
      }

      const spacingRegex = /.*ield\s+([^ ]*?)(\s+)([^ ]*)\s+([^#\n]*)(#?)(.*)/mg;
      matches = fieldsDefinition.matchAll(spacingRegex);
      let minSpaces = 2000;
      for (const match of matches) {
        const spaces = match[2];
        if (spaces.length < minSpaces)
          minSpaces = spaces.length;
      }
      const spacesToRemove = Math.max(minSpaces - 2, 0);

      const cleaningRegex = /^\s*(.*?ield)\s+([^ \{]*)(\s+)([^ ]*)\s+([^#\n]*)(#?)(.*)((\n*( {4}| {2}\]).*)*)/gm;
      const isDescriptionRegex = /Is\s`([a-zA-Z]*).([a-zA-Z]*)`./g;

      const baseNodeList = ['WorldInfo', 'Hinge2JointParameters', 'PBRAppearance', 'ContactProperties', 'SolidReference',
        'Charger', 'Capsule', 'Mesh', 'Background', 'BallJoint', 'Focus', 'RotationalMotor', 'ElevationGrid', 'Pen',
        'Cylinder', 'GPS', 'SliderJoint', 'Compass', 'Emitter', 'Track', 'Cone', 'LED', 'Slot', 'Radar', 'Coordinate',
        'HingeJointParameters', 'Hinge2Joint', 'LinearMotor', 'Sphere', 'JointParameters', 'TrackWheel', 'Appearance',
        'HingeJoint', 'DirectionalLight', 'Accelerometer', 'Viewpoint', 'Speaker', 'IndexedLineSet', 'PointSet', 'Damping',
        'ImmersionProperties', 'Robot', 'Lidar', 'DistanceSensor', 'Camera', 'Lens', 'Altimeter', 'Color', 'Transform',
        'Recognition', 'Connector', 'Propeller', 'LensFlare', 'BallJointParameters', 'TextureTransform', 'IndexedFaceSet',
        'Normal', 'Fog', 'Display', 'TouchSensor', 'Shape', 'TextureCoordinate', 'Box', 'ImageTexture', 'Radio', 'CadShape',
        'Plane', 'RangeFinder', 'Physics', 'SpotLight', 'Brake', 'PointLight', 'PositionSensor', 'Zoom', 'InertialUnit',
        'LightSensor', 'Gyro', 'Receiver', 'Microphone', 'Solid', 'Billboard', 'Fluid', 'Muscle', 'Group', 'Skin',
        'Material'];

      // create the final cleaned PROTO header
      matches = fieldsDefinition.matchAll(cleaningRegex);
      const removeCommentRegex = /\s*(#.*)/mg;
      const removeInitialFieldRegex = /^\s*.*field\s/mg;
      for (const match of matches) {
        if (!(match[1].includes('hiddenField') || match[1].includes('deprecatedField'))) {
          const fieldType = match[2];
          const fieldName = match[4];
          const fieldComment = match[7].trim();
          // skip 'Is `NodeType.fieldName`.' descriptions
          const isComment = fieldComment.match(isDescriptionRegex);
          if (fieldComment && !isComment) {
            // add link to base nodes:
            for (const baseNode of baseNodeList) {
              if (fieldComment.indexOf(baseNode) !== -1) {
                const link = ' [' + baseNode + '](https://cyberbotics.com/doc/reference/' + baseNode.toLowerCase() + ')';
                fieldComment.replace(' ' + baseNode, link);
              }
            }
            describedField.push([fieldType, fieldName, fieldComment]);
          }
          // remove the comment
          let fieldString = match[0];
          fieldString = fieldString.replace(removeCommentRegex, '');
          // remove intial '*field' string
          fieldString = fieldString.replace(removeInitialFieldRegex, '  ');
          fieldString = fieldString.replace('webots://', 'https://raw.githubusercontent.com/cyberbotics/webots/released/');
          // remove unwanted spaces between field type and field name (if needed)
          if (spacesToRemove > 0)
            fieldString = fieldString.replace(fieldType + ' '.repeat(spacesToRemove), fieldType);

          fields += fieldString + '\n';
        }
      }
      const baseType = information?.base_type;
      const description = information?.description;
      file += description + '\n\n';
      file += 'Derived from [' + baseType + '](https://cyberbotics.com/doc/reference/' + baseType?.toLowerCase() + ').\n\n';
      file += '```\n';
      file += protoName + ' {\n';
      file += fields;
      file += '}\n';
      file += '```\n\n';

      if (describedField.length > 0) {
        file += '### ' + protoName + ' Field Description\n\n';
        for (const [fieldType, fieldName, fielDescription] of describedField) {
          file += '- `' + fieldName + '` : ' + fielDescription;
          const isMFField = fieldType.startsWith('MF');
          if (fieldEnumeration.has(fieldName)) {
            const values = fieldEnumeration.get(fieldName);
            if (isMFField)
              file += ' This field accept a list of ';
            else {
              if (values.length > 1)
                file += ' This field accepts the following values: ';
              else
                file += ' This field accepts the following value: ';
            }

            for (let i = 0; i < values.length; i++) {
              const value = values[i].split('{')[0]; // In case of node keep only the type
              if (i === values.length - 1) {
                if (isMFField)
                  file += '`' + value.trim() + '` ' + fieldType.replace('MF', '').toLowerCase() + 's.';
                else
                  file += '`' + value.trim() + '`.';
              } else if (i === values.length - 2) {
                if (values.length === 2)
                  file += '`' + value.trim() + '` and ';
                else
                  file += '`' + value.trim() + '`, and ';
              } else
                file += '`' + value.trim() + '`, ';
            }
          }
          file += '\n\n';
        }
      }

      const license = information?.license;
      const licenseUrl = information?.license_url;
      const version = information?.version;
      const { populateProtoViewDiv } = await import('https://cyberbotics.com/wwi/' + checkProtoVersion(version) + '/proto_viewer.js');
      populateProtoViewDiv(file, prefix, createProtoArray(version, license, licenseUrl, protoURl, information));
    }

    // check that the proto is at least from R2023b
    function checkProtoVersion(version) {
      const year = version.substring(1, version.length - 2);
      if (year < 2023 || (year === 2023 && version[version.length - 1] === 'a'))
        return 'R2023b';

      return version;
    }

    function mainContainer(project) {
      const simulationUrl = new URL(window.location);
      simulationUrl.searchParams.append('context', 'try');
      const tryLink = simulationUrl.href.replace('%2Fblob%2Fmain%2Fworlds%2F', '%2Fblob%2Fcompetition%2Fworlds%2F');
      const repository = `${project.competitionUrl.split('/blob')[0]}`;
      const information =
        `<table style="font-size: small">
        <tbody id="competition-information">
          <tr>
            <td>Number of participants:</td>
            <td style="font-weight: bold;" id="competition-participants"></td>
          </tr>
          <tr>
            <td>Evaluation Queue:</td>
            <td style="font-weight: bold;" id="competition-queue"></td>
          </tr>
        </tbody>
        </table>`;

      const contentHtml =
        `<div id="tabs" class="tabs is-centered is-small-medium">
      <ul>
        <li data-tab="scene" class="data-tab">
          <a href="/scene">Scene</a>
        </li>
        <li data-tab="proto" class="data-tab">
          <a href="/proto">Proto</a>
        </li>
        <li data-tab="animation" class="data-tab">
          <a href="/animation">Animation</a>
        </li>
        <li data-tab="simulation" class="data-tab">
          <a href="/simulation">Simulation</a>
        </li>
        <li data-tab="competition" class="data-tab is-active">
          <a href="/competition">Competition</a>
        </li>
        <li data-tab="server" class="data-tab">
          <a href="/server">Server</a>
        </li>
      </ul>
      </div>
      <div class="container is-widescreen">
        <section class="section is-active">
          <div class="tile is-ancestor">
            <p class="title is-size-1 is-regular" id="competition-title"></p>
          </div>
          <div class="tile is-ancestor">
            <div class="tile is-parent is-4">
              <article class="tile is-child box">
                <p class="title">Information</p>
                <p id="competition-information-description" style="margin-bottom: 25px;"></p>
                <div class="content">
                  ${information}
                </div>
                <a class="button is-primary" id="try-competition" style="background-color: #007acc;" href="${tryLink}"
                 title="Run the simulation and program the robot online">
                  Try
                </a>
                <a class="button is-primary" id="submit-entry" style="background-color: #007acc;"
                 title="Enter the competition: create your code repository on GitHub">
                  Register
                </a>
                <a class="button is-primary" id="submit-entry" style="background-color: #007acc;"
                 href="${repository}/discussions"
                 title="Discuss with the organizers and the other competitors">
                  Discuss
                </a>
              </article>
            </div>
            <div class="tile is-parent">
              <article class="tile is-child box">
                <p class="title">Preview</p>
                <div class="content">
                  <div id="competition-preview-container"></div>
                </div>
              </article>
            </div>
          </div>

          <div class="tile is-ancestor">
            <div class="tile is-parent">
              <div class="tile is-child box">
                <p class="title">Leaderboard</p>
                <div class="content">
                  <div id="leaderboard"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>`;
      const template = document.createElement('template');
      template.innerHTML = contentHtml;
      project.setup('competition', template.content);
      document.getElementById('submit-entry').onclick = registerPopUp;
      getCompetition(project.competitionUrl);
    }

    function getCompetition(url) {
      // note: this is a temporary hack to allow Olivier to quickly check the repos of the wrestling participants while
      // debugging / refining the competition infrastructure
      const admin = project.email ? project.email === 'Olivier.Michel@cyberbotics.com' : false;
      const [, , , username, repo, , branch] = url.split('/');
      fetch(`https://api.github.com/repos/${username}/${repo}/commits?sha=${branch}&per_page=1`, { cache: 'no-store' })
        .then(function(response) { return response.json(); })
        .then(function(data) {
          project.lastSha = data[0] ? data[0].sha : branch;
          const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${project.lastSha}`;
          const competitionStorageUrl = `/storage/competition/${username}/${repo}`;
          // preview image
          const div = document.createElement('div');
          div.classList.add('thumbnail-button-container');
          const img = document.createElement('img');
          img.src = rawUrl + '/preview/thumbnail.jpg';
          div.append(img);
          const button = document.createElement('button');
          button.innerHTML = 'Load Animation';
          div.append(button);
          button.onclick = function() {
            document.getElementById('competition-preview-container').innerHTML = '';
            project.runWebotsView(rawUrl + '/preview/');
          };
          document.getElementById('competition-preview-container').append(div);

          fetch(rawUrl + '/README.md', { cache: 'no-cache' })
            .then(function(response) { return response.text(); })
            .then(function(data) {
              var readme = new DOMParser().parseFromString(data, 'text/html');

              const title = readme.getElementById('title').innerText.replace(/^[#\s]*/, '').replace(/[\s]*$/, '');
              document.getElementById('competition-title').innerHTML = title;
              const description = readme.getElementById('description').innerText.trim();
              document.getElementById('competition-information-description').innerHTML = description;
              const information = readme.getElementById('information').innerText.trim().split('\n');
              const escapeHtml = (unsafe) => {
                return unsafe
                  .replaceAll('&', '&amp;')
                  .replaceAll('<', '&lt;')
                  .replaceAll('>', '&gt;')
                  .replaceAll('"', '&quot;')
                  .replaceAll("'", '&#039;');
              };
              for (let i = information.length - 1; i >= 0; i--) {
                const array = information[i].split(': ');
                const name = escapeHtml(array[0].substring(2)); // skip "- "
                const value = escapeHtml(array[1]).replace(/\[([^\]]+)\]\(([^\)]+)\)/, '<a href="$2" target="_blank">$1</a>');
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${name}:</td><td style="font-weight: bold;">${value}</td>`;
                document.getElementById('competition-information').prepend(tr);
              }
            });
          fetch(rawUrl + '/webots.yml', { cache: 'no-cache' })
            .then(function(response) { return response.text(); })
            .then(function(data) {
              const metric = data.match(/metric: ([a-zA-Z-]+)/)[1];
              const hasQualification = data.match(/qualification: ([+-]?[0-9]*[.]?[0-9]+)/);
              const hasHigherIsBetter = data.match(/higher-is-better: ([(?:true|false)])/);
              const higherIsBetter = hasHigherIsBetter ? hasHigherIsBetter[1][0].toLowerCase() === 't' : true;
              const qualification = hasQualification ? parseFloat(hasQualification[1]) : NaN;
              const performanceColumn = (metric === 'ranking') ? `` : `<th class="has-text-centered">Performance</th>`;
              const leaderBoard =
                `<section class="section is-active" data-content="rankings" style="padding: 0">
                <div class="table-container rankings-table mx-auto">
                  <div class="search-bar" style="max-width: 280px; padding-bottom: 20px; display: none;">
                    <div class="control has-icons-right">
                      <input class="input is-small" id="rankings-search-input" type="text" placeholder="Search for users...">
                      <span class="icon is-small is-right is-clickable" id="rankings-search-click">
                        <i class="fas fa-search" id="rankings-search-icon"></i>
                      </span>
                    </div>
                  </div>
                  <table class="table is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th class="has-text-centered">Ranking</th>
                        <th class="has-text-centered">Country</th>
                        <th>Name</th>
                        <th class="has-text-centered">Programming</th>
                        ${performanceColumn}
                        <th class="has-text-centered">Updated</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="rankings-table">
                    </tbody>
                  </table>
                  <div class="empty-search" id="rankings-empty-search" style="display: none;">
                    <i class="fas fa-xl fa-search" id="no-project-icon"
                      style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;"></i>
                    <p id="rankings-empty-search-text"></p>
                  </div>
                </div>
                <nav class="pagination is-small is-rounded mx-auto" role="navigation" aria-label="pagination"></nav>
              </section>`;
              document.getElementById('leaderboard').innerHTML = leaderBoard;

              fetch(competitionStorageUrl + '/participants.json', { cache: 'no-cache' })
                .then(function(response) { return response.json(); })
                .then(function(participants) {
                  function getFlag(countryCode) {
                    const country = countryCode.toLowerCase();
                    if (country.length !== 2 || country === 'ru')
                      return `<svg width="32" height="24">
                              <rect width="32" height="24" fill="#fff" style="stroke-width:1;stroke:rgb(0,0,0)" />
                              </svg>`;
                    return `<img src="images/flags/${country}.svg" width="32" class="competition-flag">`;
                  }
                  let ranking = 1;
                  let demoCount = 0;
                  for (const participant of participants['participants']) {
                    const dateObject = new Date(participant.date);
                    const today = new Date();
                    const hourDelay = (today - dateObject) / 3600000;
                    const h = hourDelay > 24 ? 240 : Math.ceil(hourDelay * 10);
                    const dateString = `<span style="font-size:smaller;display:inline-block;">` +
                      `${dateObject.toLocaleDateString('en-GB')}<br>` +
                      `<svg height="10" width="18">` +
                      `<circle cx="5" cy="5" r="4" stroke="grey" stroke-width="1" fill="hsl(${h},100%,50%)" />` +
                      `</svg>` +
                      `${dateObject.toLocaleTimeString('en-GB')}</span>`;
                    const date = (typeof participant.log !== 'undefined')
                      ? `<a href="${participant.log}" target="_blank">${dateString}</a>`
                      : dateString;
                    const tableContent = document.createElement('template');
                    let performanceString;
                    if (metric === 'percent')
                      performanceString = (participant.performance * 100).toFixed(2) + '%';
                    else if (metric === 'time') {
                      // we want to display 2341:29:35:07 or 9:24:12 or 2:11
                      let seconds = participant.performance;
                      const hours = Math.floor(seconds / 3600);
                      seconds %= 3600;
                      const minutes = Math.floor(seconds / 60);
                      seconds %= 60;
                      if (hours > 0)
                        performanceString = String(hours) + ':';
                      if (hours > 0 || minutes > 0) {
                        if (hours === 0 && minutes < 10)
                          performanceString += String(minutes) + ':';
                        else
                          performanceString += String(minutes).padStart(2, '0') + ':';
                      }
                      if (hours > 0 || minutes > 0 || seconds >= 10)
                        performanceString += String(Math.floor(seconds)).padStart(2, '0') + ':';
                      else
                        performanceString += String(Math.floor(seconds)) + ':';
                      const cents = Math.floor(100 * (seconds % 1));
                      performanceString += String(cents).padStart(2, '0');
                    } else if (metric === 'distance')
                      performanceString = participant.performance.toFixed(3) + ' m.';
                    else if (metric !== 'ranking')
                      performanceString = participant.performance;
                    const performanceLine = (metric === 'ranking') ? ``
                      : `<td style="vertical-align:middle;" class="has-text-centered">${performanceString}</td>`;
                    const linkUrl = 'https://github.com/' + (participant.private && !admin
                      ? participant.repository.split('/')[0]
                      : participant.repository);
                    const link = `<a href="${linkUrl}" target="_blank">${participant.name}</a>`;
                    const title = (metric === 'ranking')
                      ? `Game lost by ${participant.name}`
                      : `Performance of ${participant.name}`;
                    const button = (metric === 'ranking' && ranking === 1)
                      ? `<span style="font-size:x-large" title="${participant.name} is the best!">&#127942;</span>`
                      : `<button class="button is-small is-primary" style="background-color: #007acc;"` +
                      `id="${participant.id}-view" title="${title}">View</button>`;
                    const demo = !participant.private && participant.country === 'demo';
                    if (demo)
                      demoCount++;
                    const flag = demo ? '<span style="font-size:small">demo</span>' : getFlag(participant.country);
                    const country = demo ? 'Open-source demo controller' : countryCodes[participant.country.toUpperCase()];
                    let qualified;
                    if (isNaN(qualification) || demo)
                      qualified = !demo;
                    else if (higherIsBetter)
                      qualified = ranking - demoCount >= qualification;
                    else
                      qualified = ranking - demoCount <= qualification;
                    const style = qualified
                      ? ''
                      : ' style="background:repeating-linear-gradient(45deg,#ddd,#ddd 21.5px,#eee 21.5px,#eee 43px);"';
                    let actualRanking = ranking - demoCount;
                    const rankingString = demo ? '&mdash;' : actualRanking;
                    const rankingTitle = demo
                      ? "Demo controllers don't compete" : qualified
                        ? 'Qualified for the finals' : 'Not qualified for the finals';
                    const extraStyle = qualified ? '' : ';color:#888;font-size:small';
                    const programming = ['Python', 'C', 'C++', 'Java', 'Rust', 'ROS 2'].includes(participant.programming)
                      ? `<img src="images/programming/${participant.programming}.png" title="${participant.programming}" ` +
                      'style="height:24px" />'
                      : participant.programming;
                    tableContent.innerHTML = `<tr${style}>
                    <td style="vertical-align:middle;${extraStyle}" class="has-text-centered" title="${rankingTitle}">
                      ${rankingString}
                    </td>
                    <td style="vertical-align:middle;font-size:x-large" class="has-text-centered"
                     title="${country}">${flag}</td>
                    <td style="vertical-align:middle;" title="${participant.description}">${link}</td>
                    <td style="text-align:center;vertical-align:middle;">${programming}</td>
                    ${performanceLine}
                    <td style="vertical-align:middle;" class="has-text-centered" title="Log file">${date}</td>
                    <td style="vertical-align:middle;" class="has-text-centered">${button}</td>
                  </tr>`;
                    ranking++;
                    document.getElementById('rankings-table').appendChild(tableContent.content.firstChild);
                    const viewButton = document.getElementById(participant.id + '-view');
                    if (viewButton)
                      viewButton.addEventListener('click', viewEntryRun);
                  }
                  let count = (participants['participants'].length - demoCount).toString();
                  if (!isNaN(qualification) && metric === 'ranking')
                    count += '/' + qualification;
                  if (demoCount === 1)
                    count += ' + 1 demo';
                  else if (demoCount > 1)
                    count += ` + ${demoCount} demos`;
                  document.getElementById('competition-participants').innerHTML = count;

                  fetch('ajax/project/queue.php', { method: 'post', body: JSON.stringify({ url: project.competitionUrl }) })
                    .then(function(response) { return response.json(); })
                    .then(function(queue) {
                      const item = document.getElementById('competition-queue');
                      item.innerHTML = queue.length;
                      let title = '';
                      let counter = 0;
                      queue.forEach(i => {
                        let found = false;
                        for (const participant of participants['participants']) {
                          if (i === participant.repository) {
                            title += counter + ': ' + participant.name + '\n';
                            found = true;
                            break;
                          } else if (i === 'R:' + participant.repository) {
                            title += 'Running now: ' + participant.name + '\n';
                            found = true;
                            break;
                          }
                        }
                        if (!found) {
                          if (i.startsWith('R:'))
                            title += 'Running now:=> new participant\n';
                          else
                            title += counter + ':=> new participant\n';
                        }
                        counter++;
                      });
                      item.parentElement.title = title;
                      // the following lines are fixing a rare bug where the leaderboard was hidden
                      document.getElementById('leaderboard').parentElement.removeAttribute('style');
                      document.getElementById('leaderboard').parentElement.removeAttribute('hidden');
                    });
                });
            });
        });
    }
    function viewEntryRun(eventOrId) {
      createCompetitionPageButton();
      const url = project.competitionUrl;
      const [, , , username, repo, ,] = url.split('/');
      let id;
      if (typeof eventOrId === 'string')
        id = eventOrId;
      else if (typeof eventOrId === 'object') {
        id = eventOrId.target.id.split('-')[0];
        var newURL = new URL(window.location);
        newURL.searchParams.append('context', 'view');
        newURL.searchParams.append('id', id);
        window.history.pushState({ path: newURL.href }, '', newURL.href);
      }
      project.runWebotsView(`/storage/competition/${username}/${repo}/${id}`);
    }
    function createCompetitionPageButton() {
      const backButtonTemplate = document.createElement('template');
      backButtonTemplate.innerHTML =
        `<div class="navbar-item">
        <a class="button is-small is-light is-outlined" id="competition-page-button">
          <span>Competition Page</span>
        </a>
      </div>`;
      document.querySelector('.navbar-start').prepend(backButtonTemplate.content);
      var pageURL = new URL(window.location);
      pageURL.searchParams.delete('context');
      pageURL.searchParams.delete('id');
      document.getElementById('competition-page-button').onclick = () => { location.href = pageURL.href; };
    }
    function registerPopUp() {
      const content = {};
      content.innerHTML =
        `<div class="field">
          <p style="padding-bottom:15px;">
           To register, you will need to create your own robot controller on GitHub.
           Follow the instructions on the <a href="${project.competitionUrl.split('/blob')[0]}#readme">repository of the competition organizer</a>.
          </p>
        </div>`;
      ModalDialog.run(`Register to the competition`, content.innerHTML);
    }
  }
});
