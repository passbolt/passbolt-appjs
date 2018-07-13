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
import Filter from 'app/model/map/filter';
import MadBus from 'passbolt-mad/control/bus';
import MenuComponent from 'passbolt-mad/component/menu';
import User from 'app/model/map/user';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/breadcrumb/breadcrumb.stache!';
import itemTemplate from 'app/view/template/component/breadcrumb/breadcrumb_item.stache!';

var WorkspaceBreadcrumbComponent = Component.extend('passbolt.component.settings.WorkspaceBreadcrumb', /** @static */ {

	defaults: {
		template: template,
		status: 'hidden',
		filter: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		// Create and render menu in the created container.
		var menuSelector = '#' + this.getId() + ' ul';
		this.options.menu = new MenuComponent(
			menuSelector, {
				itemTemplate: itemTemplate
			}
		);
		this.options.menu.start();

		// Store menu items in an array.
		// This contains the static part of the menu.
		this.menuItems = [];
		// Contains the specific section menu items.
		this.sectionMenuItems = [];

		// All users item
		var menuItem = new Action({
			id: uuid(),
			label: __('All users'),
			action: function () {
				// Switch to user workspace.
				const workspace = 'user';
				MadBus.trigger('request_workspace', {workspace});
			}
		});
		this.menuItems.push(menuItem);

		// Profile item
		var menuItem = new Action({
			id: uuid(),
			label: User.getCurrent().profile.fullName(),
			action: function () {
				const section = 'profile';
				MadBus.trigger('request_settings_section', {section});
			}
		});
		this.menuItems.push(menuItem);

		// Specific menu items, per section.
		// profile section.
		this.sectionMenuItems['profile'] = [
			new Action({
				id: uuid(),
				label: __('Profile'),
				action: function () {
					return;
				}
			})
		];
		// keys section.
		this.sectionMenuItems['keys'] = [
			new Action({
				id: uuid(),
				label: __('Keys inspector'),
				action: function () {
					return;
				}
			})
		];
		// theme section.
		this.sectionMenuItems['theme'] = [
			new Action({
				id: uuid(),
				label: __('Theme'),
				action: function () {
					return;
				}
			})
		];
	},

	/**
	 * Load the current filter
	 */
	load: function () {
		// To use if we need to load something.
		// Do not remove, it breaks the code.
	},

	/**
	 * Destroy the workspace.
	 */
	destroy: function() {
		// Be sure that the primary workspace menu controller will be destroyed also.
		$('#' + this.getId() + ' ul').empty();
		this._super();
	},

	/**
	 * Refresh the menu items as per the section.
	 * @param section
	 */
	refreshMenuItems: function(section) {
		// The items of the menu are a combination of static items and section dynamic items.
		// If the section is recognised, we just assemble the 2 arrays. Otherwise, we just keep the static part.
		var menuItems = (this.sectionMenuItems[section] !== undefined) ?
			$.merge($.merge([], this.menuItems), this.sectionMenuItems[section]) : this.menuItems;
		// Reset the menu.
		this.options.menu.reset();
		// Load the items.
		this.options.menu.load(menuItems);
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Listen to request_settings_section event.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_settings_section': function (el, ev) {
		const section = ev.data.section;
		this.refreshMenuItems(section);
	}

});

export default WorkspaceBreadcrumbComponent;
