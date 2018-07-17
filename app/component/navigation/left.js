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
import MadBus from 'passbolt-mad/control/bus';
import MenuComponent from 'passbolt-mad/component/menu';

const NavigationLeft = MenuComponent.extend('passbolt.component.AppNavigationLeft', /** @static */ {

  defaults: {
    selected: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
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

  // Go to the password workspace
  _goToPasswordWorkspace: function() {
    const workspace = 'password';
    this.options.selected = workspace;
    MadBus.trigger('request_workspace', {workspace: workspace});
  },

  // Go to the user workspace
  _goToUserWorkspace: function() {
    const workspace = 'user';
    this.options.selected = workspace;
    MadBus.trigger('request_workspace', {workspace: workspace});
  },

  // Go to the passbolt help
  _goHelp: function() {
    const helpWindow = window.open();
    helpWindow.opener = null;
    helpWindow.location = 'https://help.passbolt.com';
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user wants to switch to another workspace
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_workspace': function(el, ev) {
    const workspace = ev.data.workspace;
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
  }

});

export default NavigationLeft;
