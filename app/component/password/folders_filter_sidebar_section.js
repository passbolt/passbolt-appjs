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
import React from "react";
import ReactDOM from "react-dom";
import MadBus from 'passbolt-mad/control/bus';
import Filter from '../../model/filter';
import PrimarySidebarSectionComponent from '../workspace/primary_sidebar_section';
import Plugin from "../../util/plugin";
import FoldersTreeItemContextualMenu
  from "../../../src/components/Workspace/Passwords/FoldersTree/FoldersTreeItemContextualMenu";
import FoldersTree from "../../../src/components/Workspace/Passwords/FoldersTree/FoldersTree";
import FoldersTreeRootFolderContextualMenu
  from "../../../src/components/Workspace/Passwords/FoldersTree/FoldersTreeRootFolderContextualMenu";

const FoldersFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.password.FoldersFilterSidebarSection', /** @static */ {

}, /** @prototype */ {
  /**
   * @inheritdoc
   */
  afterStart: function () {
    this._super();
    this.selectedFolder = null;
    this.folders = null;
    this.initFoldersTree();
    this.initContextualMenu();
    this.loadFolders();
  },

  loadFolders: async function() {
    const folders = await Plugin.requestUntilSuccess("passbolt.storage.folders.get");
    this.folders = folders;
    this.renderFoldersTree(this.foldersTreeRef, this.folders, this.selectedFolder)
  },

  initFoldersTree: function () {
    const ref = React.createRef();
    this.foldersTreeRef = ref;
    this.renderFoldersTree(this.foldersTreeRef, this.folders, this.selectedFolder);
  },

  renderFoldersTree:function (ref, folders, selectedFolder) {
    ReactDOM.render(<FoldersTree
      ref={ref}
      folders={folders}
      onFolderContextualMenu={(folder, top, left, foldersTreeListElementRef) => this.onFolderContextualMenu(folder, top, left, foldersTreeListElementRef)}
      onRootFolderContextualMenu={(top, left, foldersTreeTitleElementRef) => this.onRootFolderContextualMenu(top, left, foldersTreeTitleElementRef)}
      onSelect={folder => this.onSelect(folder)}
      onSelectRoot={() => this.onSelectRoot()}
      selectedFolder={selectedFolder}
    />, this.element);
  },

  onFolderContextualMenu(folder, top, left, foldersTreeListElementRef) {
    this.renderFolderContextualMenu(folder, top, left, foldersTreeListElementRef)
  },

  onRootFolderContextualMenu(top, left, foldersTreeTitleElementRef) {
    this.renderRootFolderContextualMenu(top, left, foldersTreeTitleElementRef)
  },

  onSelect(folder) {
    const filter = new Filter({
      id: `workspace_filter_folder_${folder.id}`,
      type: 'folder',
      folder: folder,
      label: __('%s (folder)', folder.name),
      rules: {
        'has-parent': folder.id
      },
      order: ['Resource.modified DESC']
    });
    MadBus.trigger('filter_workspace', {filter});
    this.selectedFolder = folder;
    this.renderFoldersTree(this.foldersTreeRef, this.folders, this.selectedFolder);
  },

  onSelectRoot() {
    const filter = new Filter({
      id: `workspace_filter_folder_root`,
      type: 'folder',
      folder: {
        id: null,
        name: 'root'
      },
      label: __('%s (folder)', 'root'),
      rules: {
        'has-parent': null
      },
      order: ['Resource.modified DESC']
    });
    MadBus.trigger('filter_workspace', {filter});
  },

  initContextualMenu: function () {
    const ref = React.createRef();
    this.menuRef = ref;
    this.menuElement = $('<div>').appendTo('body')[0];
  },

  renderFolderContextualMenu:function (folder, top, left, foldersTreeListElementRef) {
    const ref = this.menuRef;
    ReactDOM.render(<FoldersTreeItemContextualMenu
      ref={ref}
      folder={folder}
      top={top}
      left={left}
      foldersTreeListElementRef={foldersTreeListElementRef}
      onDestroy={() => this.hideMenu()}
    />, this.menuElement);
  },

  renderRootFolderContextualMenu:function (top, left, foldersTreeTitleElementRef) {
    const ref = this.menuRef;
    ReactDOM.render(<FoldersTreeRootFolderContextualMenu
      folders={this.folders}
      ref={ref}
      top={top}
      left={left}
      foldersTreeTitleElementRef={foldersTreeTitleElementRef}
      onDestroy={() => this.hideMenu()}
    />, this.menuElement);
  },

  hideMenu() {
    ReactDOM.unmountComponentAtNode(this.menuElement);
  },

  /**
   * Listen when the local storage is updated.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{document} passbolt.storage.folders.updated': function(el, ev) {
    const folders = ev.data;
    this.folders = folders;
    this.renderFoldersTree(this.foldersTreeRef, this.folders, this.selectedFolder);
  },

  /**
   * When a new filter is applied to the workspace.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    let selectedFolder = null;

    if (filter.type === 'folder') {
      selectedFolder = filter.folder;
    }

    this.selectedFolder = selectedFolder;
    this.renderFoldersTree(this.foldersTreeRef, this.folders, this.selectedFolder);
  },

  /**
   * When the plugin request the appj to select and scroll to a folder.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{document} passbolt.plugin.folders.select-and-scroll-to': function(el, ev) {
    const folderId = ev.data;
    const folder = this.folders.find(folder => folder.id === folderId);

    const filter = new Filter({
      id: `workspace_filter_folder_${folder.id}`,
      type: 'folder',
      folder: folder,
      label: __('%s (folder)', folder.name),
      rules: {
        'has-parent': folder.id
      },
      order: ['Resource.modified DESC']
    });
    MadBus.trigger('filter_workspace', {filter});
    this.foldersTreeRef.current.openFolderTree(folder);
  },

  /**
   * Scroll to a folder
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} scroll_to_folder': function(el, ev) {
    const folder = ev.data;
    this.foldersTreeRef.current.openFolderTree(folder);
  }
});

export default FoldersFilterSidebarSectionComponent;
