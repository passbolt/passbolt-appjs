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
import diffObject from 'can-util/js/diff-object/diff-object';
import Filter from 'app/model/map/filter';
import getTimeAgo from 'passbolt-mad/util/time/get_time_ago';
import GridColumn from 'passbolt-mad/model/grid_column';
import GridComponent from 'passbolt-mad/component/grid';
import GridContextualMenuComponent from 'app/component/user/grid_contextual_menu';
import Group from 'app/model/map/group';
import GroupUser from 'app/model/map/group_user';
import List from 'passbolt-mad/model/list';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Profile from 'app/model/map/profile';
import User from 'app/model/map/user';
import UserGridView from 'app/view/component/user/grid';

import cellAvatarTemplate from 'app/view/template/component/user/grid/cell_avatar.stache!';
import columnHeaderSelectTemplate from 'app/view/template/component/user/grid/column_header_select.stache!';
import itemTemplate from 'app/view/template/component/user/grid/gridItem.stache!';

var UserGridComponent = GridComponent.extend('passbolt.component.user.Grid', /** @static */ {

    defaults: {
        itemClass: User,
        viewClass: UserGridView,
        groups: [],
        selectedUsers: new User.List(),
        prefixItemId: 'user_',
        silentLoading: false,
		itemTemplate: itemTemplate,
        // For now we are using the can-connect/can/model/model to migrate our v2 models.
        // Canjs should be able to observe Map in a Control as a function, however it doesn't.
        // Test it again after we completed the migration of the model to the canjs style.
        Group: Group,
        GroupUser: GroupUser,
        User: User
    }

}, /** @prototype */ {

    /**
     * The filter used to filter the browser.
     * @type {Filter}
     */
    filterSettings: null,

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
     * Get the grid map
     * @return {mad.Map}
     */
    _getGridMap: function() {
        return new MadMap({
            id: 'id',
            name: {
                key: 'profile',
                func: function(profile) {
                    return profile.fullName();
                }
            },
            username: 'username',
            modified: {
                key: 'modified',
                func: function (value) {
                    return getTimeAgo(value)
                }
            },
            last_logged_in: {
                key: 'last_logged_in',
                func: function (value) {
                    if (value) {
                        return getTimeAgo(value);
                    }
                    return __('never');
                }
            },
            active: 'active',
            group: 'group',
            profile: 'profile'
        });
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
            afterRender:  (cellElement, cellValue, mappedItem, item, columnModel) =>
                this._initSelectColumnComponent(cellElement, cellValue, mappedItem, item, columnModel)
        });
        columns.push(selectColumn);

        // Avatar column
        //var avatarColumn = new GridColumn({
        //    name: 'avatar',
        //    index: 'Avatar',
        //    css: ['s-cell'],
        //    label: '',
        //    template: cellAvatarTemplate
        //});
        //columns.push(avatarColumn);

        // Name column
        var nameColumn = new GridColumn({
            name: 'name',
            index: 'Profile',
            css: ['m-cell'],
            label: __('User'),
            sortable: true
        });
        columns.push(nameColumn);

        // Username column
        var usernameColumn = new GridColumn({
            name: 'username',
            index: 'username',
            css: ['m-cell'],
            label: __('Username'),
            sortable: true
        });
        columns.push(usernameColumn);

        // Modified column
        var modifiedColumn = new GridColumn({
            name: 'modified',
            index: 'modified',
            css: ['m-cell'],
            label: __('Modified'),
            sortable: true
        });
        columns.push(modifiedColumn);

        // Last logged in column
        var loggedInColumn = new GridColumn({
            name: 'last_logged_in',
            index: 'last_logged_in',
            css: ['m-cell'],
            label: __('Last logged in'),
            sortable: true
        });
        columns.push(loggedInColumn);

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
     * Show the contextual menu
     * @param {passbolt.model.Resource} resource The resource to show the contextual menu for
     * @param {string} x The x position where the menu will be rendered
     * @param {string} y The y position where the menu will be rendered
     */
    showContextualMenu: function (user, x, y) {
        var contextualMenu = GridContextualMenuComponent.instantiate({
            state: 'hidden',
            user: user,
            coordinates: {
                x: x,
                y: y
            }
        });
        contextualMenu.start();
        contextualMenu.setState('ready');
    },

    /**
     * Refresh an item in the grid.
     * We override this function, so we can keep the selected state after the refresh.
     * @param item
     */
    refreshItem: function (item) {
        // If the item doesn't exist
        if (!this.itemExists(item)) {
            return;
        }

        this._super(item);
        if (this.options.selectedUsers.length > 0) {
            this.select(this.options.selectedUsers[0]);
        }
    },

    /**
     * Reset the grid
     */
    reset: function () {
        this.filtered = false;
        this.filterSettings = null;
        var sortedColumnModel = this.getColumnModel('name');
        this.view.markColumnAsSorted(sortedColumnModel, true);
        this._super();
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
            if (this.options.selectedUsers.length > 0 && this.options.selectedUsers[0].id == item.id) {
                this.unselect(item);
                this.setState('ready');
                returnValue = false;
            } else {
                for (var i = this.options.selectedUsers.length - 1; i > -1; i--) {
                    this.unselect(this.options.selectedUsers[i]);
                }
            }
        }

        return returnValue;
    },

    /**
     * Select an item
     * @param {mad.model.Model} item The item to select
     * @param {boolean} silent Do not propagate any event (default:false)
     */
    select: function (item) {
        // If the item doesn't exist
        if (!this.itemExists(item)) {
            return;
        }

        // Unselect the previously selected user, if not in multipleSelection.
        if (!this.state.is('multipleSelection') &&
			this.options.selectedUsers.length > 0) {
            this.unselect(this.options.selectedUsers[0]);
        }

        // Add the user to the list of selected items.
        this.options.selectedUsers.push(item);

        // Check the checkbox (if it is not already done).
        var checkbox = this._selectCheckboxComponents[item.id];
        checkbox.setValue([item.id]);

        // Make the item selected in the view.
        this.view.selectItem(item);

        // Notify the application about this selection.
        MadBus.trigger('user_selected', item);
    },

    /**
     * Before unselecting an item
     * @param {mad.model.Model} item The item to unselect
     */
    beforeUnselect: function (item) {
        var returnValue = true;
        return returnValue;
    },

    /**
     * Unselect an item
     * @param {mad.model.Model} item The item to unselect
     * @param {boolean} silent Do not propagate any event (default:false)
     */
    unselect: function (item, silent) {
        silent = typeof silent == 'undefined' ? false : silent;

        // If the item doesn't exist
        if (!this.itemExists(item)) {
            return;
        }

        // Uncheck the associated checkbox (if it is not already done).
		var controlId = 'multiple_select_checkbox_' + item.id,
        	checkbox = this._selectCheckboxComponents[item.id];

		// Uncheck the checkbox by reseting it. Brutal.
		checkbox.reset();

        // Unselect the item in grid.
        this.view.unselectItem(item);

        // Remove the resource from the previously selected resources.
        this.options.selectedUsers.remove(item);

        // Notify the app about the just unselected resource.
        if (!silent) {
            MadBus.trigger('user_unselected', item);
        }
    },

    /**
     * Filter the browser using a filter settings object
     * @param {passbolt.model.Filter} filter The filter to
     */
    filterBySettings: function(filter) {
        var self = this,
        // The deferred used for the users find all request.
            def = null;

        // If new filter or the filter changed, request the API.
        if (!this.filterSettings || this.filterSettings.id !== filter.id) {
            this.setState('loading');
            this.reset();

            // Request the API.
            var findOptions = {
                silentLoading: false,
                filter: filter.getRules(['keywords']), // All rules except keywords that is filtered on the browser.
                order: filter.getOrders(),
                contain: {
                    LastLoggedIn: 1
                }
            };
            def = User.findAll(findOptions).then(function (users, response, request){
                // If the browser has been destroyed before the request completed.
                if (self.state.is('destroyed')) {
                    return;
                }

                // Load the resources in the browser.
                self.load(users);
                self.setState('ready');

                // If the results is ordered by the server, mark the relative column.
                if (filter.order) {
                    var sortedColumnModel = self.getColumnModel(filter.order);
                    if (sortedColumnModel) {
                        self.view.markColumnAsSorted(sortedColumnModel, true);
                    }
                }
            });
        } else {
            def = Promise.resolve();
        }

        // Once the call API done, if any, filter locally the result by keywords if any.
        def.then(function() {
            self.filterSettings = filter;

            // Mark the ordered column if any.
            var orders = filter.getOrders();
            if (orders && orders[0]) {
                var matches = /((\w*)\.)?(\w*)\s*(asc|desc|ASC|DESC)?/i.exec(orders[0]),
                    modelName = matches[2],
                    fieldName = matches[3],
                    sortWay = matches[4] ? matches[4].toLowerCase() : 'asc';

                if (fieldName) {
                    if (fieldName === 'last_name' || fieldName === "first_name") {
                        fieldName = 'name';
                    }

                    var sortedColumnModel = self.getColumnModel(fieldName);
                    if (sortedColumnModel) {
                        self.view.markColumnAsSorted(sortedColumnModel, sortWay === 'asc');
                    }
                }
            }

            // Filter by keywords if any filter defined.
            var keywords = filter.getRule('keywords');
            if (keywords && keywords != '') {
                self.filterByKeywords(keywords, {
                    searchInFields: ['username', 'Role.name', 'Profile.first_name', 'Profile.last_name']
                });
            }
            // Otherwise reset the local filtering.
            else if (self.isFiltered()){
                self.resetFilter();
            }
        });
    },

    /* ************************************************************** */
    /* LISTEN TO THE MODEL EVENTS */
    /* ************************************************************** */

    /**
     * Observe when a user is created.
     * @param {mad.model.Model} model The model reference
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.Resource} resource The created resource
     */
    '{User} created': function (model, ev, user) {
        this.insertItem(user, null, 'first');
        return false;
    },

    /**
     * Observe when a user is updated.
     * If the user is displayed by he grid, refresh it.
     * note : We listen the model directly, listening on changes on
     * a list seems too much here (one event for each updated attribute)
     * @param {mad.model.Model} model The model reference
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.User} user The updated user
     */
    '{User} updated': function (model, ev, user) {
        if (this.options.items.indexOf(user) != -1) {
            this.refreshItem(user);
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
     * @param {passbolt.model.User} item The right selected item instance or its id
     * @param {HTMLEvent} srcEvent The source event which occurred
     */
    ' item_right_selected': function (el, ev, item, srcEvent) {
        // Select item.
        this.select(item);
        // Get the offset position of the clicked item.
        var $item = $('#' + this.options.prefixItemId + item.id);
        var itemOffset = $item.offset();
        // Show contextual menu.
        this.showContextualMenu(item, srcEvent.pageX - 3, itemOffset.top);
    },

    /**
     * Listen to the check event on any checkbox form element components.
     *
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {mixed} rsId The id of the resource which has been checked
     */
    '.js_checkbox_multiple_select checked': function (el, ev, userId) {
        // if the grid is in initial state, switch it to selected
        if (this.state.is('ready')) {
            this.setState('selection');
        }

        // find the resource to select functions of its id
        var i = List.indexOf(this.options.items, userId);
        var user = this.options.items[i];

        if (this.beforeSelect(user)) {
            this.select(user);
        }
    },

    /**
     * Listen to the uncheck event on any checkbox form element components.
     *
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {mixed} userId The id of the user which has been unchecked
     */
    '.js_checkbox_multiple_select unchecked': function (el, ev, userId) {
        var self = this;

        // find the resource to select functions of its id
        var i = List.indexOf(this.options.items, userId);
        var user = this.options.items[i];

        if (this.beforeUnselect()) {
            self.unselect(user);
        }

        // if there is no more selected resources, switch the grid to its initial state
        if (!this.options.selectedUsers.length) {
            this.setState('ready');

            // else if only one resource is selected
        } else if (this.options.selectedUsers.length == 1) {
            this.setState('selection');
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
    '{mad.bus.element} filter_workspace': function (element, evt, filter) {
        if (this.state.is('destroyed')) {
            return;
        }
        this.filterBySettings(filter);
    },

    /**
     * Observe when an item is unselected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.Resource|array} items The unselected items
     */
    '{selectedUsers} remove': function (el, ev, items) {
        for (var i in items) {
            this.unselect(items[i]);
        }
    }

});

export default UserGridComponent;
