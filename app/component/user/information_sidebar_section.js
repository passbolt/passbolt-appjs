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
import SecondarySidebarSectionComponent from '../workspace/secondary_sidebar_section';

import template from '../../view/template/component/user/information_sidebar_section.stache';

const InformationSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.user.InformationSidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Information Controller',
    template: template,
    user: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('user', this.options.user);
  }

});

export default InformationSidebarSectionComponent;
