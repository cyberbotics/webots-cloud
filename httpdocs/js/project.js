import ModalDialog from './modal_dialog.js';
import Router from './router.js';

export default class Project extends Router {
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.load();
  }
  static run(title, footer, routes) {
    Project.current = new Project(title, footer, routes);
    return Project.current;
  }
  dynamicPage(url, pushHistory) {
    console.log('project.dynamicPage(): ' + url.pathname);
    let that = this;
    let promise = new Promise((resolve, reject) => {
      if (!url.pathname.startsWith('/a') && url.pathname.length != 12) {
        that.notFound();
        resolve();
      }
      const content = {
        method: 'post',
        body: JSON.stringify({
          id: url.pathname.substring(2)
        })
      };
      console.log('fetch /ajax/animation/list.php');
      fetch('/ajax/animation/list.php', content)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (pushHistory)
            window.history.pushState(null, name, url.pathname + url.search + url.hash);
          console.log(data);
          if (data.length == 0) { // no such animation
            that.notFound();
            resolve();
          } else {
            that.animationPage(data[0]);
            resolve();
          }
        });
    });
    return promise;
  }
  animationPage(data) {
    let that = this;
    let template = document.createElement('template');
    const reference = data.url.substring(data.url.search('/animations/') + 12);
    console.log('reference = ' + reference);
    template.innerHTML =
`<section class="section" style="padding-top:20px">
  <div class="container" style="height:540px">
    <webots-animation style="height:100%; width:100%; display:block;" title="${reference}/animation" playWhenReady=true></webots-animation>
  </div>
  <div>
    <h1 class="subtitle" style="margin:10px 0">${data.title}</h1>
    Description<br>
    Blahblah<br>
    Etc<br>
  </div>
</section>`;
    that.setup('animation', [], template.content);
  }
}
Project.current = null;
