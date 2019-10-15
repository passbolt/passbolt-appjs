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
import Ajax from '../../net/ajax';
import $ from 'jquery';
import Action from 'passbolt-mad/model/map/action';
import BreadcrumbComponent from '../user/workspace_breadcrumb';
import ButtonDropdownComponent from 'passbolt-mad/component/button_dropdown';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import Config from 'passbolt-mad/config/config';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import DialogComponent from 'passbolt-mad/component/dialog';
import Filter from '../../model/filter';
import GridComponent from '../user/grid';
import Group from '../../model/map/group';
import GroupDelete from '../../model/map/group_delete';
import GroupDeleteTransferPermissionForm from '../../form/group/delete_transfer_permission';
import GroupEditComponent from '../group/edit';
import GroupSecondarySidebarComponent from '../group/group_secondary_sidebar';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import PrimaryMenuComponent from '../user/workspace_primary_menu';
import PrimarySidebarComponent from '../user/primary_sidebar';
import route from 'can-route';
import SecondaryMenuComponent from '../workspace/secondary_menu';
import setObject from 'passbolt-mad/util/set/set';
import User from '../../model/map/user';
import UserCreateForm from '../../form/user/create';
import UserDelete from '../../model/map/user_delete';
import UserDeleteTransferPermissionForm from '../../form/user/delete_transfer_permission';
import UserSecondarySidebarComponent from '../user/user_secondary_sidebar';
import uuid from 'uuid/v4';

import createButtonTemplate from '../../view/template/component/workspace/create_button.stache';
import groupDeleteConfirmTemplate from '../../view/template/component/group/delete_confirm.stache';
import template from '../../view/template/component/user/workspace.stache';
import userDeleteConfirmTemplate from '../../view/template/component/user/delete_confirm.stache';

