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
import User from '../../model/map/user';

import template from '../../view/template/component/user/workspace_primary_menu.stache';

const WorkspacePrimaryMenu = Component.extend('passbolt.component.user.WorkspacePrimaryMenu', /** @static */ {

  defaults: {
    label: 'User Workspace Menu Controller',
    tag: 'ul',
    template: template,
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
    const isAdmin = User.getCurrent().isAdmin();
    // Only admin can edit/delete users
    if (isAdmin) {
      // Edit user
      const editButton = new ButtonComponent('#js_user_wk_menu_edition_button', {
        state: {
          disabled: true
        },
        events: {
          click: () => this._edit()
        }
      });
      editButton.start();
      this.editButton = editButton;

      // Delete user
      const deleteButton = new ButtonComponent('#js_user_wk_menu_deletion_button', {
        state: {
          disabled: true
        },
        events: {
          click: () => this._delete()
        }
      });
      deleteButton.start();
      this.deleteButton = deleteButton;

      // Resend invite
      const resendInviteButton = new ButtonComponent('#js_user_wk_menu_resend_invite_button', {
        state: {
          disabled: true
        },
        events: {
          click: () => this._resendInvite()
        }
      });

      resendInviteButton.start();
      this.resendInviteButton = resendInviteButton;
    }

    this.on();
  },

  /**
   * Delete
   */
  _delete: function() {
    const user = this.options.selectedUsers[0];
    MadBus.trigger('request_user_deletion', {user: user});
  },

  /**
   * Edit
   */
  _edit: function() {
    const user = this.options.selectedUsers[0];
    MadBus.trigger('request_user_edition', {user: user});
  },

  /**
   * Resend Invitation
   */
  _resendInvite: function() {
    const user = this.options.selectedUsers[0];
    MadBus.trigger('request_resend_invitation', {user: user});
  },

  /**
   * Observe when a user is selected
   */
  '{selectedUsers} add': function() {
    const resourceSelected = this.options.selectedUsers.length == 1;
    if (resourceSelected) {
      this.userSelected();
    } else {
      this.reset();
    }
  },

  /**
   * Observe when a user is unselected
   */
  '{selectedUsers} remove': function() {
    this.reset();
  },

  /**
   * A user is selected, adapt the buttons states.
   */
  userSelected: function() {
    const currentUser = User.getCurrent();
    const isAdmin = currentUser.role.name == 'admin';
    if (isAdmin) {
      const user = this.options.selectedUsers[0];
      const isSelf = currentUser.id == user.id;
      if (!isSelf) {
        this.deleteButton.state.disabled = false;
      }
      this.editButton.state.disabled = false;
      this.resendInviteButton.state.disabled = true;
      const userActiveState = this.options.selectedUsers[0].active;
      if (!userActiveState) {
        this.resendInviteButton.state.disabled = false;
      }
    }
  },

  /**
   * Reset the buttons states to their original.
   */
  reset: function() {
    const isAdmin = User.getCurrent().isAdmin();
    if (isAdmin) {
      this.deleteButton.state.disabled = true;
      this.editButton.state.disabled = true;
      this.resendInviteButton.state.disabled = true;
    }
  }

});

export default WorkspacePrimaryMenu;
