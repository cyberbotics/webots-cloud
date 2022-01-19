import ModalDialog from './modal_dialog.js';
import User from './user.js';

export default class Project extends User {
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.load();
  }
  static run(title, footer, routes) {
    Project.current = new Project(title, footer, routes);
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
    console.log('setup project');
    if (Project.webotsView && Project.webotsView.hasAnimation())
      Project.webotsView.close();
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
<div class="container" id="webotsViewContainer">${view}</div>`
    if (data) {
      const description = data.description.replace('\n', '<br>\n');
      template.innerHTML += `<div><h1 class="subtitle" style="margin:10px 0">${data.title}</h1>${description}</div>`;
    }
    template.innerHTML += '</section>';
    this.setup(page, [], template.content);
    if (!Project.webotsView)
      Project.webotsView = document.querySelector('webots-view');
    else
      document.querySelector('#webotsViewContainer').appendChild(Project.webotsView);
    console.log('append webots-view component');
  }
  animationPage(data) {
    const reference = 'storage' + data.url.substring(data.url.lastIndexOf('/'));
    this.setupWebotsView(data.duration > 0 ? 'animation' : 'scene', data);
    if (data.duration > 0)
      Project.webotsView.loadAnimation(`${reference}/scene.x3d`, `${reference}/animation.json`);
    else
      Project.webotsView.loadScene(`${reference}/scene.x3d`);
  }
  simulationPage() {
    this.setupWebotsView('simulation');
    const url = this.findGetParameter('url');
    const mode = this.findGetParameter('mode');
    Project.webotsView.connect('wss://cyberbotics1.epfl.ch/beta/session?url=' + url, mode);
    Project.webotsView.displayQuit(false);
  }
}
Project.current = null;
Project.webotsView = null;
