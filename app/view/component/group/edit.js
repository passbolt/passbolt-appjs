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
import View from 'passbolt-mad/view/view';

var EditView = View.extend('passbolt.view.component.group.Edit', /** @static */ { }, /** @prototype */ {

    /* ************************************************************** */
    /* LISTEN TO VIEW EVENTS */
    /* ************************************************************** */

    /**
     * Observe when the user want to delete a groupUser.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    ' .js_group_user_delete click': function(el, ev) {
        ev.stopPropagation();
        ev.preventDefault();

        var $li = $(el).parents('li');
        var groupUser = DomData.get.call($li[0], 'passbolt.model.GroupUser');
        $(this.element).trigger('request_group_user_delete', [groupUser]);
    },

    /**
     * Observe when the user want to edit a permission type.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    ' .js_group_user_is_admin changed': function(el, ev, data) {
        ev.stopPropagation();
        ev.preventDefault();

        var $li = $(el).parents('li');
        var groupUser = DomData.get.call($li[0], 'passbolt.model.GroupUser');
        var isAdmin = data.value;

        $(this.element).trigger('request_group_user_edit', [groupUser, isAdmin]);
    }

});

export default EditView;