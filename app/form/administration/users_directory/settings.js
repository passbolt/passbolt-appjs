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
 * @since         2.5.0
 */
import FeedbackComponent from 'passbolt-mad/form/feedback';
import Form from 'passbolt-mad/form/form';
import RadioComponent from 'passbolt-mad/form/element/radio';
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import ToggleButtonComponent from 'passbolt-mad/form/element/toggle_button';
import User from 'app/model/map/user';

import template from 'app/view/template/form/administration/users_directory/settings.stache!';

const UsersDirectorySettingsForm = Form.extend('passbolt.form.administration.users_directory.Settings', /** @static */ {

  defaults: {
    template: template,
    silentLoading: false,
    loadedOnStart: false,
    state: {
      hidden: true
    },
    edit: false
  }

}, /** @prototype */ {

  /**
   * Load and start the form.
   * @param {UsersDirectorySettings} usersDirectorySettings
   */
  loadAndStart: function(usersDirectorySettings) {
    this.options.usersDirectorySettings = usersDirectorySettings;
    this.start();
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initForm(this.options.usersDirectorySettings);
    this._initEditForm();
    this.state.loaded = true;
    this.state.hidden = false;
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
  _initForm: function(usersDirectorySettings) {
    this._initFormGeneralSwitch(usersDirectorySettings);
    this._initFormCredantialsSection();
    this._initFormDirectorySection();
    this._initFormSynchronisationSection();
    this.load({'UsersDirectorySettings': usersDirectorySettings});
  },

  /**
   * Init section
   * @param {UsersDirectorySettings} usersDirectorySettings
   * @private
   */
  _initFormGeneralSwitch: function(usersDirectorySettings) {
    const enabled = usersDirectorySettings.isEnabled();
    this.addElement(
      new ToggleButtonComponent('#js-ldap-toggle-button', {
        modelReference: 'UsersDirectorySettings.enabled',
        label: null,
        state: {disabled: true},
        validate: false,
        value: enabled
      }).start()
    );
    if (enabled) {
      $('.ldap-settings').addClass('enabled');
    } else {
      $('.ldap-settings').removeClass('enabled');
    }
  },

  /**
   * Init section
   * @param {UsersDirectorySettings} usersDirectorySettings
   * @private
   */
  _initFormCredantialsSection: function() {
    this.addElement(
      new RadioComponent('#js-directory-type-radio', {
        modelReference: 'UsersDirectorySettings.directory',
        state: {disabled: true},
        availableValues: {
          'ad': __('Active Directory'),
          'ldap': ('Open Ldap')
        },
        value: 'ad'
      }).start()
    );

    this.addElement(
      new TextboxComponent('#js-domain-input', {
        modelReference: 'UsersDirectorySettings.domain',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-domain-input-feedback', {}).start()
    );

    this.addElement(
      new DropdownComponent('#js-connection-protocol-input', {
        modelReference: 'UsersDirectorySettings.protocol',
        state: {disabled: true},
        availableValues: {
          'ldap': 'ldap://',
          'ldap_ssl': 'ldaps:// (ssl)',
          'ldap_tls': 'ldaps:// (tls)'
        },
        value: 'ldap_ssl',
        emptyValue: false
      }).start()
    );

    this.addElement(
      new TextboxComponent('#js-host-input', {
        modelReference: 'UsersDirectorySettings.host',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-host-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-port-input', {
        modelReference: 'UsersDirectorySettings.port',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-port-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-username-input', {
        modelReference: 'UsersDirectorySettings.username',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-username-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-password-input', {
        modelReference: 'UsersDirectorySettings.password',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-password-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-base-dn-input', {
        modelReference: 'UsersDirectorySettings.base_dn',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-base-dn-input-feedback', {}).start()
    );
  },

  /**
   * Init section
   * @param {UsersDirectorySettings} usersDirectorySettings
   * @private
   */
  _initFormDirectorySection: function() {
    this.addElement(
      new TextboxComponent('#js-group-path-input', {
        modelReference: 'UsersDirectorySettings.group_path',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-group-path-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-user-path-input', {
        modelReference: 'UsersDirectorySettings.user_path',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-user-path-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-group-object-class-input', {
        modelReference: 'UsersDirectorySettings.group_object_class',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-group-object-class-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-user-object-class-input', {
        modelReference: 'UsersDirectorySettings.user_object_class',
        state: {disabled: true}
      }).start(),
      new FeedbackComponent('#js-user-object-class-input-feedback', {}).start()
    );

    this.addElement(
      new DropdownComponent('#js-default-admin-select', {
        modelReference: 'UsersDirectorySettings.default_admin',
        state: {disabled: true},
        availableValues: []
      }).start(),
      new FeedbackComponent('#js-default-admin-select-feedback', {}).start()
    );

    this.addElement(
      new DropdownComponent('#js-default-group-admin-select', {
        modelReference: 'UsersDirectorySettings.default_group_admin',
        state: {disabled: true},
        availableValues: []
      }).start(),
      new FeedbackComponent('#js-default-group-admin-select-feedback', {}).start()
    );
  },

  /**
   * Init section
   * @param {UsersDirectorySettings} usersDirectorySettings
   * @private
   */
  _initFormSynchronisationSection: function() {
    this.addElement(
      new ToggleButtonComponent('#js-sync-create-users-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_create_users',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-delete-users-toggle-button', {
        label: __('Delete users'),
        modelReference: 'UsersDirectorySettings.sync_delete_users',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-create-groups-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_create_groups',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-delete-groups-toggle-button', {
        label: __('Delete users'),
        modelReference: 'UsersDirectorySettings.sync_delete_groups',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-update-groups-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_update_groups',
        state: {disabled: true},
        value: true
      }).start()
    );
  },

  /**
   * Init the edit form.
   */
  _initEditForm: function() {
    const edit = this.options.edit;
    if (!edit) {
      return;
    }

    const findOptions = {
      contain: {profile: 1},
      filter: {'is-admin': 1}
    };
    return User.findAll(findOptions)
      .then(users => {
        const availableAdmins = users.reduce((carry, user) => {
          carry[user.id] = `${user.profile.fullName()} (${user.username})`;
          return carry;
        }, {});

        this.elements['js-default-admin-select'].setAvailableValues(availableAdmins);
        this.elements['js-default-group-admin-select'].setAvailableValues(availableAdmins);
        for (const i in this.elements) {
          this.elements[i].state.disabled = false;
        }
      });
  },

  /**
   * Listen when the user enable the users directory.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} #js-ldap-toggle-button changed': function(el, ev) {
    if (!this.options.edit) { return; }
    const enabled = ev.data.value;
    if (enabled) {
      $('.ldap-settings').addClass('enabled');
    } else {
      $('.ldap-settings').removeClass('enabled');
    }
  }

});

export default UsersDirectorySettingsForm;
