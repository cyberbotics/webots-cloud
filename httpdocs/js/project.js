import User from './user.js';

export default class Project extends User {
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.load();
  }
  static run(title, version, footer, routes) {
    let script = document.createElement('script');
    script.type = 'module';
    script.id = 'webots-view-version';
    script.src = 'https://cyberbotics.com/wwi/' + version +'/WebotsView.js';
    //script.onload = console.log(script.src.substring(28, 34) + " files loaded.");
    script.onload = function() {
      Project.current = new Project(title, footer, routes);
    }
    document.body.appendChild(script);
    return Project.current;
  }
  dynamicPage(url, pushHistory) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      if (!url.pathname.startsWith('/A') && !url.pathname.startsWith('/M') && url.pathname.length != 8) {
        that.notFound();
        resolve();
      }
      fetch('/ajax/animation/list.php', {method: 'post',body: JSON.stringify({url: url, type: url.pathname[1]})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (pushHistory)
            window.history.pushState(null, name, url.pathname + url.search + url.hash);
          if (data.error) { // no such animation
            that.notFound();
            resolve();
          } else {
            that.animationPage(data);
            resolve();
          }
        });
    });
    return promise;
  }
  setup(title, anchors, content, fullpage = false) {
    if (Project.webotsView) {
      Project.webotsView.close();
      document.querySelector('#main-container').classList.remove('webotsView');
    }
    super.setup(title, anchors, content, fullpage);
  }
  findGetParameter(parameterName) {
    let result = undefined;
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
    const view = (!Project.webotsView) ? '<webots-view id="webots-view" style="height:100%; width:100%; display:block;"></webots-view>' : '';
    let template = document.createElement('template');
    template.innerHTML = `<section class="section" style="padding:0;height:100%">
<div class="container" id="webots-view-container">${view}</div>`
    if (data) {
      const description = data.description.replace('\n', '<br>\n');
      template.innerHTML += `<div><h1 class="subtitle" style="margin:10px 0">${data.title}</h1>${description}</div>`;
    }
    template.innerHTML += '</section>';
    this.setup(page, [], template.content);
    if (!Project.webotsView)
      Project.webotsView = document.querySelector('webots-view');
    else
      document.querySelector('#webots-view-container').appendChild(Project.webotsView);
    document.querySelector('#main-container').classList.add('webotsView');
  }
  animationPage(data) {
    const reference = 'storage' + data.url.substring(data.url.lastIndexOf('/'));
    this.setupWebotsView(data.duration > 0 ? 'animation' : 'scene', data);
    if (data.duration > 0)
      Project.webotsView.loadAnimation(`${reference}/scene.x3d`, `${reference}/animation.json`);
    else
      Project.webotsView.loadScene(`${reference}/scene.x3d`);
  }
  runPage() {
    this.setupWebotsView('run');
    const url = this.findGetParameter('url');
    const mode = this.findGetParameter('mode');
    Project.webotsView.connect('https://testing.webots.cloud/ajax/server/session.php?url=' + url, mode, false, undefined, 300);
    Project.webotsView.showQuit = false;
  }
}
Project.current = null;
Project.webotsView = null;
