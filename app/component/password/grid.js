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
import Clipboard from 'app/util/clipboard';
import ComponentHelper from 'passbolt-mad/helper/component';
import Config from 'passbolt-mad/config/config';
import FavoriteComponent from 'app/component/favorite/favorite';
import getTimeAgo from 'passbolt-mad/util/time/get_time_ago';
import GridColumn from 'passbolt-mad/model/grid_column';
import GridComponent from 'passbolt-mad/component/grid';
import GridContextualMenuComponent from 'app/component/password/grid_contextual_menu';
import MadMap from 'passbolt-mad/util/map/map';
import PasswordGridView from 'app/view/component/password/grid';
import Plugin from 'app/util/plugin';
import Resource from 'app/model/map/resource';
import View from 'passbolt-mad/view/view';

import columnHeaderSelectTemplate from 'app/view/template/component/password/grid/column_header_select.stache!';
import columnHeaderFavoriteTemplate from 'app/view/template/component/password/grid/column_header_favorite.stache!';
import cellSecretTemplate from 'app/view/template/component/password/grid/cell_secret_template.stache!';
import cellUsernameTemplate from 'app/view/template/component/password/grid/cell_username_template.stache!';
import cellUriTemplate from 'app/view/template/component/password/grid/cell_uri_template.stache!';
import gridEmptyTemplate from 'app/view/template/component/password/grid/grid_empty.stache!';

