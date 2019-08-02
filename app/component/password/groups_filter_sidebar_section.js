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
import Group from '../../model/map/group';
import PasswordCategoriesGroupsList from '../group/password_categories_groups_list';
import PrimarySidebarSectionComponent from '../workspace/primary_sidebar_section';
import User from '../../model/map/user';

import template from '../../view/template/component/password/groups_filter_sidebar_section.stache';

const GroupsFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.password.GroupsFilterSidebarSection', /** @static */ {

  defaults: {
    template: template,
    selectedGroups: new Group.List(),
    state: {hidden: true}
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
    this.groupList = groupList;
    groupList.state.on('loaded', (ev, loaded) => this._onGroupListLoadedChange(loaded));
    groupList.start();
    this._super();
  },

  /**
   * @inheritdoc
   */
  _onGroupListLoadedChange: function(loaded) {
    if (loaded) {
      const isEmpty = this.groupList.options.items.length == 0;
      this.state.hidden = isEmpty;
    }
  }
});

export default GroupsFilterSidebarSectionComponent;
