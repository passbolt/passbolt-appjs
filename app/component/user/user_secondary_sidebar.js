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
import Clipboard from 'app/util/clipboard';
import GpgkeySectionComponent from 'app/component/gpgkey/gpgkey_sidebar_section';
import InformationSectionComponent from 'app/component/user/information_sidebar_section';
import SecondarySidebarComponent from 'app/component/workspace/secondary_sidebar';
import User from 'app/model/map/user';
import UserGroupsSidebarSectionComponent from 'app/component/group_user/user_groups_sidebar_section';

import template from 'app/view/template/component/user/user_secondary_sidebar.stache!';

const UserSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.user.UserSecondarySidebar', /** @static */ {

  defaults: {
    label: 'User Details Controller',
    template: template,
    user: null,
    User: User
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('user', this.options.user);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._super();
    this._initInformationSection();
    this._initUserGroupsSection();
    this._initGpgkeySection();
  },

  /**
   * Initialize the information section
   */
  _initInformationSection: function() {
    const informationComponent = new InformationSectionComponent('#js_user_details_information', {
      user: this.options.user
    });
    informationComponent.start();
  },

  /**
   * Initialize the user groups section
   */
  _initUserGroupsSection: function() {
    /*
     * active field will not be provided for non admin users,
     * but we still want to display information regarding groups.
     */
    if (this.options.user.active === undefined || this.options.user.active == '1') {
      // Instantiate the groups list component for the current user.
      const userGroups = new UserGroupsSidebarSectionComponent('#js_user_groups', {
        user: this.options.user
      });
      userGroups.start();
    }
  },

  /**
   * Initialize the gpgkey section
   */
  _initGpgkeySection: function() {
    if (!this.options.user.gpgkey) {
      return;
    }

    const gpgkeyComponent = new GpgkeySectionComponent('#js_user_gpgkey', {
      gpgkey: this.options.user.gpgkey,
      cssClasses: ['closed']
    });
    gpgkeyComponent.start();
  },

  /**
   * Observe when a user is updated, if this is the currently displayed user, refresh the component.
   * @param {DefineMap.prototype} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {User} user The updated user
   */
  '{User} updated': function(model, ev, user) {
    if (user.id == this.options.user.id) {
      this.options.user = user;
      this.refresh();
    }
  },

  /**
   * Listen when a user clicks on copy public key.
   */
  '{element} a.copy-public-key click': function() {
    const gpgkey = this.options.user.gpgkey;
    Clipboard.copy(gpgkey.armored_key, 'public key');
  }

});

export default UserSecondarySidebarComponent;
