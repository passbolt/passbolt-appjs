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
import GpgkeySectionComponent from 'app/component/gpgkey/gpgkey_sidebar_section';
import InformationSectionComponent from 'app/component/user/information_sidebar_section';
import MadBus from 'passbolt-mad/control/bus';
import SecondarySidebarComponent from 'app/component/workspace/secondary_sidebar';
import UserGroupsSidebarSectionComponent from 'app/component/group_user/user_groups_sidebar_section';
import UserSecondarySidebarView from 'app/view/component/user/user_secondary_sidebar';

import template from 'app/view/template/component/user/user_secondary_sidebar.stache!';

var UserSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.user.UserSecondarySidebar', /** @static */ {

	defaults: {
		label: 'User Details Controller',
		viewClass: UserSecondarySidebarView,
		template: template,
		selectedItem: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	beforeRender: function () {
		this._super();
		this.setViewData('user', this.options.selectedItem);
	},

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		this._super();
		this._initInformationSection();
		this._initUserGroupsSection();
		this._initGpgkeySection();
	},

	/**
	 * Initialize the information section
	 */
	_initInformationSection: function() {
		var informationComponent = new InformationSectionComponent('#js_user_details_information', {
			user: this.options.selectedItem
		});
		informationComponent.start();
	},

	/**
	 * Initialize the user groups section
	 */
	_initUserGroupsSection: function() {
		// active field will not be provided for non admin users,
		// but we still want to display information regarding groups.
		if (this.options.selectedItem.active === undefined || this.options.selectedItem.active == '1') {
			// Instantiate the groups list component for the current user.
			var userGroups = new UserGroupsSidebarSectionComponent('#js_user_groups', {
				user: this.options.selectedItem
			});
			userGroups.start();
		}
	},

	/**
	 * Initialize the gpgkey section
	 */
	_initGpgkeySection: function() {
		if (!this.options.selectedItem.gpgkey) {
			return;
		}

		var gpgkeyComponent = new GpgkeySectionComponent('#js_user_gpgkey', {
			gpgkey: this.options.selectedItem.gpgkey,
			cssClasses: ['closed']
		});
		gpgkeyComponent.start();
	},

	/**
	 * Observer when the user is updated.
	 */
	'{selectedItem} updated': function() {
		this.setTitle(this.options.selectedItem.profile.fullName());
		this.setSubtitle(this.options.selectedItem.username);
	},

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	 * Listen when a user clicks on copy public key.
	 */
	' request_copy_publickey': function(el, ev) {
		// Get secret out of Resource object.
		var gpgKey = this.options.selectedItem.gpgkey.armored_key;
		// Build data.
		var data = {
			name : 'Public key',
			data : gpgKey
		};
		// Request decryption. (delegated to plugin).
		MadBus.trigger('passbolt.clipboard', data);
	}

});

export default UserSecondarySidebarComponent;
