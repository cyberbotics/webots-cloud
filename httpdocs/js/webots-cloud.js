import Project from './project.js';
import Simulation from './simulation.js';

document.addEventListener('DOMContentLoaded', function() {
  let simulation = new Simulation('webots');
  Project.run('webots.cloud', footer(), [
    {url: '/', setup: homePage},
    {url: '/simulation', setup: simulationPage}]);

  function footer() {
    let template = document.createElement('template');
    template.innerHTML =
`<footer class="footer" style="background: linear-gradient(0deg, rgba(15,43,87,1) 0%, rgba(50,115,220,1) 100%);">
  <div class="content has-text-centered">
    <p><strong><a class="has-text-white" href="/">webots.cloud</a></strong></p>
    <p class="has-text-white">webots simulations running in the cloud.</p>
  </div>
</footer>`;
    return template.content.firstChild;
  }

  function homePage(project) {
    const template = document.createElement('template');
    template.innerHTML =
`<section class="hero" style="background: linear-gradient(0deg, rgba(15,43,87,1) 0%, rgba(50,115,220,1) 90%);">
  <div class="hero-body">
    <div class="container">
      <h1 class="title has-text-white">webots.cloud</h1>
      <h2 class="subtitle has-text-white">Run webots simulations in the cloud</h2>
    </div>
  </div>
</section>
<a class="anchor" id="overview"></a>
<section class="section">
  <div class="container">
    <h1 class="title">Overview</h1>
  </div>
</section>`;
    project.setup('home', ['Overview', 'Simulations', 'Partners'], template.content);
  }

  function simulationPage(project) {
    project.setup('simulation', [], simulation.content(), true);
    simulation.run();
  }
});
