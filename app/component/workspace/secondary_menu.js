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
import Config from 'passbolt-mad/config/config';
import MadBus from 'passbolt-mad/control/bus';
import ToggleButton from 'passbolt-mad/component/toggle_button';
import template from 'app/view/template/component/workspace/secondary_menu.stache!';

const WorkspaceSecondaryMenu = Component.extend('passbolt.component.WorkspaceSecondaryMenu', /** @static */ {

  defaults: {
    label: 'Workspace Secondary Menu',
    template: template,
    tag: 'ul'
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const showSidebar = Config.read('ui.workspace.showSidebar');
    const viewSidebarButton = new ToggleButton('#js_wk_secondary_menu_view_sidebar_button', {
      state: {selected: showSidebar}
    });
    viewSidebarButton.start();
    this.viewSidebarButton = viewSidebarButton;
    this.viewSidebarButton.state.on('selected', (ev, selected) => this._onViewSidebarSelectedChange(selected));
  },

  /**
   * Observe when the viewbar show/hide button selected property changed
   * @param {boolean} showSidebar Show / hide the sidebar
   * @private
   */
  _onViewSidebarSelectedChange: function(showSidebar) {
    Config.write('ui.workspace.showSidebar', showSidebar);
    MadBus.trigger('workspace_sidebar_state_change');
  },

  /**
   * Observe when the workspace sidebar setting change.
   */
  '{mad.bus.element} workspace_sidebar_state_change': function() {
    this.viewSidebarButton.state.selected = Config.read('ui.workspace.showSidebar');
  },

  /**
   * Observe when the user wants to view the side bar
   */
  '{viewSidebarButton.element} click': function() {
    const showSidebar = !Config.read('ui.workspace.showSidebar');
    Config.write('ui.workspace.showSidebar', showSidebar);
    MadBus.trigger('workspace_sidebar_state_change');
  }
});

export default WorkspaceSecondaryMenu;
