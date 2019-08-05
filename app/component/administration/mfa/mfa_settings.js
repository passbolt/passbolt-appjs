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
 * @since         2.6.0
 */
import $ from 'jquery';
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MenuComponent from 'passbolt-mad/component/menu';
import MfaSettings from '../../../model/map/mfa_settings';
import MfaSettingsForm from '../../../form/administration/mfa/settings';
import PrimaryMenu from './primary_menu';
import route from 'can-route';
import template from '../../../view/template/component/administration/mfa/settings.stache';
import templateItemBreadcrumb from '../../../view/template/component/breadcrumb/breadcrumb_item.stache';

const MfaSettingsAdmin = Component.extend('passbolt.component.administration.mfa.MfaSettings', /** @static */ {

  defaults: {
    template: template,
    silentLoading: false,
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initPrimaryMenu();
    this._initBreadcrumb();
    this._initForm();
  },

  /**
   * Init the primary menu
   * @private
   */
  _initPrimaryMenu: function() {
    const selector = $('#js_wsp_primary_menu_wrapper');
    const menu = ComponentHelper.create(selector, 'inside_replace', PrimaryMenu);
    menu.start();
    this.primaryMenu = menu;
  },

  /**
   * Init the breadcrumb
   */
  _initBreadcrumb: function() {
    const breadcrumbWrapperSelector = '#js_wsp_administration_breadcrumb';
    const options = {
      itemTemplate: templateItemBreadcrumb
    };
    const breadcrumb = ComponentHelper.create($(breadcrumbWrapperSelector), 'inside_replace', MenuComponent, options);
    breadcrumb.start();

    const items = [];
    const administrationAction = new Action({
      label: __('Administration'),
      action: () => this._goToSection('mfa')
    });
    items.push(administrationAction);
    const mfaAction = new Action({
      label: __('Multi factor authentication'),
      action: () => this._goToSection('mfa')
    });
    items.push(mfaAction);
    const mfaSettingsAction = new Action({
      label: __('Settings'),
      action: () => this._goToSection('mfa')
    });
    items.push(mfaSettingsAction);
    breadcrumb.load(items);
  },

  /**
   * Init the form
   * @private
   */
  _initForm: function() {
    this.form = new MfaSettingsForm('#js-mfa-settings-form');
    this.addLoadedDependency(this.form);
    this.form.start();
    if (!this.mfaSettings) {
      return MfaSettings.findOne()
        .then(mfaSettings => {
          this.mfaSettings = mfaSettings;
          this.form.loadForm(mfaSettings);
        });
    } else {
      this.form.loadForm(this.mfaSettings);
    }
  },

  /**
   * Go to a section
   * @private
   */
  _goToSection: function(section) {
    route.data.update({controller: 'Administration', action: section});
    this.refresh();
  },

  /**
   * Listen when the form is updated.
   * When the form is updated enable the save settings button
   */
  '#js-mfa-settings-form changed': function() {
    this.primaryMenu.saveButton.state.disabled = false;
  },

  /**
   * Listen when the user want to save the changes.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-mfa-settings-save-button click': function() {
    if (this.form.validate()) {
      this.state.loaded = false;
      const data = this.form.getData();
      this.mfaSettings.assign(data.MfaSettings);
      this.mfaSettings.save()
        .then(() => {
          this.state.loaded = true;
          this.refresh();
        });
    }
  }
});

export default MfaSettingsAdmin;
