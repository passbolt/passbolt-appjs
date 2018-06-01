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
import GridView from 'passbolt-mad/view/component/grid';

var PasswordGridView = GridView.extend('passbolt.view.component.password.Grid', /** @static */ {

}, /** @prototype */ {

	/**
	 * Click on a password element.
	 * @event password_clicked
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @return {bool}
	 */
	'tbody tr td.password a click': function (el, ev) {
		ev.stopPropagation();
		ev.preventDefault();
		var data = null,
			$tr = $(el).parents('tr'),
			itemClass = this.getController().getItemClass();

		if (itemClass) {
			data = DomData.get.call($tr[0], itemClass.shortName);
		} else {
			data = $tr[0].id;
		}

		$(this.element).trigger('password_clicked', [data, ev]);
	},

	/**
	 * Right click has been detected. (contextual menu).
	 * we just stop the event here, as we do not want to base our contextual menu on this event, but on the mouse down event instead.
	 * @event item_right_selected
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @return {bool}
	 */
	'tbody tr contextmenu': function (el, ev) {
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	},

	/**
	 * Mousedown event.
	 * We use this event to display the contextual menu
	 * instead of the event "contextmenu" which is based on the mouseup.
	 * This gives a smoother feeling.
	 * @param el
	 * @param ev
	 * @returns {boolean}
	 */
	'tbody tr mousedown': function (el, ev) {
		ev.stopPropagation();
		ev.preventDefault();

		if (ev.which == 3) {
			var data = null;
			var itemClass = this.getController().getItemClass();

			if (itemClass) {
				data = DomData.get.call(el, itemClass.shortName);
			} else {
				data = el.id;
			}

			$(this.element).trigger('item_right_selected', [data, ev]);
		}

		return false;
	}

});

export default PasswordGridView;
