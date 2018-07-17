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
import Action from 'passbolt-mad/model/map/action';
import BreadcrumbComponent from 'app/component/user/workspace_breadcrumb';
import ButtonDropdownComponent from 'passbolt-mad/component/button_dropdown';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import DialogComponent from 'passbolt-mad/component/dialog';
import Filter from 'app/model/filter';
import GridComponent from 'app/component/user/grid';
import Group from 'app/model/map/group';
import GroupEditComponent from 'app/component/group/edit';
import GroupSecondarySidebarComponent from 'app/component/group/group_secondary_sidebar';
import MadBus from 'passbolt-mad/control/bus';
import PrimaryMenuComponent from 'app/component/user/workspace_primary_menu';
import PrimarySidebarComponent from 'app/component/user/primary_sidebar';
import SecondaryMenuComponent from 'app/component/workspace/secondary_menu';
import User from 'app/model/map/user';
import UserCreateForm from 'app/form/user/create';
import UserSecondarySidebarComponent from 'app/component/user/user_secondary_sidebar';
import uuid from 'uuid/v4';

import createButtonTemplate from 'app/view/template/component/workspace/create_button.stache!';
import groupDeleteConfirmTemplate from 'app/view/template/component/group/delete_confirm.stache!';
import groupDeleteErrorTemplate from 'app/view/template/component/group/delete_error.stache!';
import template from 'app/view/template/component/user/workspace.stache!';
import userDeleteConfirmTemplate from 'app/view/template/component/user/delete_confirm.stache!';
import userDeleteErrorTemplate from 'app/view/template/component/user/delete_error_dialog.stache!';

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
  getDefaultFilterSettings: function() {
    return new Filter({
      id: 'default',
      label: __('All users'),
      order: ['Profile.last_name ASC']
    });
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initPrimaryMenu();
    this._initSecondaryMenu();
    this.options.mainButton = this._initMainActionButton();
    this._initBreadcrumb();
    this._initPrimarySidebar();
    this._initGrid();
    this._initSecondarySidebar();

    /*
     * A filter has been given in options.
     * If not given, set one by default.
     */
    let filter = null;
    if (this.options.filterSettings == undefined) {
      filter = this.constructor.getDefaultFilterSettings();
    } else {
      filter = this.options.filterSettings;
    }

    // Filter the workspace
    MadBus.trigger('filter_workspace', {filter: filter});

    this.on();
  },

  /**
   * Destroy the workspace.
   */
  destroy: function() {
    // Be sure that the primary & secondary workspace menus controllers will be destroyed also.
    $('#js_wsp_primary_menu_wrapper').empty();
    $('#js_wsp_secondary_menu_wrapper').empty();
    $('.main-action-wrapper').empty();

    // Destroy Selected users.
    this.options.selectedUsers.splice(0, this.options.selectedUsers.length);

    // Call parent.
    this._super();
  },

  /**
   * Init the primary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   */
  _initPrimaryMenu: function() {
    const menu = ComponentHelper.create(
      $('#js_wsp_primary_menu_wrapper'),
      'last',
      PrimaryMenuComponent, {
        selectedUsers: this.options.selectedUsers,
        selectedGroups: this.options.selectedGroups
      }
    );
    menu.start();
  },

  /**
   * Init the secondary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   */
  _initSecondaryMenu: function() {
    const menu = ComponentHelper.create(
      $('#js_wsp_secondary_menu_wrapper'),
      'last',
      SecondaryMenuComponent, {
        selectedItems: this.options.selectedUsers
      }
    );
    menu.start();
  },

  /**
   * Initialize the workspace main action button.
   * @returns {mad.Component}
   */
  _initMainActionButton: function() {
    let button = null;
    const role = User.getCurrent().role.name;

    // Create user / group capability is only available to admin user.
    if (role == 'admin') {
      button = ComponentHelper.create(
        $('.main-action-wrapper'),
        'last',
        ButtonDropdownComponent, {
          id: 'js_wsp_create_button',
          template: createButtonTemplate,
          tag: 'a',
          cssClasses: ['button', 'primary'],
          silentLoading: false
        }
      );
      button.start();

      // New user item
      const userItem = new Action({
        id: uuid(),
        label: __('New user'),
        cssClasses: ['create-user'],
        action: function() {
          button.view.close();
          MadBus.trigger('request_user_creation');
        }
      });
      button.options.menu.insertItem(userItem);

      // New group item
      const groupItem = new Action({
        id: uuid(),
        label: __('New group'),
        cssClasses: ['create-group'],
        action: function() {
          button.view.close();
          MadBus.trigger('request_group_creation');
        }
      });
      button.options.menu.insertItem(groupItem);
    }

    return button;
  },

  /**
   * Initialize the workspace breadcrumb
   */
  _initBreadcrumb: function() {
    const component = new BreadcrumbComponent('#js_wsp_users_breadcrumb', {
      rootFilter: UserWorkspaceComponent.getDefaultFilterSettings(),
      silentLoading: false
    });
    component.start();
    this.breadcrumCtl = component;
  },

  /**
   * Initialize the primary sidebar component
   */
  _initPrimarySidebar: function() {
    const component = new PrimarySidebarComponent('#js_user_workspace_primary_sidebar', {
      defaultFilter: UserWorkspaceComponent.getDefaultFilterSettings(),
      selectedUsers: this.options.selectedUsers,
      selectedGroups: this.options.selectedGroups,
      silentLoading: false
    });
    component.start();
  },

  /**
   * Initialize the grid component
   */
  _initGrid: function() {
    const component = new GridComponent('#js_wsp_users_browser', {
      selectedUsers: this.options.selectedUsers,
      silentLoading: false
    });
    component.start();
  },

  /**
   * Initialize the secondary sidebar components
   */
  _initSecondarySidebar: function() {
    // Instantiate the user details controller
    new UserSecondarySidebarComponent('.js_wsp_users_sidebar_second', {
      id: 'js_user_details',
      selectedItems: this.options.selectedUsers
    });
    $('.js_wsp_users_sidebar_second', this.element).hide();

    // Instantiate the group details controller
    new GroupSecondarySidebarComponent('.js_wsp_groups_sidebar_second', {
      id: 'js_group_details',
      selectedItems: this.options.selectedGroups,
      silentLoading: false
    });
    $('.js_wsp_groups_sidebar_second', this.element).hide();
  },

  /**
   * Open the group edit dialog.
   *
   * @param {Group} group The target group entity.
   */
  openEditGroupDialog: function(group) {
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
        saved: function() {
          dialog.remove();
        }
      }
    });
  },

  /**
   * Open the user create dialog.
   *
   * @param {User} user The target user entity.
   */
  openCreateUserDialog: function(user) {
    const self = this;
    const dialog = DialogComponent.instantiate({
      label: __('Add User'),
      cssClasses: ['create-user-dialog', 'dialog-wrapper']
    }).start();

    const form = dialog.add(UserCreateForm, {
      data: user,
      action: 'create',
      callbacks: {
        submit: function(formData) {
          const userToCreate = new User(formData['User']);
          self._saveUser(userToCreate, form, dialog);
        }
      }
    });
    form.load(user);
  },

  /**
   * Open the user edit dialog.
   *
   * @param {User} user The target user entity.
   */
  openEditUserDialog: function(user) {
    const self = this;
    const dialog = DialogComponent.instantiate({
      label: __('Edit User'),
      cssClasses: ['edit-user-dialog', 'dialog-wrapper']
    }).start();

    const form = dialog.add(UserCreateForm, {
      data: user,
      action: 'edit',
      callbacks: {
        submit: function(formData) {
          const userToUpdate = new User(formData['User']);
          self._saveUser(userToUpdate, form, dialog);
        }
      }
    });
    form.load(user);
  },

  /**
   * Save a user after creating/editing it with the create/edit forms.
   *
   * @param {User} user The target user
   * @param {mad.Form} form The form object
   * @param {Dialog} dialog The dialog object
   */
  _saveUser: function(user, form, dialog) {
    user.save()
      .then(() => {
        dialog.remove();
      }, response => {
        form.showErrors({User: response.body});
      });
  },

  /**
   * Perform a group deletion.
   *
   * @param group
   */
  deleteGroup: function(group) {
    const self = this;

    // First do a dry run to determine whether the group can be deleted.
    group.deleteDryRun()
      .then(resources => {
        self._deleteGroupConfirm(group, resources);
      }, response => {
        self._deleteGroupError(group, response.body);
      });
  },

  /**
   * Request the user to confirm the group delete operation.
   *
   * @param {Group} group The target group
   * @param {array<Resource>} resources The resources that are shared with
   */
  _deleteGroupConfirm: function(group, resources) {
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
      action: function() {
        group.destroy();
      }
    });
    dialog.start();
  },

  /**
   * Let the user know why the group cannot be deleted
   *
   * @param {Group} group The target group
   * @param {array<Resource>} resources The resources that need a permission transfer
   */
  _deleteGroupError: function(group, resources) {
    const dialog = ConfirmDialogComponent.instantiate({
      label: __('You cannot delete this group!'),
      subtitle: __('You are trying to delete the group "%s"!', group.name),
      submitButton: {
        label: __('Got it!'),
        cssClasses: []
      },
      content: groupDeleteErrorTemplate,
      viewData: {
        group: group,
        resources: resources
      },
      action: function() {
        dialog.remove();
      }
    });
    dialog.start();
  },

  /**
   * Delete a user.
   *
   * Request a dry-run delete on the API.
   * - If the dry-run is a success, ask the user to confirm the deletion;
   * - If the dry-run failed, notify the user about the reasons.
   *
   * @param {User} user The user to delete.
   */
  deleteUser: function(user) {
    const self = this;

    user.deleteDryRun()
    // In case of success.
      .then(() => {
      // Display the delete confirmation dialog.
        self._deleteUserConfirm(user);
      })
    // In case of error.
      .then(null, response => {
      // Display the error dialog.
        if (response.body) {
          const data = response.body;
          self._deleteUserError(user, data);
        }
      });
  },

  /**
   * Request the user to confirm the user delete operation.
   *
   * @param {User} user The user to delete.
   */
  _deleteUserConfirm: function(user) {
    ConfirmDialogComponent.instantiate({
      label: __('Do you really want to delete?'),
      content: userDeleteConfirmTemplate,
      submitButton: {
        label: __('delete user'),
        cssClasses: ['warning']
      },
      action: function() {
        user.destroy();
      }
    }).start();
  },

  /**
   * Notify the user regarding the delete failure.
   *
   * @param {User} user The user to delete.
   * @param {array} data An object containing the error target
   */
  _deleteUserError: function(user, data) {
    const dialog = ConfirmDialogComponent.instantiate({
      label: __('You cannot delete this user!'),
      subtitle: __('You are trying to delete the user "%s"!', user.profile.fullName()),
      content: userDeleteErrorTemplate,
      viewData: data,
      submitButton: {
        label: __('Got it!'),
        cssClasses: []
      },
      action: function() {
        dialog.remove();
      }
    }).start();
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when a user is destroyed.
   * - Remove it from the list of selected users;
   * @param {DefineMap} model The target model
   * @param {Event} event The even
   * @param {DefineMap} destroyedItem The destroyed item
   */
  '{User} destroyed': function(model, event, destroyedItem) {
    this.options.selectedUsers.remove(destroyedItem);
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * When a new filter is applied to the workspace.
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    // If the filter applied is "all users", then empty the list of selected groups.
    if (typeof filter.name != 'undefined') {
      if (filter.name == 'all') {
        this.options.selectedGroups.splice(0, this.options.selectedGroups.length);
      }
    }
    this.options.selectedUsers.splice(0, this.options.selectedUsers.length);

    // Update the breadcrumb with the new filter.
    this.breadcrumCtl.load(filter);
  },


  /**
   * Observe when the user requests a group creation
   */
  '{mad.bus.element} request_group_creation': function() {
    const group = new Group({});
    this.openEditGroupDialog(group);
  },

  /**
   * Observe when the user requests a group edition
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_group_edition': function(el, ev) {
    const group = ev.data.group;
    this.openEditGroupDialog(group);
  },

  /**
   * Observe when the user requests a group deletion
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_group_deletion': function(el, ev) {
    const group = ev.data.group;
    this.deleteGroup(group);
  },

  /**
   * Observe when the user requests a user creation
   */
  '{mad.bus.element} request_user_creation': function() {
    const user = new User({});
    this.openCreateUserDialog(user);
  },

  /**
   * Observe when the user requests a user edition
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_user_edition': function(el, ev) {
    const user = ev.data.user;
    this.openEditUserDialog(user);
  },

  /**
   * Observe when the user requests a user deletion
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_user_deletion': function(el, ev) {
    const user = ev.data.user;
    this.deleteUser(user);
  },

  /**
   * Reset the filters.
   * Unselect the group if it was selected, and select All users instead.
   */
  '{mad.bus.element} reset_filters': function() {
    const filter = UserWorkspaceComponent.getDefaultFilterSettings();
    MadBus.trigger('filter_workspace', {filter: filter});
  }

});

export default UserWorkspaceComponent;
