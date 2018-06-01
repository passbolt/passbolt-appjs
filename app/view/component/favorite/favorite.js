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
import View from 'passbolt-mad/view/view';

var FavoriteView = View.extend('passbolt.view.component.favorite.Favorite', /** @static */ {

}, /** @prototype */ {

	/**
	 * Mark as a favorite.
	 */
	favorite: function (el, ev) {
		$('i', this.element).removeClass('fav').addClass('unfav');
	},

	/**
	 * Unmark as a favorite.
	 */
	unfavorite: function (el, ev) {
		$('i', this.element).removeClass('unfav').addClass('fav');
	}

});

export default FavoriteView;