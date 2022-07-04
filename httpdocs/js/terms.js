export default class Terms {
  constructor(routes, project) {
    console.log("Creating terms.");
    routes.push({url: '/terms-of-use', setup: termsOfUsePage});
    function termsOfUsePage() {
      const template = document.createElement('template');
      template.innerHTML =
        `<section class="section">
          <div class="container">
            <h1 class="title pb-3"><i class="fa-solid fa-sm fa-shield-halved"></i> Terms of Use</h1>
            <h2 class="subtitle pt-3">Cyberbotics Ltd.</h2>
          </div>
        </section>`
      project.setup('terms-of-use', [], template.content);
    }
  }
}
