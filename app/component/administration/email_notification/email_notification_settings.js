/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.10.0
 */
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MenuComponent from 'passbolt-mad/component/menu';
import EmailNotificationSettingsMap from 'app/model/map/email_notification_settings';
import EmailNotificationsSettingsForm from 'app/form/administration/email_notification/settings';
import PrimaryMenu from 'app/component/administration/email_notification/primary_menu';
import route from 'can-route';
import template from 'app/view/template/component/administration/email_notification/settings.stache!';
import templateItemBreadcrumb from 'app/view/template/component/breadcrumb/breadcrumb_item.stache!';

const EmailNotificationSettingsComponent = Component.extend('passbolt.component.administration.email_notification.EmailNotificationSettings', /** @static */ {

  defaults: {
    template: template,
    silentLoading: false,
    settingsOverriden: false,
    fileConfigExists: false
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
      action: () => this._goToSection('emailNotification')
    });
    items.push(administrationAction);
    const emailNotificationSettingsAction = new Action({
      label: __('Email Notification Settings'),
      action: () => this._goToSection('emailNotification')
    });
    items.push(emailNotificationSettingsAction);
    breadcrumb.load(items);
  },

  /**
   * Init the form
   * @private
   */
  _initForm: function() {
    this.form = new EmailNotificationsSettingsForm('#js-email-notification-settings-form');
    this.addLoadedDependency(this.form);
    this.form.start();

    if (!this.emailNotificationSettings) {
      return EmailNotificationSettingsMap.findOne()
        .then(settings => {
          this.emailNotificationSettings = settings;
          this.form.loadForm(this.emailNotificationSettings);
          this._showWarning();
        });
    } else {
      this.form.loadForm(this.emailNotificationSettings);
      this._showWarning();
    }
  },

  /**
   * Show configuration warning.
   * @private
   */
  _showWarning: function() {
    const settings = this.emailNotificationSettings;

    if (EmailNotificationSettingsMap.fileConfigExists(settings)) {
      // show the file config exists banner
      document.getElementById('email-notification-fileconfig-exists-banner').classList.remove('hidden');
      if (EmailNotificationSettingsMap.settingsOverridenByfile(settings)) {
        document.getElementById('email-notification-fileconfig-exists-banner').classList.add('hidden');
        // show the settings overridden banner
        document.getElementById('email-notification-setting-overridden-banner').classList.remove('hidden');
      }
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
  '#js-email-notification-settings-form changed': function() {
    if (!this.options.settingsOverriden) {
      this.primaryMenu.saveButton.state.disabled = false;
    }
  },

  /**
   * Listen when the user want to save the changes.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-email-notification-settings-save-button click': function() {
    if (this.form.validate() && !this.options.settingsOverriden) {
      this.state.loaded = false;
      const data = this.form.getData();
      this.emailNotificationSettings.assign(data.EmailNotificationSettings);
      this.emailNotificationSettings.save()
        .then(settingsUpdated => {
          this.emailNotificationSettings = settingsUpdated;
          this.refresh();
        })
        // Something went wrong
        .catch(() => {
          this.emailNotificationSettings = null;
          this.refresh();
        });
    }
  }
});

export default EmailNotificationSettingsComponent;
