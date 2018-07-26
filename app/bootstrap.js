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
import 'app/config/routes.js';
import Ajax from 'app/net/ajax';
import cookies from 'browser-cookies/src/browser-cookies';
import AccountSetting from 'app/model/map/accountSetting';
import Bootstrap from 'passbolt-mad/bootstrap';
import Config from 'passbolt-mad/config/config';
import AppComponent from 'app/component/app';
import Role from 'app/model/map/role';
import User from 'app/model/map/user';
import notificationConfig from 'app/config/notification.json';
import appConfig from 'app/config/config.json';

const AppBootstrap = Bootstrap.extend('passbolt.Bootstrap', /* @static */ {

}, /**  @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(options) {
    this._super(options);
    this._csrfToken();
    Promise.all([this._loadSettings(), this._loadUser(), this._loadRoles()])
      .then(() => this._loadAccountSettings())
      .then(() => this._loadApp())
      .then(null, e => { throw e; });
  },

  /**
   * Retrieve the csrf token from the cookie
   */
  _csrfToken: function() {
    const csrfToken = cookies.get('csrfToken');
    Config.write('app.csrfToken', csrfToken);
  },

  /**
   * Load the application settings
   */
  _loadSettings: function() {
    const url = 'settings.json?contain[header]=0';
    const silentNotify = true;
    return Ajax.request({url: url, silentNotify: silentNotify})
      .then(data => {
        Config.load({server: data});
        Config.load(appConfig);
        Config.load(notificationConfig);
      });
  },

  /**
   * Load the user information
   */
  _loadUser: function() {
    return User.findOne({
      id: 'me'
    }).then(user => {
      User.setCurrent(user);
    });
  },

  /**
   * Load the list of roles
   */
  _loadRoles: function() {
    return Role.findAll()
      .then(roles => {
        Role.setCache(roles);
      });
  },

  /**
   * Load the account settings
   */
  _loadAccountSettings: function() {
    const plugins = Config.read('server.passbolt.plugins');
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
    const app = new AppComponent('#js_app_controller');
    app.start();
  }

});


export default AppBootstrap;
