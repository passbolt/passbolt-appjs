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
import Action from 'passbolt-mad/model/map/action';
import ContextualMenuComponent from 'passbolt-mad/component/contextual_menu';
import GroupListComponent from 'app/component/group/groups_list';
import MadBus from 'passbolt-mad/control/bus';
import User from 'app/model/map/user';

import 'app/view/template/component/group/group_item.stache!';

const PeopleGroupsListComponent = GroupListComponent.extend('passbolt.component.group.PeopleGroupsList', /** @static */ {

  defaults: {
    withMenu: true
  }

}, /** @prototype */ {

  /**
   * Show the contextual menu
   * @param {Group} group The item to show the contextual menu for
   * @param {string} x The x position where the menu will be rendered
   * @param {string} y The y position where the menu will be rendered
   * @param {HTMLElement} eventTarget The element the event occurred on
   */
  showContextualMenu: function(group, x, y, eventTarget) {
    const currentUser = User.getCurrent();
    const isAdmin = currentUser.isAdmin();

    // Get the offset position of the clicked item.
    const $item = $(`#${this.options.prefixItemId}${group.id}`);
    const item_offset = $('.more-ctrl a', $item).offset();

    // Instantiate the contextual menu menu.
    const contextualMenu = ContextualMenuComponent.instantiate({
      state: 'hidden',
      source: eventTarget,
      coordinates: {
        x: x,
        y: item_offset.top
      }
    });
    contextualMenu.start();

    // Add Edit group action.
    const editItem = new Action({
      id: 'js_group_browser_menu_edit',
      label: 'Edit group',
      initial_state: 'ready',
      action: function(menu) {
        MadBus.trigger('request_group_edition', {group: group});
        menu.remove();
      }
    });
    contextualMenu.insertItem(editItem);

    // Add Delete group action if the user is an admin.
    if (isAdmin) {
      const deleteItem = new Action({
        id: 'js_group_browser_menu_remove',
        label: 'Delete group',
        initial_state: 'ready',
        action: function(menu) {
          MadBus.trigger('request_group_deletion', {group: group});
          menu.remove();
        }
      });
      contextualMenu.insertItem(deleteItem);
    }

    // Display the menu.
    contextualMenu.setState('ready');
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * An item has been clicked on the menu icon
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} item_menu_clicked': function(el, ev) {
    const group = ev.data.group;
    const srcEv = ev.data.srcEv;
    this.showContextualMenu(group, srcEv.pageX - 3, srcEv.pageY, srcEv.target);
  }

});

export default PeopleGroupsListComponent;
