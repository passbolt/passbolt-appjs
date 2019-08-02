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
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import Form from 'passbolt-mad/form/form';
import GroupUser from '../../model/map/group_user';
import getObject from 'can-util/js/get/get';
import Permission from '../../model/map/permission';

import template from '../../view/template/form/user/delete_transfer_permissions.stache';

const DeleteTransferPermissionForm = Form.extend('passbolt.form.user.DeleteTransferPermissionForm', /** @static */ {

  defaults: {
    template: template,
    user: null,
    userDelete: {}
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this.user = this.options.user;
    const userDelete = this.options.userDelete;
    this.groups = userDelete.getGroupsToTransferManager();
    this.resources = userDelete.getResourcesToTransferOwner();
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this.setViewData('resources', this.resources);
    this.setViewData('groups', this.groups);
    this.setViewData('user', this.user);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initGroupsTransferSection();
    this._initResourcesTransferSection();
  },

  /**
   * Initialize the groups transfer section
   */
  _initGroupsTransferSection: function() {
    this.groups.forEach(group => {
      const groupsUsers = new GroupUser.List(group.groups_users);
      groupsUsers.sortAlphabetically();
      const users = this._prepareGroupsTransferUsersViewData(groupsUsers);
      const dropdownSelector = `transfer_group_manager_${group.id}`;
      const dropdown = new DropdownComponent(`#${dropdownSelector}`, {
        emptyValue: false,
        validate: false,
        modelReference: `transfer.managers.${group.id}`,
        availableValues: users,
        value: Object.keys(users)[0]
      });
      dropdown.start();
      this.addElement(dropdown);
    });
  },

  /**
   * Prepare a group transfer available users for the view.
   * @param {GroupUser.List} groupsUsers
   * @return {object}
   */
  _prepareGroupsTransferUsersViewData: function(groupsUsers) {
    return groupsUsers.reduce((carry, groupUser) => {
      carry[groupUser.id] = `${groupUser.user.profile.first_name} ${groupUser.user.profile.last_name} (${groupUser.user.username})`;
      return carry;
    }, {});
  },

  /**
   * Initialize the resources transfer section
   */
  _initResourcesTransferSection: function() {
    this.resources.forEach(resource => {
      const permissions = new Permission.List(resource.permissions);
      permissions.sortAlphabetically();
      const aros = this._prepareResourcesTransferArosViewData(permissions);
      const dropdownSelector = `transfer_resource_owner_${resource.id}`;
      const dropdown = new DropdownComponent(`#${dropdownSelector}`, {
        emptyValue: false,
        validate: false,
        modelReference: `transfer.owners.${resource.id}`,
        availableValues: aros,
        value: Object.keys(aros)[0]
      });
      dropdown.start();
      this.addElement(dropdown);
    });
  },

  /**
   * Prepare a resource transfer available users for the view.
   * @param {Permission.List} permissions
   * @return {object}
   */
  _prepareResourcesTransferArosViewData: function(permissions) {
    return permissions.reduce((carry, permission) => {
      const value = permission.id;
      const label = permission.user ? `${permission.user.profile.first_name} ${permission.user.profile.last_name} (${permission.user.username})` : `${permission.group.name} (Group)`;
      carry[value] = label;
      return carry;
    }, {});
  },

  /**
   * Format the data.
   * @inheritdoc
   */
  getData: function() {
    const data = this._super();
    const owners = getObject(data, 'transfer.owners') || {};
    const managers = getObject(data, 'transfer.managers') || {};
    const transfer = {owners: [], managers: []};

    for (const aco in owners) {
      transfer.owners.push({aco_foreign_key: aco, id: owners[aco]});
    }
    for (const groupId in managers) {
      transfer.managers.push({group_id: groupId, id: managers[groupId]});
    }

    return transfer;
  }

});

export default DeleteTransferPermissionForm;
