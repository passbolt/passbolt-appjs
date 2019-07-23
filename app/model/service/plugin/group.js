/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.11.0
 */
import Plugin from '../../../util/plugin';

export default class GroupService {

  /**
   * Request the plugin to insert the group edit iframe
   * @param {string} groupId The target group id
   * @param {boolean} canAddGroupUsers Is the current user can add members to this group
   */
  static insertGroupEditframe(groupId, canAddGroupUsers) {
    Plugin.send('passbolt.plugin.group_edit', { groupId, canAddGroupUsers });
  }

  /**
   * Request the plugin to edit a group user
   * @param {GroupUser} groupUdataser The group user to remove
   */
  static groupEditIframeEditGroupUser(data) {
    const groupUser = {
      id: data.id,
      user_id: data.user_id,
      group_id: data.group_id,
      is_admin: data.is_admin,
      is_new: data.is_new
    };
    Plugin.send('passbolt.group.edit.edit_group_user', { groupUser });
  }

  /**
   * Request the plugin to remove a group user
   * @param {GroupUser} data The group user to remove
   */
  static groupEditIframeRemoveGroupUser(data) {
    const groupUser = {
      id: data.id,
      user_id: data.user_id,
      group_id: data.group_id,
      is_admin: data.is_admin,
      is_new: data.is_new || false
    };
    Plugin.send('passbolt.group.edit.remove_group_user', { groupUser });
  }

  /**
   * Request the plugin to save the group
   * @param {Object} group The group to save
   */
  static groupEditIframeSave(group) {
    Plugin.send('passbolt.group.edit.save', { group });
  }
}
