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
    if (Project.webotsView && Project.webotsView.hasAnimation())
      Project.webotsView.close();
    super.setup(title, anchors, content, fullpage);
  }
  animationPage(data) {
    let that = this;
    let template = document.createElement('template');
    const reference = 'storage' + data.url.substring(data.url.lastIndexOf('/'));
    const description = data.description.replace('\n', '<br>\n');
    const view = (!Project.webotsView) ? `<webots-view id="webots-view" style="height:100%; width:100%; display:block;"></webots-view>` : '';
    template.innerHTML =
`<section class="section" style="padding-top:20px">
  <div class="container" style="height:540px" id="webotsViewContainer">${view}</div>
  <div>
    <h1 class="subtitle" style="margin:10px 0">${data.title}</h1>
    ${description}
  </div>
</section>`;
    that.setup(data.duration > 0 ? 'animation' : 'scene', [], template.content);
    if (!Project.webotsView)
      Project.webotsView = document.querySelector('webots-view');
    else
      document.querySelector('#webotsViewContainer').appendChild(Project.webotsView);
    if (data.duration > 0)
      Project.webotsView.loadAnimation(`${reference}/scene.x3d`, `${reference}/animation.json`);
    else
      Project.webotsView.loadScene(`${reference}/scene.x3d`);
  }
}
Project.current = null;
Project.webotsView = null;
