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
import Filter from '../../model/filter';
import Group from '../../model/map/group';
import GroupsListComponent from '../group/groups_list';
import GroupsListView from '../../view/component/group/groups_list';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';

import itemTemplate from '../../view/template/component/group/group_item.stache';

const PasswordCategoriesGroupsList = GroupsListComponent.extend('passbolt.component.PasswordCategoriesGroupsList', /** @static */ {

  defaults: {
    itemClass: Group,
    itemTemplate: itemTemplate,
    prefixItemId: 'group_',
    selectedGroups: new Group.List(),
    selectedFilter: null,
    viewClass: GroupsListView
  }

}, /** @prototype */ {

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Filter the workspace by group.
   * @param {passbolt.model.Group} group The group to filter the workspace with
   */
  _filterWorkspaceByGroup: function(group) {
    this.selectedFilter = new Filter({
      id: `workspace_filter_group_${group.id}`,
      type: 'group',
      label: __('%s (group)', group.name),
      rules: {
        'is-shared-with-group': group.id
      },
      order: ['Resource.modified DESC']
    });
    MadBus.trigger('filter_workspace', {filter: this.selectedFilter});
  }

});

export default PasswordCategoriesGroupsList;
