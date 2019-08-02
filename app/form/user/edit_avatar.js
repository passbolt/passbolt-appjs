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
import Form from 'passbolt-mad/form/form';

import template from '../../view/template/form/user/avatar.stache';

const EditAvatarForm = Form.extend('passbolt.form.user.Avatar', /** @static */ {

  defaults: {
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    // Rebind controller events
    this.on();
  }

});
export default EditAvatarForm;
