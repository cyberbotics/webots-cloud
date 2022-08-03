import ModalDialog from './modal_dialog.js';
export default class MyProjects {
  constructor(routes, project) {
    this.project = project;
    this.page = 1;
    this.search = '';
    this.sort = 'default';
    this.delay = false;
    let that = this;
    routes.push({ url: '/my-projects', setup: myProjectsPage });

    function myProjectsPage() {
      that.page = new URL(document.location.href).searchParams.get('p') ?
        parseInt(new URL(document.location.href).searchParams.get('p')) : 1;
      that.search = new URL(document.location.href).searchParams.get('search') ?
        (new URL(document.location.href).searchParams.get('search')).toString() : '';
      that.sort = new URL(document.location.href).searchParams.get('sort') ?
        (new URL(document.location.href).searchParams.get('sort')).toString() : 'default';

      // we need to be logged in to view this page
      if (!that.project.password || !that.project.email)
       return false;
      const template = document.createElement('template');
      const projectsTable =
        `<section class="section" data-content="my-projects" style="padding: 0">
          <div class="table-container my-projects-table mx-auto">
            <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
              <div class="control has-icons-right">
                <input class="input is-small" id="my-projects-search-input" type="text" placeholder="Search for projects...">
                <span class="icon is-small is-right is-clickable" id="my-projects-search-click">
                  <i class="fas fa-search" id="my-projects-search-icon"></i>
                </span>
              </div>
            </div>
            <table class="table is-striped is-hoverable">
              <thead>
                <tr>
                  <th class="is-clickable column-title" id="my-projects-sort-viewed" title="Popularity"
                    style="text-align:center; min-width: 65px;">
                    <i class="fas fa-chart-column"></i>
                    <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                  </th>
                  <th class="is-clickable column-title" id="my-projects-sort-title" title="Title of the animation"
                    style="min-width: 120px;">
                    Title<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                  </th>
                  <th class="is-clickable column-title" id="my-projects-sort-version" title="Webots release of the animation"
                    style="min-width: 85px;">
                    Version<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                  </th>
                  <th class="is-clickable column-title" id="my-projects-sort-duration" title="Duration of the animation"
                    style="text-align: right; min-width: 75px;">
                    Duration<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                  </th>
                  <th class="is-clickable column-title" id="my-projects-sort-size" title="Total size of the animation files"
                    style="text-align: right; min-width: 75px;">
                    Size<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                  </th>
                  <th class="is-clickable column-title" id="my-projects-sort-uploaded" title="Upload date and time"
                    style="text-align: right; min-width: 115px;">
                    Uploaded<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
            <div class="empty-search" id="my-projects-empty-search" style="display: none;">
              <i class="fas fa-xl fa-search" id="no-project-icon"
                style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;"></i>
              <p id="my-projects-empty-search-text"></p>
            </div>
          </div>
          <nav class="pagination is-small is-rounded mx-auto" role="navigation" aria-label="pagination"></nav>
        </section>`;
      template.innerHTML =
      `<section class="section">
        <div class="tile is-ancestor">
          <div class="tile is-60 is-parent">
            <div class="tile is-child box" style="overflow-X: auto">
              <p class="title">My Projects</p>
              <div class="content">
                ${projectsTable}
              </div>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box" id="my-projects-top">
              <p class="title">Top Project <span id="my-projects-title" class="is-size-4 has-text-weight-normal"></span></p>
              <div id="my-projects-top-container"></div>
            </div>
            <div class="tile is-child box">
              <p class="title">Information</p>
              <section class="section" id="my-projects-information" style="padding: 0;">
              </section>
            </div>
          </div>
        </div>
      </section>`;

      project.setup('my-projects', [], template.content);

      that.listMyProjects();
      that.initMyProjectsSearch();
      that.initMyProjectsSort();
      that.getUserStats();
    }
  }

