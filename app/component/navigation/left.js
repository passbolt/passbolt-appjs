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
import DomData from 'can-util/dom/data/data';
import MadBus from 'passbolt-mad/control/bus';
import MenuComponent from 'passbolt-mad/component/menu';

var NavigationLeft = MenuComponent.extend('passbolt.component.AppNavigationLeft', /** @static */ {

	defaults: {
		selected: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		// passwords
		var passwordsItem = new Action({
			id: 'js_app_nav_left_password_wsp_link',
			label: __('passwords'),
			cssClasses: ['password'],
			action: () => this._goToPasswordWorkspace()
		});
		this.insertItem(passwordsItem);

		// users
		var usersItem =  new Action({
			id:  'js_app_nav_left_user_wsp_link',
			label: __('users'),
			cssClasses: ['user'],
			action: () => this._goToUserWorkspace()
		});
		this.insertItem(usersItem);

		// help
		var helpItem = new Action({
			id: 'js_app_nav_left_help_link',
			label: __('help'),
			cssClasses: ['help'],
			action: () => this._goHelp()
		});
		this.insertItem(helpItem);
	},

	// Go to the password workspace
	_goToPasswordWorkspace: function() {
		this.options.selected = 'password';
		MadBus.trigger('request_workspace', 'password');
	},

	// Go to the user workspace
	_goToUserWorkspace: function() {
		this.options.selected = 'user';
		MadBus.trigger('request_workspace', 'user');
	},

	// Go to the passbolt help
	_goHelp: function() {
		var helpWindow = window.open();
		helpWindow.opener = null;
		helpWindow.location = 'https://help.passbolt.com';
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user wants to switch to another workspace
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @param {string} workspace The target workspace
	 * @param {array} options Workspace's options
	 */
	'{mad.bus.element} request_workspace': function (el, event, workspace, options) {
		if (this.options.selected != workspace) {
			var li = $('li.' + workspace),
				itemClass = this.getItemClass();

			if (itemClass) {
				var data = DomData.get.call(li[0], itemClass.shortName);
				if (typeof data != 'undefined') {
					this.selectItem(data);
				}
			}

		}
	}

});

export default NavigationLeft;
