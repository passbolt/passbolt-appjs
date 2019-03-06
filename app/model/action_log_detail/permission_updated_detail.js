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

import ActionLogDetail from 'app/model/action_log_detail/action_log_detail';
import Group from "../map/group";
import Profile from "../map/profile";
import PermissionType from "../map/permission_type";

class PermissionUpdatedDetail extends ActionLogDetail {
  /**
   * Constructor
   * @param options
   */
  constructor(user, resource, permissions) {
    super(user, resource);

    // Added, updated and removed will contain the permissions changes.
    this.added = [];
    this.updated = [];
    this.removed = [];

    // Transform data in our own format.
    this.mapPermissions(permissions);
    console.log('added', this.added);
  }

  /**
   * Get permissionAroAvatarPath
   * @param permission
   * @return {*}
   */
  getPermissionAroAvatarPath(permission) {
    try {
      if (permission.user) {
        return Profile.avatarPath(permission.user.profile, 'small');
      } else if (permission.group) {
        return Group.avatarPath(permission.group);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Get permission full name.
   * @param permission
   * @return {*}
   */
  getPermissionFullName(permission) {
    if (permission.user) {
      return Profile.fullName(permission.user.profile);
    } else if (permission.group) {
      return permission.group.name;
    } else {
      return '';
    }
  }

  /**
   * Map permission.
   * @param permission
   */
  mapPermission(permission) {
    const res = {};

    if (permission.user) {
      res['user'] = permission.user;
      res['user'].profile = new Profile(res['user'].profile);
    }
    if (permission.group) {
      res['group'] = permission.group;
    }
    if (permission.resource) {
      res['resource'] = permission.resource;
    }
    res['aro_avatar_path'] = this.getPermissionAroAvatarPath(res);
    res['full_name'] = this.getPermissionFullName(res);

    if (permission.type === PermissionType.READ || permission.type === PermissionType.UPDATE) {
      res['type_human_readable'] = `${__('can')} ${PermissionType.PERMISSION_TYPES[permission.type]}`;
    } else if (permission.type === PermissionType.ADMIN) {
      res['type_human_readable'] = __('is admin');
    } else {
      res['type_human_readable'] = __('unknown');
    }

    return res;
  }

  /**
   * Map a list of permissions.
   * @param permissions
   */
  mapPermissions(permissions) {
    try {
      const self = this;
      permissions.added.forEach(added => {
        const perm = self.mapPermission(added);
        perm['action_type'] = 'created';
        self.added.push(perm);
      });
      permissions.updated.forEach(updated => {
        const perm = self.mapPermission(updated);
        perm['action_type'] = 'updated';
        self.updated.push(perm);
      });
      permissions.removed.forEach(removed => {
        const perm = self.mapPermission(removed);
        perm['action_type'] = 'removed';
        self.removed.push(perm);
      });
    } catch (e) {
      console.error(e.message);
    }
  }
}

export default PermissionUpdatedDetail;
