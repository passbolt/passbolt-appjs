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
//import jsSHA from 'sha1';
import XRegExp from 'xregexp/xregexp-all';
import Component from 'passbolt-mad/component/component';
import moment from 'moment/moment';
import 'moment-timezone/builds/moment-timezone-with-data';

var Common = Component.extend('passbolt.Common', /** @static */ {
	/**
	 * Generates a predictable uuid from a string.
	 * uuid is sha1 based.
	 * @param seed
	 * @returns {String}
	 */
	uuid: function(seed) {
		// Create SHA hash from seed.
		var shaObj = new jsSHA("SHA-1", "TEXT");
		shaObj.update(seed);
		var hashStr = shaObj.getHash("HEX").substring(0, 32);
		// Build a uuid based on the md5
		var search = XRegExp('^(?<first>.{8})(?<second>.{4})(?<third>.{1})(?<fourth>.{3})(?<fifth>.{1})(?<sixth>.{3})(?<seventh>.{12}$)');
		var replace = XRegExp('${first}-${second}-3${fourth}-a${sixth}-${seventh}');
		// Replace regexp by corresponding mask, and remove / character at each side of the result.
		var uuid = XRegExp.replace(hashStr, search, replace).replace(/\//g, '');
		return uuid;
	},

	/**
	 * Convert a datetime string into a js Date object.
	 * @param dateTime
	 * @returns {Date}
	 */
	datetimeToJSDate: function(dateTime) {
		var dateTime = dateTime.split(" ");
		var date = dateTime[0];
		var time = dateTime[1];
		var dateArr = date.split('-');
		var timeArr = time.split(':');
		var dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], timeArr[0], timeArr[1], timeArr[2]);
		return dateObj;
	},

	/**
	 * Convert a datetime string into a time ago value. (using moment.js).
	 *
	 * @param dateTime
	 * @returns {*}
	 */
	datetimeGetTimeAgo: function(dateTime) {
		var serverTimezone = mad.Config.read('server.app.server_timezone');
		var timeAgo = moment.tz(dateTime, serverTimezone).fromNow();
		return timeAgo;
	}

}, {

});

export default Common;
