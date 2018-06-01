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
import DomData from 'can-util/dom/data/data';
import TreeView from 'passbolt-mad/view/component/tree';

var GroupsListView = TreeView.extend('passbolt.view.component.GroupsList', /** @static */ {

}, /** @prototype */ {

    /**
     * Mousedown event.
     *
     * We use this event to display the contextual menu
     * @param el
     * @param ev
     * @returns {boolean}
     */
    '.more-ctrl a mousedown': function (el, ev) {
        ev.stopPropagation();
        ev.preventDefault();

        var data = null;
        var $li = $(el).closest('li');
        var itemClass = this.getController().getItemClass();

        if (itemClass) {
            data = DomData.get.call($li[0], itemClass.shortName);
        } else {
            data = $li[0].id;
        }

        $(this.element).trigger('item_menu_clicked', [data, ev]);

        return false;
    }

});

export default GroupsListView;
