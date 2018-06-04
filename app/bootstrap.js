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
import moment from 'moment/moment';
import 'moment-timezone/builds/moment-timezone-with-data';
import AccountSetting from 'app/model/map/accountSetting';
import baseUrl from 'can-util/js/base-url/base-url';
import Bootstrap from 'passbolt-mad/bootstrap';
import Config from 'passbolt-mad/config/config';
import AppComponent from 'app/component/app';
import Common from 'app/util/common';
import Role from 'app/model/map/role';
import User from 'app/model/map/user';

var AppBootstrap = Bootstrap.extend('passbolt.Bootstrap', /* @static */ {

}, /**  @prototype */ {

	/**
	 * @inheritdoc
	 */
	init: function (options) {
		// Load mad bootstrap.
		this._super(options);

		Promise.all([this._loadUser(), this._loadRoles(), this._loadAccountSettings()])
			.then(this._loadApp)
			.then(null, (e) => {throw e;} );
	},

	/**
	 * Load the user information
	 */
	_loadUser: function() {
		return User.findOne({
			id: 'me'
		}).then(function(user) {
			User.setCurrent(user);
		});
	},

	/**
	 * Load the list of roles
	 */
	_loadRoles: function() {
		return Role.findAll()
		.then(function(roles) {
			Role.setCache(roles);
		});
	},

	/**
	 * Load the account settings
	 */
	_loadAccountSettings: function() {
		var plugins = Config.read('server.passbolt.plugins');
		if (plugins && plugins.accountSettings) {
			return AccountSetting.findAll()
                .then(accountSettings => {
                    AccountSetting.saveInConfig(accountSettings);
                });
		}

		return null;
	},

    /**
     * Load the application
     */
	_loadApp: function() {
		var app = new AppComponent('#js_app_controller');
		app.start();
    }

});


export default AppBootstrap;
