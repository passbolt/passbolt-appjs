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
import $ from 'jquery';
import AuthService from '../../model/service/plugin/auth';
import Component from 'passbolt-mad/component/component';
import HtmlHelper from 'passbolt-mad/helper/html';

const MfaComponent = Component.extend('passbolt.component.settings.mfa', /** @static */ {

  defaults: {}

}, /** @prototype */ {
  /**
   * @inheritdoc
   */
  afterStart: async function() {
    const isAuthenticated = await AuthService.isAuthenticated();
    if (isAuthenticated) {
      const iframeContent = `<iframe id='js_mfa_iframe' src='${APP_URL}/mfa/setup/select' width='100%' height='100%'></iframe>`;
      HtmlHelper.create($(this.element), 'inside_replace', iframeContent);
    }
  }
});

export default MfaComponent;
