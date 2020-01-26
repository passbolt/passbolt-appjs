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
 * @since         2.13.0
 */
import Filter from '../../model/filter';
import getObject from 'can-util/js/get/get';
import Folder from '../../model/map/folder';
import FolderListView from '../../view/component/folder/folders_list';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import TreeComponent from 'passbolt-mad/component/tree';
import User from '../../model/map/user';
import uuid from 'uuid/v4';

import itemTemplate from '../../view/template/component/folder/folder_item.stache';
import $ from "jquery";
import ContextualMenuComponent from "passbolt-mad/component/contextual_menu";
import Action from "passbolt-mad/model/map/action";

const FoldersList = TreeComponent.extend('passbolt.component.folder.FoldersList', /** @static */ {

  defaults: {
    itemClass: Folder,
    itemTemplate: itemTemplate,
    prefixItemId: 'folder_',
    selectedFolders: new Folder.List(),
    selectedFilter: null,
    viewClass: FolderListView,
    map: null,
    loadedOnStart: false,
    silentLoading: false,
    defaultFolderFilter: {},
    /*
     * Either we want a menu associated to the folder or not.
     * If set to true, the view will render a menu icon  at the end of the line, that can be clicked.
     * on click, it will trigger a item_menu_clicked event.
     * see password_categories.js for a practical implementation sample.
     */
    withMenu: true,
    /*
     * For now we are using the can-connect/can/model/model to migrate our v2 models.
     * Canjs should be able to observe Map in a Control as a function, however it doesn't.
     * Test it again after we completed the migration of the model to the canjs style.
     */
    Folder: Folder,
    User: User
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this.state.loaded = false;
    this.setViewData('withMenu', this.options.withMenu);
    this._findFolders(this.options.defaultFolderFilter)
      .then(folders => this.load(folders))
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
    this._latestFolderModified = null;
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
          // TODO should be true only if owner
          return true;
        }
      }
    });
  },

  /**
   * Find folders.
   * @param {object} filter
   *   The filter required. Provide {} if no filter
   * @return {Promise}
   * @private
   */
  _findFolders: function(filter) {
    const findOptions = {
      order: ['Folder.name ASC'],
      filter: filter
    };
    return Folder.findAll(findOptions);
  },

  /**
   * Insert a folder in the list following an alphabetical order.
   * @param {Folder} folder The folder to insert
   */
  insertAlphabetically: function(folder) {
    let inserted = false;

    this.options.items.forEach(elt => {
      if (folder.name.localeCompare(elt.name) == -1) {
        this.insertItem(folder, elt, 'before');
        inserted = true;
        return false;
      }
    });

    if (inserted == false) {
      this.insertItem(folder, null, 'last');
    }
  },

  /**
   * @inheritsDoc
   */
  selectItem: function(item) {
    this._latestFolderModified = item.modified;
    this._filterWorkspaceByFolder(item);
    this._super(item);
  },

  /**
   * Filter the workspace by folder.
   * @param {Folder} folder The folder to filter the workspace with
   */
  _filterWorkspaceByFolder: function(folder) {
    this.selectedFilter = new Filter({
      id: `workspace_filter_folder_${folder.id}_${uuid()}`,
      type: 'folder',
      label: folder.name + __(' (folder)'),
      rules: {
        'has-folders': folder.id
      }
    });
    MadBus.trigger('filter_workspace', {filter: this.selectedFilter});
  },

  /**
   * Update the list with data from the API.
   */
  _update: function() {
    this._findFolders(this.options.defaultFolderFilter)
      .then(folders => {
        const oldFolder = this.options.items;
        const foldersToDelete = oldFolder.filter(folder => folders.indexOf(folder) == -1);
        // @todo folders to add. Maybe move this function in the parent class (Tree).
        foldersToDelete.forEach(folder => Folder.dispatch('destroyed', [folder]));
        this.options.items = folders;
      });
  },

  /**
   * Show the contextual menu
   * @param {Folder} folder The item to show the contextual menu for
   * @param {string} x The x position where the menu will be rendered
   * @param {string} y The y position where the menu will be rendered
   * @param {HTMLElement} eventTarget The element the event occurred on
   */
  showContextualMenu: function(folder, x, y, eventTarget) {
    const currentUser = User.getCurrent();
    const isOwner = true; //TODO;

    // Get the offset position of the clicked item.
    const $item = $(`#${this.options.prefixItemId}${folder.id}`);
    const item_offset = $('.more-ctrl a', $item).offset();

    // Instantiate the contextual menu menu.
    const contextualMenu = ContextualMenuComponent.instantiate({
      state: 'hidden',
      source: eventTarget,
      coordinates: {
        x: x,
        y: item_offset.top
      }
    });
    contextualMenu.start();

    const moveItem = new Action({
      id: 'js_folder_browser_menu_move',
      label: 'Move folder',
      initial_state: 'ready',
      action: function(menu) {
        MadBus.trigger('request_folder_move', {folder: folder});
        menu.remove();
      }
    });
    contextualMenu.insertItem(moveItem);

    const editItem = new Action({
      id: 'js_folder_browser_menu_edit',
      label: 'Rename folder',
      initial_state: 'ready',
      action: function(menu) {
        MadBus.trigger('request_folder_rename', {folder: folder});
        menu.remove();
      }
    });
    contextualMenu.insertItem(editItem);

    const deleteItem = new Action({
      id: 'js_folder_browser_menu_remove',
      label: 'Delete folder',
      initial_state: 'ready',
      action: function(menu) {
        MadBus.trigger('request_folder_delete', {folder: folder});
        menu.remove();
      }
    });
    contextualMenu.insertItem(deleteItem);
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when a folder is created and add it to the list.
   * @param {Folder.prototype} Constructor The constructor
   * @param {HTMLEvent} ev The event which occurred
   * @param {Folder} folder The created folder
   */
  '{Folder} created': function(Constructor, ev, folder) {
    this.insertAlphabetically(folder);
  },

  /**
   * Observe when a folder is updated.
   * @param {Folder.prototype} Constructor The constructor
   * @param {HTMLEvent} ev The event which occurred
   * @param {Folder} folder The created folder
   */
  '{Folder} updated': function(Constructor, ev, folder) {
    this.refreshItem(folder);
    const selectedFolders = this.options.selectedFolders;
    const id = folder.id;
    if (selectedFolders.indexOf({id: id}) != -1) {
      this.view.selectItem(folder);
      /*
       * This component drive the selection of a folder in the workspace.
       * @todo It's should be moved somewhere else (later :*)
       */
      const isFolderUpdated = this._latestFolderModified != folder.modified;
      if (isFolderUpdated) {
        this.selectItem(folder);
      }
    }
  },

  /**
   * Observe when a folder is destroyed.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {Folder} folder The destroyed folder
   */
  '{Folder} destroyed': function(el, ev, folder) {
    this.removeItem(folder);
  },

  /**
   * Observe when folders are unselected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Folder>} items The unselected items
   */
  '{selectedFolders} remove': function(el, ev, items) {
    items.forEach(item => {
      this.unselectItem(item);
    });
  },

  /**
   * Observe when folders are selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Folder>} items The selected items change
   */
  '{selectedFolders} add': function(el, ev, items) {
    items.forEach(item => {
      this.selectItem(item);
    });
  },

  /**
   * @inheritsDoc
   */
  '{element} item_selected': function(el, ev) {
    const item = ev.data.item;
    const folders = this.options.selectedFolders;
    /*
     * Insert the folder in the list of selected folders.
     * The component is listening to any changes to this list.
     * @see the "{selectedFolders} add" templated function
     */
    folders.splice(0, folders.length, item);
  },

  /**
   * An item has been clicked on the menu icon
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} item_menu_clicked': function(el, ev) {
    const group = ev.data.folder;
    const srcEv = ev.data.srcEv;
    this.showContextualMenu(group, srcEv.pageX - 3, srcEv.pageY, srcEv.target);
  },

  /**
   * Observe when a user is destroyed.
   * - Refresh the list if required
   */
  '{User} destroyed': function() {
    this._update();
  }

});

export default FoldersList;
