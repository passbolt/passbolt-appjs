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
import $ from 'jquery/dist/jquery.min.js';
import Action from 'passbolt-mad/model/map/action';
import UserEditAvatarForm from '../../form/user/edit_avatar';
import BreadcrumbComponent from './workspace_breadcrumb';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import Config from 'passbolt-mad/config/config';
import DialogComponent from 'passbolt-mad/component/dialog';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import KeysComponent from '../gpgkey/keys';
import MenuComponent from 'passbolt-mad/component/menu';
import PrimaryMenuComponent from './workspace_primary_menu';
import ProfileComponent from '../profile/profile';
import route from 'can-route';
import TabComponent from 'passbolt-mad/component/tab';
import ThemeComponent from './theme';
import MfaComponent from './mfa';
import User from '../../model/map/user';
import UserCreateForm from '../../form/user/create';
import uuid from 'uuid/v4';

import template from '../../view/template/component/settings/workspace.stache';

const SettingsWorkspaceComponent = Component.extend('passbolt.component.settings.Workspace', /** @static */ {

  defaults: {
    name: 'settings_workspace',
    template: template,
    sections: [
      'profile',
      'keys'
    ],
    // Override the silentLoading parameter.
    silentLoading: false
  }
}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this._initRouteListener();
  },

  /**
   * Initialize the route listener
   * @private
   */
  _initRouteListener: function() {
    // We have to proceed like following to execute the dispatch route in the scope of the instance, and be able to remove the listener when the component is destroyed.
    const executeFunc = () => this._dispatchRoute();
    route.data.on('action', executeFunc);
    this.state.on('destroyed', () => route.data.off('action', executeFunc));
  },

  /**
   * Dispatch route
   * @private
   */
  _dispatchRoute: function() {
    if (route.data.controller == 'Settings') {
      const section = route.data.action;
      this._enableSection(section);
    }
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initPrimaryMenu();
    this._initPrimarySidebar();
    this._initBreadcrumb();
    this._initTabs();
    this._dispatchRoute();
  },

  /**
   * Init the primary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   */
  _initPrimaryMenu: function() {
    const selector = $('#js_wsp_primary_menu_wrapper');
    const menu = ComponentHelper.create(selector, 'last', PrimaryMenuComponent, {});
    menu.start();
  },

  /**
   * Initialize the workspace breadcrumb
   */
  _initBreadcrumb: function() {
    const component = new BreadcrumbComponent('#js_wsp_settings_breadcrumb', {});
    component.start();
    component.load();
  },

  /**
   * Init the primary sidebar.
   */
  _initPrimarySidebar: function() {
    const menu = new MenuComponent('#js_wk_settings_menu', {});
    menu.start();
    this.options.primarySidebarMenu = menu;

    // My profile
    const profileItem = new Action({
      id: uuid(),
      name: 'profile',
      label: __('Profile'),
      action: () => this._goToSection('profile')
    });
    menu.insertItem(profileItem);

    // Theme
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins) {
      if (plugins.accountSettings) {
        const themeItem = new Action({
          id: uuid(),
          name: 'theme',
          label: __('Theme'),
          action: () => this._goToSection('theme')
        });
        menu.insertItem(themeItem);
      }
      if (plugins.multiFactorAuthentication) {
        const mfaItem = new Action({
          id: uuid(),
          name: 'mfa',
          label: __('Multi Factor Authentication'),
          action: () => this._goToSection('mfa')
        });
        menu.insertItem(mfaItem);
      }
    }

    // Keys
    const keysItem = new Action({
      id: uuid(),
      name: 'keys',
      label: __('Keys inspector'),
      action: () => this._goToSection('keys')
    });
    menu.insertItem(keysItem);
  },

  /**
   * Init the workspace tabs
   */
  _initTabs: function() {
    const tabs = new TabComponent('#js_wk_settings_main', {
      autoMenu: false // do not generate automatically the associated tab nav
    });
    tabs.start();
    this.tabs = tabs;

    // Profile tab
    tabs.addTab(ProfileComponent, {
      id: 'js_settings_profile_tab',
      label: 'profile',
      user: User.getCurrent()
    });

    // Keys tab
    tabs.addTab(KeysComponent, {
      id: 'js_settings_keys_tab',
      label: 'keys'
    });

    // Theme tab
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins) {
      if (plugins.accountSettings) {
        tabs.addTab(ThemeComponent, {
          id: 'js_settings_theme_tab',
          label: 'theme'
        });
      }
      if (plugins.multiFactorAuthentication) {
        tabs.addTab(MfaComponent, {
          id: 'js_settings_mfa_tab',
          label: 'mfa'
        });
      }
    }
  },

  /**
   * Go to a settings section
   * @private
   */
  _goToSection: function(section) {
    const controller = 'Settings';
    const action = section;
    route.data.update({controller: controller, action: action});
  },

  /**
   * Go to a settings section
   * @private
   */
  _enableSection: function(section) {
    const tabId = `js_settings_${section}_tab`;
    const menu = this.options.primarySidebarMenu;
    const menuItem = menu.options.items.filter({name: section}).pop();

    // Enable the tab
    this.tabs.enableTab(tabId);
    // @todo remove .tab-content display none rules from the css
    $('.tab-content', this.element).show();

    // Set class on top container.
    $('#container')
      .removeClass(this.options.sections.join(" "))
      .addClass(section);

    // Select corresponding section in the menu.
    menu.selectItem(menuItem);
  },

  /**
   * Open the user edit dialog.
   */
  openEditUserDialog: function() {
    const self = this;
    const user = User.getCurrent();
    const dialog = DialogComponent.instantiate({
      label: __('Edit profile'),
      cssClasses: ['edit-profile-dialog', 'dialog-wrapper']
    }).start();

    const form = dialog.add(UserCreateForm, {
      data: user,
      action: 'edit',
      callbacks: {
        submit: function(data) {
          user.assignDeep(data['User']);
          self._saveUser(user, form, dialog);
        }
      }
    });
    form.load(user);
  },

  /**
   * Save the user.
   * @param {User} user The target user
   * @param {Form} form The form object
   * @param {Dialog} dialog The dialog object
   */
  _saveUser: function(user, form, dialog) {
    user['__FILTER_CASE__'] = 'edit_profile';
    user.save()
      .then(() => {
        dialog.remove();
      }, v => {
        form.showErrors(JSON.parse(v.responseText)['body']);
      });
  },

  /**
   * Open the avatar edit dialog.
   */
  openEditAvatarDialog: function() {
    const user = User.getCurrent();
    const dialog = DialogComponent.instantiate({
      label: __('Edit Avatar')
    }).start();
    const form = dialog.add(UserEditAvatarForm, {
      data: user,
      callbacks: {
        submit: () => this._saveAvatar(user, dialog)
      }
    });
    form.load(user);
  },

  /**
   * Save the avatar.
   *
   * @param {User} user The target user
   * @param {Dialog} dialog The dialog object
   */
  _saveAvatar: function(user, dialog) {
    const $fileField = $('#js_field_avatar');
    user.saveAvatar($fileField[0].files[0]);
    dialog.remove();
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user requests a profile edition
   */
  '{mad.bus.element} request_profile_edition': function() {
    this.openEditUserDialog();
  },

  /**
   * Observe when the user requests an avatar edition
   */
  '{mad.bus.element} request_profile_avatar_edition': function() {
    this.openEditAvatarDialog();
  }

});
export default SettingsWorkspaceComponent;
