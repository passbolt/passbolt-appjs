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
import MenuComponent from 'passbolt-mad/component/menu';
import uuid from 'uuid/v4';

var NavigationRight = MenuComponent.extend('passbolt.component.AppNavigationRight', /** @static */ {

	defaults: {}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		// logout
		var item = new Action({
			id: uuid(),
			label: __('logout'),
			cssClasses: ['logout'],
			action: () => this._logout()
		});
		this.insertItem(item);
	},

	// Logout the user
	_logout: function() {
		document.location.href = APP_URL + '/auth/logout';
	}

});

export default NavigationRight;