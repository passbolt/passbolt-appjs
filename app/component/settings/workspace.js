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
import UserEditAvatarForm from 'app/form/user/edit_avatar';
import BreadcrumbComponent from 'app/component/settings/workspace_breadcrumb';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import DialogComponent from 'passbolt-mad/component/dialog';
import KeysComponent from 'app/component/gpgkey/keys';
import MadBus from 'passbolt-mad/control/bus';
import MenuComponent from 'passbolt-mad/component/menu';
import PrimaryMenuComponent from 'app/component/settings/workspace_primary_menu';
import ProfileComponent from 'app/component/profile/profile';
import TabComponent from 'passbolt-mad/component/tab';
import User from 'app/model/map/user';
import UserCreateForm from 'app/form/user/create';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/settings/workspace.stache!';

var SettingsWorkspaceComponent = Component.extend('passbolt.component.settings.Workspace', /** @static */ {

	defaults: {
		name: 'settings_workspace',
		template: template,
		sections : [
			'profile',
			'keys'
		],
		// Override the silentLoading parameter.
		silentLoading: false
	}
}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function() {
		this._initPrimaryMenu();
		this._initPrimarySidebar();
		this._initBreadcrumb();
		this._initTabs();
	},

	/**
	 * Destroy the workspace.
	 */
	destroy: function() {
		// Be sure that the primary workspace menu controller will be destroyed also.
		$('#js_wsp_primary_menu_wrapper').empty();
		// Destroy the breadcrumb too.
		$('#js_wsp_settings_breadcrumb').empty();

		this._super();
	},

	/**
	 * Init the primary workspace menu.
	 * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
	 * this component is destroyed.
	 * @see destroy()
	 */
	_initPrimaryMenu: function() {
		var menu = ComponentHelper.create(
			$('#js_wsp_primary_menu_wrapper'),
			'last',
			PrimaryMenuComponent,
			{}
		);
		menu.start();
	},

	/**
	 * Initialize the workspace breadcrumb
	 */
	_initBreadcrumb: function() {
		var component = new BreadcrumbComponent('#js_wsp_settings_breadcrumb', {});
		component.start();
		component.load();
	},

	/**
	 * Init the primary sidebar.
	 */
	_initPrimarySidebar: function() {
		var menu = new MenuComponent('#js_wk_settings_menu', {});
		menu.start();
		this.options.primarySidebarMenu = menu;

		// My profile
		var profileItem = new Action({
			id: uuid(),
			name: 'profile',
			label: __('My profile'),
			action: function () {
				MadBus.trigger('request_settings_section', 'profile');
			}
		});
		menu.insertItem(profileItem);
		this.options.primarySidebarProfileItem = profileItem;

		// Keys
		var keysItem = new Action({
			id: uuid(),
			name: 'keys',
			label: __('Manage your keys'),
			action: function () {
				MadBus.trigger('request_settings_section', 'keys');
			}
		});
		menu.insertItem(keysItem);
		this.options.primarySidebarKeysItem = keysItem;
	},

	/**
	 * Init the workspace tabs
	 */
	_initTabs: function() {
		var tabs = new TabComponent('#js_wk_settings_main', {
			autoMenu: false // do not generate automatically the associated tab nav
		});
		tabs.start();
		this.settingsTabsCtl = tabs;

		// Profile tab
		tabs.addComponent(ProfileComponent, {
			id: 'js_settings_wk_profile_controller',
			label: 'profile',
			user: User.getCurrent()
		});

		// Keys tab
		tabs.addComponent(KeysComponent, {
			id: 'js_settings_wk_profile_keys_controller',
			label: 'keys'
		});
	},

	/**
	 * Open the user edit dialog.
	 *
	 * @param {User} user The target user entity.
	 */
	openEditUserDialog: function(user) {
		var self = this;
		var dialog = DialogComponent.instantiate({
			label: __('Edit profile'),
			cssClasses : ['edit-profile-dialog', 'dialog-wrapper']
		}).start();

		var form = dialog.add(UserCreateForm, {
			data: user,
			action: 'edit',
			callbacks : {
				submit: function (data) {
					user.assignDeep(data['User']);
					self._saveUser(user, form, dialog);
				}
			}
		});
		form.load(user);
	},

	/**
	 * Save the user.
	 *
	 * @param {User} user The target user
	 * @param {mad.Form} form The form object
	 * @param {Dialog} dialog The dialog object
	 */
	_saveUser: function(user, form, dialog) {
		user.save()
			.then(function() {
				dialog.remove();
			}, function(v) {
				form.showErrors(JSON.parse(v.responseText)['body']);
			});
	},

	/**
	 * Open the avatar edit dialog.
	 *
	 * @param {User} user The target user entity.
	 */
	openEditAvatarDialog: function(user) {
		var dialog = DialogComponent.instantiate({
			label: __('Edit Avatar')
		}).start();

		var form = dialog.add(UserEditAvatarForm, {
			data: user,
			callbacks : {
				submit: () => this._saveAvatar(user, dialog)
			}
		});
		form.load(user);
	},

	/**
	 * Save the avatar.
	 *
	 * @param {User} user The target user
	 * @param {Dialog} dialog The dialog object
	 */
	_saveAvatar: function(user, dialog) {
		var $fileField = $('#js_field_avatar');
		user.saveAvatar($fileField[0].files[0]);
		dialog.remove();
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user requests a profile edition
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_profile_edition': function (el, ev) {
		var user = User.getCurrent();
		this.openEditUserDialog(user);
	},

	/**
	 * Observe when the user requests an avatar edition
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_profile_avatar_edition': function (el, ev, user) {
		this.openEditAvatarDialog(user);
	},

	/**
	 * Observe when the user requests a section.
	 * @param el
	 * @param ev
	 * @param section
	 */
	'{mad.bus.element} request_settings_section': function (el, ev, section) {
		var tabId = null,
			menuItem = null,
			menu = this.options.primarySidebarMenu;

		switch (section) {
			case 'keys' :
				tabId = 'js_settings_wk_profile_keys_controller';
				menuItem = this.options.primarySidebarKeysItem;
				break;
			case 'profile' :
				tabId = 'js_settings_wk_profile_controller';
				menuItem = this.options.primarySidebarProfileItem;
				break;
		}

		// Enable the tab
		this.settingsTabsCtl.enableTab(tabId);

		// Set class on top container.
		$('#container')
			.removeClass(this.options.sections.join(" "))
			.addClass(section);

		// Select corresponding section in the menu.
		menu.selectItem(menuItem);
	},

	/* ************************************************************** */
	/* LISTEN TO THE STATE CHANGES */
	/* ************************************************************** */

	/**
	 * The application is ready.
	 * @param {boolean} go Enter or leave the state
	 */
	stateReady: function (go) {
		// Load profile section by default.
		MadBus.trigger('request_settings_section', 'profile');
	},

	/**
	 * state disabled.
	 * @param go
	 */
	stateDisabled: function (go) {
		this._super(go);
		// Remove container class.
		$('#container')
			.removeClass(this.options.sections.join(" "));
	},

	/**
	 * state hidden.
	 * @param go
	 */
	stateHidden: function (go) {
		this._super(go);
		// Remove container class.
		$('#container')
			.removeClass(this.options.sections.join(" "));
	}
});
export default SettingsWorkspaceComponent;
