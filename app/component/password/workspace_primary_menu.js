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
import Component from 'passbolt-mad/component/component';
import Config from 'passbolt-mad/config/config';
import ButtonComponent from 'passbolt-mad/component/button';
import ButtonDropdownComponent from 'passbolt-mad/component/button_dropdown';
import MadBus from 'passbolt-mad/control/bus';
import PermissionType from 'app/model/map/permission_type';
import Resource from 'app/model/map/resource';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/password/workspace_primary_menu.stache!';

var PasswordWorkspaceMenuComponent = Component.extend('passbolt.component.PasswordWorkspaceMenu', /** @static */ {

    defaults: {
        label: 'Workspace Menu Controller',
        tag: 'ul',
        // the selected resources, you can pass an existing list as parameter of the constructor to share the same list
        selectedRs: new Resource.List(),
        template: template
    }

}, /** @prototype */ {

    /**
     * @inheritdoc
     */
    afterStart: function () {
		// Copy secret button
        var copySecretButton = new ButtonComponent('#js_wk_menu_secretcopy_button', {
            state: 'disabled',
            events: {
                click: () => this._copySecret()
            }
        });
        copySecretButton.start();
		this.options.secretCopyButton = copySecretButton;

		// Edit button
        var editButton = new ButtonComponent('#js_wk_menu_edition_button', {
            state: 'disabled',
            events: {
                click: () => this._edit()
            }
        });
        editButton.start();
        this.options.editButton = editButton;

        // Share button
        var shareButton = new ButtonComponent('#js_wk_menu_sharing_button', {
            state: 'disabled',
            events: {
                click: () => this._share()
            }
        });
        shareButton.start();
        this.options.shareButton = shareButton;

        // Export
        this._initExportButton();

        // More button items
        var moreButtonMenuItems = [];

        // Copy login
        var copyLoginItem = new Action({
            id: uuid(),
            label: __('copy login to clipboard'),
            cssClasses: [],
            action: () => this._copyLogin()
        });
        moreButtonMenuItems.push(copyLoginItem);

        // Copy secret
        var copySecretItem = new Action({
            id: uuid(),
            label: __('copy password to clipboard'),
            cssClasses: [],
            action: () => this._copySecret()
        });
        moreButtonMenuItems.push(copySecretItem);

        // Delete
        var deleteItem = new Action({
            id: 'js_wk_menu_delete_action',
            label: __('delete'),
            cssClasses: [],
            action: () => this._delete()
        });
        moreButtonMenuItems.push(deleteItem);

        var moreButton = new ButtonDropdownComponent('#js_wk_menu_more_button', {
            state: 'disabled',
            items: moreButtonMenuItems,
            template: null
        });
        moreButton.start();
        this.options.moreButton = moreButton;

        // @todo URGENT, buggy, it rebinds 2 times external element event (such as madbus)
        this.on();
    },

    /**
     * Init export button.
     * @private
     */
    _initExportButton: function() {
        if (Config.read('server.passbolt.plugins.export')) {
            var exportButtonSelector = '#js_wk_menu_export_button';
            $(exportButtonSelector).removeClass('hidden');
            var exportButton = new ButtonComponent(exportButtonSelector, {
                events: {
                    click: () => this._export()
                }
            });
            exportButton.start();
            this.options.exportButton = exportButton;
        }
    },

    /**
     * Copy login to clipboard.
     */
    _copyLogin: function() {
        var username = this.options.selectedRs[0].username;
        MadBus.trigger('passbolt.clipboard', {
            name: 'username',
            data: username
        });
    },

    /**
     * Decrypt and copy secret to clipboard
     */
    _copySecret: function() {
        var secret = this.options.selectedRs[0].secrets[0].data;
        MadBus.trigger('passbolt.secret.decrypt', secret);
    },

    /**
     * Delete
     */
    _delete: function() {
        var resource = this.options.selectedRs[0];
        MadBus.trigger('request_resource_deletion', resource);
    },

    /**
     * Edit
     */
    _edit: function() {
        var resource = this.options.selectedRs[0];
        MadBus.trigger('request_resource_edition', resource);
    },

    /**
     * Share
     */
    _share: function() {
        var resource = this.options.selectedRs[0];
        MadBus.trigger('request_resource_sharing', resource);
    },

    /**
     * Export
     */
    _export: function() {
        MadBus.trigger('request_export', 'csv');
    },

    /* ************************************************************** */
    /* LISTEN TO THE MODEL EVENTS */
    /* ************************************************************** */

    /**
     * Observe when a resource is selected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.Resource} resource The selected resource
     */
    '{selectedRs} add': function (el, ev, resource) {
        // If a resource is selected
        if (this.options.selectedRs.length == 1) {
            this.setState('selection');
        } else if (this.options.selectedRs.length == 0) {
            this.setState('ready');
        }
    },

    /**
     * Observe when a resource is unselected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.Resource} resource The unselected resource
     */
    '{selectedRs} remove': function (el, ev, resource) {
        // If a resource is selected
        if (this.options.selectedRs.length == 1) {
            this.setState('selection');
        }
        else if (this.options.selectedRs.length == 0) {
            this.setState('ready');
        }
    },

    /* ************************************************************** */
    /* LISTEN TO THE STATE CHANGES */
    /* ************************************************************** */

    /**
     * Listen to the change relative to the state selected
     * @param {boolean} go Enter or leave the state
     */
    stateSelection: function (go) {
        if (go) {
            var permission = this.options.selectedRs[0].permission;
            // Is the resource editable ?
            var updatable = permission.isAllowedTo(PermissionType.UPDATE);
            // Is the resource administrable ?
            var administrable = permission.isAllowedTo(PermissionType.ADMIN);

			this.options.secretCopyButton
				.setValue(this.options.selectedRs[0])
				.setState('ready');
            this.options.editButton
                .setValue(this.options.selectedRs[0])
                .setState(updatable ? 'ready' : 'disabled');
            this.options.shareButton
                .setValue(this.options.selectedRs)
                .setState(administrable ? 'ready' : 'disabled');
            this.options.moreButton
                .setValue(this.options.selectedRs[0])
                .setState('ready');
			this.options.moreButton.setItemState('js_wk_menu_delete_action', updatable ? 'ready' : 'disabled')
        } else {
			this.options.secretCopyButton
				.setValue(null)
				.setState('disabled');
            this.options.editButton
                .setValue(null)
                .setState('disabled');
            this.options.shareButton
                .setValue(null)
                .setState('disabled');
            this.options.moreButton
                .setValue(null)
                .setState('disabled');
			this.options.moreButton.setItemState('js_wk_menu_delete_action', 'disabled');
        }
    }

});

export default PasswordWorkspaceMenuComponent;
