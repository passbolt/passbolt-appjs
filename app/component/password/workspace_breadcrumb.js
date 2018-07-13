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
import MadBus from 'passbolt-mad/control/bus';
import Menu from 'passbolt-mad/component/menu';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/breadcrumb/breadcrumb.stache!';
import itemTemplate from 'app/view/template/component/breadcrumb/breadcrumb_item.stache!';

var WorkspaceBreadcrumb = Component.extend('passbolt.component.WorkspaceBreadcrumb', /** @static */ {

	defaults: {
		template: template,
		status: 'hidden',
		// Root crumb filter
		rootFilter: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		var menuSelector = '#' + this.getId() + ' ul';
		var menu = new Menu(menuSelector, {
			itemTemplate: itemTemplate
		});
		menu.start();
		this.options.menu = menu;
	},

	/**
	 * Parse the current filter
	 * @param {passbolt.model.Filter} filter The filter to load
	 * @return {array}
	 */
	parseFilter: function (filter) {
		var menuItems = [],
			keywords = filter.getRule('keywords');

		// Add a link to filter on all items as first item.
		var menuItem = new Action({
			id: uuid(),
			label: __('All items'),
			filter: this.options.rootFilter
		});
		menuItems.push(menuItem);

		// If filtered by keywords, add a breadcrumb relative to the searched keywords
		if (keywords && keywords != '') {
			var menuItem = new Action({
				id: uuid(),
				label: __('Search : %s', keywords)
			});
			menuItems.push(menuItem);
		}
		// For any other filters than the default one, add a breadcrumb entry.
		else if (filter.id != 'default') {
			var menuItem = new Action({
				id: uuid(),
				label: filter.label
			});
			menuItems.push(menuItem);
		}

		return menuItems;
	},

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	 * An item has been selected
	 * @parent mad.component.Menu.view_events
	 * @param {HTMLElement} el The element the event occured on
	 * @param {HTMLEvent} ev The event which occured
	 */
	'{element} item_selected': function (el, ev) {
		const item = ev.data.item;
		if (item.filter) {
			MadBus.trigger('filter_workspace', {filter: item.filter});
		}
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Listen to the browser filter
	 * @param {jQuery} element The source element
	 * @param {Event} event The jQuery event
	 * @param {passbolt.model.Filter} filter The filter to apply
	 */
	'{mad.bus.element} filter_workspace': function (el, ev) {
		const filter = ev.data.filter;
		this.options.menu.reset();
		var menuItems = this.parseFilter(filter);
		this.options.menu.load(menuItems);
	}

});

export default WorkspaceBreadcrumb;
