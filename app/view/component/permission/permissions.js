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

const PermissionsView = View.extend('passbolt.view.component.permission.Permissions', /** @static */ { }, /** @prototype */ {

  /* ************************************************************** */
  /* LISTEN TO VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user want to delete a permission.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .js_perm_delete click': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const $li = $(el).parents('li');
    const permission = DomData.get($li[0], 'passbolt.model.Permission');
    domEvents.dispatch(this.element, {type: 'request_permission_delete', data: {permission: permission}});
  },

  /**
   * Observe when the user want to edit a permission type.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .js_share_rs_perm_type changed': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const data = ev.data;
    const $li = $(el).parents('li');
    const permission = DomData.get($li[0], 'passbolt.model.Permission');
    const type = data.value;
    domEvents.dispatch(this.element, {type: 'request_permission_edit', data: {permission: permission, type: type}});
  },

  /**
   * Observe when the user want to reset the filter
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} #js_perm_create_form_add_btn click': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    $(el).trigger('submit');
  }

});

export default PermissionsView;
