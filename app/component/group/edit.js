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
import canEventMap from 'can-event-queue/map/map';
import Component from 'passbolt-mad/component/component';
import DialogComponent from 'passbolt-mad/component/dialog';
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import EditView from 'app/view/component/group/edit';
import Group from 'app/model/map/group';
import GroupCreateForm from 'app/form/group/create';
import GroupUser from 'app/model/map/group_user';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Plugin from 'app/util/plugin';
import TreeComponent from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';
import User from 'app/model/map/user';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/group/edit.stache!';
import treeItemTemplate from 'app/view/template/component/group/group_user_list_item.stache!';

var EditComponent = Component.extend('passbolt.component.group.Edit', /** @static */ {

    defaults: {
        label: null,
        cssClasses: ['share-tab'],
        viewClass: EditView,
        template: template,
        state: 'loading',
        resource: null,
        GroupUserChanges: [],
        data: {
            Group: {}
        },
        // Component callbacks
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
                  this.options.state = 'ready';
                  this.setState('ready');
              }
              this.showFeedback();
              this.on();
          }, (error) => {
              console.log('something happened', error);
          });
    },

    /**
     */
    _findGroup: function(group) {
        var self = this;

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
              .then(function(group) {
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
        var group = this.options.data.Group;
        var form = new GroupCreateForm('#js_group_edit_form', {
            data: group,
            canUpdateName: this.isGroupManager && !this.isAdmin ? false: true,
            callbacks : {}
        });
        form.start();
        form.load(group);
        this.formGroup = form;
    },

    /**
     * Initialize the group users list
     */
    _initGroupUsersList: function() {
        var map = this._getGroupUsersListMap();
        var treeComponent = new TreeComponent('#js_permissions_list', {
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
     * @returns {mad.Map}
     */
    _getGroupUsersListMap: function() {
        return new MadMap({
            id: 'id',
            userAvatarPath: {
                key: 'user',
                func: function(user, map, obj) {
                    return user.profile.avatarPath('small');
                }
            },
            userLabel: {
                key: 'user',
                func: function(user, map, obj) {
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
            // By default it is disabled, it will be enabled once the user has entered
            // a name and added a group admin.
            state: 'disabled'
        }).start();
    },

    /**
     * Notify the plugin about the group edit
     */
    _notifyPlugin: function() {
        const group = this.options.data.Group;
        const canAddGroupUsers = this.formState == 'create' || this.isGroupManager;
        const groupId = group.id || '';
        Plugin.insertGroupEditframe(groupId, canAddGroupUsers);
    },

    /**
     * Show a visual feedback as per the form status.
     * Feedback can be:
     * - The group is empty, please add a group manager.
     * - You need to click save for the changes to take place.
     * - Only the group manager can add new people to a group
     */
    showFeedback: function() {
        var feedback = [];
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
            feedback.forEach(function(fb) {
                $('.message.feedback').append('<span>' + fb + '</span>');
            });
            $('.message.feedback').removeClass('hidden');
        }
        else {
            $('.message.feedback').addClass('hidden');
        }
    },

    /**
     * Load a group to edit.
     *
     * @param group
     */
    loadGroup: function(group) {
        var self = this;

        // Update the form with the group data.
        this.formGroup.load({Group: group});

        // Load groupUsers.
        group.groups_users.forEach(function(groupUser) {
            self.addGroupUser(groupUser);
        });

        // Mark the component as ready.
        // If the component rendering is slower than the time the plugin makes to retrieve the group.
        this.options.state = 'ready';
        this.setState('ready');
    },

    /**
     * Load a groupUser in the list.
     * @param groupUser
     */
    loadGroupUser: function(groupUser) {
        var groupUserId = groupUser.id,
            groupUserTypeSelector = '#js_group_user_is_admin_select_' + groupUserId,
            groupUserSelector = '#' + groupUserId;

        // Insert GroupUser in the list.
        this.groupUserList.insertItem(groupUser);

        // Add a selectbox to display the permission type (and allow to change)
        var dropdownComponent = new DropdownComponent($('.js_group_user_is_admin', groupUserTypeSelector)[0], {
            id: 'js_group_user_is_admin_' + groupUserId,
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
        var buttonComponent = new ButtonComponent($('.js_group_user_delete', $('.actions', groupUserSelector))[0], {
            id: 'js_group_user_delete_' + groupUserId,
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
        }
        else {
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
        Plugin.groupEditIframeRemoveGroupUser(groupUser);
        this.checkManager();
    },

    /**
     * Edit a group user
     * @param groupUser The groupUser to edit
     */
    editGroupUser: function(groupUser, value) {
        groupUser.is_admin = value;
        Plugin.groupEditIframeEditGroupUser(groupUser);
        this.checkManager();
    },

    /**
     * Check whether there are enough group managers, and lock the neccessary is_admin fields if necessary.
     * @returns {boolean}
     */
    checkManager: function() {
        var admins = this.groupUserList.options.items.filter(item => {
            return item.is_admin === true;
        });

        // If the groups is manage by several group managers.
        // Allow the user to change the membership type of the admin.
        if (admins.length > 1) {
            admins.forEach(admin =>  {
                var permTypeDropdown = this._permissionChangeTypeDropDowns[admin.id];
                var permDeleteButton = this._permissionDeleteButtons[admin.id];

                // Disable the permission type field and the permission delete button
                permTypeDropdown.setState('ready');
                permDeleteButton.setState('ready');
            });
        }
        // If only one admin, the membership of the admin cannot be changed.
        else if (admins.length == 1) {
            var permTypeDropdown = this._permissionChangeTypeDropDowns[admins[0].id];
            var permDeleteButton = this._permissionDeleteButtons[admins[0].id];

            // Disable the permission type field and the permission delete button
            permTypeDropdown.setState('disabled');
            permDeleteButton.setState('disabled');
        }

        // If at least one admin is set, the form can be saved.
        if (admins.length) {
            this.options.saveChangesButton.setState('ready');
        }
        else {
            this.options.saveChangesButton.setState('disabled');
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
    setGroupUserItemState : function(groupUserId, state) {
        var $li = this.groupUserList.view.getItemElement({id:groupUserId});

        if (state == null) {
            $li.removeClass('permission-updated');
            $('.permission_changes span', $li).text(__('Unchanged'));
        }
        else {
            $li.addClass('permission-updated');
            var text = state == 'created' ? __('Will be added') : __('Will be updated');
            $('.permission_changes span', $li).text(text);
        }
    },

    /* ************************************************************** */
    /* LISTEN TO THE VIEW EVENTS */
    /* ************************************************************** */

    /**
     * The user request the form to be saved.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{saveChangesButton.element} click': function(el, ev) {
        if (this.state.is('ready')) {
            // Validate form.
            var validate = this.formGroup.validate();

            var hasAdmins = this.checkManager();
            if (validate == true && hasAdmins == true) {
                var formData = this.formGroup.getData();
                var groupJson = {name: formData['Group']['name']};

                MadBus.trigger('passbolt_loading');
                Plugin.groupEditIframeSave(groupJson);

                // Switch the component in loading state.
                // The ready state will be restored once the component will be refreshed.
                this.setState('loading');

                // Button goes in processing state.
                this.options.saveChangesButton.setState('processing');
            }
        }
    },

    /* ************************************************************** */
    /* LISTEN TO THE PLUGIN EVENTS */
    /* ************************************************************** */

    /**
     * Listen when a group has been loaded by the plugin.
     */
    '{mad.bus.element} passbolt.plugin.group.edit.group_loaded': function(el, ev, data) {
        // @todo Bug (#REF NEEDED), the data provided by the plugin are incomplete (users gpg key fingerprint missing).
        // Use the group which is loaded in the afterStart method.
        this.loadGroup(this.options.data.Group);
    },

    /**
     * Listen when a permission has been added through the plugin.
     */
    '{mad.bus.element} passbolt.group.edit.add_user': function(el, ev) {
        const data = ev.data;

        // @todo remove it when the plugin deprecate the v1 format.
        // V1 format to v2 manually.
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

        var groupUser = new GroupUser(data);
        this.addGroupUser(groupUser);
    },

    /**
     * Listen when a change to group users has been reported by the plugin.
     */
    '{mad.bus.element} passbolt.plugin.group.edit.group_users_updated': function(el, ev) {
        const data = ev.data;
        var self = this;
        self.changeList = data.changeList;

        setTimeout(function() {
            self.groupUserList.options.items.forEach(function(item) {
                var userId = item.user_id,
                    groupUserId = item.id,
                    correspondingChange = data.changeList.find(function(item) {
                        return item.user_id == userId;
                    });

                if (correspondingChange != undefined) {
                    // We act only for created and updated. Deleted simply disappear from the list.
                    if (correspondingChange.status == 'created' || correspondingChange.status == 'updated') {
                        self.setGroupUserItemState(groupUserId, correspondingChange.status);
                    }
                }
                else {
                    // Reset groupUser state.
                    self.setGroupUserItemState(groupUserId, null);
                }
            });
            self.showFeedback();
        }, 0);
    },

    /**
     * Listen when a group has been added / updated through the plugin.
     */
    '{mad.bus.element} group_edit_save_success': function(el, ev) {
        // Retrieve the created/updated group.
        const data = ev.data;
        var findOptions = {
            id: data.Group.id,
            contain: {group_user: 1}
        };

        Group.findOne(findOptions)
        .then(group => {
            if (this.formState == 'create') {
                Group.dispatch('created', [group]);
            } else {
                MadBus.trigger('group_replaced', {group});
            }

            this.setState('ready');
            MadBus.trigger('passbolt_loading_complete');
            MadBus.trigger('passbolt_notify', {
                status: 'success',
                title: 'app_groups_' + (this.formState == 'create' ? 'add' : 'edit') + '_success',
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
     * @param el
     * @param ev
     * @param json errorResponse the response sent by the server in json format.
     */
    '{mad.bus.element} group_edit_save_error': function(el, ev, errorResponse) {
        if (errorResponse.header.status_code == 400) {
            // If it' an error with the group name, display validation error.
            if (errorResponse.body.Group != undefined
                && errorResponse.body.Group['name'] != undefined) {
                var errorGroup = errorResponse.body;
                this.formGroup.showErrors(errorGroup);
            }
            else {
                // If error with another field, log it in console.
                console.error('Validation error while saving group', errorResponse);
            }
        }
        else {
            // If error with something else, log it in console.
            console.error('Unknown error while saving group', errorResponse);
        }

        // Complete loading bar.
        MadBus.trigger('passbolt_loading_complete');
        MadBus.trigger('passbolt_notify', {
            status: 'error',
            title: 'app_groups_add_error',
            data: errorResponse
        });

        // The ready state is restored.
        this.setState('ready');

        // Button goes back in processing state.
        this.options.saveChangesButton.setState('ready');
    },

    /* ************************************************************** */
    /* LISTEN TO THE COMPONENT EVENTS */
    /* ************************************************************** */

    /**
     * The user want to remove a groupUser
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{element} request_group_user_delete': function (el, ev) {
        const groupUser = ev.data.groupUser;
        this.deleteGroupUser(groupUser);
    },

    /**
     * The user wants to edit a groupUser
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{element} request_group_user_edit': function (el, ev) {
        const groupUser = ev.data.groupUser;
        const isAdmin = ev.data.isAdmin;
        this.editGroupUser(groupUser, isAdmin);
    }

});

export default EditComponent;
