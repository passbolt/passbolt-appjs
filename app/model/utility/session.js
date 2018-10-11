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

class Session {}

/**
 * Get the session timeout in milliseconds.
 * @return {number}
 */
Session.getTimeout = function() {
  return (Config.read('server.app.session_timeout') * 60 * 1000);
};

/**
 * Ping the server to check if the session is not yet expired.
 * Note that calling the server extends the session.
 * @param {boolean} autoRedirect Automatically redirect the user to the login page. Default yes.
 * @return {Promise}
 * @static
 */
Session.check = function(autoRedirect) {
  autoRedirect = autoRedirect != undefined ? autoRedirect : true;
  return AppAjax.request({
    url: `${APP_URL}auth/checkSession.json`,
    type: 'GET',
    sessionExpiredAutoRedirect: autoRedirect
  });
};

export default Session;
