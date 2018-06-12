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
import moment from 'moment';
import CheckboxComponent from 'passbolt-mad/form/element/checkbox';
import ComponentHelper from 'passbolt-mad/helper/component';
import Config from 'passbolt-mad/config/config';
import FavoriteComponent from 'app/component/favorite/favorite';
import getTimeAgo from 'passbolt-mad/util/time/get_time_ago';
import GridColumn from 'passbolt-mad/model/grid_column';
import GridComponent from 'passbolt-mad/component/grid';
import GridContextualMenuComponent from 'app/component/password/grid_contextual_menu';
import List from 'passbolt-mad/model/list';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import PasswordGridView from 'app/view/component/password/grid';
import Resource from 'app/model/map/resource';
import View from 'passbolt-mad/view/view';

import columnHeaderSelectTemplate from 'app/view/template/component/password/grid/column_header_select.stache!';
import columnHeaderFavoriteTemplate from 'app/view/template/component/password/grid/column_header_favorite.stache!';
import cellSecretTemplate from 'app/view/template/component/password/grid/cell_secret_template.stache!';
import cellUsernameTemplate from 'app/view/template/component/password/grid/cell_username_template.stache!';
import cellUriTemplate from 'app/view/template/component/password/grid/cell_uri_template.stache!';
import gridEmptyTemplate from 'app/view/template/component/password/grid/grid_empty.stache!';

