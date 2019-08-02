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
import GroupUsersSectionComponent from '../group_user/group_users_sidebar_section';
import InformationSectionComponent from '../group/information_sidebar_section';
import SecondarySidebarComponent from '../workspace/secondary_sidebar';

import template from '../../view/template/component/group/group_secondary_sidebar.stache';

const GroupSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.group.GroupSecondarySidebar', /** @static */ {

  defaults: {
    label: 'Group Details Controller',
    template: template,
    group: null,
    Group: Group
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this._latestGroupModified = options.group.modified;
  },

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
    const component = new InformationSectionComponent('#js_group_details_information', {group: group});
    component.start();
  },

  /**
   * Init the group user section.
   * @private
   */
  _initGroupUsersSection: function() {
    const group = this.options.group;
    const cssClasses = ['closed'];
    const component = new GroupUsersSectionComponent('#js_group_details_members', {group: group, cssClasses: cssClasses});
    component.start();
  },

  /**
   * Observe when a group is updated.
   * @param {Group.prototype} Constructor The constructor
   * @param {HTMLEvent} ev The event which occurred
   * @param {Group} group The created group
   */
  '{Group} updated': function(Constructor, ev, group) {
    if (this.options.group.id == group.id) {
      this.options.group = group;
      this.refresh();
    }
  }

});

export default GroupSecondarySidebarComponent;
