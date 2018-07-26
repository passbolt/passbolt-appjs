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
import AppAjax from 'app/net/ajax';
import Config from 'passbolt-mad/config/config';

class SessionCheck {
  /**
   * Instantiate the singleton.
   * @returns {*}
   */
  static instantiate() {
    if (SessionCheck._instance) {
      return SessionCheck._instance;
    }
    return new SessionCheck();
  }

  // Constructor
  constructor() {
    this._scheduleCheckSession = null;
    AppAjax._requests.on('length', (ev, length) => this._handleLastRequest(length));
  }

  /**
   * Handle the last ajax request.
   * @param {integer} length
   * @private
   */
  _handleLastRequest(length) {
    if (!length) {
      // The session timeout from the server is given in minutes
      const timeout = (Config.read('server.app.session_timeout') * 60 * 1000) + 2000;
      if (this._scheduleCheckSession) {
        clearTimeout(this._scheduleCheckSession);
      }
      this._scheduleCheckSession = setTimeout(() => {
        this._checkSession();
      }, timeout);
    }
  }

  /**
   * Request the API
   * @private
   */
  _checkSession() {
    AppAjax.request({
      url: `${APP_URL}auth/checkSession.json`,
      type: 'GET',
      register: false
    });
  }
}

SessionCheck._instance = null;

export default SessionCheck;
