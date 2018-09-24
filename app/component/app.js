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
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import ContextualMenuComponent from 'passbolt-mad/component/contextual_menu';
import FilterComponent from 'app/component/navigation/filter';
import LoadingBarComponent from 'app/component/footer/loading_bar';
import MadBus from 'passbolt-mad/control/bus';
import NavigationLeftComponent from 'app/component/navigation/left';
import NotificationComponent from 'app/component/footer/notification';
import PasswordWorkspaceComponent from 'app/component/password/workspace';
import ProfileHeaderDropdownComponent from 'app/component/profile/header_dropdown';
import route from 'can-route';
import SessionCheck from 'app/model/session_check';
import SettingsWorkspaceComponent from 'app/component/settings/workspace';
import String from 'can-string';
import User from 'app/model/map/user';
import UserWorkspaceComponent from 'app/component/user/workspace';

import template from 'app/view/template/app.stache!';

const App = Component.extend('passbolt.component.App', /** @static */ {

  defaults: {
    template: template,
    loadedOnStart: false
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
   * Dispatch route.
   * @private
   */
  _dispatchRoute: function() {
    const controller = route.data.controller;
    const workspaceName = String.underscore(controller);
    this._enableWorkspace(workspaceName);
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this.setViewData('APP_URL', APP_URL);
    this._super();
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._firstLoad = true;
    this._workspace = null
    this._initFooter();
    this._initHeader();
    SessionCheck.instantiate();
    this._dispatchRoute();
    this._super();
  },

  /**
   * Observer when the component is loaded / loading
   * @param {boolean} loaded True if loaded, false otherwise
   */
  onLoadedChange: function(loaded) {
    if (loaded) {
      if (this._firstLoad) {
        this._firstLoad = false;
        $('html').removeClass('launching');
      }
      $('html').removeClass('loading').addClass('loaded');
    } else {
      $('html').removeClass('loaded').addClass('loading');
    }
    this._super(loaded);
  },

  /**
   * Init header
   */
  _initHeader: function() {
    const navigationLeftComponent = new NavigationLeftComponent('#js_app_navigation_left');
    navigationLeftComponent.start();

    const filterComponent = new FilterComponent('#js_app_filter');
    filterComponent.start();

    const profileHeaderDropdownComponent = new ProfileHeaderDropdownComponent('#js_app_profile_dropdown', {
      user: User.getCurrent()
    });
    profileHeaderDropdownComponent.start();
  },

  /**
   * Init footer
   */
  _initFooter: function() {
    const loadingBarComponent = new LoadingBarComponent('#js_app_loading_bar');
    loadingBarComponent.start();
    new NotificationComponent('#js_app_notificator');
  },

  /**
   * Initialize the target workspace.
   * @param {string} name The name of the workspace
   * @param {array} options The additional options to use during the workspace creation
   */
  _enableWorkspace: function(name, options) {
    this._destroyWorkspace()
      .then(() => this._initWorkspace(name, options));
  },

  /**
   * Get a workspace class by name
   * @param {string} name The target workspace name
   * @return {Component}
   */
  _getWorkspaceClassByName: function(name) {
    let WorkspaceClass = null;
    switch (name) {
      case 'password':
        WorkspaceClass = PasswordWorkspaceComponent;
        break;
      case 'settings':
        WorkspaceClass = SettingsWorkspaceComponent;
        break;
      case 'user':
        WorkspaceClass = UserWorkspaceComponent;
        break;
    }
    return WorkspaceClass;
  },

  /**
   * Destroy the previously instantiated workspace.
   * @param {string} name The name of the workspace
   * @param {array} options The additional options to use during the workspace creation
   */
  _destroyWorkspace: function() {
    // Destroy common adaptable area
    $('#js_wsp_primary_menu_wrapper').empty();
    $('#js_wsp_secondary_menu_wrapper').empty();
    $('.main-action-wrapper').empty();
    // Remove all the classes
    $('#container').removeClass();
    // Remove any HTMLElements relative to the previous workspace.
    $('#js_app_panel_main').empty();
    // Remove any existing contextual menu.
    if (ContextualMenuComponent._instance) {
      ContextualMenuComponent._instance.destroyAndRemove();
    }

    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!this._workspace || this._workspace.state.destroyed) {
          clearInterval(checkInterval);
          this._workspace = null;
          resolve();
        }
      }, 200);
    });
  },

  /**
   * Init workspace
   */
  _initWorkspace: function(name, options) {
    this.state.loaded = false;
    const workspaceOptions = {
      id: `js_passbolt_${name}_workspace_controller`,
      label: name
    };
    $.extend(workspaceOptions, options);
    const selector = $('#js_app_panel_main');
    const WorkspaceComponent = this._getWorkspaceClassByName(name);
    const workspace = ComponentHelper.create(selector, 'last', WorkspaceComponent, workspaceOptions);
    this._workspace = workspace;
    this.addLoadedDependency(workspace);
    workspace.start();

    $('#container').addClass(`page ${name}`);
    MadBus.trigger('workspace_enabled', {workspace: workspace});
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
    const workspaceName = ev.data.workspace;
    const options = ev.data.options || {};
    this._enableWorkspace(workspaceName, options);
  },

  /**
   * Remove all existing focus in the document.
   * This way we can set the focus somewhere else in another iframe.
   * @todo used by the plugin, move it in a plugin controller or something like this.
   */
  '{mad.bus.element} remove_all_focuses': function() {
    const $focused = $(':focus');
    $focused.blur();
  },

  /**
   * The p3 narrow external lib caught a window resize event and
   * set the appropriated classes to the body HTML Element.
   */
  '{window} p3_narrow_checked': function() {
    MadBus.trigger('passbolt.html_helper.window_resized');
  }

});

export default App;
