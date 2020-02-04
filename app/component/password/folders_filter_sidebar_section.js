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
import Folder from '../../model/map/folder';
import FoldersList from "../../../src/components/FoldersList/FoldersList";
import PrimarySidebarSectionComponent from '../workspace/primary_sidebar_section';
import ContextualMenu from "../../../src/components/FoldersList/ContextualMenu";

const FoldersFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.password.FoldersFilterSidebarSection', /** @static */ {

  defaults: {
    selectedFolders: new Folder.List(),
  }

}, /** @prototype */ {
  /**
   * @inheritdoc
   */
  afterStart: function () {
    this._super();
    this.initFoldersList();
    this.initContextualMenu();
  },

  initFoldersList: function () {
    const ref = React.createRef();
    const foldersList = React.createElement(FoldersList, {ref});
    ReactDOM.render(foldersList, this.element);
  },

  initContextualMenu: function () {
    const ref = React.createRef();
    this.menuRef = ref;
    const menu = React.createElement(ContextualMenu, {ref});
    const menuElement = $('<div>').appendTo('body');
    ReactDOM.render(menu, menuElement[0]);
  },

  /**
   * An item has been right selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} folders_list_folder_contextual_menu': function (el, ev) {
    const folder = ev.detail.folder;
    const top = ev.detail.top;
    const left = ev.detail.left;
    this.menuRef.current.show(folder, top, left);
  },

  /**
   * Filter the workspace by folder.
   * @param {passbolt.model.Folder} folder The folder to filter the workspace with
   */
  '{mad.bus.element} folders_list_folder_selected': function (el, ev) {
    const folder = ev.detail.folder;
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
  }
});

export default FoldersFilterSidebarSectionComponent;
