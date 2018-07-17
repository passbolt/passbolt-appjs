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
    selectedItem: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('name', this.options.selectedItem.name);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._findGroup(this.options.selectedItem.id)
      .then(() => this._initInformationSection())
      .then(() => this._initGroupUsersSection());

    this._super();
  },

  /**
   * Retrieve the group and the associated required information
   * @param groupId
   * @return {Group}
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
        this.options.selectedItem = group;
      });
  },

  /**
   * Initialize the information section
   * @private
   */
  _initInformationSection: function() {
    const component = new InformationSectionComponent('#js_group_details_information', {
      group: this.options.selectedItem
    });
    component.start();
  },

  /**
   * Init the group user section.
   */
  _initGroupUsersSection: function() {
    const component = new GroupUsersSectionComponent('#js_group_details_members', {
      group: this.options.selectedItem,
      cssClasses: ['closed']
    });
    component.start();
  },

  /**
   * Observer when the group is updated.
   */
  '{selectedItem} updated': function() {
    this.setTitle(this.options.selectedItem.name);
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Listen to the event user_selected
   */
  '{mad.bus.element} user_selected': function() {
    if (!this.state.is(null) && !this.state.is('hidden')) {
      this.setState('hidden');
    }
  }

});

export default GroupSecondarySidebarComponent;
