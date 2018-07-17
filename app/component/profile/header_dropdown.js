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
import ButtonDropdown from 'passbolt-mad/component/button_dropdown';
import Config from 'passbolt-mad/config/config';
import MadBus from 'passbolt-mad/control/bus';
import User from 'app/model/map/user';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/profile/header_dropdown.stache!';

const HeaderProfileDropdownComponent = ButtonDropdown.extend('passbolt.component.ProfileDropdown', /** @static */ {

  defaults: {
    label: null,
    cssClasses: [],
    template: template,
    contentElement: '#js_app_profile_dropdown .dropdown-content',
    user: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeStart: function() {
    this.options.user = User.getCurrent();
    this._super();
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._super();
    const menu = this.options.menu;

    // profile
    const profileItem = new Action({
      id: uuid(),
      label: __('Profile'),
      action: () => this._goToUserProfile()
    });
    menu.insertItem(profileItem);

    // theme
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins && plugins.accountSettings) {
      const keysItem = new Action({
        id: uuid(),
        label: __('Theme'),
        action: () => this._goToTheme()
      });
      menu.insertItem(keysItem);
    }

    // Logout
    const logoutItem = new Action({
      id: uuid(),
      label: __('Logout'),
      action: () => this._logout()
    });
    menu.insertItem(logoutItem);
  },

  /**
   * Go to the user profile
   */
  _goToUserProfile: function() {
    const workspace = 'settings';
    const section = 'profile';
    MadBus.trigger('request_workspace', {workspace: workspace});
    MadBus.trigger('request_settings_section', {section: section});
    this.view.close();
  },

  /**
   * Go to the manage your keys screen
   */
  _goToTheme: function() {
    const workspace = 'settings';
    const section = 'theme';
    MadBus.trigger('request_workspace', {workspace: workspace});
    MadBus.trigger('request_settings_section', {section: section});
    this.view.close();
  },

  /**
   * Logout the user
   */
  _logout: function() {
    document.location.href = `${APP_URL}/auth/logout`;
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('user', this.options.user);
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user is updated
   */
  '{user} updated': function() {
    // If the component is active, refresh it.
    if (!this.state.is('disabled') && !this.state.is(null)) {
      this.refresh();
    }
  }

});

export default HeaderProfileDropdownComponent;
