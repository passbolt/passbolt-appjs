/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.4.0
 */
import Component from 'passbolt-mad/component/component';
import template from '../../view/template/component/mfa/mfa_required.stache';

const MfaRequiredComponent = Component.extend('passbolt.component.mfa.MfaRequired', /** @static */ {

  defaults: {
    label: 'Multi Factor Authentication Expired Controller',
    url: null,
    template: template,
    timeToRedirect: 5000,
    countDownInterval: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const initialTime = new Date().getTime();

    // Check every second if the time to wait before redirection has been consumed.
    this.options.countDownInterval = setInterval(() => {
      const elapsedTime = new Date().getTime() - initialTime;
      if (elapsedTime > this.options.timeToRedirect) {
        clearInterval(this.options.countDownInterval);
        location.href = APP_URL + this.options.url;
      }
    }, 1000);
  },

  /**
   * The mfa required component has been destroyed.
   */
  destroy: function() {
    if (this.options.countDownInterval != null) {
      clearInterval(this.options.countDownInterval);
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * The user clicked on the Redirect now button
   */
  ' .submit-wrapper input click': function() {
    clearInterval(this.options.countDownInterval);
    location.href = APP_URL + this.options.url;
  }
});

export default MfaRequiredComponent;
