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
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import MadBus from 'passbolt-mad/control/bus';
import User from 'app/model/map/user';

import template from 'app/view/template/component/user/workspace_primary_menu.stache!';

const WorkspacePrimaryMenu = Component.extend('passbolt.component.user.WorkspacePrimaryMenu', /** @static */ {

  defaults: {
    label: 'User Workspace Menu Controller',
    tag: 'ul',
    template: template,
    // the selected users, you can pass an existing list as parameter of the constructor to share the same list
    selectedUsers: new User.List()
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('isAdmin', User.getCurrent().role.name == 'admin');
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const role = User.getCurrent().role.name;

    // Only admin can edit/delete users
    if (role == 'admin') {
      // Edit user
      const editButton = new ButtonComponent('#js_user_wk_menu_edition_button', {
        state: 'disabled'
      });
      editButton.start();
      this.options.editButton = editButton;

      // Delete user
      const deleteButton = new ButtonComponent('#js_user_wk_menu_deletion_button', {
        state: 'disabled'
      });
      deleteButton.start();
      this.options.deleteButton = deleteButton;
    }

    this.on();
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user wants to edit an instance (Resource, User depending of the active workspace)
   */
  '{editButton.element} click': function() {
    const user = this.options.selectedUsers[0];
    MadBus.trigger('request_user_edition', {user: user});
  },

  /**
   * Observe when the user wants to delete an instance (Resource, User depending of the active workspace)
   */
  '{deleteButton.element} click': function() {
    const user = this.options.selectedUsers[0];
    MadBus.trigger('request_user_deletion', {user: user});
  },

  /**
   * Observe when a user is selected
   */
  '{selectedUsers} add': function() {
    // if no user selected.
    if (this.options.selectedUsers.length == 0) {
      this.setState('ready');
    } else if (this.options.selectedUsers.length == 1) {
      // else if only 1 user is selected show the details
      this.setState('selection');
    } else {
      // else if more than one resource have been selected
      this.setState('multiSelection');
    }
  },

  /**
   * Observe when a user is unselected
   */
  '{selectedUsers} remove': function() {
    // if more than one resource selected, or no resource selected
    if (this.options.selectedUsers.length == 0) {
      this.setState('ready');

      // else if only 1 resource selected show the details
    } else if (this.options.selectedUsers.length == 1) {
      this.setState('selection');

      // else if more than one resource have been selected
    } else {
      this.setState('multiSelection');
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE STATE CHANGES */
  /* ************************************************************** */

  /**
   * Listen to the change relative to the state selected
   * @param {boolean} go Enter or leave the state
   */
  stateSelection: function(go) {
    // Is the current user an admin.
    const isAdmin = User.getCurrent().role.name == 'admin';

    // If user is an admin, we enable the controls.
    if (isAdmin) {
      if (go) {
        // Is the selected user same as the current user.
        const isSelf = User.getCurrent().id == this.options.selectedUsers[0].id;

        this.options.editButton
          .setValue(this.options.selectedUsers[0])
          .setState('ready');

        // If the user has not selected himself.
        if (!isSelf) {
          // Activate the delete button.
          this.options.deleteButton
            .setValue(this.options.selectedUsers)
            .setState('ready');
        } else {
          // If user has selected himself, delete is not available.
          this.options.deleteButton
            .setValue(null)
            .setState('disabled');
        }
      } else {
        this.options.editButton
          .setValue(null)
          .setState('disabled');
        this.options.deleteButton
          .setValue(null)
          .setState('disabled');
      }
    }
  },

  /**
   * Listen to the change relative to the state multiSelection
   * @param {boolean} go Enter or leave the state
   */
  stateMultiSelection: function(go) {
    if (User.getCurrent().role.name == 'admin') {
      if (go) {
        this.options.editButton
          .setState('disabled');
        this.options.deleteButton
          .setValue(this.options.selectedUsers)
          .setState('ready');
      } else {
        this.options.editButton
          .setValue(null)
          .setState('disabled');
        this.options.deleteButton
          .setValue(null)
          .setState('disabled');
      }
    }
  }

});

export default WorkspacePrimaryMenu;
