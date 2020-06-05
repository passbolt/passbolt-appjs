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
import Clipboard from '../../util/clipboard';
import Config from 'passbolt-mad/config/config';
import Resource from '../../model/map/resource';
import ResourceService from '../../model/service/plugin/resource';
import SecondarySidebarSectionComponent from '../workspace/secondary_sidebar_section';

import template from '../../view/template/component/password/information_sidebar_section.stache';
import Plugin from "../../util/plugin";
import Filter from "../../model/filter";
import MadBus from "passbolt-mad/control/bus";

const InformationSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.password.InformationSidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Information Controller',
    template: template,
    resource: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    // Find complementary resource data (creator/modifier/folder parent).
    this.pluginFoldersEnabled = Config.read('server.passbolt.plugins.folders');
    this.folderParent = null;
    this.folderParentName = null;
    this._findResource();
    this._findFolderParent();
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('resource', this.options.resource);
    this.setViewData('pluginFoldersEnabled', this.pluginFoldersEnabled);
    this.setViewData('folderParentName', this.folderParentName ? this.folderParentName : '');
  },

  /**
   * Find the resource missing information (creator & modifier).
   */
  _findResource: function() {
    const _this = this;
    const findOptions = {
      id: this.options.resource.id,
      contain: {creator: 1, modifier: 1}
    };
    Resource.findOne(findOptions).then(resource => {
      _this.options.resource = resource;
      _this.refresh();
    }, () => {
      console.error(`Resource not found ${this.options.resource.id}`);
    });
  },

  /**
   * Find the folder parent.
   * @private
   */
  _findFolderParent: async function() {
    if (!this.pluginFoldersEnabled) {
      return;
    }

    const folders = await Plugin.requestUntilSuccess("passbolt.storage.folders.get");
    if (this.options.resource.folder_parent_id === null) {
      this.folderParent = null;
      this.folderParentName = "/";
    } else {
      this.folderParent = folders.find(item => item.id === this.options.resource.folder_parent_id);
      this.folderParentName = this.folderParent.name;
    }

    this.refresh();
  },

  /**
   * The password has been clicked.
   */
  '{element} li.password .secret-copy > a click': function() {
    const resource = this.options.resource;
    ResourceService.decryptSecretAndCopyToClipboard(resource.id);
  },

  /**
   * The username has been clicked.
   */
  '{element} li.username .value > a click': function() {
    const item = this.options.resource;
    Clipboard.copy(item.username, 'username');
  },

  /**
   * The folder location has been clicked.
   */
  '{element} li.location .value > a click': function() {
    if (this.folderParent) {
      this.handleFolderSecondarySidebarSelectFolder(this.folderParent);
    } else {
      this.handleFolderSecondarySidebarSelectRootFolder();
    }
  },

  /**
   * Handle when the user selects a folder from the resource secondary sidebar.
   * @param {object} folder The selected folder
   */
  handleFolderSecondarySidebarSelectFolder: function(folder) {
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

  /**
   * Handle when the user selects the root folder from the resource secondary sidebar.
   * @param {object} folder The selected folder
   */
  handleFolderSecondarySidebarSelectRootFolder: function() {
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

});

export default InformationSidebarSectionComponent;
