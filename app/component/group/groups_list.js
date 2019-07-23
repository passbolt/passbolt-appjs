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
import Filter from '../../model/filter';
import getObject from 'can-util/js/get/get';
import Group from '../../model/map/group';
import GroupListView from '../../view/component/group/groups_list';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import TreeComponent from 'passbolt-mad/component/tree';
import User from '../../model/map/user';
import uuid from 'uuid/v4';

import itemTemplate from '../../view/template/component/group/group_item.stache';

const GroupsList = TreeComponent.extend('passbolt.component.group.GroupsList', /** @static */ {

  defaults: {
    itemClass: Group,
    itemTemplate: itemTemplate,
    prefixItemId: 'group_',
    selectedGroups: new Group.List(),
    selectedFilter: null,
    viewClass: GroupListView,
    map: null,
    loadedOnStart: false,
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
    Group: Group,
    User: User
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this.state.loaded = false;
    this.setViewData('withMenu', this.options.withMenu);
    this._findGroups(this.options.defaultGroupFilter)
      .then(groups => this.load(groups))
      .then(() => {
        this.state.loaded = true;
      });
    this._super();
  },

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    options = options || {};
    options.map = this._getTreeMap();
    this._super(el, options);
    this._latestGroupModified = null;
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
   * Find groups.
   * @param {object} filter
   *   The filter required. Provide {} if no filter
   *   Example: {"has-users":"xxx-xxx-xxx-xxx-xxx"}
   * @return {Promise}
   * @private
   */
  _findGroups: function(filter) {
    const findOptions = {
      contain: {'my_group_user': 1},
      order: ['Group.name ASC'],
      filter: filter
    };
    return Group.findAll(findOptions);
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
    this._latestGroupModified = item.modified;
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
      type: 'group',
      label: group.name + __(' (group)'),
      rules: {
        'has-groups': group.id
      }
    });
    MadBus.trigger('filter_workspace', {filter: this.selectedFilter});
  },

  /**
   * Update the list with data from the API.
   */
  _update: function() {
    this._findGroups(this.options.defaultGroupFilter)
      .then(groups => {
        const oldGroup = this.options.items;
        const groupsToDelete = oldGroup.filter(group => groups.indexOf(group) == -1);
        // @todo groups to add. Maybe move this function in the parent class (Tree).
        groupsToDelete.forEach(group => Group.dispatch('destroyed', [group]));
        this.options.items = groups;
      });
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
   * Observe when a group is updated.
   * @param {Group.prototype} Constructor The constructor
   * @param {HTMLEvent} ev The event which occurred
   * @param {Group} group The created group
   */
  '{Group} updated': function(Constructor, ev, group) {
    this.refreshItem(group);
    const selectedGroups = this.options.selectedGroups;
    const id = group.id;
    if (selectedGroups.indexOf({id: id}) != -1) {
      this.view.selectItem(group);
      /*
       * This component drive the selection of a group in the workspace.
       * @todo It's should be moved somewhere else (later :*)
       */
      const isGroupUpdated = this._latestGroupModified != group.modified;
      if (isGroupUpdated) {
        this.selectItem(group);
      }
    }
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
  },

  /**
   * Observe when a user is destroyed.
   * - Refresh the list if required
   */
  '{User} destroyed': function() {
    this._update();
  }

});

export default GroupsList;