const UserWorkspaceComponent = Component.extend('passbolt.component.user.Workspace', /** @static */ {

  defaults: {
    name: 'user_workspace',
    template: template,
    // The current selected users
    selectedUsers: new User.List(),
    // The current selected groups
    selectedGroups: new Group.List(),
    // The current filter
    filter: null,
    // Override the silentLoading parameter.
    silentLoading: false,
    loadedOnStart: false,
    // State strategy
    state: 'ready',
    // Filter the workspace with this filter settings.
    filterSettings: null,
    // Models to listen to
    User: User,
    Group: Group
  },

  /**
   * Return the default filter used to filter the workspace
   * @return {Filter}
   */
  getDefaultFilterSettings: function () {
    return new Filter({
      id: 'default',
      type: 'default',
      label: __('All users'),
      order: ['Profile.first_name ASC']
    });
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function (el, options) {
    this._super(el, options);
    this._firstLoad = true;
  },

  /**
   * Dispatch route
   * @private
   */
  _dispatchRoute: function () {
    const action = route.data.action;
    switch (action) {
      case 'view': {
        const id = route.data.id;
        const user = this.options.grid.options.items.filter({ id: id }).pop();
        if (user) {
          this.options.selectedUsers.push(user);
        } else {
          MadBus.trigger('passbolt_notify', {
            status: 'error',
            title: `app_users_view_error_not_found`
          });
        }
        break;
      }
      case 'delete': {
        const id = route.data.id;
        const user = this.options.grid.options.items.filter({ id: id }).pop();
        if (user) {
          this.deleteUser(user);
        } else {
          MadBus.trigger('passbolt_notify', {
            status: 'error',
            title: `app_users_delete_error_not_found`
          });
        }
        break;
      }
      case 'groupDelete': {
        const id = route.data.id;
        // Cannot use the local store to retrieve the group because of a Canjs issue, see model/map/group for more details.
        Group.findOne({ id: id })
          .then(group => {
            this.deleteGroup(group);
          });
        break;
      }
      case 'groupEdit': {
        const id = route.data.id;
        // Cannot use the local store to retrieve the group because of a Canjs issue, see model/map/group for more details.
        Group.findOne({ id: id })
          .then(group => {
            this.openEditGroupDialog(group);
          });
        break;
      }
      case 'groupViewMembership':
      case 'groupView': {
        const id = route.data.id;
        // Cannot use the local store to retrieve the group because of a Canjs issue, see model/map/group for more details.
        Group.findOne({ id: id })
          .then(group => {
            this.options.selectedGroups.splice(0, this.options.selectedGroups.length, group);
          });
        break;
      }
      case 'add': {
        const username = route.data.username;
        const firstName = route.data.first_name;
        const lastName = route.data.last_name;
        const data = {
          username: username,
          profile: {
            first_name: firstName,
            last_name: lastName
          }
        };
        const user = new User(data);
        this.openCreateUserDialog(user);
        break;
      }
      case 'edit': {
        const id = route.data.id;
        const user = this.options.grid.options.items.filter({ id: id }).pop();
        if (user) {
          const data = {};
          const firstName = route.data.first_name;
          const lastName = route.data.last_name;
          if (firstName) {
            setObject(data, 'profile.first_name', firstName);
          }
          if (lastName) {
            setObject(data, 'profile.last_name', lastName);
          }
          user.assignDeep(data);
          this.openEditUserDialog(user);
        } else {
          MadBus.trigger('passbolt_notify', {
            status: 'error',
            title: `app_users_edit_error_not_found`
          });
        }
        break;
      }
    }
  },

  /**
   * @inheritdoc
   */
  afterStart: function () {
    const primaryMenu = this._initPrimaryMenu();
    const secondaryMenu = this._initSecondaryMenu();
    const mainActionButton = this._initMainActionButton();
    const breadcrumb = this._initBreadcrumb();
    const primarySidebar = this._initPrimarySidebar();
    const grid = this._initGrid();

    primaryMenu.start();
    secondaryMenu.start();
    if (mainActionButton) {
      mainActionButton.start();
    }
    breadcrumb.start();
    primarySidebar.start();
    grid.start();

    // Apply a filter to the workspace
    let filter = null;
    if (this.options.filterSettings == undefined) {
      filter = this.constructor.getDefaultFilterSettings();
    } else {
      filter = this.options.filterSettings;
    }

    // Filter the workspace
    MadBus.trigger('filter_workspace', { filter: filter });

    this.on();
    this._super();
  },

  /**
   * Observer when the component is loaded / loading
   * @param {boolean} loaded True if loaded, false otherwise
   */
  onLoadedChange: function (loaded) {
    if (loaded) {
      if (this._firstLoad) {
        this._firstLoad = false;
        this._dispatchRoute();
      }
    }
    this._super(loaded);
  },

  /**
   * Init the primary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   * @return {Component}
   */
  _initPrimaryMenu: function () {
    const component = ComponentHelper.create(
      $('#js_wsp_primary_menu_wrapper'),
      'last',
      PrimaryMenuComponent, {
        selectedUsers: this.options.selectedUsers,
        selectedGroups: this.options.selectedGroups
      }
    );
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Init the secondary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   * @return {Component}
   */
  _initSecondaryMenu: function () {
    const component = ComponentHelper.create(
      $('#js_wsp_secondary_menu_wrapper'),
      'last',
      SecondaryMenuComponent, {
        selectedItems: this.options.selectedUsers
      }
    );
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the workspace main action button.
   * @return {Component}
   */
  _initMainActionButton: function () {
    const role = User.getCurrent().role.name;

    // Create user / group capability is only available to admin user.
    if (role == 'admin') {
      const items = [
        new Action({
          id: uuid(),
          label: __('New user'),
          cssClasses: ['create-user'],
          action: function () {
            button.view.close();
            MadBus.trigger('request_user_creation');
          }
        }),
        new Action({
          id: uuid(),
          label: __('New group'),
          cssClasses: ['create-group'],
          action: function () {
            button.view.close();
            MadBus.trigger('request_group_creation');
          }
        })
      ];

      const button = ComponentHelper.create(
        $('.main-action-wrapper'),
        'last',
        ButtonDropdownComponent, {
          id: 'js_wsp_create_button',
          template: createButtonTemplate,
          tag: 'a',
          cssClasses: ['button', 'primary'],
          silentLoading: false,
          items: items
        }
      );

      this.options.mainButton = button;
      this.addLoadedDependency(button);
      return button;
    }
  },

  /**
   * Initialize the workspace breadcrumb
   * @return {Component}
   */
  _initBreadcrumb: function () {
    const component = new BreadcrumbComponent('#js_wsp_users_breadcrumb', {
      rootFilter: UserWorkspaceComponent.getDefaultFilterSettings(),
      silentLoading: false
    });
    this.breadcrumCtl = component;
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the primary sidebar component
   * @return {Component}
   */
  _initPrimarySidebar: function () {
    const component = new PrimarySidebarComponent('#js_user_workspace_primary_sidebar', {
      defaultFilter: UserWorkspaceComponent.getDefaultFilterSettings(),
      selectedUsers: this.options.selectedUsers,
      selectedGroups: this.options.selectedGroups,
      silentLoading: false
    });
    this.options.primarySidebar = component;
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the grid component
   * @return {Component}
   */
  _initGrid: function () {
    const component = new GridComponent('#js_wsp_users_browser', {
      selectedUsers: this.options.selectedUsers,
      silentLoading: false
    });
    this.options.grid = component;
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Open the group edit dialog.
   * @param {Group} group The target group entity.
   */
  openEditGroupDialog: function (group) {
    const dialog = DialogComponent.instantiate({
      label: group.isNew() ? __('Create group') : __('Edit group'),
      cssClasses: ['edit-group-dialog', 'dialog-wrapper']
    }).start();

    // Attach the component to the dialog.
    dialog.add(GroupEditComponent, {
      id: 'js_edit_group',
      data: {
        Group: group
      },
      callbacks: {
        saved: function () {
          dialog.remove();
        }
      }
    });
  },

  /**
   * Open the user create dialog.
   * @param {User} user The target user entity.
   */
  openCreateUserDialog: function (user) {
    const self = this;
    const dialog = DialogComponent.instantiate({
      label: __('Add User'),
      cssClasses: ['create-user-dialog', 'dialog-wrapper']
    }).start();

    const form = dialog.add(UserCreateForm, {
      data: user,
      action: 'create',
      callbacks: {
        submit: formData => {
          const userToCreate = new User(formData['User']);
          // The component will be marked as loaded when its children will be marked as loaded.
          this.state.loaded = false;
          self._saveUser(userToCreate, form, dialog)
            .then(() => {
              this._resetFilter();
            });
        }
      }
    });
    form.load(user);
  },

  /**
   * Open the user edit dialog.
   * @param {User} user The target user entity.
   */
  openEditUserDialog: function (user) {
    const self = this;
    const dialog = DialogComponent.instantiate({
      label: __('Edit User'),
      cssClasses: ['edit-user-dialog', 'dialog-wrapper']
    }).start();

    const form = dialog.add(UserCreateForm, {
      data: user,
      action: 'edit',
      callbacks: {
        submit: function (formData) {
          const userToUpdate = new User(formData['User']);
          self._saveUser(userToUpdate, form, dialog);
        }
      }
    });
    form.load(user);
  },

  /**
   * Save a user after creating/editing it with the create/edit forms.
   * @param {User} user The target user
   * @param {Form} form The form object
   * @param {Dialog} dialog The dialog object
   * @return {Promise}
   */
  _saveUser: function (user, form, dialog) {
    return user.save()
      .then(savedUser => {
        user.assign(savedUser);
        dialog.remove();
      }, response => {
        form.showErrors({ User: response.body });
        return Promise.reject();
      });
  },

  /**
   * Perform a group deletion.
   * @param {Group} group
   */
  deleteGroup: function (group) {
    group.deleteDryRun()
      .then(resources => {
        this._deleteGroupConfirm(group, resources);
      }, response => {
        response.body.group_id = group.id;
        // Cannot be done by the Group model, the can-define module does not support well circular references.
        const groupDelete = new GroupDelete(response.body);
        this._openDeleteGroupTransferPermissionsDialog(group, groupDelete);
      });
  },

  /**
   * Request the user to confirm the group delete operation.
   * @param {Group} group The target group
   * @param {array<Resource>} resources The resources that are shared with
   */
  _deleteGroupConfirm: function (group, resources) {
    const dialog = ConfirmDialogComponent.instantiate({
      label: __('Are you sure ?'),
      subtitle: __('You are about to delete the group "%s"!', group.name),
      submitButton: {
        label: __('delete group'),
        cssClasses: ['warning']
      },
      content: groupDeleteConfirmTemplate,
      viewData: {
        group: group,
        resources: resources
      },
      action: function () {
        group.delete();
      }
    });
    dialog.start();
  },

  /**
   * Display the group transfer permissions dialog.
   * @param {Group} group The group to delete.
   * @param {GroupDelete} groupDelete An object containing the error target
   */
  _openDeleteGroupTransferPermissionsDialog: function (group, groupDelete) {
    const dialog = DialogComponent.instantiate({
      label: __('You cannot delete this group!'),
      cssClasses: ['delete-group-dialog', 'dialog-wrapper']
    }).start();

    // Attach the component to the dialog.
    dialog.add(GroupDeleteTransferPermissionForm, {
      id: 'js_delete_group',
      group: group,
      groupDelete: groupDelete,
      callbacks: {
        submit: formData => {
          group.delete(formData);
          dialog.remove();
        }
      }
    });
  },

  /**
   * Resend invitation to the user that didn't complete the setup.
   * @param {User} user The user to resnd the invitation.
   */
  resendInvitation: async function (user) {
    await Ajax.request({
      url: 'users/recover.json?api-version=v2',
      type: 'POST',
      params: {
        'username': user.username
      }
    });
    MadBus.trigger('passbolt_notify', {
      title: 'app_notificationresendinvitation_success',
      status: 'success'
    });
  },

  /**
   * Delete a user.
   * Request a dry-run delete on the API.
   * - If the dry-run is a success, ask the user to confirm the deletion;
   * - If the dry-run failed, notify the user about the reasons.
   * @param {User} user The user to delete.
   */
  deleteUser: function (user) {
    user.deleteDryRun()
      .then(() => {
        this._deleteUserConfirm(user);
      })
      .then(null, response => {
        if (response.body) {
          response.body.user_id = user.id;
          // Cannot be done by the User model, the can-define module does not support well circular references.
          const userDelete = new UserDelete(response.body);
          this._openDeleteUserTransferPermissionsDialog(user, userDelete);
        }
      });
  },

  /**
   * Request the user to confirm the user delete operation.
   * @param {User} user The user to delete.
   */
  _deleteUserConfirm: function (user) {
    const dialog = ConfirmDialogComponent.instantiate({
      label: __('Delete user?'),
      content: userDeleteConfirmTemplate,
      submitButton: {
        label: __('delete user'),
        cssClasses: ['warning']
      },
      action: () => user.delete()
    });
    dialog.setViewData('user', user);
    dialog.start();
  },

  /**
   * Display the user transfer permissions dialog.
   * @param {User} user The user to delete.
   * @param {array} data An object containing the error target
   */
  _openDeleteUserTransferPermissionsDialog: function (user, userDelete) {
    const dialog = DialogComponent.instantiate({
      label: __('You cannot delete this user!'),
      cssClasses: ['delete-user-dialog', 'dialog-wrapper']
    }).start();

    // Attach the component to the dialog.
    dialog.add(UserDeleteTransferPermissionForm, {
      id: 'js_delete_user',
      user: user,
      userDelete: userDelete,
      callbacks: {
        submit: formData => {
          user.delete(formData);
          dialog.remove();
        }
      }
    });
  },

  /**
   * Reset the workspace filter
   * @private
   */
  _resetFilter: function () {
    const filter = UserWorkspaceComponent.getDefaultFilterSettings();
    filter.forceReload = true;
    MadBus.trigger('filter_workspace', { filter: filter });
  },

  /**
   * Init the user secondary sidebar.
   * @private
   */
  _initUserSecondarySidebar: function () {
    const showSidebar = Config.read('ui.workspace.showSidebar');
    if (!showSidebar) {
      return;
    }
    this._destroyUserSecondarySidebar();
    this._destroyGroupSecondarySidebar();
    const user = this.options.selectedUsers[0];
    const state = Config.read('ui.workspace.showSidebar') ? 'ready' : 'hidden';
    const options = {
      id: 'js_user_details',
      user: user,
      silentLoading: false,
      cssClasses: ['panel', 'aside', 'js_wsp_users_sidebar_second'],
      state: state
    };
    const component = ComponentHelper.create(this.element, 'last', UserSecondarySidebarComponent, options);
    component.start();
    this.options.userSecondarySidebar = component;
  },

  /**
   * Init the group secondary sidebar.
   * @private
   */
  _initGroupSecondarySidebar: function () {
    const showSidebar = Config.read('ui.workspace.showSidebar');
    if (!showSidebar) {
      return;
    }
    this._destroyUserSecondarySidebar();
    this._destroyGroupSecondarySidebar();
    const group = this.options.selectedGroups[0];
    const state = Config.read('ui.workspace.showSidebar') ? 'ready' : 'hidden';
    const options = {
      id: 'js_group_details',
      group: group,
      silentLoading: false,
      cssClasses: ['panel', 'aside', 'js_wsp_groups_sidebar_second'],
      state: state
    };
    const component = ComponentHelper.create(this.element, 'last', GroupSecondarySidebarComponent, options);
    component.start();
    this.options.groupSecondarySidebar = component;
  },

  /**
   * Destroy the user secondary sidebar
   * @private
   */
  _destroyUserSecondarySidebar: function () {
    if (this.options.userSecondarySidebar) {
      this.options.userSecondarySidebar.destroyAndRemove();
      this.options.userSecondarySidebar = null;
    }
  },

  /**
   * Destroy the group secondary sidebar
   * @private
   */
  _destroyGroupSecondarySidebar: function () {
    if (this.options.groupSecondarySidebar) {
      this.options.groupSecondarySidebar.destroyAndRemove();
      this.options.groupSecondarySidebar = null;
    }
  },

  /**
   * Observe when users are selected
   */
  '{selectedUsers} add': function () {
    this._initUserSecondarySidebar();
  },

  /**
   * Observe when users are selected
   */
  '{selectedUsers} remove': function () {
    this._destroyUserSecondarySidebar();
  },

  /**
   * Observe when groups are selected
   */
  '{selectedGroups} add': function () {
    this._initGroupSecondarySidebar();
  },

  /**
   * Observe when users are selected
   */
  '{selectedGroups} remove': function () {
    this._destroyGroupSecondarySidebar();
  },

  /**
   * Observe when a user is updated.
   * If the user is currently selected, update the instance instance in selectedUsers array
   * @param {DefineMap.prototype} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {User} user The updated user
   */
  '{User} updated': function (model, ev, user) {
    const userSelectedIndex = this.options.selectedUsers.indexOf(user);
    if (userSelectedIndex != -1) {
      this.options.selectedUsers[userSelectedIndex].assign(user);
    }
  },

  /**
   * Observe when a user is destroyed.
   * - Remove it from the list of selected users;
   * @param {DefineMap} model The target model
   * @param {Event} event The even
   * @param {User} user The destroyed item
   */
  '{User} destroyed': function (model, event, user) {
    const selectedUsers = this.options.selectedUsers;
    selectedUsers.remove(user);
  },

  /**
   * Observe when a group is destroyed.
   * - Remove it from the list of selected groups;
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {Group} group The destroyed group
   */
  '{Group} destroyed': function (el, ev, group) {
    const selectedGroups = this.options.selectedGroups;
    if (selectedGroups.indexOf({ id: group.id }) != -1) {
      selectedGroups.remove(group);
      this._resetFilter();
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * When a new filter is applied to the workspace.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function (el, ev) {
    const filter = ev.data.filter;
    // Unselect all group if the filter does not target a group (dirty).
    if (!filter.rules['has-groups']) {
      this.options.selectedGroups.splice(0, this.options.selectedGroups.length);
    }
    this.options.selectedUsers.splice(0, this.options.selectedUsers.length);
    this.breadcrumCtl.load(filter);
  },

  /**
   * Observe when the user requests a group creation
   */
  '{mad.bus.element} request_group_creation': function () {
    const group = new Group({});
    this.openEditGroupDialog(group);
  },

  /**
   * Observe when the user requests a group edition
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_group_edition': function (el, ev) {
    const group = ev.data.group;
    this.openEditGroupDialog(group);
  },

  /**
   * Observe when the user requests a group deletion
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_group_deletion': function (el, ev) {
    const group = ev.data.group;
    this.deleteGroup(group);
  },

  /**
   * Observe when the user requests a user creation
   */
  '{mad.bus.element} request_user_creation': function () {
    const user = new User({});
    this.openCreateUserDialog(user);
  },

  /**
   * Observe when the user requests a user edition
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_user_edition': function (el, ev) {
    const user = ev.data.user;
    this.openEditUserDialog(user);
  },

  /**
   * Observe when the user requests a user deletion
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_user_deletion': function (el, ev) {
    const user = ev.data.user;
    this.deleteUser(user);
  },

  /**
     * Observe when the admin requests to resend the invitation
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
  '{mad.bus.element} request_resend_invitation': function (el, ev) {
    const user = ev.data.user;
    this.resendInvitation(user);
  },

  /**
   * Observe when the workspace sidebar setting change.
   */
  '{mad.bus.element} workspace_sidebar_state_change': function () {
    const user = this.options.selectedUsers[0];
    const group = this.options.selectedGroups[0];
    if (user) {
      this._initUserSecondarySidebar();
    } else if (group) {
      this._initGroupSecondarySidebar();
    }
  }

});

export default UserWorkspaceComponent;
