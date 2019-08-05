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
import $ from 'jquery';
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import EditView from '../../view/component/group/edit';
import Group from '../../model/map/group';
import GroupCreateForm from '../../form/group/create';
import GroupService from '../../model/service/plugin/group';
import GroupUser from '../../model/map/group_user';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import TreeComponent from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';
import User from '../../model/map/user';
import uuid from 'uuid/v4';

import template from '../../view/template/component/group/edit.stache';
import treeItemTemplate from '../../view/template/component/group/group_user_list_item.stache';

const EditComponent = Component.extend('passbolt.component.group.Edit', /** @static */ {

  defaults: {
    label: null,
    cssClasses: ['share-tab'],
    viewClass: EditView,
    template: template,
    loadedOnStart: false,
    GroupUserChanges: [],
    data: {
      Group: {}
    },
    callbacks: {
      saved: null
    }
  }

}, /** @prototype */ {

  // A list of permission change type dropdown components.
  _permissionChangeTypeDropDowns: {},
  // A list of permission delete button components.
  _permissionDeleteButtons: {},

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this.changeList = [];

    this._findGroup(this.options.data.Group)
      .then(() => this._initForm())
      .then(() => this._initGroupUsersList())
      .then(() => this._notifyPlugin())
      .then(() => this._initSaveButton())
      .then(() => {
        if (this.formState == 'create') {
          this.state.loaded = true;
        }
        this.showFeedback();
        this.on();
      }, error => {
        console.error('something happened', error);
      });
  },

  /**
   */
  _findGroup: function(group) {
    const self = this;

    // Is the user and administrator.
    this.isAdmin = User.getCurrent().isAdmin();

    // Create case.
    if (group.id == undefined) {
      this.formState = 'create';
      this.isGroupManager = false;
      $('.group_members').addClass('empty');

      return Promise.resolve(group);
    } else {
      // Update case.
      this.formState = 'edit';

      return Group.findView(group.id)
        .then(group => {
          self.options.data.Group = group;
          self.isGroupManager = group.isGroupManager(User.getCurrent());
          return group;
        });
    }
  },

  /**
   * Initialize the group create/edit form
   */
  _initForm: function() {
    const group = this.options.data.Group;
    const form = new GroupCreateForm('#js_group_edit_form', {
      data: group,
      canUpdateName: this.isGroupManager && !this.isAdmin ? false : true,
      callbacks: {}
    });
    form.start();
    form.load(group);
    this.formGroup = form;
  },

  /**
   * Initialize the group users list
   */
  _initGroupUsersList: function() {
    const map = this._getGroupUsersListMap();
    const treeComponent = new TreeComponent('#js_permissions_list', {
      cssClasses: ['group_user'],
      viewClass: TreeView,
      itemClass: GroupUser,
      itemTemplate: treeItemTemplate,
      // The map to use to make jstree working with our permission model
      map: map
    });
    treeComponent.start();
    this.groupUserList = treeComponent;
  },

  /**
   * Get the group users list map.
   * @return {UtilMap}
   */
  _getGroupUsersListMap: function() {
    return new MadMap({
      id: 'id',
      userAvatarPath: {
        key: 'user',
        func: function(user) {
          return user.profile.avatarPath('small');
        }
      },
      userLabel: {
        key: 'user',
        func: function(user) {
          return user.profile.fullName();
        }
      },
      userEmail: 'user.username',
      userFingerprint: {
        key: 'user.gpgkey.fingerprint',
        func: function(fingerprint) {
          return fingerprint.match(/(.{1,4})/g).join(' ');
        }
      },
      isAdmin: 'is_admin',
      isNew: 'is_new'
    });
  },

  /**
   * Initialize the form save button.
   */
  _initSaveButton: function() {
    this.options.saveChangesButton = new ButtonComponent('#js_group_save', {
      state: {disabled: true}
    }).start();
  },

  /**
   * Notify the plugin about the group edit
   */
  _notifyPlugin: function() {
    const group = this.options.data.Group;
    const canAddGroupUsers = this.formState == 'create' || this.isGroupManager;
    const groupId = group.id || '';
    GroupService.insertGroupEditframe(groupId, canAddGroupUsers);
  },

  /**
   * Show a visual feedback as per the form status.
   * Feedback can be:
   * - The group is empty, please add a group manager.
   * - You need to click save for the changes to take place.
   * - Only the group manager can add new people to a group
   */
  showFeedback: function() {
    const feedback = [];
    if (this.formState == 'create' && this.groupUserList.options.items.length == 0) {
      feedback.push(__('The group is empty, please add a group manager.'));
    }
    if (this.formState == 'edit' && !this.isGroupManager) {
      feedback.push(__('Only the group manager can add new people to a group.'));
    }
    // Check if any changes is there.
    if (this.changeList.length) {
      feedback.push(__('You need to click save for the changes to take place.'));
    }

    $('.message.feedback').empty();
    if (feedback.length) {
      feedback.forEach(fb => {
        $('.message.feedback').append(`<span>${fb}</span>`);
      });
      $('.message.feedback').removeClass('hidden');
    } else {
      $('.message.feedback').addClass('hidden');
    }
  },

  /**
   * Load a group to edit
   * @param group
   */
  loadGroup: function(group) {
    this.formGroup.load({Group: group});
    group.groups_users.forEach(groupUser => {
      this.addGroupUser(groupUser);
    });

    this.state.loaded = true;
  },

  /**
   * Load a groupUser in the list.
   * @param groupUser
   */
  loadGroupUser: function(groupUser) {
    const groupUserId = groupUser.id;
    const groupUserTypeSelector = `#js_group_user_is_admin_select_${groupUserId}`;
    const groupUserSelector = `#${groupUserId}`;

    // Insert GroupUser in the list.
    this.groupUserList.insertItem(groupUser);

    // Add a selectbox to display the permission type (and allow to change)
    const dropdownComponent = new DropdownComponent($('.js_group_user_is_admin', groupUserTypeSelector)[0], {
      id: `js_group_user_is_admin_${groupUserId}`,
      emptyValue: false,
      modelReference: 'passbolt.model.GroupUser.is_admin',
      availableValues:  {
        false: __('Member'),
        true: __('Group manager')
      }
    });
    dropdownComponent.start();
    dropdownComponent.setValue(groupUser.is_admin);
    this._permissionChangeTypeDropDowns[groupUserId] = dropdownComponent;

    // Add a button to allow the user to delete the userGroup.
    const buttonComponent = new ButtonComponent($('.js_group_user_delete', $('.actions', groupUserSelector))[0], {
      id: `js_group_user_delete_${groupUserId}`,
      state: 'ready'
    }).start();

    this._permissionDeleteButtons[groupUserId] = buttonComponent;
  },

  /**
   * Add a new user to the group.
   * @param groupUser The groupUser data, either in json, or in object.
   */
  addGroupUser: function(groupUser) {
    // Instantiate a new temporary permission.
    if (groupUser.id == undefined) {
      groupUser.id = uuid();
      groupUser.is_new = true;
    } else {
      groupUser.is_new = false;
    }

    // Load this temporary groupUser in the group users list component.
    this.loadGroupUser(groupUser);
    $('.group_members').removeClass('empty');

    // Check manager.
    this.checkManager();
  },

  /**
   * Delete a group user
   * @param groupUSer The groupUser to delete
   */
  deleteGroupUser: function(groupUser) {
    // Remove the permission from the list.
    this.groupUserList.removeItem(groupUser);

    // Show empty permission warning message if the list is empty.
    if (this.groupUserList.options.items.length == 0) {
      $('.group_members').addClass('empty');
    }

    // Notify the plugin, the user shouldn't be listed by the autocomplete anymore.
    GroupService.groupEditIframeRemoveGroupUser(groupUser);
    this.checkManager();
  },

  /**
   * Edit a group user
   * @param groupUser The groupUser to edit
   */
  editGroupUser: function(groupUser, value) {
    groupUser.is_admin = value;
    GroupService.groupEditIframeEditGroupUser(groupUser);
    this.checkManager();
  },

  /**
   * Check whether there are enough group managers, and lock the neccessary is_admin fields if necessary.
   * @return {boolean}
   */
  checkManager: function() {
    const admins = this.groupUserList.options.items.filter(item => item.is_admin === true);

    /*
     * If the groups is manage by several group managers.
     * Allow the user to change the membership type of the admin.
     */
    if (admins.length > 1) {
      admins.forEach(admin =>  {
        const permTypeDropdown = this._permissionChangeTypeDropDowns[admin.id];
        const permDeleteButton = this._permissionDeleteButtons[admin.id];

        // Disable the permission type field and the permission delete button
        permTypeDropdown.state.disabled = false;
        permDeleteButton.state.disabled = false;
      });
    } else if (admins.length == 1) {
      // If only one admin, the membership of the admin cannot be changed.
      const permTypeDropdown = this._permissionChangeTypeDropDowns[admins[0].id];
      const permDeleteButton = this._permissionDeleteButtons[admins[0].id];

      // Disable the permission type field and the permission delete button
      permTypeDropdown.state.disabled = true;
      permDeleteButton.state.disabled = true;
    }

    // If at least one admin is set, the form can be saved.
    if (admins.length) {
      this.options.saveChangesButton.state.disabled = false;
    } else {
      this.options.saveChangesButton.state.disabled = true;
    }

    return admins.length >= 1;
  },

  /**
   * Set a state to a groupUser element : "created", "updated", "unchanged"
   *
   * Will reflect the change in the UI.
   *
   * @param uuid groupUserId
   *   groupUser id
   * @param string state
   *   can be "created", "updated", or null.
   */
  setGroupUserItemState: function(groupUserId, state) {
    const $li = this.groupUserList.view.getItemElement({id: groupUserId});

    if (state == null) {
      $li.removeClass('permission-updated');
      $('.permission_changes span', $li).text(__('Unchanged'));
    } else {
      $li.addClass('permission-updated');
      const text = state == 'created' ? __('Will be added') : __('Will be updated');
      $('.permission_changes span', $li).text(text);
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * The user request the form to be saved.
   */
  '{saveChangesButton.element} click': function() {
    if (this.options.saveChangesButton.state.loaded) {
      // Validate form.
      const validate = this.formGroup.validate();

      const hasAdmins = this.checkManager();
      if (validate == true && hasAdmins == true) {
        const formData = this.formGroup.getData();
        const groupJson = {name: formData['Group']['name']};

        MadBus.trigger('passbolt_loading');
        GroupService.groupEditIframeSave(groupJson);

        this.state.loaded = false;
      }
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE PLUGIN EVENTS */
  /* ************************************************************** */

  /**
   * Listen when a group has been loaded by the plugin.
   */
  '{mad.bus.element} passbolt.plugin.group.edit.group_loaded': function() {
    /*
     * @todo Bug (#REF NEEDED), the data provided by the plugin are incomplete (users gpg key fingerprint missing).
     * Use the group which is loaded in the afterStart method.
     */
    this.loadGroup(this.options.data.Group);
  },

  /**
   * Listen when a permission has been added through the plugin.
   */
  '{mad.bus.element} passbolt.group.edit.add_user': function(el, ev) {
    const data = ev.data;

    /*
     * @todo remove it when the plugin deprecate the v1 format.
     * V1 format to v2 manually.
     */
    data.user = data.User;
    delete data.User;
    data.user.gpgkey = data.user.Gpgkey;
    delete data.user.Gpgkey;
    delete data.GroupUser;
    data.user.profile = data.user.Profile;
    delete data.user.Profile;
    data.user.profile.avatar = data.user.profile.Avatar;
    delete data.user.profile.Avatar;
    data.user.role = data.user.Role;
    delete data.user.Role;
    $.extend(data.user, data.user.User);
    delete data.user.User;
    delete data.user.GroupUser;
    const groupUser = new GroupUser(data);
    this.addGroupUser(groupUser);
  },

  /**
   * Listen when a change to group users has been reported by the plugin.
   */
  '{mad.bus.element} passbolt.plugin.group.edit.group_users_updated': function(el, ev) {
    const data = ev.data;
    this.changeList = data.changeList;

    setTimeout(() => {
      this.groupUserList.options.items.forEach(item => {
        const userId = item.user_id;
        const groupUserId = item.id;
        const correspondingChange = data.changeList.find(item => item.user_id == userId);

        if (correspondingChange != undefined) {
          // We act only for created and updated. Deleted simply disappear from the list.
          if (correspondingChange.status == 'created' || correspondingChange.status == 'updated') {
            this.setGroupUserItemState(groupUserId, correspondingChange.status);
          }
        } else {
          // Reset groupUser state.
          this.setGroupUserItemState(groupUserId, null);
        }
      });
      this.showFeedback();
    }, 0);
  },

  /**
   * Listen when a group has been added / updated through the plugin.
   */
  '{mad.bus.element} group_edit_save_success': function(el, ev) {
    // Retrieve the created/updated group.
    const data = ev.data;
    const findOptions = {
      id: data.Group.id,
      contain: {group_user: 1}
    };

    Group.findOne(findOptions)
      .then(group => {
        if (this.formState == 'create') {
          Group.dispatch('created', [group]);
        } else {
          Group.dispatch('updated', [group]);
        }

        this.state.loaded = true;
        MadBus.trigger('passbolt_loading_complete');
        MadBus.trigger('passbolt_notify', {
          status: 'success',
          title: `app_groups_${this.formState == 'create' ? 'add' : 'edit'}_success`,
          data: group
        });

        // Notify the caller.
        if (this.options.callbacks.saved) {
          this.options.callbacks.saved(group);
        }
      });
  },

  /**
   * Listen when a group could not be saved by the plugin.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} group_edit_save_error': function(el, ev) {
    const errorResponse = ev.data;
    if (errorResponse.header.code == 400) {
      // If it' an error with the group name, display validation error.
      if (errorResponse.body.Group != undefined && errorResponse.body.Group['name'] != undefined) {
        const errorGroup = errorResponse.body;
        this.formGroup.showErrors(errorGroup);
      } else {
        // If error with another field, log it in console.
        console.error('Validation error while saving group', errorResponse);
      }
    } else {
      // If error with something else, log it in console.
      console.error('Unknown error while saving group', errorResponse);
    }

    // Complete loading bar.
    MadBus.trigger('passbolt_loading_complete');
    MadBus.trigger('passbolt_notify', {
      status: 'error',
      title: 'app_groups_add_error',
      message: errorResponse.header.message,
      data: errorResponse
    });

    this.state.loaded = true;
  },

  /* ************************************************************** */
  /* LISTEN TO THE COMPONENT EVENTS */
  /* ************************************************************** */

  /**
   * The user want to remove a groupUser
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} request_group_user_delete': function(el, ev) {
    const groupUser = ev.data.groupUser;
    this.deleteGroupUser(groupUser);
  },

  /**
   * The user wants to edit a groupUser
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} request_group_user_edit': function(el, ev) {
    const groupUser = ev.data.groupUser;
    const isAdmin = ev.data.isAdmin;
    this.editGroupUser(groupUser, isAdmin);
  }

});

export default EditComponent;
