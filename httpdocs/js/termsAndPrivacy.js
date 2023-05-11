export default class TermsAndPrivacy {
  constructor(routes, project) {
    routes.push({ url: '/terms-of-service', setup: termsOfServicePage });
    routes.push({ url: '/privacy-policy', setup: privacyPolicyPage });
    function termsOfServicePage() {
      const template = document.createElement('template');
      template.innerHTML =
        `<section class="section">
          <div class="container content">
            <h1 class="title pb-3"><i class="fa-solid fa-sm fa-shield-halved"></i> Terms of Service</h1>
            <ul>
              <li>Effective: 7 July 2022</li>
              <li>Last updated: 11 May 2023</li>
            </ul>
            <p>The <a target="_blank" href="https://webots.cloud">webots.cloud</a> website is created, developed and operated by
              Cyberbotics Sàrl, headquartered at EPFL Innovation Park, Building C, 1015 Lausanne, Switzerland, registered
              with the Swiss UID CHE-104.504.228 (hereinafter “Cyberbotics” or “we”). These Terms of Service are a legal
              agreement between you and Cyberbotics. They apply to your use of our services.</p>
            <h2 class="subtitle pt-4">Creating an account</h2>
            <p>In order to use our services, you may need to create an account with an e-mail address and a password. You are
              responsible for keeping your password secure. Our <a href="privacy-policy"
              onclick="document.getElementById('scrollable-body').scrollTo(0, 0);"> Privacy Policy</a> informs you on what
              information we collect and how we use it.</p>
            <h2 class="subtitle pt-4">Our services</h2>
            <p>We provide you with the following services:</p>
            <ul>
              <li>Upload any Webots world file (<a target="_blank" href="scene">scene</a>) and view it
                in 3D.</li>
              <li>Upload any Webots animation (<a target="_blank" href="animation">animation</a>) and
                play it back in 3D.</li>
              <li>Refer to a GitHub repository containing a Webots PROTO (<a target="_blank" href="proto">proto</a>) and
                visualize it.</li>
              <li>Refer to a GibHub repository containing a Webots competition scenario (<a target="_blank"
                href="competition">competition</a>) and run it.
              <li>Refer to a GitHub repository containing a Webots simulation (<a target="_blank"
                href="simulation">simulation</a>), run it in the cloud and visualize the result in real
                time.</li>
              <li>Register your own server (<a target="_blank" href="server">server</a>) to run simulations.</Li>
            </ul>
            <h2 class="subtitle pt-4">Your content</h2>
            <p>Your content includes the scenes, animations and simulations you provide. You are the owner of your content.
              By using our services, you agree that your scenes, animations and simulations visualizations are made publicly
              available under the terms of Creative Common license. We reserve the right to remove your content for any
              reason.</p>
            <h2 class="subtitle pt-4">Service availability</h2>
            <p>We do reasonable efforts to keep webots.cloud operational but we cannot guarantee it will be available at all
              times. We may for example need to perform maintenance or experience software or hardware problems.</p>
            <h2 class="subtitle pt-4">Applicable Law</h2>
            <p>These terms are subject to Switzerland law.</p>
            <h2 class="subtitle pt-4">How to contact us?</h2>
            <p>If you have any questions concerning the Terms of Service, please contact us at
              <a href="mailto: info@cyberbotics.com">info@cyberbotics.com</a>.</p>
          </div>
        </section>`;
      project.setup('terms-of-service', template.content);
    }
    function privacyPolicyPage() {
      const template = document.createElement('template');
      template.innerHTML =
        `<section class="section">
          <div class="container content">
            <h1 class="title pb-3"><i class="fa-solid fa-sm fa-lock"></i> Privacy Policy</h1>
            <ul>
              <li>Effective: 7 July 2022</li>
              <li>Last updated: 7 July 2022</li>
            </ul>
            <p>The <a target="_blank" href="https://webots.cloud">webots.cloud</a> website is created, developed and operated by
              Cyberbotics Sàrl, headquartered at EPFL Innovation Park, Building C, 1015 Lausanne, Switzerland, registered
              with the Swiss UID CHE-104.504.228 (hereinafter “Cyberbotics” or “we”). We are committed to protect and respect
              your privacy while using our services through <a target="_blank" href="https://webots.cloud">webots.cloud</a>.
              This privacy policy explains how we manage data that identifies you (the "personal data") when you use our
              services. We recommend that you read this entire policy before using our services.</p>
            <h2 class="subtitle pt-4">What personal data do we collect?</h2>
            <h4>Information you provide to us</h4>
            <ul>
              <li>Account information: e-mail address and password hash when you create an account.</br>
                What is the password hash?</br>
                The password hash is a text string computed from your password using an encryption algorithm (the hashing
                function) when you create an account. We store it in our database. Then, when you log into your account, the
                entered password is run through the same hashing function. The new hash is compared to the stored hash. If
                they match, you are granted access to your account. It is almost impossible for hackers to generate the
                password from the password hash.</li>
              <li>Content you create: any content that you may upload to webots.cloud.</li>
              <li>Other information you provide directly to us: when you contact us by e-mail for example.</li>
            </ul>
            <h4>Information we collect automatically</h4>
            <ul>
              <li>Information about your device: your Internet Protocol (IP) address.</li>
            </ul>
            <h4>Cookies</h4>
            <ul>
              <li>We don't use any cookies. Instead we use the more privacy-oriented local storage web technology.</li>
            </ul>
            <h2 class="subtitle pt-4">For which purpose do we collect your personal data?</h2>
            <ul>
              <li>To provide you with our services: create and manage your account, display the content you upload.</li>
              <li>To contact you when needed.</li>
              <li>To provide customer service.</li>
            </ul>
            <p>We do not sell your data. </p>
            <h2 class="subtitle pt-4">How do we protect your personal data?</h2>
            <p>The information that you provide to us through our services is stored on our secured servers located in
              Switzerland.</p>
            <h2 class="subtitle pt-4">How long do we keep your personal data?</h2>
            <p>We keep your personal data only as long as it is necessary to provide you with our services. Then, your
              personal data may be archived or deleted.</p>
            <h2 class="subtitle pt-4">How to contact us?</h2>
            <p>If you have any questions concerning the Privacy Policy, please contact us at
              <a href="mailto: info@cyberbotics.com">info@cyberbotics.com</a>.</p>
          </div>
        </section>`;
      project.setup('privacy-policy', template.content);
    }
  }
}
