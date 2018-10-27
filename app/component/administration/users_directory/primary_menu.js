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
 * @since         2.5.0
 */
import Component from 'passbolt-mad/component/component';
import template from 'app/view/template/component/administration/users_directory/primary_menu.stache!';
import editTemplate from 'app/view/template/component/administration/users_directory/primary_menu_edit.stache!';

const PrimaryMenu = Component.extend('passbolt.component.administration.ldap.PrimaryMenu', /** @static */ {
  defaults: {
    edit: false
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeStart: function() {
    const edit = this.options.edit;
    if (!edit) {
      this.options.template = template;
    } else {
      this.options.template = editTemplate;
    }
  }
});

export default PrimaryMenu;