const PasswordGridComponent = GridComponent.extend('passbolt.component.password.Grid', /** @static */ {

  defaults: {
    // the type of the item rendered by the grid
    itemClass: Resource,
    // the view class to use. Overridden so we can put our own logic.
    viewClass: PasswordGridView,
    // the selected resources, you can pass an existing list as parameter of the constructor to share the same list
    selectedResources: new Resource.List(),
    // Prefix each row id with resource_
    prefixItemId: 'resource_',
    // Override the silentLoading parameter.
    silentLoading: false,
    // Default state at loading
    state: 'loading',
    /*
     * For now we are using the can-connect/can/model/model to migrate our v2 models.
     * Canjs should be able to observe Map in a Control as a function, however it doesn't.
     * Test it again after we completed the migration of the model to the canjs style.
     */
    Resource: Resource
  }

}, /** @prototype */ {

  /**
   * The filter used to filter the browser.
   * @type {Filter}
   */
  filterSettings: null,

  /**
   * Keep a trace of the old filter used to filter the browser.
   * @type {Filter}
   */
  oldFilterSettings: null,

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
   * Init the grid map.
   * @return {UtilMap}
   */
  _getGridMap: function() {
    const map = new MadMap({
      id: 'id',
      name: 'name',
      username: 'username',
      secret: 'Secret',
      uri: 'uri',
      safeUri: {
        key: 'uri',
        func: function(value, map, item) {
          return item.safeUri();
        }
      },
      modified: {
        key: 'modified',
        func: function(value) {
          return getTimeAgo(value);
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
    const columns = [];

    // Select column
    const selectColumn = new GridColumn({
      name: 'multipleSelect',
      index: 'multipleSelect',
      css: ['selections s-cell'],
      label: columnHeaderSelectTemplate,
      afterRender: (cellElement, cellValue, mappedItem, item, columnModel) =>
        this._initSelectColumnComponent(cellElement, cellValue, mappedItem, item, columnModel)
    });
    columns.push(selectColumn);

    // Favorite column
    const favoriteColumn = new GridColumn({
      name: 'favorite',
      index: 'favorite',
      css: ['selections s-cell'],
      label: columnHeaderFavoriteTemplate,
      afterRender: this._initFavoriteCellComponent
    });
    columns.push(favoriteColumn);

    // Name column
    const nameColumn = new GridColumn({
      name: 'name',
      index: 'name',
      css: ['m-cell'],
      label: __('Resource'),
      sortable: true
    });
    columns.push(nameColumn);

    // Username column
    const usernameColumn = new GridColumn({
      name: 'username',
      index: 'username',
      css: ['m-cell', 'username'],
      label: __('Username'),
      sortable: true,
      template: cellUsernameTemplate
    });
    columns.push(usernameColumn);

    // Secret column
    const secretColumn = new GridColumn({
      name: 'secret',
      index: 'secret',
      css: ['m-cell', 'password'],
      label: __('Password'),
      template: cellSecretTemplate
    });
    columns.push(secretColumn);

    // Uri column
    const uriColumn = new GridColumn({
      name: 'uri',
      index: 'uri',
      css: ['l-cell'],
      label: __('URI'),
      sortable: true,
      template: cellUriTemplate
    });
    columns.push(uriColumn);

    // Modified column
    const modifiedColumn = new GridColumn({
      name: 'modified',
      index: 'modified',
      css: ['m-cell'],
      sortable: true,
      label: __('Modified')
    });
    columns.push(modifiedColumn);

    // Owner column
    const ownerColumn = new GridColumn({
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
   * Init the favorite component for a given cell.
   * @inheritdoc
   */
  _initFavoriteCellComponent: function(cellElement, cellValue, mappedItem, item) {
    const availableValues = {};
    availableValues[item.id] = '';
    const favorite = ComponentHelper.create(
      cellElement,
      'inside_replace',
      FavoriteComponent, {
        id: `favorite_${item.id}`,
        instance: item
      }
    );
    favorite.start();
  },

  /**
   * Show the contextual menu
   * @param {Resource} resource The resource to show the contextual menu for
   * @param {string} x The x position where the menu will be rendered
   * @param {string} y The y position where the menu will be rendered
   */
  showContextualMenu: function(resource, x, y) {
    const contextualMenu = GridContextualMenuComponent.instantiate({
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
   * @param {Resource} item The item to refresh
   */
  refreshItem: function(resource) {
    // If the item doesn't exist
    if (!this.itemExists(resource)) {
      return;
    }

    // if the resource has not been removed from the grid, update it
    this._super(resource);

    // If the item was previously selected, update the view that has been altered when the item has been refreshed.
    if (this.isSelected(resource)) {
      // Select the checkbox (if it is not already done).
      const checkbox = this._selectCheckboxComponents[resource.id];
      checkbox.setValue([resource.id]);

      // Make the item selected in the view.
      this.view.selectItem(resource);
    }
  },

  /**
   * Is the item selected
   *
   * @param {Resource}
   * @return {bool}
   */
  isSelected: function(item) {
    return this.options.selectedResources.length > 0
			&& this.options.selectedResources[0].id == item.id;
  },

  /**
   * Select an item
   * @param {Resource} item The item to select
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
   * @param {Resource} item The item to unselect
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
   * @return {Jquery.Deferred}
   */
  filterBySettings: function(filter) {
    let def = null;
    const readyStates = [];

    this.setState('loading');
    /*
     * The states to apply when the component will be ready.
     * @todo the css except the class all_items in case the grid is empty to display the empty background image
     */
    readyStates.push(filter.id == 'default' ? 'all_items' : filter.id);

    // If new filter or the filter changed, request the API.
    if (!this.filterSettings || this.filterSettings.id !== filter.id) {
      const findOptions = {
        contain: {creator: 1, favorite: 1, modifier: 1, secret: 1, permission: 1, tag: 1},
        // All rules except keywords that is filtered on the browser.
        filter: filter.getRules(['keywords']),
        order: filter.getOrders()
      };

      this.reset();
      def = Resource.findAll(findOptions)
        .then(resources => {
        // If the browser has been destroyed before the request completed.
          if (this.state.is('destroyed')) {
            return;
          }
          if (!resources.length) {
            readyStates.push('empty');
          }
          // If the grid was marked as filtered, reset it.
          this.filtered = false;
          // Load the resources in the browser.
          this.load(resources);
        });
    } else {
      def = Promise.resolve();
    }

    // When the resources have been retrieved.
    def.then(() => {
      if (this.state.is('destroyed')) {
        return;
      }
      this.filterSettings = filter;

      // Mark the ordered column if any.
      const orders = filter.getOrders();
      if (orders && orders[0]) {
        const matches = /((\w*)\.)?(\w*)\s*(asc|desc|ASC|DESC)?/i.exec(orders[0]);
        const fieldName = matches[3];
        const sortWay = matches[4] ? matches[4].toLowerCase() : 'asc';

        if (fieldName) {
          const sortedColumnModel = this.getColumnModel(fieldName);
          if (sortedColumnModel) {
            this.view.markColumnAsSorted(sortedColumnModel, sortWay === 'asc');
          }
        }
      }

      // Filter by keywords.
      const keywords = filter.getRule('keywords');
      if (keywords && keywords != '') {
        const searchInFields = ['username', 'name', 'uri', 'description'];
        const plugins = Config.read('server.passbolt.plugins');
        if (plugins && plugins.tags) {
          searchInFields.push('tags[].slug');
        }
        this.filterByKeywords(keywords, {
          searchInFields: searchInFields
        });
      } else if (this.isFiltered()) {
        this.resetFilter();
      }

      // If resource to select given
      if (filter.resource) {
        this.select(filter.resource);
      }

      // Mark the component as ready
      readyStates.push('ready');
      this.setState(readyStates);
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
   * @param {Resource} resource The created resource
   */
  '{Resource} created': function(Constructor, ev, resource) {
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
   * @param {DefineMap.prototype} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {Resource} resource The updated resource
   */
  '{Resource} updated': function(model, ev, resource) {
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
   */
  '{element} item_selected': function(el, ev) {
    const item = ev.data.item;
    if (this.isSelected(item)) {
      this.options.selectedResources.splice(0);
    } else {
      this.options.selectedResources.splice(0, this.options.selectedResources.length, item);
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
    // Select item.
    this.options.selectedResources.splice(0, this.options.selectedResources.length, item);
    // Get the offset position of the clicked item.
    const $item = $(`#${this.options.prefixItemId}${item.id}`);
    const itemOffset = $item.offset();
    // Show contextual menu.
    this.showContextualMenu(item, srcEv.pageX - 3, itemOffset.top, srcEv.target);
  },

  /**
   * A password has been clicked.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} password_clicked': function(el, ev) {
    const item = ev.data.item;
    const secret = item.secrets[0];
    Plugin.decryptAndCopyToClipboard(secret.data);
  },

  /**
   * A username has been clicked.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} username_clicked': function(el, ev) {
    const item = ev.data.item;
    Clipboard.copy(item.username, 'username');
  },

  /**
   * Listen to the check event on any checkbox form element components.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .js_checkbox_multiple_select checked': function(el, ev) {
    const id = ev.data;
    const resource = this.options.items.filter({id: id}).pop();
    this.options.selectedResources.splice(0, this.options.selectedResources.length, resource);
  },

  /**
   * Listen to the uncheck event on any checkbox form element components.
   */
  '{element} .js_checkbox_multiple_select unchecked': function() {
    this.options.selectedResources.splice(0, this.options.selectedResources.length);
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Listen to the workspace filter event.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    console.log('catch filter workspace');
    const filter = ev.data.filter;
    this.filterBySettings(filter);
  },

  /**
   * Observe when an item is unselected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Resource>} items The unselected items
   */
  '{selectedResources} remove': function(el, ev, items) {
    items.forEach(item => {
      this.unselect(item);
    });
  },

  /**
   * Observe when an item is unselected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Resource>} items The selected items change
   */
  '{selectedResources} add': function(el, ev, items) {
    items.forEach(item => {
      this.select(item);
    });
  },

  /* ************************************************************** */
  /* LISTEN TO THE STATE CHANGES */
  /* ************************************************************** */

  /**
   * Listen to changes related to state empty (when there are no passwords to show).
   * @param {boolean} go Enter or leave the state
   */
  stateEmpty: function(go) {
    if (go) {
      if (this.filterSettings.id == 'default') {
        const empty_html = View.render(gridEmptyTemplate);
        $('.tableview-content', this.element).prepend(empty_html);
      }
    } else {
      /*
       * Remove any empty content html from page.
       * (empty content is the html displayed when the workspace is empty).
       */
      $('.empty-content', this.element).remove();
    }
  }

});

export default PasswordGridComponent;
