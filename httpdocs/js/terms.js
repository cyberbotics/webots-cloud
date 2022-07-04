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
            <h2 class="subtitle pt-3 pb-3">Introduction</h2>
            <p>
              The website https://webots.cloud (“webots.cloud”) is created, developed and operated by Cyberbotics Sàrl, 
              headquartered at EPFL Innovation Park, Building C, 1015 Lausanne, Switzerland, registered with the Swiss UID 
              CHE-104.504.228 (hereinafter “Cyberbotics” or “we”). </br> These Terms of Service are a legal agreement between 
              you and Cyberbotics. They apply to your use of our services.
            </p>
          </div>
        </section>`
      project.setup('terms-of-use', [], template.content);
    }
  }
}
