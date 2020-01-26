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
 * @since         2.13.0
 */
import $ from 'jquery';
import DomData from 'can-dom-data';
import domEvents from 'can-dom-events';
import TreeView from 'passbolt-mad/view/component/tree';

const FoldersListView = TreeView.extend('passbolt.view.component.FoldersList', /** @static */ {

}, /** @prototype */ {

  /**
   * Mousedown event.
   *
   * We use this event to display the contextual menu
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @returns {boolean}
   */
  '{element} .more-ctrl a mousedown': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const $li = $(el).closest('li');
    const itemClass = this.getController().getItemClass();
    const folder = DomData.get($li[0], itemClass.shortName);
    domEvents.dispatch(this.element, {type: 'item_menu_clicked', data: {folder: folder, srcEv: ev}});

    return false;
  }

});

export default FoldersListView;
