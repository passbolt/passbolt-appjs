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

var PeopleGroupsListComponent = GroupListComponent.extend('passbolt.component.group.PeopleGroupsList', /** @static */ {

  defaults: {
    withMenu: true
  }

}, /** @prototype */ {

  /**
   * Show the contextual menu
   * @param {passbolt.model.Resource} item The item to show the contextual menu for
   * @param {string} x The x position where the menu will be rendered
   * @param {string} y The y position where the menu will be rendered
   * @param {HTMLElement} eventTarget The element the event occurred on
   */
  showContextualMenu: function (item, x, y, eventTarget) {

    var currentUser = User.getCurrent(),
      isAdmin = currentUser.isAdmin();

    // Get the offset position of the clicked item.
    var $item = $('#' + this.options.prefixItemId + item.id);
    var item_offset = $('.more-ctrl a', $item).offset();

    // Instantiate the contextual menu menu.
    var contextualMenu = ContextualMenuComponent.instantiate({
      state: 'hidden',
      source: eventTarget,
      coordinates: {
        x: x,
        y: item_offset.top
      }
    });
    contextualMenu.start();

    // Add Edit group action.
    var action = new Action({
      id: 'js_group_browser_menu_edit',
      label: 'Edit group',
      initial_state: 'ready',
      action: function (menu) {
        MadBus.trigger('request_group_edition', item);
        menu.remove();
      }
    });
    contextualMenu.insertItem(action);

    // Add Delete group action if the user is an admin.
    if (isAdmin) {
      var action = new Action({
        id: 'js_group_browser_menu_remove',
        label: 'Delete group',
        initial_state: 'ready',
        action: function (menu) {
          // var secret = item.Secret[0].data;
          MadBus.trigger('request_group_deletion', item);
          menu.remove();
        }
      });
      contextualMenu.insertItem(action);
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
   * @param {passbolt.model.Group} item The right selected item instance or its id
   * @param {HTMLEvent} srcEvent The source event which occurred
   */
  ' item_menu_clicked': function (el, ev, item, srcEvent) {
    this.showContextualMenu(item, srcEvent.pageX, srcEvent.pageY, srcEvent.target);
  }

});

export default PeopleGroupsListComponent;