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
import $ from 'jquery/dist/jquery.min.js';
import DomData from 'can-dom-data';
import domEvents from 'can-dom-events';
import View from 'passbolt-mad/view/view';

const EditView = View.extend('passbolt.view.component.group.Edit', /** @static */ { }, /** @prototype */ {

  /* ************************************************************** */
  /* LISTEN TO VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user want to delete a groupUser.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .js_group_user_delete click': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const $li = $(el).parents('li');
    const groupUser = DomData.get($li[0], 'passbolt.model.GroupUser');
    domEvents.dispatch(this.element, {type: 'request_group_user_delete', data: {groupUser: groupUser}});
  },

  /**
   * Observe when the user want to edit a permission type.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .js_group_user_is_admin changed': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const data = ev.data;
    const $li = $(el).parents('li');
    const groupUser = DomData.get($li[0], 'passbolt.model.GroupUser');
    const isAdmin = data.value;
    domEvents.dispatch(this.element, {type: 'request_group_user_edit', data: {groupUser: groupUser, isAdmin: isAdmin}});
  }

});

export default EditView;
