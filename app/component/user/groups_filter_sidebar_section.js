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
import Group from 'app/model/map/group';
import PeopleGroupsListComponent from 'app/component/group/people_groups_list';

import template from 'app/view/template/component/user/groups_filter_sidebar_section.stache!';

var GroupsFilterSidebarSectionComponent = Component.extend('passbolt.component.user.GroupsFilterSidebarSection', /** @static */ {

  defaults: {
    template: template,
    selectedGroups: new Group.List()
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    var peopleGroupsList = new PeopleGroupsListComponent('#js_wsp_users_groups_list', {
      selectedGroups: this.options.selectedGroups
    });
    peopleGroupsList.start();
  }

});

export default GroupsFilterSidebarSectionComponent;
