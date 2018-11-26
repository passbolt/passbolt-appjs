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
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import MenuComponent from 'passbolt-mad/component/menu';
import MfaSettings from 'app/model/map/mfa_settings';
import MfaSettingsForm from 'app/form/administration/mfa/settings';
import PrimaryMenu from 'app/component/administration/mfa/primary_menu';
import route from 'can-route';
import template from 'app/view/template/component/administration/mfa/settings.stache!';
import templateItemBreadcrumb from 'app/view/template/component/breadcrumb/breadcrumb_item.stache!';

const MfaSettingsAdmin = Component.extend('passbolt.component.administration.mfa.MfaSettings', /** @static */ {

  defaults: {
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const edit = route.data.action == 'mfa/edit';
    this._initPrimaryMenu(edit);
    this._initBreadcrumb(edit);
    this._initForm(edit);
  },

  /**
   * Init the primary menu
   * @param {bool} edit Start the component in edit mode
   * @private
   */
  _initPrimaryMenu: function(edit) {
    const selector = $('#js_wsp_primary_menu_wrapper');
    const menu = ComponentHelper.create(selector, 'inside_replace', PrimaryMenu, {
      edit: edit
    });
    menu.start();
  },

  /**
   * Init the breadcrumb
   * @param {bool} edit Start the component in edit mode
   */
  _initBreadcrumb: function(edit) {
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
    if (edit) {
      const mfaEditAction = new Action({
        label: __('edit'),
        action: () => this._goToSection('mfa/edit')
      });
      items.push(mfaEditAction);
    }
    breadcrumb.load(items);
  },

  /**
   * Init the form
   * @param {bool} edit Start the component in edit mode
   * @private
   */
  _initForm: function(edit) {
    this.form = new MfaSettingsForm('#js-mfa-settings-form', {edit: edit});
    this.addLoadedDependency(this.form);
    return MfaSettings.findOne()
      .then(mfaSettings => {
        this.mfaSettings = mfaSettings;
        this.form.loadAndStart(mfaSettings);
      });
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
   * Listen when the user want to edit the settings.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-mfa-settings-edit-button click': function() {
    route.data.update({controller: 'Administration', action: 'mfa/edit'});
    this.refresh();
  },

  /**
   * Listen when the user want to save the changes.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-mfa-settings-save-button click': function() {
    if (this.form.validate()) {
      const data = this.form.getData();
      this.mfaSettings.assign(data.MfaSettings);
      this.mfaSettings.save()
        .then(() => {
          route.data.update({controller: 'Administration', action: 'mfa'});
          this.refresh();
        });
    }
  },

  /**
   * Listen when the user want to cancel the edit.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-mfa-settings-cancel-button click': function() {
    route.data.update({controller: 'Administration', action: 'mfa'});
    this.refresh();
  }
});

export default MfaSettingsAdmin;
