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
import FilterView from 'app/view/component/navigation/filter';
import Form from 'passbolt-mad/form/form';
import getObject from 'can-util/js/get/get';
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
      onChangeTimeout: 200,
      modelReference: 'passbolt.model.Filter.keywords'
    }));
    keywordsTextbox.start();
    this.options.keywordsTextbox = keywordsTextbox;
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
      settingsWorkspaceFilter.setRule('keywords', keywords);
      const workspace = 'user';
      const options = {filterSettings: settingsWorkspaceFilter};
      MadBus.trigger('request_workspace', {workspace: workspace, options: options});
    } else {
      // Otherwise filter the current workspace.
      const workspaceFilter = this.options.workspace.constructor.getDefaultFilterSettings();
      workspaceFilter.setRule('keywords', keywords);
      MadBus.trigger('filter_workspace', {filter: workspaceFilter});
    }
  },

  /**
   * Update the search placeholder functions of the selected workspace.
   * @param workspaceName
   */
  _updateSearchPlaceholder: function(workspaceName) {
    let placeholder = '';

    switch (workspaceName) {
      case 'password_workspace':
        placeholder = __('search passwords');
        break;
      case 'settings_workspace':
        placeholder = __('search users');
        this.reset();
        break;
      case 'user_workspace':
        placeholder = __('search users');
        break;
    }

    $(this.options.keywordsTextbox.element).attr("placeholder", placeholder);
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
    this._updateSearchPlaceholder(workspace.options.name);
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