  getUserStats() {
    let that = this;
    fetch('/ajax/animation/information.php', {method: 'post', body: JSON.stringify({user: that.project.id})})
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.error)
        ModalDialog.run(`User information request error`, data.error);
      else if (data.status !== 'no uploads') {
        that.showTopProject(data);
        that.showInformation(data);
      }
    });
  }

  showInformation(data) {
    document.getElementById('my-projects-information').innerHTML =
      `<p style="padding-bottom: 10px;"><strong>First Upload: &nbsp; </strong>${data.firstUpload}</p>
      <p style="padding-bottom: 10px;"><strong>Total Scenes: &nbsp; </strong>${data.totalScenes}</p>
      <p style="padding-bottom: 10px;"><strong>Total Animations: &nbsp; </strong>${data.totalAnimations}</p>
      <p><strong>Total Views: &nbsp; </strong>${data.totalViews}</p>`
  }

  showTopProject(data) {
    this.project.setupMyProjectsWebotsView(data);
    this.project.runWebotsView(data);
  }

  updateMyProjectsPagination(max) {
    const hrefSort = this.sort && this.sort !== 'default' ? '?sort=' + this.sort : '';
    const hrefSearch = this.search && this.search !== '' ? '?search=' + this.search : '';
    let nav = document.querySelector(`section[data-content="my-projects"] > nav`);
    let content = {};
    const previousDisabled = (this.page === 1) ? ' disabled' : ` href="${(this.page === 2)
      ? ('/my-projects') : ('/my-projects?p=' + (this.page - 1))}${hrefSort}${hrefSearch}"`;
    const nextDisabled = (this.page === max) ? ' disabled' : ` href="my-projects?p=${this.page + 1}${hrefSort}${hrefSearch}"`;
    const oneIsCurrent = (this.page === 1) ? ' is-current" aria-label="Page 1" aria-current="page"'
      : `" aria-label="Goto page 1" href="my-projects${hrefSort}${hrefSearch}"`;
    content.innerHTML =
      `<a class="pagination-previous"${previousDisabled}>Previous</a>
      <ul class="pagination-list" style="position:relative; margin: auto;"><li>
      <a class="pagination-link${oneIsCurrent}>1</a></li>`;
    for (let i = 2; i <= max; i++) {
      if (i === this.page - 2 || (i === this.page + 2 && i !== max)) {
        content.innerHTML += `<li><span class="pagination-ellipsis">&hellip;</span></li>`;
        continue;
      }
      if (i < this.page - 2 || (i > this.page + 2 && i !== max))
        continue;
      if (i === this.page)
        content.innerHTML += `<li><a class="pagination-link is-current" aria-label="Page ${i}"` +
          ` aria-current="page">${i}</a></li>`;
      else
        content.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}"
          href="/my-projects?p=${i}${hrefSort}${hrefSearch}">${i}</a></li>`;
    }
    content.innerHTML += `</ul>` + `<a class="pagination-next"${nextDisabled}>Next page</a>`;
    nav.innerHTML = content.innerHTML;
  }

  myProjectsRow(data) {
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
    let duration;
    if (data.duration) {
      let millisecond = data.duration % 1000;
      let second = Math.trunc(data.duration / 1000) % 60;
      let minute = Math.trunc(data.duration / 60000) % 60;
      let hour = Math.trunc(data.duration / 3600000);
      if (millisecond < 10)
        millisecond = '00' + millisecond;
      else if (millisecond < 100)
        millisecond = '0' + millisecond;
      duration = second + ':' + millisecond;
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
    } else
      duration = '-';
    const type = (data.duration === 0) ? 'scene' : 'animation';
    const typeLetter = (data.duration === 0) ? 'S' : 'A';
    const url = data.url.slice(0, data.url.lastIndexOf('/') + 1) + typeLetter + data.url.slice(data.url.lastIndexOf('/') + 1);
    const thumbnailUrl = url.slice(0, url.lastIndexOf('/')) + '/storage' + url.slice(url.lastIndexOf('/')) + '/thumbnail.jpg';
    const defaultThumbnailUrl = document.location.origin + '/images/thumbnail_not_available.jpg';
    const versionUrl = `https://github.com/cyberbotics/webots/releases/tag/${data.version}`;
    const style = ' style="color:#007acc"';
    const tooltip = `Delete your ${type}`;
    const deleteIcon = `<i${style} class="is-clickable far fa-trash-alt" id="my-projects-${data.id}" title="${tooltip}"></i>`;
    const uploaded = data.uploaded.replace(' ', `<br>${deleteIcon} `);
    const title = data.title === '' ? '<i>anonymous</i>' : data.title;
    let row = `<td class="has-text-centered">${data.viewed}</td>`;
    row += `<td>
              <a class="table-title has-text-dark" href="${url}">${title}</a>
              <div class="thumbnail">
                <div class="thumbnail-container">
                  <img class="thumbnail-image" src="${thumbnailUrl}" onerror="this.src='${defaultThumbnailUrl}';"/>
                  <p class="thumbnail-description">
                    ${data.description}
                    <div class="thumbnail-description-fade"/>
                  </p>
                </div>
              </div>
            </td>`;
    row += `<td><a class="has-text-dark" href="${versionUrl}" target="_blank"
      title="View Webots release">${data.version}</a></td>`;
    row += `<td class="has-text-right">${duration}</td>`;
    row += `<td class="has-text-right">${size}</td><td class="has-text-right is-size-7">${uploaded}</td>`;
    return row;
  }

  listMyProjects() {
    const pageLimit = 10;
    const offset = (this.page - 1) * pageLimit;
    let that = this;
    fetch('/ajax/animation/list.php', {method: 'post',
      body: JSON.stringify({offset: offset, limit: pageLimit, sortBy: that.sort, search: that.search, user: that.project.id})})
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.error)
          ModalDialog.run(`User project listing error`, data.error);
        else {
          if (data.total === 0) {
            const message = that.search || that.search !== '' ?
              'Your search - <strong>' + that.search + '</strong> - did not match any projects.' :
              'You have not uploaded any projects yet.';
            const iconClassList = that.search || that.search !== '' ?
              'fas fa-xl fa-search' : 'fas fa-xl fa-face-frown';
            document.getElementById('no-project-icon').classList = iconClassList;
            document.getElementById('my-projects-empty-search-text').innerHTML = message;
            document.getElementById('my-projects-empty-search').style.display = 'flex';
          } else
            document.getElementById('my-projects-empty-search').style.display = 'none';
          let line = ``;
          for (let i = 0; i < data.animations.length; i++)
            line += '<tr>' + that.myProjectsRow(data.animations[i]) + '</tr>';
          let parent = that.project.content.querySelector(`section[data-content="my-projects"] > div > table > tbody`);
          parent.innerHTML = line;
          for (let i = 0; i < data.animations.length; i++) {
            let type = data.animations[i].duration === 0 ? 'S' : 'A';
            let node = parent.querySelector(`#my-projects-${data.animations[i].id}`);
            if (node) {
              let p = (data.animations.length === 1) ? that.page - 1 : that.page;
              if (p === 0)
                p = 1;
              node.addEventListener('click', function(event) { that.deleteMyProject(event, type, p); });
            }
          }
          const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
          that.updateMyProjectsPagination(total);
        }
      });
  }

  initMyProjectsSort() {
    if (this.sort && this.sort !== 'default') {
      const columnTitle = document.getElementById('my-projects-sort-' + this.sort.split('-')[0]);
      const sortIcon = columnTitle.querySelector('.sort-icon');
      columnTitle.querySelector('.sort-icon').style.display = 'inline';
      if (this.sort.split('-')[1] === 'asc' && sortIcon.classList.contains('fa-sort-down')) {
        sortIcon.classList.toggle('fa-sort-down');
        sortIcon.classList.toggle('fa-sort-up');
      }
    }

    let that = this;
    document.querySelectorAll('.column-title').forEach((title) => {
      title.addEventListener('click', function(e) {
        const sortIcon = title.querySelector('.sort-icon');
        const previousSort = that.sort.split('-')[0];
        let sort = title.id.split('-')[3];

        if (previousSort === sort) {
          sortIcon.classList.toggle('fa-sort-down');
          sortIcon.classList.toggle('fa-sort-up');
          sort += sortIcon.classList.contains('fa-sort-down') ? '-desc' : '-asc';
        } else if (previousSort !== 'default') {
          document.getElementById('my-projects-sort-' + previousSort).querySelector('.sort-icon').style.display = 'none';
          if (sortIcon.classList.contains('fa-sort-up')) {
            sortIcon.classList.toggle('fa-sort-down');
            sortIcon.classList.toggle('fa-sort-up');
          }
          sort += '-desc';
        } else
          sort += '-desc';

        title.querySelector('.sort-icon').style.display = 'inline';
        that.sort = sort;
        that.searchAndSortMyProjectsTable();
      });
    });
  }

  initMyProjectsSearch() {
    document.getElementById('my-projects-search-input').value = this.search;

    let that = this;
    document.getElementById('my-projects-search-input').addEventListener('keyup', function(event) {
      if (!that.delay) {
        that.delay = true;
        setTimeout(() => {
          that.search = document.getElementById('my-projects-search-input').value;
          that.page = 1;
          that.updateMyProjectsSearchIcon();
          that.searchAndSortMyProjectsTable();
          that.delay = false;
        }, '300');
      }
    });
    document.getElementById('my-projects-search-click').addEventListener('click', function(event) {
      if (document.getElementById('my-projects-search-icon').classList.contains('fa-xmark')) {
        document.getElementById('my-projects-search-input').value = '';
        that.search = document.getElementById('my-projects-search-input').value;
        that.page = 1;
        that.updateMyProjectsSearchIcon();
        that.searchAndSortMyProjectsTable();
      }
    });
  }

  searchAndSortMyProjectsTable(isSearch) {
    let url = new URL(document.location.origin + document.location.pathname);
    if (this.page !== 1 && !isSearch)
      url.searchParams.append('p', this.page);
    else
      this.page = 1;
    if (this.sort && this.sort !== 'default')
      url.searchParams.append('sort', this.sort);
    if (this.search && this.search !== '')
      url.searchParams.append('search', this.search);
    window.history.replaceState(null, '', (url.pathname + url.search).toString());

    this.listMyProjects();
  }

  updateMyProjectsSearchIcon() {
    const searchIcon = document.getElementById('my-projects-search-icon');
    if (searchIcon.classList.contains('fa-search') && this.search.length > 0) {
      searchIcon.classList.remove('fa-search');
      searchIcon.classList.add('fa-xmark');
    } else if (searchIcon.classList.contains('fa-xmark') && this.search.length === 0) {
      searchIcon.classList.add('fa-search');
      searchIcon.classList.remove('fa-xmark');
    }
  }

  deleteMyProject(event, type, page) {
    let that = this;
    const animation = parseInt(event.target.id.substring(12));
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
          user: that.project.id,
          password: that.project.password
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
            that.project.load(`/my-projects${(page > 1) ? ('?p=' + page) : ''}`);
          }
        });
    });
  }
}
