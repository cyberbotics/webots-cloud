import User from './user.js';
import ModalDialog from './modal_dialog.js';
import TermsAndPrivacy from './termsAndPrivacy';

export default class Project extends User {
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.termsOfService = new TermsAndPrivacy(routes, this);
    this.load(null, false);
  }
  static run(title, footer, routes) {
    Project.current = new Project(title, footer, routes);
    return Project.current;
  }
  dynamicPage(url, pushHistory) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      if (!url.pathname.startsWith('/A') && !url.pathname.startsWith('/M') && url.pathname.length !== 8) {
        that.notFound();
        resolve();
      }
      fetch('/ajax/animation/list.php', {method: 'post', body: JSON.stringify({url: url, type: url.pathname[1]})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          let pushUrl;
          if (url.search !== data.uploadMessage)
            pushUrl = url.pathname + url.search + url.hash;
          else {
            if (!that.id) {
              let uploads = JSON.parse(window.localStorage.getItem('uploads'));
              if (uploads === null)
                uploads = [];
              if (!uploads.includes(data.animation.id))
                uploads.push(data.animation.id);
              window.localStorage.setItem('uploads', JSON.stringify(uploads));
            } else {
              fetch('/ajax/user/authenticate.php', {
                method: 'post',
                body: JSON.stringify({email: that.email, password: that.password, uploads: [data.animation.id]})
              })
                .then(function(response) {
                  return response.json();
                })
                .then(function(data) {
                  if (data.error) {
                    that.password = null;
                    that.email = '!';
                    that.load('/');
                    ModalDialog.run('Error', data.error);
                  } else
                    ModalDialog.run(`Upload associated`,
                      `Your upload has successfully been associated with your webots.cloud account`);
                });
            }
            pushUrl = url.pathname + url.hash;
          }
          if (pushHistory)
            window.history.pushState(null, '', pushUrl);
          if (data.error) { // no such animation
            that.notFound();
            resolve();
          } else {
            that.runWebotsView(data.animation);
            resolve();
          }
        });
    });
    return promise;
  }
  setup(title, content, fullpage = false) {
    if (Project.webotsView) {
      Project.webotsView.close();
      document.querySelector('#main-container').classList.remove('webotsView');
    }
    super.setup(title, content, fullpage);
  }
  findGetParameter(parameterName) {
    let result;
    let tmp = [];
    let items = window.location.search.substr(1).split('&');
    for (let index = 0; index < items.length; index++) {
      tmp = items[index].split('=');
      if (tmp[0] === parameterName)
        result = decodeURIComponent(tmp[1]);
    }
    return result;
  }
  setupWebotsView(page, data) {
    const view = (!Project.webotsView)
      ? '<webots-view id="webots-view" style="height:100%; width:100%; display:block;"></webots-view>' : '';
    let template = document.createElement('template');
    template.innerHTML = `<section class="section" style="padding:0;height:100%">
      <div class="container" id="webots-view-container">${view}</div>`;
    if (data) {
      const description = data.description.replace('\n', '<br>\n');
      template.innerHTML += `<div><h1 class="subtitle" style="margin:10px 0">${data.title}</h1>${description}</div>`;
    }
    template.innerHTML += '</section>';
    this.setup(page, template.content);
    if (!Project.webotsView)
      Project.webotsView = document.querySelector('webots-view');
    else
      document.querySelector('#webots-view-container').appendChild(Project.webotsView);
    document.querySelector('#main-container').classList.add('webotsView');
  }
  setupPreviewWebotsView() {
    if (Project.webotsView) {
      Project.webotsView.close();
      document.getElementById('competition-preview-container').innerHTML = '';
      document.getElementById('competition-preview-container').appendChild(Project.webotsView);
    } else {
      document.getElementById('competition-preview-container').innerHTML = '<webots-view id="webots-view"></webots-view>';
      Project.webotsView = document.querySelector('webots-view');
    }
  }
  runWebotsView(data, version) {
    let that = this;
    let reference;
    const url = this.findGetParameter('url');
    const mode = this.findGetParameter('mode');
    if (!version || version === 'undefined') {
      if (window.location.hostname === 'testing.webots.cloud')
        version = 'testing';
      else
        version = data ? data.version : this.findGetParameter('version');
    }
    version = 'benchmark';
    const src = 'https://cyberbotics.com/wwi/' + version + '/WebotsView.js';

    if (!data)
      that._updateSimulationViewCount(url);

    let promise = new Promise((resolve, reject) => {
      let script = document.getElementById('webots-view-version');

      if (!script || (script && script.src !== src)) {
        if (script && script.src !== src) {
          script.remove();
          window.location.reload();
        }
        script = document.createElement('script');
        script.type = 'module';
        script.id = 'webots-view-version';
        script.src = src;
        script.onload = () => {
          this._loadContent(data, resolve);
        };
        script.onerror = () => {
          console.warn(
            'Could not find Webots version, reloading with R2022b instead. This could cause some unwanted behaviour.');
          script.remove();
          this.runWebotsView(data, 'R2022b'); // if release not found, default to R2022b
        };
        document.body.appendChild(script);
      } else
        this._loadContent(data, resolve);
    });

    promise.then(() => {
      if (document.querySelector('#user-menu')) {
        if (this.email && this.password) {
          document.querySelector('#user-menu').style.display = 'auto';
          document.querySelector('#log-in').style.display = 'none';
          document.querySelector('#sign-up').style.display = 'none';
          this.updateDisplayName();
        } else {
          document.querySelector('#user-menu').style.display = 'none';
          document.querySelector('#log-in').style.display = 'flex';
          document.querySelector('#sign-up').style.display = 'flex';
        }
        if (this.email === '!')
          this.login();
      }
    });
  }
  _loadContent(data, resolve) {
    // if data empty -> demo or competition simulation
    // if data is object -> scene or animation
    const url = this.findGetParameter('url');
    const mode = this.findGetParameter('mode');
    const type = this.findGetParameter('type');
    if (!data) this._updateSimulationViewCount(url);
    if (type === 'competition') {
      const [, , , username, repo, , branch] = this.competitionUrl.split('/');
      const thumbnailUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/preview/thumbnail.jpg`;
      if (data) {
        // if there is animation data, it is the preview window or a user performance
        if (data.includes('wb_animation_'))  // user performance view
          this.setupWebotsView('run');
        else
          this.setupPreviewWebotsView();

        Project.webotsView.loadAnimation(`${data}/scene.x3d`, `${data}/animation.json`, false,
          this._isMobileDevice(), `${thumbnailUrl}`);
        resolve();
      } else {
        // if there is no data, it is a testing simulation
        this.setupWebotsView('run');
        Project.webotsView.connect('https://' + window.location.hostname + '/ajax/server/session.php?url=' + url, mode,
          false, undefined, 300, thumbnailUrl);
        Project.webotsView.showQuit = false;
        Project.webotsView.showWorldSelection = false;
        resolve();
      }
    } else if (data) {
      // scene or animation
      const reference = 'storage' + data.url.substring(data.url.lastIndexOf('/'));
      this.setupWebotsView(data.duration > 0 ? 'animation' : 'scene', data);
      if (data.duration > 0) {
        Project.webotsView.loadAnimation(`${reference}/scene.x3d`, `${reference}/animation.json`, false,
          this._isMobileDevice(), `${reference}/thumbnail.jpg`);
      } else
        Project.webotsView.loadScene(`${reference}/scene.x3d`, this._isMobileDevice(), `${reference}/thumbnail.jpg`);
      resolve();
    } else { // demo simulation
      this.setupWebotsView('run');
      let dotIndex = url.lastIndexOf('/') + 1;
      let thumbnailUrl = (url.slice(0, dotIndex) + '.' + url.slice(dotIndex))
        .replace('github.com', 'raw.githubusercontent.com').replace('/blob', '').replace('.wbt', '.jpg');
      Project.webotsView.connect('https://' + window.location.hostname + '/ajax/server/session.php?url=' + url, mode,
        false, undefined, 300, thumbnailUrl);
      Project.webotsView.showQuit = false;
      resolve();
    }
  }
  _updateSimulationViewCount(url) {
    fetch('/ajax/project/list.php', {method: 'post', body: JSON.stringify({url: url})})
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.error)
          console.warn(data.error);
      });
  }
  _isMobileDevice() {
    // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}
Project.current = null;
Project.webotsView = null;
