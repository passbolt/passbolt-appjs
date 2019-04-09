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
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import RadioComponent from 'passbolt-mad/form/element/radio';
import domEvents from 'can-dom-events';
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import template from 'app/view/template/form/administration/users_directory/settings.stache!';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import ToggleButtonComponent from 'passbolt-mad/form/element/toggle_button';
import 'chosen-js/chosen.jquery';

const UsersDirectorySettingsForm = Form.extend('passbolt.form.administration.users_directory.Settings', /** @static */ {

  defaults: {
    template: template,
    silentLoading: false,
    loadedOnStart: false,
    defaultAdmin: null,
    defaultGroupAdmin: null,
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this.usersDirectorySettings = null;
    this.users = null;
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initForm(this.usersDirectorySettings);
    this._super();
  },

  /**
   * Check if the form is enabled.
   * @return {boolean|*}
   */
  isEnabled: function() {
    return this.enabled;
  },

  /**
   * Init the form.
   */
  _initForm: function() {
    this._initFormGeneralSwitch();
    this._initFormCredantialsSection();
    this._initFormDirectorySection();
    this._initFormSynchronisationSection();
  },

  /**
   * Load the form
   * @param {UsersDirectorySettings} usersDirectorySettings
   * @param {Users.List} users The list of users.
   */
  loadForm: function(usersDirectorySettings, users) {
    this.usersDirectorySettings = usersDirectorySettings;
    this.users = users;
    this.load({'UsersDirectorySettings': this.usersDirectorySettings});
    this._initGeneralSwitch();
    this._enableFormFields();
    this._initChoosenFields();
    this.state.loaded = true;
    this.enabled = usersDirectorySettings.isEnabled();
  },

  /**
   * Init the general switch toggle button.
   */
  _initGeneralSwitch: function() {
    if (this.usersDirectorySettings.isEnabled()) {
      $('.ldap-settings').addClass('enabled');
      this.generalToggleButton.setValue(true);
    } else {
      $('.ldap-settings').removeClass('enabled');
      this.generalToggleButton.setValue(false);
    }
  },

  /**
   * Enable all the form fields.
   */
  _enableFormFields: function() {
    for (const i in this.elements) {
      this.elements[i].state.disabled = false;
    }
  },

  /**
   * After the form is loaded
   */
  _initChoosenFields: function() {
    const $connectionChosenField = $('#js-connection-connection-type-input');
    const $adminChosenField = $('#js-default-user-select');
    const $groupAdminChosenField = $('#js-default-group-admin-user-select');

    $connectionChosenField.chosen({width: '100%', disable_search: true}).change(() => {
      const value = $connectionChosenField.val();
      domEvents.dispatch($connectionChosenField[0], {type: 'changed', data: {value: value}});
    });

    const admins = this.users.filter(user => user.role.name == 'admin').reduce((carry, user) => {
      carry[user.id] = `${user.profile.fullName()} (${user.username})`;
      return carry;
    }, {});
    this.defaultUserDropdown.setAvailableValues(admins);
    const defaultAdmin = (this.usersDirectorySettings.default_user ? this.usersDirectorySettings.default_user : this.options.defaultAdmin);
    this.defaultUserDropdown.setValue(defaultAdmin);
    $adminChosenField.chosen({width: '80%'}).change(() => {
      const value = $adminChosenField.val();
      domEvents.dispatch($adminChosenField[0], {type: 'changed', data: {value: value}});
    });
    $adminChosenField.val(defaultAdmin).trigger('chosen:updated');

    const users = this.users.reduce((carry, user) => {
      carry[user.id] = `${user.profile.fullName()} (${user.username})`;
      return carry;
    }, {});
    this.defaultGroupAdminUserDropdown.setAvailableValues(users);
    const defaultGroupAdmin = (this.usersDirectorySettings.default_group_admin_user ? this.usersDirectorySettings.default_group_admin_user : this.options.defaultGroupAdmin);
    this.defaultGroupAdminUserDropdown.setValue(defaultGroupAdmin); // @dirty, the dropdown refresh function removes the value of the element
    $groupAdminChosenField.chosen({width: '80%'}).change(() => {
      const value = $groupAdminChosenField.val();
      domEvents.dispatch($groupAdminChosenField[0], {type: 'changed', data: {value: value}});
    });
    $groupAdminChosenField.val(defaultGroupAdmin).trigger('chosen:updated');
  },

  /**
   * Init section
   * @private
   */
  _initFormGeneralSwitch: function() {
    this.generalToggleButton = this.addElement(
      new ToggleButtonComponent('#js-ldap-toggle-button', {
        modelReference: 'UsersDirectorySettings.enabled',
        label: null,
        state: {disabled: true},
        validate: false
      }).start()
    );
  },

  /**
   * Init section
   * @private
   */
  _initFormCredantialsSection: function() {
    this.directoryTypeRadio = this.addElement(
      new RadioComponent('#js-directory-type-radio', {
        modelReference: 'UsersDirectorySettings.directory_type',
        state: {disabled: true},
        availableValues: {
          'ad': __('Active Directory'),
          'openldap': ('Open Ldap')
        },
        value: 'ad'
      }).start()
    );

    this.addElement(
      new TextboxComponent('#js-domain-name-input', {
        modelReference: 'UsersDirectorySettings.domain_name',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-domain-name-input-feedback', {}).start()
    );

    this.addElement(
      new DropdownComponent('#js-connection-connection-type-input', {
        modelReference: 'UsersDirectorySettings.connection_type',
        state: {disabled: true},
        availableValues: {
          'plain': 'ldap://',
          'ssl': 'ldaps:// (ssl)',
          'tls': 'ldaps:// (tls)'
        },
        value: 'plain',
        emptyValue: false
      }).start()
    );

    this.addElement(
      new TextboxComponent('#js-server-input', {
        modelReference: 'UsersDirectorySettings.server',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-server-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-port-input', {
        modelReference: 'UsersDirectorySettings.port',
        state: {disabled: true},
        value: 389
      }).start(),
      new FeedbackComponent('#js-port-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-username-input', {
        modelReference: 'UsersDirectorySettings.username',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-username-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-password-input', {
        modelReference: 'UsersDirectorySettings.password',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-password-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-base-dn-input', {
        modelReference: 'UsersDirectorySettings.base_dn',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-base-dn-input-feedback', {}).start()
    );
  },

  /**
   * Init section
   * @private
   */
  _initFormDirectorySection: function() {
    this.addElement(
      new TextboxComponent('#js-group-path-input', {
        modelReference: 'UsersDirectorySettings.group_path',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-group-path-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-user-path-input', {
        modelReference: 'UsersDirectorySettings.user_path',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-user-path-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-group-object-class-input', {
        modelReference: 'UsersDirectorySettings.group_object_class',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-group-object-class-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-user-object-class-input', {
        modelReference: 'UsersDirectorySettings.user_object_class',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-user-object-class-input-feedback', {}).start()
    );
  },

  /**
   * Init section
   * @private
   */
  _initFormSynchronisationSection: function() {
    this.defaultUserDropdown = this.addElement(
      new DropdownComponent('#js-default-user-select', {
        modelReference: 'UsersDirectorySettings.default_user',
        state: {disabled: true},
        availableValues: this._admins
      }).start(),
      new FeedbackComponent('#js-default-user-select-feedback', {}).start()
    );

    this.defaultGroupAdminUserDropdown = this.addElement(
      new DropdownComponent('#js-default-group-admin-user-select', {
        modelReference: 'UsersDirectorySettings.default_group_admin_user',
        state: {disabled: true},
        availableValues: this._users
      }).start(),
      new FeedbackComponent('#js-default-group-admin-user-select-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-groups-parent-group-input', {
        modelReference: 'UsersDirectorySettings.groups_parent_group',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-groups-parent-group-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-users-parent-group-input', {
        modelReference: 'UsersDirectorySettings.users_parent_group',
        state: {disabled: true},
      }).start(),
      new FeedbackComponent('#js-users-parent-group-input-feedback', {}).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-enabled-users-only-toggle-button', {
        label: __('Only for AD. Synchronize only the users that are enabled'),
        modelReference: 'UsersDirectorySettings.enabled_users_only',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-users-create-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_users_create',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-users-delete-toggle-button', {
        label: __('Delete users'),
        modelReference: 'UsersDirectorySettings.sync_users_delete',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-groups-create-toggle-button', {
        label: __('Create groups'),
        modelReference: 'UsersDirectorySettings.sync_groups_create',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-groups-delete-toggle-button', {
        label: __('Delete groups'),
        modelReference: 'UsersDirectorySettings.sync_groups_delete',
        state: {disabled: true},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-groups-update-toggle-button', {
        label: __('Update groups'),
        modelReference: 'UsersDirectorySettings.sync_groups_update',
        state: {disabled: true},
        value: true
      }).start()
    );
  },

  showFieldsForDirectoryType: function(directoryType) {
    $('.section-directory-configuration .accordion-content div.input, .section-sync-options .accordion-content div.input')
      .each((i, elt) => {
        if (!$(elt).hasClass(directoryType)) {
          $(elt).hide();
        } else {
          $(elt).show();
        }
      });
  },

  /**
   * Listen when the user enable the users directory.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} #js-ldap-toggle-button changed': function(el, ev) {
    const enabled = ev.data.value;
    if (enabled) {
      $('.ldap-settings').addClass('enabled');
    } else {
      $('.ldap-settings').removeClass('enabled');
    }
    this.enabled = enabled;
  }

});

export default UsersDirectorySettingsForm;
