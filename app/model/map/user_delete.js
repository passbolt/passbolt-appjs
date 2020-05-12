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
import DefineMap from 'passbolt-mad/model/map/map';
import getObject from 'can-util/js/get/get';
import Group from './group';
import Resource from './resource';

const UserDelete = DefineMap.extend('passbolt.model.UserDelete', {
  user_id: 'string',
  groups_to_delete: Group.List,
  errors: {
    type: {
      groups: {
        type: {
          sole_manager: {
            Type: Group.List,
            Value: Group.List
          }
        }
      },
      resources: {
        type: {
          sole_owner: 'array'
        }
      },
      folders: {
        type: {
          sole_owner: 'array'
        }
      }
    }
  },

  /**
   * Get the groups to transfer the manager for.
   * @return {Group.List}
   */
  getGroupsToTransferManager: function() {
    const groups = getObject(this, 'errors.groups.sole_manager') || [];
    groups.forEach(group => {
      // The user who is going to be deleted cannot be the manager of the group.
      group.groups_users = group.groups_users.filter(group_user => group_user.user.id != this.user_id);
      group.groups_users = group.groups_users.sort((a, b) => a.user.profile.first_name < b.user.profile.first_name);
    });
    return groups;
  },

  /**
   * Get the resources to transfer the owner for.
   * @return {Resource.List}
   */
  getResourcesToTransferOwner: function() {
    let resources = new Resource.List();
    const resourcesSoleOwner = getObject(this, 'errors.resources.sole_owner') || [];
    const resourcesSoleManagerOfGroupSoleOwner = getObject(this, 'errors.resources.sole_manager_of_group_sole_owner') || [];
    const groupsToDelete = getObject(this, 'groups_to_delete') || [];

    // The user who is going to be deleted and the groups that are going to be deleted cannot be the owner of the resource.
    let excludedOwners = [this.user_id];
    excludedOwners = excludedOwners.concat(groupsToDelete.reduce((carry, group) => carry.concat(group.id), []));

    resources = resources.concat(resourcesSoleOwner);
    resources = resources.concat(resourcesSoleManagerOfGroupSoleOwner);
    resources = resources.sort((a, b) => a.name > b.name);
    resources.forEach(resource => {
      resource.permissions = resource.permissions.filter(permission => excludedOwners.indexOf(permission.aro_foreign_key) == -1);
    });

    return resources;
  },

  /**
   * Get the folders to transfer the owner for.
   * @return {array}
   */
  getFoldersToTransferOwner: function() {
    let folders = getObject(this, 'errors.folders.sole_owner') || [];
    const groupsToDelete = getObject(this, 'groups_to_delete') || [];

    // The user who is going to be deleted and the groups that are going to be deleted cannot be the owner of the resource.
    let excludedOwners = [this.user_id];
    excludedOwners = excludedOwners.concat(groupsToDelete.reduce((carry, group) => carry.concat(group.id), []));

    folders = folders.sort((a, b) => a.name > b.name);
    folders.forEach(folder => {
      folder.permissions = folder.permissions.filter(permission => excludedOwners.indexOf(permission.aro_foreign_key) == -1);
    });

    return folders;
  }

});

export default UserDelete;
