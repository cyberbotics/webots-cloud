export default class Terms {
  constructor() {
    this.routes.push({url: '/terms-of-use', setup: termsOfUsePage});
    let that = this;
    function termsOfUsePage() {
      const template = document.createElement('template');
      template.innerHTML =
        `<section class="section">
          <div class="container">
            <h1 class="title pb-3"><i class="fas fa-pencil-square-o></i> Terms of Use</h1>
            <h2 class="subtitle pt-3">Cyberbotics Ltd.</h2>
          </div>
        </section>`
      that.setup('terms-of-use', [], template.content);
    }
  }
}
