import Project from './project.js';
import Simulation from './simulation.js';
import ModalDialog from './modal_dialog.js';

document.addEventListener('DOMContentLoaded', function() {
  let simulation = new Simulation('webots');
  Project.run('webots.cloud', footer(), [
    {url: '/', setup: homePage},
    {url: '/simulation', setup: simulationPage}]);

  function footer() {
    let template = document.createElement('template');
    template.innerHTML =
`<footer class="footer">
  <div class="content has-text-centered">
    <p><strong><a class="has-text-white" href="/">webots.cloud</a></strong></p>
    <p class="has-text-white">webots simulations running in the cloud.</p>
  </div>
</footer>`;
    return template.content.firstChild;
  }

  function homePage(project) {
    console.log('homePage()');
    const template = document.createElement('template');
    template.innerHTML =
`<section class="section">
  <div class="container">
    <table class="table">
      <thead>
        <tr>
          <th title="Number of GitHub stars"><i class="far fa-star"></i></th>
          <th title="Title of the simulation">Title</th>
          <th title="Last update time">Updated</th>
          <th title="GitHub repository"><i class="fas fa-code-branch"></i></th>
          <th title="GitHub repository"><i class="fab fa-github"></i></th>
          <th title="animation playback"><i class="fas fa-film" style="color: grey"></i></th>
          <th title="simulation run"><i class="fas fa-play" style="color: grey"></i></th>
          <th title="GitHub synchronization"><i class="fas fa-sync"></i></th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
    <button class="button" id="add-a-new-project">Add a new entry</button>
  </div>
</section>`;
    project.setup('home', [], template.content);
    project.content.querySelector('#add-a-new-project').addEventListener('click', function(event) {
      let content = {};
      content.innerHTML =
        `<div class="field">
  <label class="label">Webots world file</label>
  <div class="control has-icons-left">
    <input id="world-file" class="input" type="url" required placeholder="https://github.com/my_name/my_project/blob/tag_or_branch/worlds/file.wbt" value="https://github.com/">
    <span class="icon is-small is-left">
      <i class="fab fa-github"></i>
    </span>
  </div>
  <div class="help">Blob reference in a public GitHub repository, including tag or branch information, for example:<br>
    <a target="_blank" href="https://github.com/cyberbotics/webots/blob/R2020a/projects/languages/python/worlds/example.wbt">
      https://github.com/cyberbotics/webots/blob/R2020a/projects/languages/python/worlds/example.wbt
    </a>
  </div>
</div>
<div class="field">
  <label class="label">Tag or Branch?</label>
  <div class="control">
    <span class="icon is-small is-left"><i class="fas fa-code-branch"></i></span><span> &nbsp; </span>
    <label class="radio">
      <input type="radio" name="branch" required checked> Tag
    </label>
    <label class="radio">
      <input type="radio" name="branch" required> Branch
    </label>
  </div>
  <div class="help">Specify if the above blob corresponds to a git tag (recommended) or a git branch.</div>
</div>`;
      let modal = ModalDialog.run('Add a project', content.innerHTML, 'Cancel', 'Add');
      let input = modal.querySelector('#world-file');
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        const worldFile = modal.querySelector('#world-file').value.trim();
        if (!worldFile.startsWith('https://github.com/')) {
          modal.error('The world file should start with "https://github.com/".');
          return;
        }
        const branchOrTag = modal.querySelector('input[type="radio"]').checked ? 'tag' : 'branch';
        const n = worldFile.split('/', 5).join('/').length;
        const url = 'webots' + worldFile.substring(5, n + 1) + branchOrTag + worldFile.substring(n + 5); // skipping "/blob"
        const content = {
          method: 'post',
          body: JSON.stringify({
            url: url
          })
        };
        console.log('url=' + url);
        fetch('/ajax/create.php', content)
          .then(function(response) {
            console.log(response);
            return response.json();
          })
          .then(function(data) {
            if (data.error) {
              console.log(data.error);
              modal.error(data.error);
            } else {
              modal.close();
              let project = {};
              project.id = data.id;
              project.title = data.title;
              project.url = url;
              let template = document.createElement('template');
              template.innerHTML = addProject(project);
              that.content.querySelector('#project-table').appendChild(template.content.firstChild);
              that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
              that.content.querySelector('#run-x3d---' + project.id).addEventListener('click', runProject);
              that.content.querySelector('#run-mjpeg-' + project.id).addEventListener('click', runProject);
              projectCount++;
              updateProjectCount();
            }
          });
      });
    });
    /*
    if (data.projects && data.projects.length > 0) {
      data.projects.forEach(function(project, index) {
        that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
        that.content.querySelector('#run-x3d---' + project.id).addEventListener('click', runProject);
        that.content.querySelector('#run-mjpeg-' + project.id).addEventListener('click', runProject);
      });
    }
    */
  }

  function simulationPage(project) {
    project.setup('simulation', [], simulation.content(), true);
    simulation.run();
  }
});
