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
import Button from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import FilterView from 'app/view/component/navigation/filter';
import Form from 'passbolt-mad/form/form';
import getObject from 'can-util/js/get/get';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import SettingsWorkspaceComponent from 'app/component/settings/workspace';
import Textbox from 'passbolt-mad/form/element/textbox';
import UserWorkspaceComponent from 'app/component/user/workspace';

import template from 'app/view/template/component/navigation/filter.stache!';

const FilterComponent = Component.extend('passbolt.component.navigation.Filter', /** @static */ {

  defaults: {
    template: template,
    viewClass: FilterView
  }

}, /** @prototype */ {

  /**
   * The currently enabled workspace
   * @type {mad.Component}
   */
  workspace: null,

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initForm();
    this.on();
  },

  /**
   * Reset the filter
   */
  reset: function() {
    this.options.keywordsTextbox.setValue('');
  },

  /**
   * Init the filter form.
   */
  _initForm: function() {
    const form = new Form('#js_app_filter_form', {});
    form.start();
    this.options.filterForm = form;

    const keywordsTextbox = form.addElement(new Textbox('#js_app_filter_keywords', {
      modelReference: 'passbolt.model.Filter.keywords'
    }));
    keywordsTextbox.start();
    this.options.keywordsTextbox = keywordsTextbox;

    const searchButton = new Button('#js_app_filter_button');
    searchButton.start();
    this.options.searchButton = searchButton;
  },

  /**
   * Update the filter
   * @param {string} keywords
   */
  _updateFilter: function(keywords) {
    /*
     * If the settings workspace is currently enabled.
     * Enable the user workspace first, and filter it.
     */
    if (this.options.workspace instanceof SettingsWorkspaceComponent) {
      const settingsWorkspaceFilter = UserWorkspaceComponent.getDefaultFilterSettings();
      settingsWorkspaceFilter.id = 'search';
      settingsWorkspaceFilter.type = 'search';
      settingsWorkspaceFilter.setRule('keywords', keywords);
      const workspace = 'user';
      const options = {filterSettings: settingsWorkspaceFilter};
      MadBus.trigger('request_workspace', {workspace: workspace, options: options});
    } else {
      // Otherwise filter the current workspace.
      const workspaceFilter = this.options.workspace.constructor.getDefaultFilterSettings();
      if (keywords != '') {
        workspaceFilter.id = 'search';
        workspaceFilter.type = 'search';
        workspaceFilter.setRule('keywords', keywords);
      }
      MadBus.trigger('filter_workspace', {filter: workspaceFilter});
    }
  },

  /**
   * Enable the component.
   */
  enable: function() {
    this.options.keywordsTextbox.state.disabled = false;
    this.options.searchButton.state.disabled = false;
  },

  /**
   * Disable the component.
   */
  disable: function() {
    this.options.keywordsTextbox.state.disabled = true;
    this.options.searchButton.state.disabled = true;
  },

  /**
   * Passwords workspace enabled handler.
   */
  _passwordsWorkspaceEnabled: function() {
    const placeholder = __('search passwords');
    $(this.options.keywordsTextbox.element).attr("placeholder", placeholder);
    this.enable();
  },

  /**
   * Users workspace enabled handler.
   */
  _usersWorkspaceEnabled: function() {
    const placeholder = __('search users');
    $(this.options.keywordsTextbox.element).attr("placeholder", placeholder);
    this.enable();
  },

  /**
   * Settings workspace enabled handler.
   */
  _settingsWorkspaceEnabled: function() {
    this.reset();
    const placeholder = __('search users');
    $(this.options.keywordsTextbox.element).attr("placeholder", placeholder);
    this.enable();
  },

  /**
   * Administration workspace enabled handler.
   */
  _administrationWorkspaceEnabled: function() {
    this.reset();
    const placeholder = '';
    $(this.options.keywordsTextbox.element).attr("placeholder", placeholder);
  },

  /**
   * Adapt the filter for a given workspace.
   * @param workspace
   */
  _workspaceEnabledHandler: function(workspace) {
    this.disable();
    switch (workspace.options.name) {
      case 'password_workspace':
        this._passwordsWorkspaceEnabled();
        break;
      case 'settings_workspace':
        this._settingsWorkspaceEnabled();
        break;
      case 'user_workspace':
        this._usersWorkspaceEnabled();
        break;
      case 'administration_workspace':
        this._administrationWorkspaceEnabled();
        break;
    }
  },

  /* ************************************************************** */
  /* LISTEN TO VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Listen when the user is updating the filter
   */
  '{keywordsTextbox.element} changed': function() {
    const formData = this.options.filterForm.getData();
    const keywords = getObject(formData, 'passbolt.model.Filter.keywords');
    this._updateFilter(keywords);
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user switched to another workspace
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} workspace_enabled': function(el, ev) {
    const workspace = ev.data.workspace;
    this.options.workspace = workspace;
    this._workspaceEnabledHandler(workspace);
  },

  /**
   * Listen to the browser filter
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    const keywords = filter.getRule('keywords');
    const formData =  this.options.filterForm.getData();
    const previousKeywords = getObject(formData, 'passbolt.model.Filter.keywords');
    if (keywords != previousKeywords) {
      this.options.keywordsTextbox.setValue(keywords);
    }
  }

});

export default FilterComponent;
