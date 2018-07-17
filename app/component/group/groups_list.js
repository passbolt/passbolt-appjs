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
import Filter from 'app/model/filter';
import getObject from 'can-util/js/get/get';
import Group from 'app/model/map/group';
import GroupListView from 'app/view/component/group/groups_list';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import TreeComponent from 'passbolt-mad/component/tree';
import User from 'app/model/map/user';
import uuid from 'uuid/v4';

import itemTemplate from 'app/view/template/component/group/group_item.stache!';

const GroupsList = TreeComponent.extend('passbolt.component.group.GroupsList', /** @static */ {

  defaults: {
    itemClass: Group,
    itemTemplate: itemTemplate,
    prefixItemId: 'group_',
    selectedGroups: new Group.List(),
    selectedGroup: null,
    selectedFilter: null,
    // the view class to use. Overriden so we can put our own logic.
    viewClass: GroupListView,
    map: null,
    state: 'loading',
    silentLoading: false,
    defaultGroupFilter: {},
    /*
     * Either we want a menu associated to the group or not.
     * If set to true, the view will render a menu icon  at the end of the line, that can be clicked.
     * on click, it will trigger a item_menu_clicked event.
     * see password_categories.js for a practical implementation sample.
     */
    withMenu: false,
    /*
     * For now we are using the can-connect/can/model/model to migrate our v2 models.
     * Canjs should be able to observe Map in a Control as a function, however it doesn't.
     * Test it again after we completed the migration of the model to the canjs style.
     */
    Group: Group
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this.setViewData('withMenu', this.options.withMenu);
    this.loadGroups(this.options.defaultGroupFilter);
    this._super();
  },

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    options = options || {};
    options.map = this._getTreeMap();
    this._super(el, options);
  },

  /**
   * Get the tree map.
   * @returns {MadMap}
   */
  _getTreeMap: function() {
    return  new MadMap({
      id: 'id',
      label: 'name',
      canEdit: {
        key: 'id',
        func: (id, map, item) => {
          const isAdmin = getObject(item, 'my_group_user.is_admin') || User.getCurrent().isAdmin();
          return isAdmin === true;
        }
      }
    });
  },

  /**
   * Load groups after retrieving them from API according to a given filter.
   * @param json filter
   *   The filter required. Provide {} if no filter
   *   Example: {"has-users":"xxx-xxx-xxx-xxx-xxx"}
   */
  loadGroups: function(filter) {
    const findOptions = {
      contain: {'my_group_user': 1},
      order: ['Group.name ASC'],
      filter: filter
    };
    Group.findAll(findOptions)
      .then(groups => {
      // @todo could throw a specific exception and catch it globally (this is not an error).
        if (this.state.is('destroyed')) {
          return;
        }
        // Load the tree component with the groups.
        this.load(groups);
        this.setState('ready');
      }, error => {
        throw error;
      });
  },

  /**
   * Insert a group in the list following an alphabetical order.
   * @param {passbolt.model.Group} group The group to insert
   * @param item
   */
  insertAlphabetically: function(group) {
    let inserted = false;

    this.options.items.forEach(elt => {
      if (group.name.localeCompare(elt.name) == -1) {
        this.insertItem(group, elt, 'before');
        inserted = true;
        return false;
      }
    });

    if (inserted == false) {
      this.insertItem(group, null, 'last');
    }
  },

  /**
   * @inheritsDoc
   */
  selectItem: function(item) {
    this.view.selectItem(item);
    this.options.selectedGroups.splice(0, this.options.selectedGroups.length);
    this.options.selectedGroups.push(item);
    if (!this.options.selectedGroup || (this.options.selectedGroup && this.options.selectedGroup.id != item.id)) {
      this.options.selectedGroup = item;
      this.on();
    }
    this._filterWorkspaceByGroup(item);
  },

  /**
   * @inheritsDoc
   */
  unselectAll: function() {
    this.options.selectedGroups.splice(0, this.options.selectedGroups.length);
    this.selectedGroup = null;
    this.on();
    this._super();
  },

  /**
   * Filter the workspace by group.
   * @param {passbolt.model.Group} group The group to filter the workspace with
   */
  _filterWorkspaceByGroup: function(group) {
    this.selectedFilter = new Filter({
      id: `workspace_filter_group_${group.id}_${uuid()}`,
      label: group.name + __(' (group)'),
      rules: {
        'has-groups': group.id
      }
    });
    MadBus.trigger('filter_workspace', {filter: this.selectedFilter});
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when a group is created and add it to the list.
   * @param {Object} Constructor The constructor
   * @param {HTMLEvent} ev The event which occurred
   * @param {passbolt.model.Group} group The created group
   */
  '{Group} created': function(Constructor, ev, group) {
    this.insertAlphabetically(group);
  },

  /**
   * Listen when a group is updated.
   * @param {mad.model.Model} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {Group} group The updated group
   */
  '{mad.bus.element} group_replaced': function(model, ev) {
    const group = ev.data.group;
    this.refreshItem(group);

    // If the group was selected, mark it as selected
    if (this.options.selectedGroup && this.options.selectedGroup.id == group.id) {
      this.selectItem(group);
    }
  },

  /**
   * Listen when a group model has been destroyed.
   *
   * And update the component accordingly by removing it from the list, and unselecting all groups.
   *
   * @param el
   * @param ev
   * @param data
   */
  '{Group} destroyed': function(el, ev, group) {
    this.unselectAll();
    this.removeItem(group);
    MadBus.trigger('reset_filters');
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
    if (!filter.id.match(/^workspace_filter_group_/)) {
      this.unselectAll();
    }
  }

});

export default GroupsList;
