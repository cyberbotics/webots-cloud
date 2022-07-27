import ModalDialog from './modal_dialog.js';
import Router from './router.js';
import md5 from './md5.min.js';

export default class User extends Router {
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.routes.push({url: '/settings', setup: settingsPage});
    this.routes.push({url: '/my-projects', setup: myProjectsPage});
    this.page = 1;
    this.search = '';
    this.sort = 'default';
    this.delay = false;
    let that = this;
    function myProjectsPage() {
      that.page = new URL(document.location.href).searchParams.get('p') ?
        parseInt(new URL(document.location.href).searchParams.get('p')) : 1;
      that.search = new URL(document.location.href).searchParams.get('search') ?
        (new URL(document.location.href).searchParams.get('search')).toString() : that.search;
      that.sort = new URL(document.location.href).searchParams.get('sort') ?
        (new URL(document.location.href).searchParams.get('sort')).toString() : that.sort;

      // we need to be logged in to view this page
      if (!that.password || !that.email)
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
      that.setup('settings', [], template.content);
      listMyProjects();
      initMyProjectsSearch();
      initMyProjectsSort();
      getUserStats();
    }
    function getUserStats() {
      fetch('/ajax/animation/information.php', {method: 'post', body: JSON.stringify({user: that.id})})
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.error)
          ModalDialog.run(`User information request error`, data.error);
        else if (data.status !== 'no uploads') {
          showTopProject(data);
          showInformation(data);
        }
      });
    }
    function showInformation(data) {
      document.getElementById('my-projects-information').innerHTML =
        `<p style="padding-bottom: 10px;"><strong>First Upload: &nbsp; </strong>${data.firstUpload}</p>
        <p style="padding-bottom: 10px;"><strong>Total Scenes: &nbsp; </strong>${data.totalScenes}</p>
        <p style="padding-bottom: 10px;"><strong>Total Animations: &nbsp; </strong>${data.totalAnimations}</p>
        <p><strong>Total Views: &nbsp; </strong>${data.totalViews}</p>`
    }
    function showTopProject(data) {
      if (!that.topProjectWebotsView) {
        that.topProjectWebotsView = document.createElement('webots-view');
        that.topProjectWebotsView.id = 'my-projects-top-webots-view';
        document.getElementById('my-projects-top-container').append(that.topProjectWebotsView);
      }

      document.getElementById('my-projects-title').innerHTML = data.topTitle;

      const reference = window.location.origin + '/storage/' + data.topId;
      if (data.topId[0] === 'S')
        that.topProjectWebotsView.loadScene(`${reference}/scene.x3d`, that.isMobileDevice(), `${reference}/thumbnail.jpg`);
      else
        that.topProjectWebotsView.loadAnimation(`${reference}/scene.x3d`, `${reference}/animation.json`,
          that.isMobileDevice(), false, `${reference}/thumbnail.jpg`);
    }
    function updateMyProjectsPagination(max) {
      const hrefSort = that.sort && that.sort !== 'default' ? '?sort=' + that.sort : '';
      const hrefSearch = that.search && that.search !== '' ? '?search=' + that.search : '';
      let nav = document.querySelector(`section[data-content="my-projects"] > nav`);
      let content = {};
      const previousDisabled = (that.page === 1) ? ' disabled' : ` href="${(that.page === 2)
        ? ('/my-projects') : ('/my-projects?p=' + (that.page - 1))}${hrefSort}${hrefSearch}"`;
      const nextDisabled = (that.page === max) ? ' disabled' : ` href="my-projects?p=${that.page + 1}${hrefSort}${hrefSearch}"`;
      const oneIsCurrent = (that.page === 1) ? ' is-current" aria-label="Page 1" aria-current="page"'
        : `" aria-label="Goto page 1" href="my-projects${hrefSort}${hrefSearch}"`;
      content.innerHTML =
        `<a class="pagination-previous"${previousDisabled}>Previous</a>
        <ul class="pagination-list"><li>
        <a class="pagination-link${oneIsCurrent}>1</a></li>`;
      for (let i = 2; i <= max; i++) {
        if (i === that.page - 2 || (i === that.page + 2 && i !== max)) {
          content.innerHTML += `<li><span class="pagination-ellipsis">&hellip;</span></li>`;
          continue;
        }
        if (i < that.page - 2 || (i > that.page + 2 && i !== max))
          continue;
        if (i === that.page)
          content.innerHTML += `<li><a class="pagination-link is-current" aria-label="Page ${i}"` +
            ` aria-current="page">${i}</a></li>`;
        else
          content.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}"
            href="/my-projects?p=${i}${hrefSort}${hrefSearch}">${i}</a></li>`;
      }
      content.innerHTML += `</ul>` + `<a class="pagination-next"${nextDisabled}>Next page</a>`;
      nav.innerHTML = content.innerHTML;
    }
    function myProjectsRow(data) {
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
    function listMyProjects() {
      const pageLimit = 10;
      const offset = (that.page - 1) * pageLimit;
      fetch('/ajax/animation/list.php', {method: 'post',
        body: JSON.stringify({offset: offset, limit: pageLimit, sortBy: that.sort, search: that.search, user: that.id})})
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
              line += '<tr>' + myProjectsRow(data.animations[i]) + '</tr>';
            let parent = that.content.querySelector(`section[data-content="my-projects"] > div > table > tbody`);
            parent.innerHTML = line;
            for (let i = 0; i < data.animations.length; i++) {
              let type = data.animations[i].duration === 0 ? 'S' : 'A';
              let node = parent.querySelector(`#my-projects-${data.animations[i].id}`);
              if (node) {
                let p = (data.animations.length === 1) ? that.page - 1 : that.page;
                if (p === 0)
                  p = 1;
                node.addEventListener('click', function(event) { deleteMyProject(event, type, p); });
              }
            }
            const total = (data.total === 0) ? 1 : Math.ceil(data.total / pageLimit);
            updateMyProjectsPagination(total);
          }
        });
    }
    function initMyProjectsSort() {
      if (that.sort && that.sort !== 'default') {
        const columnTitle = document.getElementById('my-projects-sort-' + that.sort.split('-')[0]);
        const sortIcon = columnTitle.querySelector('.sort-icon');
        columnTitle.querySelector('.sort-icon').style.display = 'inline';
        if (that.sort.split('-')[1] === 'asc' && sortIcon.classList.contains('fa-sort-down')) {
          sortIcon.classList.toggle('fa-sort-down');
          sortIcon.classList.toggle('fa-sort-up');
        }
      }
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
          searchAndSortMyProjectsTable();
        });
      });
    }
    function initMyProjectsSearch() {
      document.getElementById('my-projects-search-input').value = that.search;
      document.getElementById('my-projects-search-input').addEventListener('keyup', function(event) {
        if (!that.delay) {
          that.delay = true;
          setTimeout(() => {
            that.search = document.getElementById('my-projects-search-input').value;
            that.page = 1;
            updateMyProjectsSearchIcon();
            searchAndSortMyProjectsTable();
            that.delay = false;
          }, '300');
        }
      });
      document.getElementById('my-projects-search-click').addEventListener('click', function(event) {
        if (document.getElementById('my-projects-search-icon').classList.contains('fa-xmark')) {
          document.getElementById('my-projects-search-input').value = '';
          that.search = document.getElementById('my-projects-search-input').value;
          that.page = 1;
          updateMyProjectsSearchIcon();
          searchAndSortMyProjectsTable();
        }
      });
    }
    function searchAndSortMyProjectsTable(isSearch) {
      let url = new URL(document.location.origin + document.location.pathname);
      if (that.page !== 1 && !isSearch)
        url.searchParams.append('p', that.page);
      else
        that.page = 1;
      if (that.sort && that.sort !== 'default')
        url.searchParams.append('sort', that.sort);
      if (that.search && that.search !== '')
        url.searchParams.append('search', that.search);
      window.history.replaceState(null, '', (url.pathname + url.search).toString());

      listMyProjects();
    }
    function updateMyProjectsSearchIcon() {
      console.log(that.search.length);
      const searchIcon = document.getElementById('my-projects-search-icon');
      if (searchIcon.classList.contains('fa-search') && that.search.length > 0) {
        searchIcon.classList.remove('fa-search');
        searchIcon.classList.add('fa-xmark');
      } else if (searchIcon.classList.contains('fa-xmark') && that.search.length === 0) {
        searchIcon.classList.add('fa-search');
        searchIcon.classList.remove('fa-xmark');
      }
    }
    function deleteMyProject(event, type, page) {
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
              that.load(`/my-projects${(page > 1) ? ('?p=' + page) : ''}`);
            }
          });
      });
    }

    function settingsPage() {
      // we need to be logged in to view this page
      if (!that.password || !that.email)
        return false;
      const emailBeginning = that.email.substring(0, that.email.indexOf("@"));
      const template = document.createElement('template');
      const md5sum = md5(that.email.toLowerCase());
      const hostname = document.location.hostname;
      const name = (typeof displayName === 'undefined') ? emailBeginning : displayName;
      template.innerHTML =
        `<section class="section">
          <div class="container">
            <h1 class="title pb-3"><i class="fas fa-cog"></i> Settings</h1>
            <h2 class="subtitle pt-3">${that.email}</h2>
          </div>
        </section>
        <section class="section" style="margin-top:0;padding-top:0">
          <div class="container panel">
            <p class="panel-heading">Gravatar Profile</p>
            <div class="panel-block">
              <img src="https://www.gravatar.com/avatar/${md5sum}?s=80&d=https%3A%2F%2F${hostname}%2Fimages%2Fprofile.png"> &nbsp;
              <span name="displayName">${name}</span>
            </div>
            <div class="panel-block">
              <p>Create or update your picture and information on <a href="https://www.gravatar.com" target="_blank">gravatar</a>.</p>
            </div>
            <div class="panel-block">
              <a class="button is-link" href="https://www.gravatar.com/${md5sum}" target="_blank">Gravatar Profile</a>
            </div>
          </div>
          <div class="container panel">
            <p class="panel-heading">Change Password</p>
            <div class="panel-block">
              We will send you a e-mail with a link to reset your password.
            </div>
            <div class="panel-block">
              <button class="button is-link" id="change-password">Change Password</button>
            </div>
          </div>
          <div class="container panel">
            <p class="panel-heading">Delete Account</p>
            <div class="panel-block">
              All your data will be erased, including the scenes and animations you uploaded.
              There is no undo.
            </div>
            <div class="panel-block">
              <button class="button is-danger" id="delete-account">Delete my Account</button>
            </div>
          </div>
        </section>`;
      that.setup('settings', [], template.content);
      document.querySelector('#change-password').addEventListener('click', function(event) {
        event.target.classList.add('is-loading');
        that.forgotPassword(that.email, function() { event.target.classList.remove('is-loading'); });
      });
      document.querySelector('#delete-account').addEventListener('click', function(event) {
        let dialog = ModalDialog.run('Really delete account?',
          '<p>All your data will be deleted from our database, including scenes and animations.</p>' +
          '<p>There is no way to recover deleted data.</p>', 'Cancel', 'Delete Account', 'is-danger');
        dialog.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          dialog.querySelector('button[type="submit"]').classList.add('is-loading');
          fetch('/ajax/user/delete.php', { method: 'post',
            body: JSON.stringify({email: that.email, password: that.password})})
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              dialog.close();
              if (data.error)
                ModalDialog.run('Error', data.error);
              else {
                ModalDialog.run('Account deleted',
                  '<p>Your account was successfully deleted.</p><p>All you data was erased.</p>');
                that.password = null;
                that.email = null;
                that.id = null;
                that.load('/');
              }
            });
        });
      });
    }
    function resetPassword(id, token, email) {
      let content = {};
      content.innerHTML =
        `<div class="field">
        <label class="label">E-mail</label>
        <div class="control has-icons-left">
          <input class="input" type="email" required readonly value="${email}">
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
        </div>
        <div class="field">
        <label class="label">Password</label>
        <div class="control has-icons-left">
          <input id="choose-password" class="input" type="password" required autocomplete=new-password>
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
        <div id="choose-password-help" class="help">
          8 characters minimum, including at least a lowercase letter, an uppercase letter, a number and a symbol.
        </div>
        </div>
        <div class="field">
        <label class="label">Password (confirm)</label>
        <div class="control has-icons-left">
          <input id="choose-confirm-password" class="input" type="password" required>
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
        <div id="choose-confirm-help" class="help">&nbsp;</div>
        </div>`;
      let choose = ModalDialog.run('Choose a password', content.innerHTML, 'Cancel', 'Ok');
      choose.querySelector('#choose-password').focus();
      choose.querySelector('button[type="submit"]').disabled = true;
      choose.querySelector('#choose-password').value = '';
      choose.querySelector('#choose-password').addEventListener('change', checkPasswordMatch);
      choose.querySelector('#choose-password').addEventListener('input', checkPasswordMatch);
      choose.querySelector('#choose-confirm-password').addEventListener('change', checkPasswordMatch);
      choose.querySelector('#choose-confirm-password').addEventListener('input', checkPasswordMatchInput);
      let testPasswordMatch = false;
      let validPassword = false;
      function checkPasswordMatchInput(event) {
        const password = choose.querySelector('#choose-password').value;
        const confirm = choose.querySelector('#choose-confirm-password').value;
        if (confirm.length === 0) {
          choose.querySelector('#choose-confirm-help').innerHTML = '&nbsp;';
          testPasswordMatch = false;
          choose.querySelector('button[type="submit"]').disabled = true;
        }
        if (confirm.length === password.length || testPasswordMatch) {
          testPasswordMatch = true;
          checkPasswordMatch(event);
        }
      }
      function checkPasswordMatch(event) {
        const password = choose.querySelector('#choose-password').value;
        const confirm = choose.querySelector('#choose-confirm-password').value;
        if (event.type === 'input') {
          let length = password.length;
          let message = '';
          if (length < 8)
            message = '8 characters minimum';
          let numberCount = 0;
          let uppercaseCount = 0;
          let lowercaseCount = 0;
          for (let i = 0; i < length; i++) {
            if (password[i] >= '0' && password[i] <= '9')
              numberCount++;
            else if (password[i] >= 'A' && password[i] <= 'Z')
              uppercaseCount++;
            else if (password[i] >= 'a' && password[i] <= 'z')
              lowercaseCount++;
          }
          let symbolCount = length - numberCount - uppercaseCount - lowercaseCount;
          if (lowercaseCount === 0 || uppercaseCount === 0 || numberCount === 0 || symbolCount === 0) {
            if (message === '')
              message = 'Missing ';
            else
              message += ', including at least ';
          }
          if (lowercaseCount === 0)
            message += 'a lowercase letter';
          if (uppercaseCount === 0) {
            if (lowercaseCount === 0) {
              if (numberCount > 0 && symbolCount > 0)
                message += ' and ';
              else
                message += ', ';
            }
            message += 'an uppercase letter';
          }
          if (numberCount === 0) {
            if (lowercaseCount === 0 || uppercaseCount === 0) {
              if (symbolCount > 0)
                message += ' and ';
              else
                message += ', ';
            }
            message += 'a number';
          }
          if (symbolCount === 0) {
            if (lowercaseCount === 0 || uppercaseCount === 0 || numberCount === 0)
              message += ' and ';
            message += 'a symbol';
          }
          const help = choose.querySelector('#choose-password-help');
          if (message === '') {
            validPassword = true;
            message = 'Valid password.';
            help.classList.remove('is-danger');
            help.classList.add('is-success');
          } else {
            help.classList.add('is-danger');
            help.classList.remove('is-success');
            validPassword = false;
            message += '.';
          }
          help.innerHTML = message;
        }
        if (!confirm)
          return;
        const help = choose.querySelector('#choose-confirm-help');
        const button = choose.querySelector('button[type="submit"]');
        if (password !== confirm) {
          help.classList.add('is-danger');
          help.classList.remove('is-success');
          help.innerHTML = 'Passwords mismatch: please re-enter carefully your password.';
          button.disabled = true;
        } else {
          help.classList.remove('is-danger');
          help.classList.add('is-success');
          help.innerHTML = 'Confirmed password.';
          if (validPassword)
            button.disabled = false;
        }
      }
      choose.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        choose.querySelector('button[type="submit"]').classList.add('is-loading');
        that.sha256Hash(choose.querySelector('#choose-password').value + that.title).then(function(hash) {
          fetch('/ajax/user/password.php', { method: 'post', body: JSON.stringify({id: id, token: token, password: hash})})
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              choose.close();
              if (data.error)
                ModalDialog.run('Account activation error', data.error);
              else {
                if (data.status === 0)
                  ModalDialog.run('Welcome to ' + that.title, '<p>Your new account is up-and-ready.</p>');
                else if (data.status === 1)
                  ModalDialog.run('Password changed', '<p>Your password was successfully changed.</p>');
                else
                  console.error('Error: ' + data.status);
                that.email = email;
                that.password = hash;
                that.login();
              }
            });
        });
      });
    }
    function findGetParameter(parameterName) {
      let result = null;
      let tmp = [];
      let items = location.search.substr(1).split('&');
      for (let index = 0; index < items.length; index++) {
        tmp = items[index].split('=');
        if (tmp[0] === parameterName)
          result = decodeURIComponent(tmp[1]);
      }
      return result;
    }
    // account creation: entering the password
    const token = findGetParameter('token');
    if (token) {
      const id = findGetParameter('id');
      const email = findGetParameter('email');
      if (id && email) {
        that.email = email;
        that.updateDisplayName();
        resetPassword(id, token, email);
      }
    }
  }
  updateDisplayName() {
    let that = this;
    const md5sum = md5(that.email.toLowerCase());
    let head = document.getElementsByTagName('head')[0];
    if (typeof displayName === 'undefined') {
      const emailBeginning = that.email ? that.email.substring(0, that.email.indexOf("@")) : 'Anonymous';
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `let displayName = '${emailBeginning}';
        function User_profile(data) {
        if (data && data.entry && data.entry[0]) {
        displayName = data.entry[0].displayName;
        if (!displayName)
        displayName = data.entry[0].name.formatted;
        if (!displayName)
        displayName = data.entry[0].name.givenName;
        if (!displayName)
        displayName = data.entry[0].name.familyName;
        if (!displayName)
        displayName = '${emailBeginning}';
        } else
        displayName = '${emailBeginning}';
        let x = document.getElementsByName("displayName");
        let i;
        for (i = 0; i < x.length; i++)
        x[i].innerHTML = displayName;
        }`;
      head.appendChild(script);
    } else
      User_profile();
    let gq = document.getElementById('gravatar-query');
    if (gq)
      gq.remove();
    let script = document.createElement('script');
    script.id = 'gravatar-query';
    script.type = 'text/javascript';
    script.src = `https://www.gravatar.com/${md5sum}.json?callback=User_profile}`;
    head.appendChild(script);
  }
  load(page = null, pushHistory = true) {
    let that = this;
    super.load(page, pushHistory).then(() => {
      if (document.querySelector('#user-menu')) {
        if (that.email && that.password) {
          document.querySelector('#user-menu').style.display = 'auto';
          document.querySelector('#log-in').style.display = 'none';
          document.querySelector('#sign-up').style.display = 'none';
          that.updateDisplayName();
        } else {
          document.querySelector('#user-menu').style.display = 'none';
          document.querySelector('#log-in').style.display = 'flex';
          document.querySelector('#sign-up').style.display = 'flex';
        }
        if (that.email === '!')
          that.login();
      }
    });
  }
  setup(title, anchors, content, fullpage = false) {
    super.setup(title, anchors, content, fullpage);
    let navbarEnd = document.body.querySelector('.navbar-end');
    navbarEnd.parentNode.replaceChild(this.menu(), navbarEnd);
  }
  menu() {
    let div = document.createElement('div');
    div.setAttribute('class', 'navbar-end');
    const emailBeginning = this.email ? this.email.substring(0, this.email.indexOf("@")) : 'Anonymous';
    const md5sum = this.email ? md5(this.email.toLowerCase()) : '';
    const hostname = document.location.hostname;
    const name = (typeof displayName === 'undefined') ? emailBeginning : displayName;
    div.innerHTML =
      `<div class="navbar-item">
        <div class="buttons">
          <a class="button is-small is-success" id="sign-up">
            <strong>Sign up</strong>
          </a>
          <a class="button is-small is-light" id="log-in">
            Log in
          </a>
        </div>
      </div>
      <div id="user-menu" class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link" id="email"><span name="displayName">${name}</span> &nbsp; <img src="https://www.gravatar.com/avatar/${md5sum}?s=80&d=https%3A%2F%2F${hostname}%2Fimages%2Fprofile.png"></a>
        <div class="navbar-dropdown is-boxed">
          <a class="navbar-item" href="/my-projects"><i class="fas fa-user"> &nbsp; </i>My projects</a>
          <div class="navbar-divider"></div>
          <a class="navbar-item" href="/settings"><i class="fas fa-cog"> &nbsp; </i>Settings</a>
          <div class="navbar-divider"></div>
          <a class="navbar-item" id="log-out"><i class="fas fa-power-off"> &nbsp; </i>Log out</a>
        </div>
      </div>`;
    let that = this;

    div.querySelector('a#log-out').addEventListener('click', function(event) {
      that.password = null;
      that.email = null;
      that.id = null;
      if (window.location.pathname === '/settings' || window.location.pathname === '/my-projects')
        that.load('/');
      else
        that.load();
    });

    div.querySelector('a#sign-up').addEventListener('click', function(event) {
      event.preventDefault();
      let content = {};
      content.innerHTML =
        `<div class="field">
          <label class="label">E-mail</label>
          <div class="control has-icons-left">
            <input id="sign-up-email" class="input" type="email" required placeholder="Enter your e-mail address">
            <span class="icon is-small is-left">
              <i class="fas fa-envelope"></i>
            </span>
          </div>
          <div id="sign-up-email-help" class="help">We will send you an e-mail to verify this address.</div>
        </div>`;
      let modal = ModalDialog.run('Sign up', content.innerHTML, 'Cancel', 'Sign up');
      modal.querySelector('#sign-up-email').focus();
      modal.querySelector('#sign-up-email').addEventListener('change', function(event) {
        event.target.setCustomValidity('');
        const email = event.target.value;
        const help = modal.querySelector('#sign-up-email-help');
        // check if e-mail address is valid
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(email).toLowerCase())) {
          help.innerHTML = 'This e-mail address is invalid.';
          help.classList.add('is-danger');
          help.classList.remove('is-success');
          return;
        }
        // check if this e-mail address is not already registered
        fetch('/ajax/user/uniqueness.php', { method: 'post', body: JSON.stringify({email: email}) })
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error) {
              help.innerHTML = data.error;
              event.target.setCustomValidity(data.error);
              help.classList.add('is-danger');
              help.classList.remove('is-success');
            } else if (data.status === 'OK') {
              help.innerHTML = 'This e-mail address is available for registration.';
              help.classList.add('is-success');
              help.classList.remove('is-danger');
            }
          });
      });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = modal.querySelector('#sign-up-email').value;
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('/ajax/user/sign-up.php', { method: 'post', body: JSON.stringify({email: email}) })
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            modal.close();
            if (data.error)
              ModalDialog.run('Error', data.error);
            else {
              ModalDialog.run('Thank you!',
                'An e-mail was just sent to you to verify your address.<br />' +
                'Click on the link in the e-mail to set a password and activate your account.');
            }
          });
      });
    });

    div.querySelector('a#log-in').addEventListener('click', function(event) {
      event.preventDefault();
      let content = {};
      content.innerHTML =
        `<div class="field">
          <label class="label">E-mail</label>
          <div class="control has-icons-left">
            <input id="log-in-email" class="input" type="email" required placeholder="Enter your e-mail address">
            <span class="icon is-small is-left">
              <i class="fas fa-envelope"></i>
            </span>
          </div>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <div class="control has-icons-left">
            <input id="log-in-password" class="input" type="password" required>
            <span class="icon is-small is-left">
              <i class="fas fa-lock"></i>
            </span>
          </div>
          <div class="has-text-right"><a id="log-in-forgot" class="help">Forgot your password?</a></div>
        </div>
        <p id="log-in-help" class="help"></p>`;
      let modal = ModalDialog.run('Log in', content.innerHTML, 'Cancel', 'Log in');
      modal.querySelector('#log-in-email').focus();
      modal.querySelector('#log-in-forgot').addEventListener('click', function(event) {
        modal.close();
        let content = {};
        content.innerHTML =
          `<div class="field">
            <label class="label">E-mail</label>
            <div class="control has-icons-left">
              <input id="forgot-email" class="input" type="email" required placeholder="Enter your e-mail address"
              value="${modal.querySelector('#log-in-email').value}">
              <span class="icon is-small is-left">
                <i class="fas fa-envelope"></i>
              </span>
            </div>
          </div>`;
        let forgot = ModalDialog.run('Forgot your password?', content.innerHTML, 'Cancel', 'Reset Password');
        forgot.querySelector('#forgot-email').focus();
        forgot.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          forgot.querySelector('button[type="submit"]').classList.add('is-loading');
          that.forgotPassword(forgot.querySelector('#forgot-email').value, function() { forgot.close(); });
        });
      });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        let email = modal.querySelector('#log-in-email').value;
        let password = modal.querySelector('#log-in-password').value;
        that.email = email;
        that.sha256Hash(password + that.title).then(function(hash) {
          that.password = hash;
          that.login(function(error) {
            modal.querySelector('#log-in-help').innerHTML = error; // "Your e-mail or password is wrong, please try again.";
          }, function(success) {
            modal.close();
          }, true);
        });
      });
    });
    return div;
  }
  login(error = null, success = null, reload = false) {
    if (this.email && this.password) {
      document.querySelector('#user-menu').style.display = 'none';
      document.querySelector('#log-in').style.display = 'none';
      document.querySelector('#sign-up').style.display = 'none';
      let that = this;
      let uploads = JSON.parse(window.localStorage.getItem('uploads'));
      if (uploads === null)
        uploads = [];
      fetch('/ajax/user/authenticate.php', { method: 'post',
        body: JSON.stringify({email: this.email, password: this.password, uploads: uploads})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error) {
            that.password = null;
            if (error)
              error(data.error);
            else
              ModalDialog.run('Error', data.error);
            that.email = '!';
            that.load('/');
          } else {
            that.id = data.id;
            document.querySelector('#user-menu').style.display = 'flex';
            document.querySelector('#log-in').style.display = 'none';
            document.querySelector('#sign-up').style.display = 'none';
            window.localStorage.removeItem('uploads');
            if (reload) // the page content may need to be updated after loging in.
              that.load();
            if (success)
              success();
            if (uploads.length !== 0)
              ModalDialog.run(`Uploads associated`,
                `Thank you for logging in!<br>` +
                `All scenes and animations that you have uploaded during this session have been associated with your` +
                `webots.cloud account. Only you may delete them now.`);
          }
        });
    }
  }
  async sha256Hash(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  forgotPassword(email, callback = null) {
    fetch('/ajax/user/forgot.php', { method: 'post', body: JSON.stringify({email: email})})
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (callback)
          callback();
        if (data.error)
          ModalDialog.run('Error', data.error);
        else {
          ModalDialog.run('Password reset',
            'An e-mail with a password reset link was just sent to you.<br />Check your inbox now.');
        }
      });
  }
  get id() {
    return window.localStorage.getItem('id');
  }
  set id(value) {
    if (value === null)
      window.localStorage.removeItem('id');
    else
      window.localStorage.setItem('id', value);
  }
  get email() {
    return window.localStorage.getItem('email');
  }
  set email(value) {
    if (value === null)
      window.localStorage.removeItem('email');
    else
      window.localStorage.setItem('email', value);
  }
  get password() {
    return window.localStorage.getItem('password');
  }
  set password(value) {
    if (value === null)
      window.localStorage.removeItem('password');
    else
      window.localStorage.setItem('password', value);
  }
}
