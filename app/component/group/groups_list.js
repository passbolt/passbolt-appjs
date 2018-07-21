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
   * @param {Group} group The group to insert
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
    this._filterWorkspaceByGroup(item);
    this._super(item);
  },

  /**
   * Filter the workspace by group.
   * @param {Group} group The group to filter the workspace with
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
   * @param {Group.prototype} Constructor The constructor
   * @param {HTMLEvent} ev The event which occurred
   * @param {Group} group The created group
   */
  '{Group} created': function(Constructor, ev, group) {
    this.insertAlphabetically(group);
  },

  /**
   * Observe when a group is destroyed.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {Group} group The destroyed group
   */
  '{Group} destroyed': function(el, ev, group) {
    this.removeItem(group);
  },

  /**
   * Listen when a group is updated.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @todo Explain the group_replaced event
   */
  '{mad.bus.element} group_replaced': function(el, ev) {
    const group = ev.data.group;
    this.refreshItem(group);

    // If the group was selected, mark it as selected
    if (this.options.selectedGroup && this.options.selectedGroup.id == group.id) {
      this.selectItem(group);
    }
  },

  /**
   * Observe when groups are unselected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Group>} items The unselected items
   */
  '{selectedGroups} remove': function(el, ev, items) {
    items.forEach(item => {
      this.unselectItem(item);
    });
  },

  /**
   * Observe when groups are selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Group>} items The selected items change
   */
  '{selectedGroups} add': function(el, ev, items) {
    items.forEach(item => {
      this.selectItem(item);
    });
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * @inheritsDoc
   */
  '{element} item_selected': function(el, ev) {
    const item = ev.data.item;
    const groups = this.options.selectedGroups;
    /*
     * Insert the group in the list of selected groups.
     * The component is listening to any changes to this list.
     * @see the "{selectedGroups} add" templated function
     */
    groups.splice(0, groups.length, item);
  }

});

export default GroupsList;
