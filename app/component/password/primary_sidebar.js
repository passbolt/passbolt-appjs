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
import Config from 'passbolt-mad/config/config';
import FoldersFilterSidebarSectionComponent from '../password/folders_filter_sidebar_section';
import GroupsFilterSidebarSectionComponent from '../password/groups_filter_sidebar_section';
import PrimarySidebarAbstractComponent from '../workspace/primary_sidebar';
import ShortcutsFilterSidebarSectionComponent from '../password/shortcuts_filter_sidebar_section';
import TagsFilterSidebarSectionComponent from '../tag/tags_filter_sidebar_section';

import template from '../../view/template/component/password/primary_sidebar.stache';

const PrimarySidebarComponent = PrimarySidebarAbstractComponent.extend('passbolt.component.password.PrimarySidebar', /** @static */ {

  defaults: {
    label: 'Password Workspace Primary Sidebar',
    template: template,
    defaultFilter: null,
    selectedGroups: null,
    selectedTags: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initShortcutsFilterSection();
    this._initFoldersFilterSection();
    this._initGroupsFilterSection();
    this._initTagsFilterSection();
    this._super();
  },

  /**
   * Initialize the shortcuts filter section
   */
  _initShortcutsFilterSection: function() {
    const component = new ShortcutsFilterSidebarSectionComponent('#js_wsp_pwd_filter_shortcuts', {
      allFilter: this.options.defaultFilter
    });
    component.start();
  },

  /**
   * Initialize the groups filter section
   */
  _initFoldersFilterSection: function() {
    const pluginFoldersEnabled = Config.read('server.passbolt.plugins.folders');
    if (!pluginFoldersEnabled) {
      return;
    }
    const component = new FoldersFilterSidebarSectionComponent('#js_wsp_pwd_filter_folders_section', {
      selectedGroups: this.options.selectedFolders
    });
    component.start();
  },

  /**
   * Initialize the groups filter section
   */
  _initGroupsFilterSection: function() {
    const component = new GroupsFilterSidebarSectionComponent('#js_wsp_pwd_password_categories', {
      selectedGroups: this.options.selectedGroups
    });
    component.start();
  },

  /**
   * Initialize the tags filter section
   */
  _initTagsFilterSection: function() {
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins && plugins.tags) {
      const component = new TagsFilterSidebarSectionComponent('#js_wsp_pwd_filter_tags_section', {
        selectedTags: this.options.selectedTags
      });
      component.start();
    }
  }

});

export default PrimarySidebarComponent;
