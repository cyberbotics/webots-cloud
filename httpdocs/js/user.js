import ModalDialog from './modal_dialog.js';
import Router from './router.js';

let md5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

export default class User extends Router {
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.routes.push({url: '/settings', setup: settingsPage});
    let that = this;
    function findGetParameter(parameterName) {
      let result = null;
      let tmp = [];
      let items = location.search.substr(1).split('&');
      for (let index = 0; index < items.length; index++) {
        tmp = items[index].split('=');
        if (tmp[0] === parameterName)
          result = decodeURIComponent(tmp[1]);
      }
      return result;
    }
    function resetPassword(id, token, email) {
      let content = {};
      content.innerHTML =
`<div class="field">
<label class="label">E-mail</label>
<div class="control has-icons-left">
  <input class="input" type="email" required readonly value="${email}">
  <span class="icon is-small is-left">
    <i class="fas fa-envelope"></i>
  </span>
</div>
</div>
<div class="field">
<label class="label">Password</label>
<div class="control has-icons-left">
  <input id="choose-password" class="input" type="password" required autocomplete=new-password>
  <span class="icon is-small is-left">
    <i class="fas fa-lock"></i>
  </span>
</div>
<div id="choose-password-help" class="help">
  8 characters minimum, including at least a lowercase letter, an uppercase letter, a number and a symbol.
</div>
</div>
<div class="field">
<label class="label">Password (confirm)</label>
<div class="control has-icons-left">
  <input id="choose-confirm-password" class="input" type="password" required>
  <span class="icon is-small is-left">
    <i class="fas fa-lock"></i>
  </span>
</div>
<div id="choose-confirm-help" class="help">&nbsp;</div>
</div>`;
      let choose = ModalDialog.run('Choose a password', content.innerHTML, 'Cancel', 'Ok');
      choose.querySelector('#choose-password').focus();
      choose.querySelector('button[type="submit"]').disabled = true;
      choose.querySelector('#choose-password').value = '';
      choose.querySelector('#choose-password').addEventListener('change', checkPasswordMatch);
      choose.querySelector('#choose-password').addEventListener('input', checkPasswordMatch);
      choose.querySelector('#choose-confirm-password').addEventListener('change', checkPasswordMatch);
      choose.querySelector('#choose-confirm-password').addEventListener('input', checkPasswordMatchInput);
      let testPasswordMatch = false;
      let validPassword = false;
      function checkPasswordMatchInput(event) {
        const password = choose.querySelector('#choose-password').value;
        const confirm = choose.querySelector('#choose-confirm-password').value;
        if (confirm.length === 0) {
          choose.querySelector('#choose-confirm-help').innerHTML = '&nbsp;';
          testPasswordMatch = false;
          choose.querySelector('button[type="submit"]').disabled = true;
        }
        if (confirm.length === password.length || testPasswordMatch) {
          testPasswordMatch = true;
          checkPasswordMatch(event);
        }
      }
      function checkPasswordMatch(event) {
        const password = choose.querySelector('#choose-password').value;
        const confirm = choose.querySelector('#choose-confirm-password').value;
        if (event.type === 'input') {
          let length = password.length;
          let message = '';
          if (length < 8)
            message = '8 characters minimum';
          let numberCount = 0;
          let uppercaseCount = 0;
          let lowercaseCount = 0;
          for (let i = 0; i < length; i++) {
            if (password[i] >= '0' && password[i] <= '9')
              numberCount++;
            else if (password[i] >= 'A' && password[i] <= 'Z')
              uppercaseCount++;
            else if (password[i] >= 'a' && password[i] <= 'z')
              lowercaseCount++;
          }
          let symbolCount = length - numberCount - uppercaseCount - lowercaseCount;
          if (lowercaseCount === 0 || uppercaseCount === 0 || numberCount === 0 || symbolCount === 0) {
            if (message === '')
              message = 'Missing ';
            else
              message += ', including at least ';
          }
          if (lowercaseCount === 0)
            message += 'a lowercase letter';
          if (uppercaseCount === 0) {
            if (lowercaseCount === 0) {
              if (numberCount > 0 && symbolCount > 0)
                message += ' and ';
              else
                message += ', ';
            }
            message += 'an uppercase letter';
          }
          if (numberCount === 0) {
            if (lowercaseCount === 0 || uppercaseCount === 0) {
              if (symbolCount > 0)
                message += ' and ';
              else
                message += ', ';
            }
            message += 'a number';
          }
          if (symbolCount === 0) {
            if (lowercaseCount === 0 || uppercaseCount === 0 || numberCount === 0)
              message += ' and ';
            message += 'a symbol';
          }
          const help = choose.querySelector('#choose-password-help');
          if (message === '') {
            validPassword = true;
            message = 'Valid password.';
            help.classList.remove('is-danger');
            help.classList.add('is-success');
          } else {
            help.classList.add('is-danger');
            help.classList.remove('is-success');
            validPassword = false;
            message += '.';
          }
          help.innerHTML = message;
        }
        if (!confirm)
          return;
        const help = choose.querySelector('#choose-confirm-help');
        const button = choose.querySelector('button[type="submit"]');
        if (password !== confirm) {
          help.classList.add('is-danger');
          help.classList.remove('is-success');
          help.innerHTML = 'Passwords mismatch: please re-enter carefully your password.';
          button.disabled = true;
        } else {
          help.classList.remove('is-danger');
          help.classList.add('is-success');
          help.innerHTML = 'Confirmed password.';
          if (validPassword)
            button.disabled = false;
        }
      }
      choose.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        choose.querySelector('button[type="submit"]').classList.add('is-loading');
        that.sha256Hash(choose.querySelector('#choose-password').value + that.title).then(function(hash) {
          fetch('/ajax/user/password.php', { method: 'post', body: JSON.stringify({id: id, token: token, password: hash})})
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              choose.close();
              if (data.error)
                ModalDialog.run('Account activation error', data.error);
              else {
                if (data.status === 0)
                  ModalDialog.run('Welcome to ' + that.title, '<p>Your new account is up-and-ready.</p>');
                else if (data.status === 1)
                  ModalDialog.run('Password changed', '<p>Your password was successfully changed.</p>');
                else
                  console.log('Error: ' + data.status);
                that.email = email;
                that.password = hash;
                that.login();
              }
            });
        });
      });
    }
    function settingsPage() {
      // we need to be logged in to view this page
      if (!that.password || !that.email)
        return false;
      const template = document.createElement('template');
      template.innerHTML =
`<section class="section">
  <div class="container">
    <h1 class="title pb-3"><i class="fas fa-cog"></i> Settings</h1>
    <h2 class="subtitle pt-3">${that.email}</h2>
  </div>
</section>
<section class="section" style="margin-top:0;padding-top:0">
  <div class="container panel">
    <p class="panel-heading">Change password</p>
    <div class="panel-block">
      We will send you a e-mail with a link to reset your password.
    </div>
    <div class="panel-block">
      <button class="button is-link" id="change-password">Change password</button>
    </div>
  </div>
  <div class="container panel">
    <p class="panel-heading">Delete Account</p>
    <div class="panel-block">
      <i class="fas fa-exclamation-triangle"></i> &nbsp; Once you delete your account, there is no going back. Please be certain.
    </div>
    <div class="panel-block">
      <button class="button is-danger" id="delete-account">Delete my account</button>
    </div>
  </div>
</section>`;
      that.setup('settings', [], template.content);
      document.querySelector('#change-password').addEventListener('click', function(event) {
        event.target.classList.add('is-loading');
        that.forgotPassword(that.email, function() { event.target.classList.remove('is-loading'); });
      });
      document.querySelector('#delete-account').addEventListener('click', function(event) {
        let dialog = ModalDialog.run('Really delete account?', '<p>All your data will be deleted from our database.</p>' +
                                     '<p>There is no way to recover deleted data.</p>', 'Cancel', 'Delete Account', 'is-danger');
        dialog.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          dialog.querySelector('button[type="submit"]').classList.add('is-loading');
          fetch('/ajax/user/delete.php', { method: 'post', body: JSON.stringify({email: that.email, password: that.password})})
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              dialog.close();
              if (data.error)
                ModalDialog.run('Error', data.error);
              else {
                ModalDialog.run('Account deleted',
                  '<p>Your account was successfully deleted.</p><p>All you data was erased.</p>');
                that.password = null;
                that.email = null;
                that.load('/');
              }
            });
        });
      });
    }
    this.load();
    // account creation: entering the password
    const token = findGetParameter('token');
    if (token) {
      const id = findGetParameter('id');
      const email = findGetParameter('email');
      if (id && email)
        resetPassword(id, token, email);
    }
  }
  load(page = null, pushHistory = true) {
    let that = this;
    super.load(page, pushHistory).then(() => {
      if (document.querySelector('#user-menu')) {
        if (that.email && that.password) {
          document.querySelector('#user-menu').style.display = 'flex';
          document.querySelector('#log-in').style.display = 'none';
          document.querySelector('#sign-up').style.display = 'none';
        } else {
          document.querySelector('#user-menu').style.display = 'none';
          document.querySelector('#log-in').style.display = 'flex';
          document.querySelector('#sign-up').style.display = 'flex';
        }
        if (that.email === '!')
          that.login();
      }
    });
  }
  setup(title, anchors, content, fullpage = false) {
    super.setup(title, anchors, content, fullpage);
    let navbarEnd = document.body.querySelector('.navbar-end');
    navbarEnd.parentNode.replaceChild(this.menu(), navbarEnd);
  }
  menu() {
    let div = document.createElement('div');
    div.setAttribute('class', 'navbar-end');
    const md5sum = md5(this.email);
    div.innerHTML =
`<div class="navbar-item">
  <div class="buttons">
    <a class="button is-small is-success" id="sign-up">
      <strong>Sign up</strong>
    </a>
    <a class="button is-small is-light" id="log-in">
      Log in
    </a>
  </div>
</div>
<div id="user-menu" class="navbar-item has-dropdown is-hoverable">
  <a class="navbar-link" id="email"><img src="https://www.gravatar.com/avatar/${md5sum}.jpg"></a>
  <div class="navbar-dropdown is-boxed">
    <a class="navbar-item" href="/settings"><i class="fas fa-cog"> &nbsp; </i>Settings</a>
    <a class="navbar-item" href="/${this.email}" id="projects"><i class="fas fa-folder"> &nbsp; </i>Projects</a>
    <div class="navbar-divider"></div>
    <a class="navbar-item" id="log-out"><i class="fas fa-power-off"> &nbsp; </i>Log out</a>
  </div>
</div>`;
    let that = this;

    div.querySelector('a#log-out').addEventListener('click', function(event) {
      that.password = null;
      if (window.location.pathname === '/settings')
        that.load('/');
      else
        that.load();
    });

    div.querySelector('a#sign-up').addEventListener('click', function(event) {
      event.preventDefault();
      let content = {};
      content.innerHTML =
`<div class="field">
  <label class="label">E-mail</label>
  <div class="control has-icons-left">
    <input id="sign-up-email" class="input" type="email" required placeholder="Enter your e-mail address">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
  </div>
  <div id="sign-up-email-help" class="help">We will send you an e-mail to verify this address.</div>
</div>`;
      let modal = ModalDialog.run('Sign up', content.innerHTML, 'Cancel', 'Sign up');
      modal.querySelector('#sign-up-email').focus();
      modal.querySelector('#sign-up-email').addEventListener('change', function(event) {
        event.target.setCustomValidity('');
        const email = event.target.value;
        const help = modal.querySelector('#sign-up-email-help');
        // check if e-mail address is valid
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(email).toLowerCase())) {
          help.innerHTML = 'This e-mail address is invalid.';
          help.classList.add('is-danger');
          help.classList.remove('is-success');
          return;
        }
        // check if this e-mail address is not already registered
        fetch('/ajax/user/uniqueness.php', { method: 'post', body: JSON.stringify({field: 'email', value: email})})
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error) {
              help.innerHTML = data.error;
              event.target.setCustomValidity(data.error);
              help.classList.add('is-danger');
              help.classList.remove('is-success');
            } else if (data.status === 'OK') {
              help.innerHTML = 'This e-mail address is available for registration.';
              help.classList.add('is-success');
              help.classList.remove('is-danger');
            }
          });
      });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = modal.querySelector('#sign-up-email').value;
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('/ajax/user/sign-up.php', {
          method: 'post',
          body: JSON.stringify({email: email})})
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            modal.close();
            if (data.error)
              ModalDialog.run('Error', data.error);
            else {
              ModalDialog.run('Thank you!',
                'An e-mail was just sent to you to verify your address.<br />' +
                'Click on the link in the e-mail to set a password and activate your account.');
            }
          });
      });
    });

    div.querySelector('a#log-in').addEventListener('click', function(event) {
      event.preventDefault();
      let content = {};
      content.innerHTML =
`<div class="field">
  <label class="label">E-mail</label>
  <div class="control has-icons-left">
    <input id="log-in-email" class="input" type="email" required placeholder="Enter your e-mail address">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
  </div>
</div>
<div class="field">
  <label class="label">Password</label>
  <div class="control has-icons-left">
    <input id="log-in-password" class="input" type="password" required>
    <span class="icon is-small is-left">
      <i class="fas fa-lock"></i>
    </span>
  </div>
  <div class="has-text-right"><a id="log-in-forgot" class="help">Forgot your password?</a></div>
</div>
<p id="log-in-help" class="help"></p>`;
      let modal = ModalDialog.run('Log in', content.innerHTML, 'Cancel', 'Log in');
      modal.querySelector('#log-in-email').focus();
      modal.querySelector('#log-in-forgot').addEventListener('click', function(event) {
        modal.close();
        let content = {};
        content.innerHTML =
`<div class="field">
  <label class="label">E-mail</label>
  <div class="control has-icons-left">
    <input id="forgot-email" class="input" type="email" required placeholder="Enter your e-mail address"
     value="${modal.querySelector('#log-in-email').value}">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
  </div>
</div>`;
        let forgot = ModalDialog.run('Forgot your password?', content.innerHTML, 'Cancel', 'Reset Password');
        forgot.querySelector('#forgot-email').focus();
        forgot.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          forgot.querySelector('button[type="submit"]').classList.add('is-loading');
          that.forgotPassword(forgot.querySelector('#forgot-email').value, function() { forgot.close(); });
        });
      });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        let email = modal.querySelector('#log-in-email').value;
        let password = modal.querySelector('#log-in-password').value;
        that.email = email;
        that.sha256Hash(password + that.title).then(function(hash) {
          that.password = hash;
          that.login(function(error) {
            modal.querySelector('#log-in-help').innerHTML = error; // "Your e-mail or password is wrong, please try again.";
          }, function(success) {
            modal.close();
          }, true);
        });
      });
    });
    return div;
  }
  login(error = null, success = null, reload = false) {
    if (this.email && this.password) {
      document.querySelector('#user-menu').style.display = 'none';
      document.querySelector('#log-in').style.display = 'none';
      document.querySelector('#sign-up').style.display = 'none';
      let that = this;
      fetch('/ajax/user/authenticate.php', { method: 'post', body: JSON.stringify({email: this.email, password: this.password})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error) {
            that.password = null;
            if (error)
              error(data.error);
            else
              ModalDialog.run('Error', data.error);
            that.email = '!';
            that.load('/');
          } else {
            document.querySelector('#user-menu').style.display = 'flex';
            document.querySelector('#log-in').style.display = 'none';
            document.querySelector('#sign-up').style.display = 'none';
            if (reload) // the page content may need to be updated after loging in.
              that.load();
            if (success)
              success();
          }
        });
    }
  }
  async sha256Hash(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  forgotPassword(email, callback = null) {
    fetch('/ajax/user/forgot.php', { method: 'post', body: JSON.stringify({email: email})})
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (callback)
          callback();
        if (data.error)
          ModalDialog.run('Error', data.error);
        else {
          ModalDialog.run('Password reset',
            'An e-mail with a password reset link was just sent to you.<br />Check your inbox now.');
        }
      });
  }
  get email() {
    return window.localStorage.getItem('email');
  }
  set email(value) {
    if (value === null)
      window.localStorage.removeItem('email');
    else
      window.localStorage.setItem('email', value);
  }
  get password() {
    return window.localStorage.getItem('password');
  }
  set password(value) {
    if (value === null)
      window.localStorage.removeItem('password');
    else
      window.localStorage.setItem('password', value);
  }
}
