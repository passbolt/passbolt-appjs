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
 * @since         2.2.0
 */

class Plugin {
  /**
   * Decrypt a secret and copy it to clipboard
   * @param {string} resourceId The resource id to decrypt and copy the secret for
   */
  static decryptSecretAndCopyToClipboard(resourceId) {
    this.send('passbolt.plugin.decrypt_secret_and_copy_to_clipboard', resourceId);
  }

  /**
   * Request the plugin to insert the resource edit iframe
   * @param {string} resource The target resource id
   */
  static insertResourceEditframe(resourceId) {
    this.send('passbolt.plugin.resource_edit', resourceId);
  }

  /**
   * Request the plugin to insert the group edit iframe
   * @param {string} groupId The target group id
   * @param {boolean} canAddGroupUsers Is the current user can add members to this group
   */
  static insertGroupEditframe(groupId, canAddGroupUsers) {
    this.send('passbolt.plugin.group_edit', {groupId: groupId, canAddGroupUsers: canAddGroupUsers});
  }

  /**
   * Request the plugin to edit a group user
   * @param {GroupUser} groupUser The group user to remove
   */
  static groupEditIframeEditGroupUser(groupUser) {
    const data = {
      groupUser: {
        id: groupUser.id,
        user_id: groupUser.user_id,
        group_id: groupUser.group_id,
        is_admin: groupUser.is_admin,
        is_new: groupUser.is_new
      }
    };
    this.send('passbolt.group.edit.edit_group_user', data);
  }

  /**
   * Request the plugin to remove a group user
   * @param {GroupUser} groupUser The group user to remove
   */
  static groupEditIframeRemoveGroupUser(groupUser) {
    const data = {
      groupUser: {
        id: groupUser.id,
        user_id: groupUser.user_id,
        group_id: groupUser.group_id,
        is_admin: groupUser.is_admin,
        is_new: groupUser.is_new || false
      }
    };
    this.send('passbolt.group.edit.remove_group_user', data);
  }

  /**
   * Request the plugin to save the group
   * @param {Object} group The group to save
   */
  static groupEditIframeSave(group) {
    this.send('passbolt.group.edit.save', {group: group});
  }

  /**
   * Request the plugin to insert the bulk share iframe
   * @param {array} resourcesIds The list of resources ids to share
   */
  static insertShareIframe(resourcesIds) {
    this.send('passbolt.plugin.resources_share', {resourcesIds: resourcesIds});
  }

  /**
   * Send a message to the plugin
   * @param {string} type The event type
   * @param {mixed} data The data to send with the event
   */
  static send(type, data) {
    data = data || {};
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, data);
    document.documentElement.dispatchEvent(event);
  }
}

export default Plugin;
