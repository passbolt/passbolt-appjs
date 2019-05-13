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
import EmailNotificationSettingsMap from 'app/model/map/email_notification_settings';
import Form from 'passbolt-mad/form/form';
import ToggleButtonComponent from 'passbolt-mad/form/element/toggle_button';
import template from 'app/view/template/form/administration/email_notification/settings.stache!';

const EmailNotificationsSettingsForm = Form.extend('passbolt.form.administration.email_notification.Settings', /** @static */ {

  defaults: {
    template: template,
    silentLoading: false,
    loadedOnStart: false
  }
}, /** @prototype */ {

  /**
   * Load and start the form.
   * @param {EmailNotificationSettingsMap} emailNotificationSettings
   */
  loadForm: function(emailNotificationSettings) {
    this.options.emailNotificationSettings = emailNotificationSettings;
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
   * Init the form.
   */
  _initForm: function() {
    // Send controls
    this._initFormPasswordSection();
    this._initFormRegistrationSection();
    this._initFormCommentSection();
    this._initFormGroupSection();
    this._initFormGroupManagerSection();

    // Show controls
    this._initFormShowSection();
  },

  /**
   * Init the Password section.
   * @private
   */
  _initFormPasswordSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-send-password-create-toggle-button', {
        label: __("When you create a password"),
        modelReference: 'EmailNotificationSettings.send_password_create',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-password-update-toggle-button', {
        label: __("When a password is updated"),
        modelReference: 'EmailNotificationSettings.send_password_update',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-password-delete-toggle-button', {
        label: __("When a password is deleted"),
        modelReference: 'EmailNotificationSettings.send_password_delete',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-password-share-toggle-button', {
        label: __("When a password is shared with you"),
        modelReference: 'EmailNotificationSettings.send_password_share',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Init the Registration and Recovery section
   */
  _initFormRegistrationSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-send-user-create-toggle-button', {
        label: __("When you are invited to passbolt"),
        modelReference: 'EmailNotificationSettings.send_user_create',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-user-recover-toggle-button', {
        label: __("When you try to recover an account"),
        modelReference: 'EmailNotificationSettings.send_user_recover',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Init the Comment section
   */
  _initFormCommentSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-send-comment-add-toggle-button', {
        label: __("When somebody posts a comment"),
        modelReference: 'EmailNotificationSettings.send_comment_add',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Init the Group section
   */
  _initFormGroupSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-send-group-delete-toggle-button', {
        label: __("When a group you belong to is deleted"),
        modelReference: 'EmailNotificationSettings.send_group_delete',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-group-user-add-toggle-button', {
        label: __("When you are added to a group"),
        modelReference: 'EmailNotificationSettings.send_group_user_add',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-group-user-delete-toggle-button', {
        label: __("When you are removed from a group"),
        modelReference: 'EmailNotificationSettings.send_group_user_delete',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-send-group-user-update-toggle-button', {
        label: __("When your permission changes in a group"),
        modelReference: 'EmailNotificationSettings.send_group_user_delete',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Init the Group Manager section
   */
  _initFormGroupManagerSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-send-group-manager-update-toggle-button', {
        label: __("When members change in a group you manage"),
        modelReference: 'EmailNotificationSettings.send_group_manager_update',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Init the Content Visibility section
   */
  _initFormShowSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-show-username-toggle-button', {
        label: __("Username"),
        modelReference: 'EmailNotificationSettings.show_username',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-show-uri-toggle-button', {
        label: __("URI"),
        modelReference: 'EmailNotificationSettings.show_uri',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-show-secret-toggle-button', {
        label: __("Encrypted secret"),
        modelReference: 'EmailNotificationSettings.show_secret',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-show-description-toggle-button', {
        label: __("Description"),
        modelReference: 'EmailNotificationSettings.show_description',
        state: {disabled: true}
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-show-comment-toggle-button', {
        label: __("Comment content"),
        modelReference: 'EmailNotificationSettings.show_comment',
        state: {disabled: true}
      }).start()
    );
  },

  /**
   * Enable the form
   */
  _enableForm: function() {
    const emailNotificationSettings = this.options.emailNotificationSettings;
    this.load({'EmailNotificationSettings': emailNotificationSettings});

    // check for dual configuration and don't enable the form if it exists.
    if (!EmailNotificationSettingsMap.settingsOverridenByfile(emailNotificationSettings)) {
      for (const i in this.elements) {
        this.elements[i].state.disabled = false;
      }
    }

    this.state.loaded = true;
  },
});

export default EmailNotificationsSettingsForm;
