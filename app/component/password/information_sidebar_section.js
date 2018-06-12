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
import MadBus from 'passbolt-mad/control/bus';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/password/information_sidebar_section.stache!';

var InformationSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.password.InformationSidebarSection', /** @static */ {

	defaults: {
		label: 'Sidebar Section Information Controller',
		template: template,
		resource: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	beforeRender: function () {
		this._super();
		this.setViewData('resource', this.options.resource);
	},

	/**
	 * Observe when the item is updated
	 * @param {passbolt.model} item The updated item
	 */
	'{resource} updated': function (item) {
		this.refresh();
	},

	/**
	 * The password has been clicked.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	' li.password .secret-copy > a click': function (el, ev) {
		// Get secret out of Resource object.
		var secret = this.options.resource.secrets[0].data;
		// Request decryption. (delegated to plugin).
		MadBus.trigger('passbolt.secret.decrypt', secret);
	},

	/**
	 * The username has been clicked.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	' li.username .value > a click': function (el, ev) {
		var username = this.options.resource.username;
		MadBus.trigger('passbolt.clipboard', {
			name: 'username',
			data: username
		});
	}

});

export default InformationSidebarSectionComponent;