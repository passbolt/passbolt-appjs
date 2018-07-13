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
import domEvents from 'can-dom-events';
import SecondarySidebarSectionView from 'app/view/component/workspace/secondary_sidebar_section';

var PermissionsView = SecondarySidebarSectionView.extend('passbolt.view.component.permission.Permissions', /** @static */ {

}, /** @prototype */ {

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user clicks on the edit button
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{element} a#js_edit_permissions_button click': function (el, ev) {
		if (this.getController().getViewData('administrable') !== false) {
			domEvents.dispatch(this.element, {type: 'request_resource_permissions_edit'});
		}
	}
});

export default PermissionsView;
