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
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/gpgkey/gpgkey_sidebar_section.stache!';

const GpgKeySidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.gpgkey.GpgKeySidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Gpgkey Controller',
    template: template,
    gpgkey: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    // pass the new resource to the view
    const gpgkey = this.options.gpgkey;
    this.setViewData('gpgkey', gpgkey);
  }

});

export default GpgKeySidebarSectionComponent;
