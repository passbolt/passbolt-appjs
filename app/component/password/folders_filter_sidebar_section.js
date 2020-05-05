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

const FoldersFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.password.FoldersFilterSidebarSection', /** @static */ {

}, /** @prototype */ {
  /**
   * @inheritdoc
   */
  afterStart: function () {
    this._super();
    this.initFoldersTree();
    this.initContextualMenu();
    this.loadFolders();
  },

  loadFolders: async function() {
    const folders = await Plugin.requestUntilSuccess("passbolt.storage.folders.get");
    this.renderFoldersTree(this.foldersTreeRef, folders)
  },

  initFoldersTree: function () {
    const ref = React.createRef();
    this.foldersTreeRef = ref;
    const folders = null;
    this.renderFoldersTree(ref, folders);
  },

  renderFoldersTree:function (ref, folders) {
    ReactDOM.render(<FoldersTree
      ref={ref}
      folders={folders}
      onContextualMenu={(folder, top, left, foldersTreeElement) => this.onContextualMenu(folder, top, left, foldersTreeElement)}
      onSelect={folder => this.onSelect(folder)}
      onSelectRoot={() => this.onSelectRoot()}
    />, this.element);
  },

  onContextualMenu(folder, top, left, foldersTreeElement) {
    this.renderContextualMenu(folder, top, left, foldersTreeElement)
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

  renderContextualMenu:function (folder, top, left, foldersTreeElement) {
    const ref = this.menuRef;
    ReactDOM.render(<FoldersTreeItemContextualMenu
      ref={ref}
      folder={folder}
      top={top}
      left={left}
      foldersTreeElementRef={foldersTreeElement}
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
    this.renderFoldersTree(this.foldersTreeRef, folders);
  }
});

export default FoldersFilterSidebarSectionComponent;
