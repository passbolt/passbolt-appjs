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
import DefineMap from 'passbolt-mad/model/map/map';
import ImageStorage from 'app/model/map/image_storage';

var Profile = DefineMap.extend('passbolt.model.Profile', {
	id: 'string',
	first_name: 'string',
	last_name: 'string',
	avatar: ImageStorage,
	
	/**
	 * Return the user full name.
	 * @return {string}
	 */
	fullName: function() {
		return this.first_name + ' ' + this.last_name;
	},

	/**
	 * Get the avatar image path
	 * @param {string} version (optional) The version to get
	 * @return {string} The image path
	 */
	avatarPath: function(version) {
		if (typeof this.avatar != 'undefined' && this.avatar.url != undefined) {
			return this.avatar.imagePath(version);
		} else {
			return 'img/avatar/user.png';
		}
	}
});
DefineMap.setReference('Profile', Profile);

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 * @see https://github.com/passbolt/passbolt_api/src/Model/Table/PRofilesTable.php
 */
Profile.validationRules = {
	first_name: [
		{rule: 'required', message: __('A first name is required')},
		{rule: 'notEmpty', message: __('A first name is required')},
		{rule: 'utf8', message: __('First name should be a valid utf8 string.')},
		{rule: ['lengthBetween', 0, 255], message: __('The first name length should be maximum 255 characters.')}
	],
	last_name: [
		{rule: 'required', message: __('A last name is required')},
		{rule: 'notEmpty', message: __('A last name is required')},
		{rule: 'utf8', message: __('Last name should be a valid utf8 string.')},
		{rule: ['lengthBetween', 0, 255], message: __('The last name length should be maximum 255 characters.')}
	]
};

export default Profile;
