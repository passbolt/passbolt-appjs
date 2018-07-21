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
import Group from 'app/model/map/group';
import PasswordCategoriesGroupsList from 'app/component/group/password_categories_groups_list';
import PrimarySidebarSectionComponent from 'app/component/workspace/primary_sidebar_section';
import User from 'app/model/map/user';

import template from 'app/view/template/component/password/groups_filter_sidebar_section.stache!';

const GroupsFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.password.GroupsFilterSidebarSection', /** @static */ {

  defaults: {
    template: template,
    selectedGroups: new Group.List(),
    // Hidden by default, show it if there are groups to show.
    state: 'hidden'
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const groupList = new PasswordCategoriesGroupsList('#js_wsp_password_categories_groups_list', {
      selectedGroups: this.options.selectedGroups,
      defaultGroupFilter: {
        'has-users': User.getCurrent().id
      }
    });
    this._listenGroupListStateChanges(groupList);
    groupList.start();
    this._super();
  },

  /**
   * Listen to the group list child component state changes and adapt this component state in function.
   * @param {Component} groupList
   */
  _listenGroupListStateChanges: function(groupList) {
    const state = this.state;
    const groupListState = groupList.state;
    const isEmpty = groupList.options.items.length;
    groupListState.current.on('length', () => {
      // Mark this component as ready when its child is ready.
      if (groupListState.is('ready')) {
        state.addState('ready');
      }
      // Display the group list only if it contains groups.
      if (isEmpty) {
        state.removeState('hidden');
      }
    });
  }
});

export default GroupsFilterSidebarSectionComponent;
