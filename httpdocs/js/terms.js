export default class Terms {
  constructor(routes) {
    routes.push({url: '/terms-of-use', setup: termsOfUsePage});
    let that = this;
    function termsOfUsePage() {
      const content = document.createElement('template');
      content.innerHTML =
        `<section class="section">
          <div class="container">
            <h1 class="title pb-3"><i class="fa-solid fa-sm fa-shield-halved"></i> Terms of Use</h1>
            <h2 class="subtitle pt-3">Cyberbotics Ltd.</h2>
          </div>
        </section>`
      document.head.querySelector('#title').innerHTML = 'terms-of-use';
      if (content.childNodes) {
        content.childNodes.forEach(function(item) {
          that.content.appendChild(item);
        });
      }
    }
  }
}
