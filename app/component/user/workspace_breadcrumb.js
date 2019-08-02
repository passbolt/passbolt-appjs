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
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import MenuComponent from 'passbolt-mad/component/menu';
import uuid from 'uuid/v4';

import template from '../../view/template/component/breadcrumb/breadcrumb.stache';
import breadCrumbTemplate from '../../view/template/component/breadcrumb/breadcrumb_item.stache';

const WorkspaceBreadcrumb = Component.extend('passbolt.component.user.WorkspaceBreadcrumb', /** @static */ {

  defaults: {
    template: template,
    status: 'hidden',
    // Root crumb filter
    rootFilter: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const menuSelector = `#${this.getId()} ul`;
    this.options.menu = new MenuComponent(menuSelector, {
      itemTemplate: breadCrumbTemplate
    });
    this.options.menu.start();
  },

  /**
   * Parse the current filter
   * @param {passbolt.model.Filter} filter The filter to load
   * @return {array}
   */
  parseFilter: function(filter) {
    const menuItems = [];
    const keywords = filter.getRule('keywords');

    // Add default filter as root action.
    const allUsersMenuItem = new Action({
      id: uuid(),
      label: __('All users'),
      filter: this.options.rootFilter
    });
    menuItems.push(allUsersMenuItem);

    // If filtered by keywords, add a breadcrumb relative to the searched keywords
    if (keywords && keywords != '') {
      const searchMenuItem = new Action({
        id: uuid(),
        label: __('Search : %s', keywords)
      });
      menuItems.push(searchMenuItem);
    } else if (filter.id != 'default') {
      // For any other filters than the default one, add a breadcrumb entry.
      const thirdFilterMenuItem = new Action({
        id: uuid(),
        label: filter.label
      });
      menuItems.push(thirdFilterMenuItem);
    }

    return menuItems;
  },

  /**
   * Load the current filter
   * @param {Filter} filter The filter to load
   */
  load: function(filter) {
    const menuItems = this.parseFilter(filter);
    this.options.menu.reset();
    this.options.menu.load(menuItems);
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * An item has been selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} item_selected': function(el, ev) {
    const item = ev.data.item;
    if (item.filter) {
      MadBus.trigger('filter_workspace', {filter: item.filter});
    }
  },

  /* ************************************************************** */
  /* LISTEN TO APP EVENTS */
  /* ************************************************************** */

  /**
   * Listen to the browser filter
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    this.options.menu.reset();
    const menuItems = this.parseFilter(filter);
    this.options.menu.load(menuItems);
  }

});

export default WorkspaceBreadcrumb;
