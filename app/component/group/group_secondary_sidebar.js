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
import GroupUsersSectionComponent from 'app/component/group_user/group_users_sidebar_section';
import InformationSectionComponent from 'app/component/group/information_sidebar_section';
import SecondarySidebarComponent from 'app/component/workspace/secondary_sidebar';

import template from 'app/view/template/component/group/group_secondary_sidebar.stache!';

const GroupSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.group.GroupSecondarySidebar', /** @static */ {

  defaults: {
    label: 'Group Details Controller',
    template: template,
    group: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this.setViewData('name', this.options.group.name);
    this._super();
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._findGroup(this.options.group.id)
      .then(() => this._initInformationSection())
      .then(() => this._initGroupUsersSection());
    this._super();
  },

  /**
   * Retrieve the group and the associated required information
   * @param {string} groupId The group id to find
   * @return {Promise}
   * @private
   */
  _findGroup: function(groupId) {
    const options = {
      id: groupId,
      contain: {
        'modifier': 1,
        'modifier.profile': 1,
        'my_group_user': 1
      }
    };

    return Group.findOne(options)
      .then(group => {
        this.options.group = group;
      });
  },

  /**
   * Initialize the information section
   * @private
   */
  _initInformationSection: function() {
    const group = this.options.group;
    const component = new InformationSectionComponent('#js_group_details_information', {group});
    component.start();
  },

  /**
   * Init the group user section.
   * @private
   */
  _initGroupUsersSection: function() {
    const group = this.options.group;
    const cssClasses = ['closed'];
    const component = new GroupUsersSectionComponent('#js_group_details_members', {group, cssClasses});
    component.start();
  },

  /**
   * Observe when the group is updated.
   */
  '{group} updated': function() {
    this.setTitle(this.options.selectedItem.name);
  }

});

export default GroupSecondarySidebarComponent;
