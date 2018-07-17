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
//import PrimarySidebarView from 'app/view/component/workspace/primary_sidebar';

import template from 'app/view/template/component/workspace/primary_sidebar.stache!';

const PrimarySidebarComponent = Component.extend('passbolt.component.workspace.PrimarySidebar', /** @static */ {

  defaults: {
    label: 'Sidebar Component',
    //viewClass: PrimarySidebarView,
    template: template
  }

}, /** @prototype */ {

});

export default PrimarySidebarComponent;
