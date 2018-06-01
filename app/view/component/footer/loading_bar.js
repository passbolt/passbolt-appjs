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

var LoadingBarView = View.extend('passbolt.view.component.footer.LoadingBar', /** @static */ {

}, /** @prototype */ {

	/**
	 * Update the loading bar.
	 * @param size
	 * @param animate
	 * @param callback
	 */
	update: function(size, animate, callback) {
		animate = typeof(animate) != 'undefined' ? animate : true;
		callback = callback || null;
		var percent = size + '%';

		if (animate) {
			$('.progress-bar span', this.element).animate({width:percent}, callback);
		} else {
			$('.progress-bar span', this.element).css('width', percent);
			if (callback) {
				callback();
			}
		}
	}
});

export default LoadingBarView;
