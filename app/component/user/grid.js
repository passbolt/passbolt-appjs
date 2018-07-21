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
import CheckboxComponent from 'passbolt-mad/form/element/checkbox';
import ComponentHelper from 'passbolt-mad/helper/component';
import getTimeAgo from 'passbolt-mad/util/time/get_time_ago';
import GridColumn from 'passbolt-mad/model/grid_column';
import GridComponent from 'passbolt-mad/component/grid';
import GridContextualMenuComponent from 'app/component/user/grid_contextual_menu';
import Group from 'app/model/map/group';
import GroupUser from 'app/model/map/group_user';
import MadMap from 'passbolt-mad/util/map/map';
import User from 'app/model/map/user';
import UserGridView from 'app/view/component/user/grid';

import cellAvatarTemplate from 'app/view/template/component/user/grid/cell_avatar.stache!';
import columnHeaderSelectTemplate from 'app/view/template/component/user/grid/column_header_select.stache!';

const UserGridComponent = GridComponent.extend('passbolt.component.user.Grid', /** @static */ {

  defaults: {
    itemClass: User,
    viewClass: UserGridView,
    groups: [],
    selectedUsers: new User.List(),
    prefixItemId: 'user_',
    silentLoading: false,
    state: 'loading',
    // Model observed in templated functions
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
  init: function(el, options) {
    options.map = this._getGridMap();
    options.columnModel = this._getGridColumns();
    this._super(el, options);
  },

  /**
   * Get the grid map
   * @return {UtilMap}
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
        func: function(value) {
          return getTimeAgo(value);
        }
      },
      last_logged_in: {
        key: 'last_logged_in',
        func: function(value) {
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
    const columns = [];

    // Select column
    const selectColumn = new GridColumn({
      name: 'multipleSelect',
      index: 'multipleSelect',
      css: ['selections s-cell'],
      label: columnHeaderSelectTemplate,
      afterRender:  (cellElement, cellValue, mappedItem, item, columnModel) =>
        this._initSelectColumnComponent(cellElement, cellValue, mappedItem, item, columnModel)
    });
    columns.push(selectColumn);

    // Avatar column
    const avatarColumn = new GridColumn({
      name: 'avatar',
      index: 'Avatar',
      css: ['s-cell'],
      label: '',
      template: cellAvatarTemplate
    });
    columns.push(avatarColumn);

    // Name column
    const nameColumn = new GridColumn({
      name: 'name',
      index: 'Profile',
      css: ['m-cell'],
      label: __('User'),
      sortable: true
    });
    columns.push(nameColumn);

    // Username column
    const usernameColumn = new GridColumn({
      name: 'username',
      index: 'username',
      css: ['m-cell'],
      label: __('Username'),
      sortable: true
    });
    columns.push(usernameColumn);

    // Modified column
    const modifiedColumn = new GridColumn({
      name: 'modified',
      index: 'modified',
      css: ['m-cell'],
      label: __('Modified'),
      sortable: true
    });
    columns.push(modifiedColumn);

    // Last logged in column
    const loggedInColumn = new GridColumn({
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
  _initSelectColumnComponent: function(cellElement, cellValue, mappedItem, item) {
    const availableValues = {};
    availableValues[item.id] = '';
    const checkbox = ComponentHelper.create(
      cellElement,
      'inside_replace',
      CheckboxComponent, {
        id: `multiple_select_checkbox_${item.id}`,
        cssClasses: ['js_checkbox_multiple_select'],
        availableValues: availableValues
      }
    );
    checkbox.start();
    this._selectCheckboxComponents[item.id] = checkbox;
  },

  /**
   * Show the contextual menu
   * @param {User} user The user to show the contextual menu for
   * @param {string} x The x position where the menu will be rendered
   * @param {string} y The y position where the menu will be rendered
   */
  showContextualMenu: function(user, x, y) {
    const contextualMenu = GridContextualMenuComponent.instantiate({
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
  refreshItem: function(item) {
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
  reset: function() {
    this.filtered = false;
    this.filterSettings = null;
    const sortedColumnModel = this.getColumnModel('name');
    this.view.markColumnAsSorted(sortedColumnModel, true);
    this._super();
  },

  /**
   * Before selecting an item
   * @param {User} item The item to select
   */
  beforeSelect: function(item) {
    let returnValue = true;

    if (this.state.is('selection')) {
      /*
       * if an item has already been selected
       * if the item is already selected, unselect it
       */
      if (this.options.selectedUsers.length > 0 && this.options.selectedUsers[0].id == item.id) {
        this.unselect(item);
        this.setState('ready');
        returnValue = false;
      } else {
        for (let i = this.options.selectedUsers.length - 1; i > -1; i--) {
          this.unselect(this.options.selectedUsers[i]);
        }
      }
    }

    return returnValue;
  },

  /**
   * Is the item selected
   * @param {User}
   * @return {bool}
   */
  isSelected: function(item) {
    return this.options.selectedUsers.length > 0
      && this.options.selectedUsers[0].id == item.id;
  },

  /**
   * Select an item
   * @param {User} item The item to select
   */
  select: function(item) {
    if (!this.itemExists(item)) {
      return;
    }
    const checkbox = this._selectCheckboxComponents[item.id];
    checkbox.setValue([item.id]);
    this.view.selectItem(item);
  },

  /**
   * Unselect an item
   * @param {User} item The item to unselect
   */
  unselect: function(item) {
    if (!this.itemExists(item)) {
      return;
    }
    const checkbox = this._selectCheckboxComponents[item.id];
    checkbox.reset();
    this.view.unselectItem(item);
  },

  /**
   * Filter the browser using a filter settings object
   * @param {Filter} filter The filter to
   */
  filterBySettings: function(filter) {
    // The deferred used for the users find all request.
    let def = null;

    // If new filter or the filter changed, request the API.
    if (!this.filterSettings || this.filterSettings.id !== filter.id) {
      this.setState('loading');
      this.reset();

      // Request the API.
      const findOptions = {
        silentLoading: false,
        filter: filter.getRules(['keywords']), // All rules except keywords that is filtered on the browser.
        order: filter.getOrders(),
        contain: {
          LastLoggedIn: 1
        }
      };
      def = User.findAll(findOptions).then(users => {
        // If the browser has been destroyed before the request completed.
        if (this.state.is('destroyed')) {
          return;
        }

        // Load the resources in the browser.
        this.load(users);
        this.setState('ready');

        // If the results is ordered by the server, mark the relative column.
        if (filter.order) {
          const sortedColumnModel = this.getColumnModel(filter.order);
          if (sortedColumnModel) {
            this.view.markColumnAsSorted(sortedColumnModel, true);
          }
        }
      });
    } else {
      def = Promise.resolve();
    }

    // Once the call API done, if any, filter locally the result by keywords if any.
    def.then(() => {
      this.filterSettings = filter;

      // Mark the ordered column if any.
      const orders = filter.getOrders();
      if (orders && orders[0]) {
        const matches = /((\w*)\.)?(\w*)\s*(asc|desc|ASC|DESC)?/i.exec(orders[0]);
        let fieldName = matches[3];
        const sortWay = matches[4] ? matches[4].toLowerCase() : 'asc';

        if (fieldName) {
          if (fieldName === 'last_name' || fieldName === "first_name") {
            fieldName = 'name';
          }

          const sortedColumnModel = this.getColumnModel(fieldName);
          if (sortedColumnModel) {
            this.view.markColumnAsSorted(sortedColumnModel, sortWay === 'asc');
          }
        }
      }

      // Filter by keywords if any filter defined.
      const keywords = filter.getRule('keywords');
      if (keywords && keywords != '') {
        this.filterByKeywords(keywords, {
          searchInFields: ['username', 'Role.name', 'Profile.first_name', 'Profile.last_name']
        });
      } else if (this.isFiltered()) {
        // Otherwise reset the local filtering.
        this.resetFilter();
      }
    });
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when a user is created.
   * @param {User.prototype} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {User} resource The created resource
   */
  '{User} created': function(model, ev, user) {
    this.insertItem(user, null, 'first');
    return false;
  },

  /**
   * Observe when a user is updated.
   * If the user is displayed by he grid, refresh it.
   * note : We listen the model directly, listening on changes on
   * a list seems too much here (one event for each updated attribute)
   * @param {User.prototype} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {User} user The updated user
   */
  '{User} updated': function(model, ev, user) {
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
   */
  '{element} item_selected': function(el, ev) {
    const item = ev.data.item;
    if (this.isSelected(item)) {
      this.options.selectedUsers.splice(0);
    } else {
      this.options.selectedUsers.splice(0, this.options.selectedUsers.length, item);
    }
  },

  /**
   * An item has been right selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} item_right_selected': function(el, ev) {
    const item = ev.data.item;
    const srcEv = ev.data.srcEv;
    this.options.selectedUsers.splice(0, this.options.selectedUsers.length, item);
    const $item = $(`#${this.options.prefixItemId}${item.id}`);
    const itemOffset = $item.offset();
    this.showContextualMenu(item, srcEv.pageX - 3, itemOffset.top);
  },

  /**
   * Listen to the check event on any checkbox form element components.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .js_checkbox_multiple_select checked': function(el, ev) {
    const id = ev.data;
    const user = this.options.items.filter({id: id}).pop();
    this.options.selectedUsers.splice(0, this.options.selectedUsers.length, user);
  },

  /**
   * Listen to the uncheck event on any checkbox form element components.
   */
  '{element} .js_checkbox_multiple_select unchecked': function() {
    this.options.selectedUsers.splice(0, this.options.selectedUsers.length);
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Listen to the browser filter
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    if (this.state.is('destroyed')) {
      return;
    }
    this.filterBySettings(filter);
  },

  /**
   * Observe when a user is unselected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<User>} items The target users
   */
  '{selectedUsers} remove': function(el, ev, items) {
    items.forEach(item => {
      this.unselect(item);
    });
  },

  /**
   * Observe when a user is selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<User>} items The target users
   */
  '{selectedUsers} add': function(el, ev, items) {
    items.forEach(item => {
      this.select(item);
    });
  }

});

export default UserGridComponent;
