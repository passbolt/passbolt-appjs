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
import Clipboard from 'app/util/clipboard';
import ContextualMenuComponent from 'passbolt-mad/component/contextual_menu';
import MadBus from 'passbolt-mad/control/bus';
import PermissionType from 'app/model/map/permission_type';
import Plugin from 'app/util/plugin';

var GridContextualMenuComponent = ContextualMenuComponent.extend('passbolt.component.password.GridContextualMenu', /** @static */ {

    defaults: {
        resource: null
    }

}, /** @prototype */ {

    /**
     * @inheritdoc
     */
    afterStart: function () {
        var resource = this.options.resource;

        // Get the permission on the resource.
        var canRead = resource.permission.isAllowedTo(PermissionType.READ),
            canUpdate = resource.permission.isAllowedTo(PermissionType.UPDATE),
            canAdmin = resource.permission.isAllowedTo(PermissionType.ADMIN);

        // Add Copy username action.
        var action = new Action({
            id: 'js_password_browser_menu_copy_username',
            label: __('Copy username'),
            initial_state: !canRead ? 'disabled' : 'ready',
            action: () => this._copyLogin()
        });
        this.insertItem(action);

        // Add Copy password action.
        var action = new Action({
            id: 'js_password_browser_menu_copy_password',
            label: __('Copy password'),
            initial_state: !canRead ? 'disabled' : 'ready',
            action: () => this._copySecret()
        });
        this.insertItem(action);

        // Add Copy URI action.
        var action = new Action({
            id: 'js_password_browser_menu_copy_uri',
            label: __('Copy URI'),
            initial_state: !canRead ? 'disabled' : 'ready',
            action: () => this._copyUri()
        });
        this.insertItem(action);

        // Add Open URI in a new tab action.
        var action = new Action({
            id: 'js_password_browser_menu_open_uri',
            label: __('Open URI in a new tab'),
            initial_state: !canRead ? 'disabled' : 'ready',
            cssClasses: ['separator-after'],
            action: () => this._openUri()
        });
        this.insertItem(action);

        // Add Edit action.
        var action = new Action({
            id: 'js_password_browser_menu_edit',
            label: __('Edit'),
            initial_state: !canUpdate ? 'disabled' : 'ready',
            action: () => this._edit()
        });
        this.insertItem(action);

        // Add Share action.
        var action = new Action({
            id: 'js_password_browser_menu_share',
            label: __('Share'),
            initial_state: !canAdmin ? 'disabled' : 'ready',
            action: () => this._share()
        });
        this.insertItem(action);

        // Add Delete action.
        var action = new Action({
            id: 'js_password_browser_menu_delete',
            label: __('Delete'),
            initial_state: !canUpdate ? 'disabled' : 'ready',
            action: () => this._delete()
        });
        this.insertItem(action);

        this._super();
    },

    /**
     * Copy login to clipboard
     */
    _copyLogin: function() {
        Clipboard.copy(this.options.resource.username, 'username');
        this.remove();
    },

    /**
     * Copy secret to clipboard
     */
    _copySecret: function () {
        const secret = this.options.resource.secrets[0];
        Plugin.decryptAndCopyToClipboard(secret.data);
        this.remove();
    },

    /**
     * Copy uri to clipboard
     */
    _copyUri: function() {
        Clipboard.copy(this.options.resource.uri, 'URL');
        this.remove();
    },

    /**
     * Open uri in a new tab
     */
    _openUri: function() {
        var uri = this.options.resource.safeUri();
        window.open(uri, '_blank');
        this.remove();
    },

    /**
     * Edit the resource
     */
    _edit: function() {
        const resource = this.options.resource;
        MadBus.trigger('request_resource_edition', {resource});
        this.remove();
    },

    /**
     * Share the resource
     */
    _share: function() {
        const resource = this.options.resource;
        MadBus.trigger('request_resource_sharing', {resource});
        this.remove();
    },

    /**
     * Delete the resource
     */
    _delete: function() {
        const resource = this.options.resource;
        MadBus.trigger('request_resource_deletion', {resource});
        this.remove();
    }

});

export default GridContextualMenuComponent;
