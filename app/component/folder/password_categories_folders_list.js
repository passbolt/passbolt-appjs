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
import Folder from '../../model/map/folder';
import FoldersListComponent from '../folder/folders_list';
import FoldersListView from '../../view/component/folder/folders_list';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';

import itemTemplate from '../../view/template/component/folder/folder_item.stache';

const PasswordCategoriesFoldersList = FoldersListComponent.extend('passbolt.component.PasswordCategoriesFoldersList', /** @static */ {

  defaults: {
    itemClass: Folder,
    itemTemplate: itemTemplate,
    prefixItemId: 'folder_',
    selectedFolders: new Folder.List(),
    selectedFilter: null,
    viewClass: FoldersListView
  }

}, /** @prototype */ {

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Filter the workspace by folder.
   * @param {passbolt.model.Folder} folder The folder to filter the workspace with
   */
  _filterWorkspaceByFolder: function(folder) {
    this.selectedFilter = new Filter({
      id: `workspace_filter_folder_${folder.id}`,
      type: 'folder',
      label: __('%s (folder)', folder.name),
      rules: {
        'has-parent-folder': folder.id // TODO api implementation check
      },
      order: ['Resource.modified DESC']
    });
    MadBus.trigger('filter_workspace', {filter: this.selectedFilter});
  }

});

export default PasswordCategoriesFoldersList;
