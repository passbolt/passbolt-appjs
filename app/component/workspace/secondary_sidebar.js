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
import $ from 'jquery/dist/jquery.min.js';
import Component from 'passbolt-mad/component/component';
import MadBus from 'passbolt-mad/control/bus';
import Config from 'passbolt-mad/config/config';

import template from '../../view/template/component/workspace/secondary_sidebar.stache';

const SecondarySidebarComponent = Component.extend('passbolt.component.workspace.SecondarySidebar', /** @static */ {

  defaults: {
    label: 'Sidebar Component',
    template: template
  }

}, /** @prototype */ {

  /**
   * Set the title
   * @param {string} title The new title
   */
  setTitle: function(title) {
    $('.sidebar .sidebar-header .sidebar-header-title', this.element).text(title);
  },

  /**
   * Set the subtitle
   * @param {string} subtitle The new subtitle
   */
  setSubtitle: function(subtitle) {
    $('.sidebar .sidebar-header .sidebar-header-subtitle', this.element).text(subtitle);
  },

  /**
   * Observe when the workspace sidebar setting change.
   */
  '{mad.bus.element} workspace_sidebar_state_change': function() {
    if (!Config.read('ui.workspace.showSidebar')) {
      this.destroyAndRemove();
    }
  },

  /**
   * Observe when the user clicks on the close button
   */
  '{element} .js_sidebar_close click': function() {
    Config.write('ui.workspace.showSidebar', false);
    MadBus.trigger('workspace_sidebar_state_change');
  }

});

export default SecondarySidebarComponent;
