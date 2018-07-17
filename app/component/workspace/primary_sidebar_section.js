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
import PrimarySidebarSectionView from 'app/view/component/workspace/primary_sidebar_section';

//import template from 'app/view/template/component/workspace/sidebar_section.ejs!';

const PrimarySidebarSectionComponent = Component.extend('passbolt.component.workspace.SecondarySidebarSection', /** @static */ {

  defaults: {
    label: 'Primary Sidebar Section Component',
    viewClass: PrimarySidebarSectionView
  }

}, /** @prototype */ {

});

export default PrimarySidebarSectionComponent;
