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
import FeedbackComponent from 'passbolt-mad/form/feedback';
import Form from 'passbolt-mad/form/form';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import ToggleButtonComponent from 'passbolt-mad/form/element/toggle_button';

import template from 'app/view/template/form/administration/mfa/settings.stache!';

const MfaSettingsForm = Form.extend('passbolt.form.administration.mfa.Settings', /** @static */ {

  defaults: {
    template: template,
    silentLoading: false,
    loadedOnStart: false
  }

}, /** @prototype */ {

  /**
   * Load and start the form.
   * @param {MfaSettings} mfaSettings
   */
  loadForm: function(mfaSettings) {
    this.options.mfaSettings = mfaSettings;
    this._enableForm();
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initForm();
    this._super();
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('edit', this.options.edit);
  },

  /**
   * Init the form.
   */
  _initForm: function() {
    this._initFormTotpSection();
    this._initFormYubikeySection();
    this._initFormDuoSection();
  },

  /**
   * Init the Totp form section.
   * @private
   */
  _initFormTotpSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-totp-provider-toggle-button', {
        label: null,
        modelReference: 'MfaSettings.totp_provider',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Init the Yubikey form section.
   * @private
   */
  _initFormYubikeySection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-yubikey-provider-toggle-button', {
        label: null,
        modelReference: 'MfaSettings.yubikey_provider',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new TextboxComponent('#js-yubikey-client-id-input', {
        modelReference: 'MfaSettings.yubikey_client_id',
        state: {disabled: true},
        validate: formData => formData.MfaSettings.yubikey_provider
      }).start(),
      new FeedbackComponent('#js-yubikey-client-id-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-yubikey-secret-key-input', {
        modelReference: 'MfaSettings.yubikey_secret_key',
        state: {disabled: true},
        validate: formData => formData.MfaSettings.yubikey_provider
      }).start(),
      new FeedbackComponent('#js-yubikey-secret-key-input-feedback', {}).start()
    );
  },

  /**
   * Init the Duo form section.
   * @private
   */
  _initFormDuoSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-duo-provider-toggle-button', {
        label: null,
        modelReference: 'MfaSettings.duo_provider',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new TextboxComponent('#js-duo-host-name-input', {
        modelReference: 'MfaSettings.duo_host_name',
        state: {disabled: true},
        validate: formData => formData.MfaSettings.duo_provider
      }).start(),
      new FeedbackComponent('#js-duo-host-name-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-duo-integration-key-input', {
        modelReference: 'MfaSettings.duo_integration_key',
        state: {disabled: true},
        validate: formData => formData.MfaSettings.duo_provider
      }).start(),
      new FeedbackComponent('#js-duo-integration-key-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-duo-salt-input', {
        modelReference: 'MfaSettings.duo_salt',
        state: {disabled: true},
        validate: formData => formData.MfaSettings.duo_provider
      }).start(),
      new FeedbackComponent('#js-duo-salt-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-duo-secret-key-input', {
        modelReference: 'MfaSettings.duo_secret_key',
        state: {disabled: true},
        validate: formData => formData.MfaSettings.duo_provider
      }).start(),
      new FeedbackComponent('#js-duo-secret-key-input-feedback', {}).start()
    );
  },

  /**
   * Enable the form
   */
  _enableForm: function() {
    const mfaSettings = this.options.mfaSettings;
    this.load({'MfaSettings': mfaSettings});

    if (mfaSettings.totp_provider) {
      $('.provider-section.totp').addClass('enabled');
    } else {
      $('.provider-section.totp').removeClass('enabled');
    }

    if (mfaSettings.yubikey_provider) {
      $('.provider-section.yubikey').addClass('enabled');
    } else {
      $('.provider-section.yubikey').removeClass('enabled');
    }

    if (mfaSettings.duo_provider) {
      $('.provider-section.duo').addClass('enabled');
    } else {
      $('.provider-section.duo').removeClass('enabled');
    }

    for (const i in this.elements) {
      this.elements[i].state.disabled = false;
    }

    this.state.loaded = true;
  },

  /**
   * Listen when the user enable totp
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} #js-totp-provider-toggle-button changed': function(el, ev) {
    const enabled = ev.data.value;
    if (enabled) {
      $('.provider-section.totp').addClass('enabled');
    } else {
      $('.provider-section.totp').removeClass('enabled');
    }
  },

  /**
   * Listen when the user enable yubikey.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} #js-yubikey-provider-toggle-button changed': function(el, ev) {
    const enabled = ev.data.value;
    if (enabled) {
      $('.provider-section.yubikey').addClass('enabled');
    } else {
      $('.provider-section.yubikey').removeClass('enabled');
    }
  },

  /**
   * Listen when the user enable duo.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} #js-duo-provider-toggle-button changed': function(el, ev) {
    const enabled = ev.data.value;
    if (enabled) {
      $('.provider-section.duo').addClass('enabled');
    } else {
      $('.provider-section.duo').removeClass('enabled');
    }
  }
});

export default MfaSettingsForm;
