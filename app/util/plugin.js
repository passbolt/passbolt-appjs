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
     * Decrypt and copy to clipboard a secret
     * @param {sting} secret The secret to decrypt and copy to clipboard
     */
    static decryptAndCopyToClipboard(secret) {
        this.send('passbolt.secret.decrypt', secret);
    }

    /**
     * Request the plugin to insert the group edit iframe
     * @param {string} groupId The target group id
     * @param {boolean} canAddGroupUsers Is the current user can add members to this group
     */
    static insertGroupEditframe(groupId, canAddGroupUsers) {
        this.send('passbolt.plugin.group_edit', {groupId, canAddGroupUsers});
    }

    /**
     * Request the plugin to edit a group user
     * @param {GroupUser} groupUser The group user to remove
     */
    static groupEditIframeEditGroupUser(groupUser) {
        var data = {
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
        var data = {
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
        this.send('passbolt.group.edit.save', {group});
    }

    /**
     * Request the plugin to insert the share iframe
     * @param {string} resourceId The target resource id
     * @param {string} armored The armored secret
     */
    static insertShareIframe(resourceId, armored) {
        this.send('passbolt.plugin.resource_share', {resourceId, armored});
    }

    /**
     * Remove permission in the share iframe.
     * @param {string} userId
     * @param {boolean} isTemporaryPermission
     */
    static shareIframeRemovePermission(userId, isTemporaryPermission) {
        this.send('passbolt.share.remove_permission', {userId, isTemporaryPermission});
    }

    /**
     * Request the plugin to encrypt the secret regarding the share changes.
     */
    static shareIframeEncrypt() {
        this.send('passbolt.share.encrypt');
    }

    /**
     * Send a message to the plugin
     * @param {string} type The event type
     * @param {mixed} data The data to send with the event
     */
    static send(type, data) {
        data = data || {};
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, true, true, data);
        document.documentElement.dispatchEvent(event);
    }
}

export default Plugin;
