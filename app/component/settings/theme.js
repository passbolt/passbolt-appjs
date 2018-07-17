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
import Component from 'passbolt-mad/component/component';
import Config from 'passbolt-mad/config/config';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Theme from 'app/model/map/theme';
import TreeComponent from 'passbolt-mad/component/tree';

import template from 'app/view/template/component/settings/theme.stache!';
import itemTemplate from 'app/view/template/component/settings/theme_item.stache!';

const ThemeComponent = Component.extend('passbolt.component.settings.Theme', /** @static */ {

  defaults: {
    template: template,
    tree: null,
    user: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._findThemes()
      .then(themes => this._initTree(themes));
  },

  /**
   * Retrieve the available themes
   * @return {array<Theme>}
   */
  _findThemes: function() {
    return Theme.findAll();
  },

  /**
   * Init the filter tree
   * @param {DefineList<Theme>} theme The themes
   */
  _initTree: function(themes) {
    const tree = new TreeComponent('#js_theme_tree', {
      map: this._getTreeMap(),
      itemTemplate: itemTemplate
    });
    this.options.tree = tree;
    tree.start();
    tree.load(themes);

    // Mark the current selected theme.
    const selectedThemeName = Config.read('accountSetting.theme') || 'default';
    themes.forEach(theme => {
      if (theme.name == selectedThemeName) {
        this.options.tree.selectItem(theme);
      }
    });
  },

  /**
   * Get the list map
   *
   * @returns {mad.Map}
   */
  _getTreeMap: function() {
    return new MadMap({
      id: 'id',
      name: 'name',
      preview: 'preview'
    });
  },

  /**
   * Select a theme
   * @param {Theme} theme The theme to use
   */
  _selectTheme: function(theme) {
    Theme.select(theme).then(() => {
      const cssSelector = '#js_css_theme';
      const version = Config.read('server.app.version.number');
      const themePath = `${APP_URL}css/themes/${theme.name}/api_main.min.css?v=${version}`;
      $(cssSelector).attr('href', themePath);
      this.options.tree.selectItem(theme);
      MadBus.trigger('passbolt.plugin.account_settings_updated', theme);
    });
  },

  /**
   * Observe when an item is selected in the grid.
   * This event comes from the grid view
   *
   * @param {HTMLElement} el The element the event occured on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} item_selected': function(el, ev) {
    alert('see if working');
    const item = ev.data.item;
    this._selectTheme(item);
  }
});

export default ThemeComponent;
