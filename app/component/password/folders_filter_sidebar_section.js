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
import Folder from '../../model/map/folder';
import PasswordCategoriesFoldersList from '../folder/password_categories_folders_list';
import PrimarySidebarSectionComponent from '../workspace/primary_sidebar_section';
import User from '../../model/map/user';

import template from '../../view/template/component/password/folders_filter_sidebar_section.stache';

const FoldersFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.password.FoldersFilterSidebarSection', /** @static */ {

  defaults: {
    template: template,
    selectedFolders: new Folder.List(),
    state: {hidden: false}
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const folderList = new PasswordCategoriesFoldersList('#js_wsp_password_categories_folders_list', {
      selectedFolders: this.options.selectedFolders,
      defaultFolderFilter: {
        'has-users': User.getCurrent().id
      }
    });
    this.folderList = folderList;
    folderList.state.on('loaded', (ev, loaded) => this._onFolderListLoadedChange(loaded));
    folderList.start();
    this._super();
  },

  /**
   * @inheritdoc
   */
  _onFolderListLoadedChange: function(loaded) {
    // TBD
  }
});

export default FoldersFilterSidebarSectionComponent;
