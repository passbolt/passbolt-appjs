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
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import MadBus from 'passbolt-mad/control/bus';
import template from 'app/view/template/component/settings/workspace_primary_menu.stache!';

var SettingsWorkspaceMenu = Component.extend('passbolt.component.settings.WorkspacePrimaryMenu', /** @static */ {
	defaults: {
		label: 'Settings Workspace Menu',
		template: template
	}

}, /** @prototype */ {

	/**
	 * After start hook.
	 * @see {mad.Component}
	 */
	afterStart: function () {
		// Edit user
		var editButton = new ButtonComponent('#js_settings_wk_menu_edition_button', {});
		editButton.start();
		this.options.editButton = editButton;

		// Download public key
		var publicKeyButton = new ButtonComponent('#js_settings_wk_menu_download_public_key', {});
		publicKeyButton.start();
		this.options.publicKeyButton = publicKeyButton;

		// Download private key
		var privateKeyButton = new ButtonComponent('#js_settings_wk_menu_download_private_key', {});
		privateKeyButton.start();
		this.options.privateKeyButton = privateKeyButton;

		this.on();
	},

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user wants to edit an instance (Resource, User depending of the active workspace)
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{editButton.element} click': function (el, ev) {
		MadBus.trigger('request_profile_edition');
	},

	/**
	 * Observe when the user wants to download his public key.
	 * @param el
	 * @param ev
	 */
	'{publicKeyButton.element} click': function (el, ev) {
		MadBus.trigger('passbolt.settings.download_public_key');
	},

	/**
	 * Observe when the user wants to download his private key.
	 * @param el
	 * @param ev
	 */
	'{privateKeyButton.element} click': function (el, ev) {
		MadBus.trigger('passbolt.settings.download_private_key');
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user changes section inside the workspace, and adjust the menu items accordingly
	 * @param el
	 * @param ev
	 * @param section
	 */
	'{mad.bus.element} request_settings_section': function(el, ev, section) {
 		if (section == 'profile') {
			this.options.editButton.setState('ready');
			this.options.publicKeyButton.setState('hidden');
			this.options.privateKeyButton.setState('hidden');
		} else if (section == 'keys') {
			this.options.editButton.setState('hidden');
			this.options.publicKeyButton.setState('ready');
			this.options.privateKeyButton.setState('ready');
		}
	}
});

export default SettingsWorkspaceMenu;
