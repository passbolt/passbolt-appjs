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
import Menu from 'passbolt-mad/component/menu';
import uuid from 'uuid/v4';

import template from '../../view/template/component/breadcrumb/breadcrumb.stache';
import itemTemplate from '../../view/template/component/breadcrumb/breadcrumb_item.stache';

const WorkspaceBreadcrumb = Component.extend('passbolt.component.WorkspaceBreadcrumb', /** @static */ {

  defaults: {
    template: template,
    rootFilter: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const menuSelector = `#${this.getId()} ul`;
    const menu = new Menu(menuSelector, {
      itemTemplate: itemTemplate
    });
    menu.start();
    this.options.menu = menu;
  },

  /**
   * Parse the current filter
   * @param {Filter} filter The filter to load
   * @return {array}
   */
  parseFilter: function(filter) {
    const menuItems = [];
    const keywords = filter.getRule('keywords');

    // Add a link to filter on all items as first item.
    const allItemsItem = new Action({
      id: uuid(),
      label: __('All items'),
      filter: this.options.rootFilter
    });
    menuItems.push(allItemsItem);

    // If filtered by keywords, add a breadcrumb relative to the searched keywords
    if (keywords && keywords != '') {
      const searchItem = new Action({
        id: uuid(),
        label: __('Search : %s', keywords)
      });
      menuItems.push(searchItem);
    } else if (filter.id != 'default') {
      // For any other filters than the default one, add a breadcrumb entry.
      const thirdItem = new Action({
        id: uuid(),
        label: filter.label
      });
      menuItems.push(thirdItem);
    }

    return menuItems;
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * An item has been selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} item_selected': function(el, ev) {
    const item = ev.data.item;
    if (item.filter) {
      MadBus.trigger('filter_workspace', {filter: item.filter});
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Listen to the browser filter
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    this.options.menu.reset();
    const menuItems = this.parseFilter(filter);
    this.options.menu.load(menuItems);
  }

});

export default WorkspaceBreadcrumb;
