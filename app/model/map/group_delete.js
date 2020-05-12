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

const GroupDelete = DefineMap.extend('passbolt.model.GroupDelete', {
  group_id: 'string',
  groups_to_delete: Group.List,
  errors: {
    type: {
      resources: {
        type: {
          sole_owner: "array"
        }
      },
      folders: {
        type: {
          sole_owner: "array"
        }
      }
    }
  },

  /**
   * Get the resources to transfer the owner for.
   * @return {Resource.List}
   */
  getResourcesToTransferOwner: function() {
    const resourcesSoleOwner = getObject(this, 'errors.resources.sole_owner') || [];
    let resources = new Resource.List(resourcesSoleOwner);
    resources = resources.sort((a, b) => a.name > b.name);
    resources.forEach(resource => {
      resource.permissions = resource.permissions.filter(permission => permission.aro_foreign_key != this.group_id);
    });

    return resources;
  },

  /**
   * Get the folders to transfer the owner for.
   * @return {array}
   */
  getFoldersToTransferOwner: function() {
    let folders = getObject(this, 'errors.folders.sole_owner') || [];
    folders = folders.sort((a, b) => a.name > b.name);
    folders.forEach(folder => {
      folder.permissions = folder.permissions.filter(permission => permission.aro_foreign_key != this.group_id);
    });

    return folders;
  }

});

export default GroupDelete;
