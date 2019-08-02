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
 * @since         2.0.0
 */
import Component from 'passbolt-mad/component/component';
import template from '../../view/template/component/session/session_expired.stache';

const SessionExpiredComponent = Component.extend('passbolt.component.session.SessionExpired', /** @static */ {

  defaults: {
    label: 'Session Expired Controller',
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
        location.href = APP_URL;
      }
    }, 1000);
  },

  /**
   * The session expired component has been destroyed.
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
    location.href = APP_URL;
  }
});

export default SessionExpiredComponent;
