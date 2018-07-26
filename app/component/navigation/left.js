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
import DomData from 'can-dom-data';
import MenuComponent from 'passbolt-mad/component/menu';
import route from 'can-route';
import String from 'can-string';

const NavigationLeft = MenuComponent.extend('passbolt.component.AppNavigationLeft', /** @static */ {

  defaults: {
    selected: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._initRouteListener();
    return this._super(el, options);
  },

  /**
   * Initialize the route listener
   * @private
   */
  _initRouteListener: function() {
    route.data.on('controller', () => {
      this._dispatchRoute();
    });
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initMenu();
    this._dispatchRoute();
    this._super();
  },

  /**
   * Init the menu.
   * @private
   */
  _initMenu: function() {
    // passwords
    const passwordsItem = new Action({
      id: 'js_app_nav_left_password_wsp_link',
      label: __('passwords'),
      cssClasses: ['password'],
      action: () => this._goToPasswordWorkspace()
    });
    this.insertItem(passwordsItem);

    // users
    const usersItem =  new Action({
      id:  'js_app_nav_left_user_wsp_link',
      label: __('users'),
      cssClasses: ['user'],
      action: () => this._goToUserWorkspace()
    });
    this.insertItem(usersItem);

    // help
    const helpItem = new Action({
      id: 'js_app_nav_left_help_link',
      label: __('help'),
      cssClasses: ['help'],
      action: () => this._goHelp()
    });
    this.insertItem(helpItem);
  },

  /**
   * Go to the password workspace.
   * @private
   */
  _goToPasswordWorkspace: function() {
    location.hash = '/passwords';
  },

  /**
   * Go to the user workspace
   */
  _goToUserWorkspace: function() {
    location.hash = '/users';
  },

  /**
   * Dispatch route
   * @private
   */
  _dispatchRoute: function() {
    const workspace = String.underscore(route.data.controller);
    if (this.options.selected != workspace) {
      const li = $(`li.${workspace}`);
      const itemClass = this.getItemClass();

      if (itemClass) {
        const data = DomData.get(li[0], itemClass.shortName);
        if (typeof data != 'undefined') {
          this.selectItem(data);
        }
      }
    }
  },

  /**
   * Go to the passbolt help
   * @private
   */
  _goHelp: function() {
    const helpWindow = window.open();
    helpWindow.opener = null;
    helpWindow.location = 'https://help.passbolt.com';
  }

});

export default NavigationLeft;