var PasswordGridComponent = GridComponent.extend('passbolt.component.password.Grid', /** @static */ {

	defaults: {
		// the type of the item rendered by the grid
		itemClass: Resource,
		// the view class to use. Overridden so we can put our own logic.
		viewClass: PasswordGridView,
		// the selected resources, you can pass an existing list as parameter of the constructor to share the same list
		selectedRs: new Resource.List(),
		// Prefix each row id with resource_
		prefixItemId: 'resource_',
        // Override the silentLoading parameter.
        silentLoading: false,
		// Default state at loading
		state: 'loading',
		// For now we are using the can-connect/can/model/model to migrate our v2 models.
		// Canjs should be able to observe Map in a Control as a function, however it doesn't.
		// Test it again after we completed the migration of the model to the canjs style.
		Resource: Resource
	}

}, /** @prototype */ {

	/**
	 * The filter used to filter the browser.
	 * @type {passbolt.model.Filter}
	 */
	filterSettings: null,

	/**
	 * Keep a trace of the old filter used to filter the browser.
	 * @type {passbolt.model.Filter}
	 */
	oldFilterSettings: null,

	/**
	 * The array of select checkbox components.
	 */
	_selectCheckboxComponents: {},

	/**
	 * @inheritdoc
	 */
	init: function (el, options) {
		options.map = this._getGridMap();
		options.columnModel = this._getGridColumns();
		this._super(el, options);
	},

	/**
	 * Init the grid map.
	 * @return {mad.Map}
	 */
	_getGridMap: function() {
		var map = new MadMap({
			id: 'id',
			name: 'name',
			username: 'username',
			secret: 'Secret',
			uri: 'uri',
			safeUri: {
				key: 'uri',
				func: function (value, map, item) {
					return item.safeUri();
				}
			},
			modified: {
				key: 'modified',
				func: function (value) {
					return getTimeAgo(value)
				}
			},
			owner: 'Creator.username'
		});
		return map;
	},

	/**
	 * Init the grid columns
	 * @return {array}
	 */
	_getGridColumns: function() {
		var columns = [];

		// Select column
		var selectColumn = new GridColumn({
			name: 'multipleSelect',
			index: 'multipleSelect',
			css: ['selections s-cell'],
			label: columnHeaderSelectTemplate,
			afterRender: (cellElement, cellValue, mappedItem, item, columnModel) =>
				this._initSelectColumnComponent(cellElement, cellValue, mappedItem, item, columnModel)
		});
		columns.push(selectColumn);

		// Favorite column
		var favoriteColumn = new GridColumn({
			name: 'favorite',
			index: 'favorite',
			css: ['selections s-cell'],
			label: columnHeaderFavoriteTemplate,
			afterRender: this._initFavoriteCellComponent
		});
		columns.push(favoriteColumn);

		// Name column
		var nameColumn = new GridColumn({
			name: 'name',
			index: 'name',
			css: ['m-cell'],
			label: __('Resource'),
			sortable: true
		});
		columns.push(nameColumn);

		// Username column
		var usernameColumn = new GridColumn({
			name: 'username',
			index: 'username',
			css: ['m-cell', 'username'],
			label: __('Username'),
			sortable: true,
			template: cellUsernameTemplate
		});
		columns.push(usernameColumn);

		// Secret column
		var secretColumn = new GridColumn({
			name: 'secret',
			index: 'secret',
			css: ['m-cell', 'password'],
			label: __('Password'),
			template: cellSecretTemplate
		});
		columns.push(secretColumn);

		// Uri column
		var uriColumn = new GridColumn({
			name: 'uri',
			index: 'uri',
			css: ['l-cell'],
			label: __('URI'),
			sortable: true,
			template: cellUriTemplate
		});
		columns.push(uriColumn);

		// Modified column
		var modifiedColumn = new GridColumn({
			name: 'modified',
			index: 'modified',
			css: ['m-cell'],
			sortable: true,
			label: __('Modified')
		});
		columns.push(modifiedColumn);

		// Owner column
		var ownerColumn = new GridColumn({
			name: 'owner',
			index: 'owner',
			css: ['m-cell'],
			label: __('Owner'),
			sortable: true
		});
		columns.push(ownerColumn);

		return columns;
	},

	/**
	 * Init the select component for a given cell.
	 * @inheritdoc
	 */
	_initSelectColumnComponent: function (cellElement, cellValue, mappedItem, item, columnModel) {
		var availableValues = {};
		availableValues[item.id] = '';
		var checkbox = ComponentHelper.create(
			cellElement,
			'inside_replace',
			CheckboxComponent, {
				id: 'multiple_select_checkbox_' + item.id,
				cssClasses: ['js_checkbox_multiple_select'],
				availableValues: availableValues
			}
		);
		checkbox.start();
		this._selectCheckboxComponents[item.id] = checkbox;
	},

	/**
	 * Init the favorite component for a given cell.
	 * @inheritdoc
	 */
	_initFavoriteCellComponent: function (cellElement, cellValue, mappedItem, item, columnModel) {
		var availableValues = {};
		availableValues[item.id] = '';
		var favorite = ComponentHelper.create(
			cellElement,
			'inside_replace',
			FavoriteComponent, {
				id: 'favorite_' + item.id,
				instance: item
			}
		);
		favorite.start();
	},

	/**
	 * Show the contextual menu
	 * @param {passbolt.model.Resource} resource The resource to show the contextual menu for
	 * @param {string} x The x position where the menu will be rendered
	 * @param {string} y The y position where the menu will be rendered
	 */
	showContextualMenu: function (resource, x, y) {
		var contextualMenu = GridContextualMenuComponent.instantiate({
			state: 'hidden',
			resource: resource,
			coordinates: {
				x: x,
				y: y
			}
		});
		contextualMenu.start();
		contextualMenu.setState('ready');
	},

	/**
	 * Refresh item
	 * @param {mad.model.Model} item The item to refresh
	 */
	refreshItem: function (resource) {
		// If the item doesn't exist
		if (!this.itemExists(resource)) {
			return;
		}

		// if the resource has not been removed from the grid, update it
		this._super(resource);

		// If the item was previously selected, update the view that has been altered when the item has been refreshed.
		if (this.isSelected(resource)) {
			// Select the checkbox (if it is not already done).
			var checkbox = this._selectCheckboxComponents[resource.id];
			checkbox.setValue([resource.id]);

			// Make the item selected in the view.
			this.view.selectItem(resource);
		}
	},

	/**
	 * Before selecting an item
	 * @param {mad.model.Model} item The item to select
	 */
	beforeSelect: function (item) {
		var returnValue = true;

		if (this.state.is('selection')) {
			// if an item has already been selected
			// if the item is already selected, unselect it
			if (this.isSelected(item)) {
				this.unselect(item);
				this.setState('ready');
				returnValue = false;
			} else {
				for (var i = this.options.selectedRs.length - 1; i > -1; i--) {
					this.unselect(this.options.selectedRs[i]);
				}
			}
		}

		return returnValue;
	},

	/**
	 * Is the item selected
	 *
	 * @param {mad.Model}
	 * @return {bool}
	 */
	isSelected: function (item) {
		return this.options.selectedRs.length > 0
			&& this.options.selectedRs[0].id == item.id;
	},

	/**
	 * Select an item
	 * @param {mad.model.Model} item The item to select
	 */
	select: function (item) {
		// If the item doesn't exist
		if (!this.itemExists(item)) {
			return;
		}

        // If resource is already selected, we do nothing.
		// Refresh the view
        if (this.isSelected(item)) {
            return;
        }

		// Unselect the previously selected resources, if not in multipleSelection.
		if (!this.state.is('multipleSelection') &&
			this.options.selectedRs.length > 0) {
			this.unselect(this.options.selectedRs[0]);
		}

		// Add the resource to the list of selected items.
		this.options.selectedRs.push(item);

		// Select the checkbox (if it is not already done).
		var checkbox = this._selectCheckboxComponents[item.id];
		checkbox.setValue([item.id]);

		// Make the item selected in the view.
		this.view.selectItem(item);

		// Notify the application about this selection.
		//MadBus.trigger('resource_selected', item);
	},

	/**
	 * Unselect an item
	 * @param {mad.model.Model} item The item to unselect
	 * @param {boolean} silent Do not propagate any event (default:false)
	 */
	unselect: function (item, silent) {
		silent = silent || false;

		// If the item doesn't exist
		if (!this.itemExists(item)) {
			return;
		}

		// Uncheck the associated checkbox (if it is not already done).
		var checkbox = this._selectCheckboxComponents[item.id];

		// Uncheck the checkbox by reseting it. Brutal.
		checkbox.reset();

		// Unselect the item in grid.
		this.view.unselectItem(item);

		// Remove the resource from the previously selected resources.
		this.options.selectedRs.remove(item);

		// Notify the app about the just unselected resource.
		if (!silent) {
			MadBus.trigger('resource_unselected', item);
		}
	},

	/**
	 * Filter the browser using a filter settings object
	 * @param {passbolt.model.Filter} filter The filter to
	 * @return {Jquery.Deferred}
	 */
	filterBySettings: function(filter) {
		var self = this,
			def = null,
			readyStates = [];

		this.setState('loading');
		// The states to apply when the component will be ready.
		// @todo the css except the class all_items in case the grid is empty to display the empty background image
		readyStates.push(filter.id == 'default' ? 'all_items' : filter.id);

		// If new filter or the filter changed, request the API.
		if (!this.filterSettings || this.filterSettings.id !== filter.id) {
			var findOptions = {
				silentLoading: false,
				contain: {creator: 1, favorite: 1, modifier: 1, secret: 1, permission: 1, tag:1},
				// All rules except keywords that is filtered on the browser.
				filter: filter.getRules(['keywords']),
				order: filter.getOrders()
			};

			this.reset();
			def = Resource.findAll(findOptions)
			.then(function (resources) {
				// If the browser has been destroyed before the request completed.
				if (self.state.is('destroyed')) {
					return;
				}
				if (!resources.length) {
					readyStates.push('empty');
				}
				// If the grid was marked as filtered, reset it.
				self.filtered = false;
				// Load the resources in the browser.
				self.load(resources);
			});
		} else {
			def = Promise.resolve();
		}

		// When the resources have been retrieved.
		def.then(function() {
			if (self.state.is('destroyed')) {
				return;
			}
			self.filterSettings = filter;

			// Mark the ordered column if any.
			var orders = filter.getOrders();
			if (orders && orders[0]) {
				var matches = /((\w*)\.)?(\w*)\s*(asc|desc|ASC|DESC)?/i.exec(orders[0]),
					modelName = matches[2],
					fieldName = matches[3],
					sortWay = matches[4] ? matches[4].toLowerCase() : 'asc';

				if (fieldName) {
					var sortedColumnModel = self.getColumnModel(fieldName);
					if (sortedColumnModel) {
						self.view.markColumnAsSorted(sortedColumnModel, sortWay === 'asc');
					}
				}
			}

			// Filter by keywords.
			var keywords = filter.getRule('keywords');
			if (keywords && keywords != '') {
				var searchInFields = ['username', 'name', 'uri', 'description'];
				var plugins = Config.read('server.passbolt.plugins');
				if (plugins && plugins.tags) {
					searchInFields.push('tags[].slug');
				}
				self.filterByKeywords(keywords, {
					searchInFields: searchInFields
				});
			} else if (self.isFiltered()){
				self.resetFilter();
			}

			// If resource to select given
			if (filter.resource) {
				self.select(filter.resource);
			}

			// Mark the component as ready
			readyStates.push('ready');
			self.setState(readyStates);
		});

		return def;
	},

	/* ************************************************************** */
	/* LISTEN TO THE MODEL EVENTS */
	/* ************************************************************** */

	/**
	* Observe when a resource is created and add it to the browser.
	* @param {Object} Constructor The constructor
	* @param {HTMLEvent} ev The event which occurred
	* @param {passbolt.model.Resource} resource The created resource
	*/
	'{Resource} created': function (Constructor, ev, resource) {
		if (this.state.is('empty')) {
			this.setState('ready');
		}
		this.insertItem(resource, null, 'first');
	},

	/**
	* Observe when a resource is updated.
	* If the resource is displayed by he grid, refresh it.
	* note : We listen the model directly, listening on changes on
	* a list seems too much here (one event for each updated attribute)
	* @param {mad.model.Model} model The model reference
	* @param {HTMLEvent} ev The event which occurred
	* @param {passbolt.model.Resource} resource The updated resource
	*/
	'{Resource} updated': function (model, ev, resource) {
		if (this.options.items.indexOf(resource) != -1) {
			this.refreshItem(resource);
		}
	},

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	* Observe when an item is selected in the grid.
	* This event comes from the grid view
	* @param {HTMLElement} el The element the event occurred on
	* @param {HTMLEvent} ev The event which occurred
	* @param {mixed} item The selected item instance or its id
	* @param {HTMLEvent} ev The source event which occurred
	*/
	' item_selected': function (el, ev, item, srcEvent) {
		// switch to select state
		this.setState('selection');

		if (this.beforeSelect(item)) {
			this.select(item);
		}
	},

	/**
	* An item has been right selected
	* @param {HTMLElement} el The element the event occurred on
	* @param {HTMLEvent} ev The event which occurred
	* @param {passbolt.model.Resource} item The right selected item instance or its id
	* @param {HTMLEvent} srcEvent The source event which occurred
	*/
    ' item_right_selected': function (el, ev, item, srcEvent) {
        // Select item.
		this.select(item);
		// Get the offset position of the clicked item.
		var $item = $('#' + this.options.prefixItemId + item.id);
		var itemOffset = $item.offset();
		// Show contextual menu.
		this.showContextualMenu(item, srcEvent.pageX - 3, itemOffset.top, srcEvent.target);
	},

	/**
	* A password has been clicked.
	* @param {HTMLElement} el The element the event occurred on
	* @param {HTMLEvent} ev The event which occurred
	* @param {passbolt.model.Resource} item The right selected item instance or its id
	* @param {HTMLEvent} srcEvent The source event which occurred
	*/
	' password_clicked': function (el, ev, item, srcEvent) {
		// Get secret out of Resource object.
		var secret = item.secrets[0].data;
		// Request decryption. (delegated to plugin).
		MadBus.trigger('passbolt.secret.decrypt', secret);
	},

	/**
	 * A username has been clicked.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @param {passbolt.model.Resource} item The right selected item instance or its id
	 * @param {HTMLEvent} srcEvent The source event which occurred
	 */
	' username_clicked': function (el, ev, item, srcEvent) {
		var username = item.username;
		MadBus.trigger('passbolt.clipboard', {
			name: 'username',
			data: username
		});
	},

	/**
	* Listen to the check event on any checkbox form element components.
	*
	* @param {HTMLElement} el The element the event occurred on
	* @param {HTMLEvent} ev The event which occurred
	* @param {mixed} rsId The id of the resource which has been checked
	*/
	'.js_checkbox_multiple_select checked': function (el, ev, rsId) {
		// if the grid is in initial state, switch it to selected
		if (this.state.is('ready')) {
			this.setState('selection');
		}

		// find the resource to select functions of its id
		var i = List.indexOf(this.options.items, rsId);
		var resource = this.options.items[i];

		if (this.beforeSelect(resource)) {
			this.select(resource);
		}
	},

	/**
	* Listen to the uncheck event on any checkbox form element components.
	*
	* @param {HTMLElement} el The element the event occurred on
	* @param {HTMLEvent} ev The event which occurred
	* @param {mixed} rsId The id of the resource which has been unchecked
	*/
	'.js_checkbox_multiple_select unchecked': function (el, ev, rsId) {
		// find the resource to select functions of its id
		var i = List.indexOf(this.options.items, rsId);
		var resource = this.options.items[i];

		this.unselect(resource);

		// if there is no more selected resources, switch the grid to its initial state
		if (!this.options.selectedRs.length) {
			this.setState('ready');

		// else if only one resource is selected
		} else if (this.options.selectedRs.length == 1) {
			this.setState('selection');
		}
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Listen to the workspace filter event.
	 * @param {jQuery} element The source element
	 * @param {Event} event The jQuery event
	 * @param {passbolt.model.Filter} filter The filter settings
	 */
	'{mad.bus.element} filter_workspace': function(el, ev, filter) {
		this.filterBySettings(filter);
	},

	/**
	 * Observe when an item is unselected
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @param {passbolt.model.Resource|array} items The unselected items
	 */
	'{selectedRs} remove': function (el, ev, items) {
		for (var i in items) {
			this.unselect(items[i]);
		}
	},

	/* ************************************************************** */
	/* LISTEN TO THE STATE CHANGES */
	/* ************************************************************** */

    /**
     * Listen to changes related to state empty (when there are no passwords to show).
     * @param {boolean} go Enter or leave the state
     */
    stateEmpty: function (go) {
        if (go) {
            if (this.filterSettings.id == 'default') {
                var empty_html = View.render(gridEmptyTemplate);
                $('.tableview-content', this.element).prepend(empty_html);
            }
        }
        else {
            // Remove any empty content html from page.
            // (empty content is the html displayed when the workspace is empty).
            $('.empty-content', this.element).remove();
        }
    }

});

export default PasswordGridComponent;
