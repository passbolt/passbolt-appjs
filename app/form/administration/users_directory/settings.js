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
import RadioComponent from 'passbolt-mad/form/element/radio';
import domEvents from 'can-dom-events';
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import ToggleButtonComponent from 'passbolt-mad/form/element/toggle_button';
import User from 'app/model/map/user';
import 'chosen-js/chosen.jquery';

import template from 'app/view/template/form/administration/users_directory/settings.stache!';
import { isFunction } from 'util';

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
    this._retrieveUsers()
      .then(() => this.start());
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initForm(this.options.usersDirectorySettings);
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
   * Retrieve passbolt users.
   */
  _retrieveUsers: function() {
    const findOptions = {
      contain: {profile: 1}
    };
    return User.findAll(findOptions)
      .then(users => {
        this._users = users.reduce((carry, user) => {
          carry[user.id] = `${user.profile.fullName()} (${user.username})`;
          return carry;
        }, {});
        this._admins = users.filter(user => user.role.name == 'admin').reduce((carry, user) => {
          carry[user.id] = `${user.profile.fullName()} (${user.username})`;
          return carry;
        }, {});
      });
  },

  /**
   * Init the form.
   */
  _initForm: function() {
    const settings = this.options.usersDirectorySettings;
    this._initFormGeneralSwitch();
    this._initFormCredantialsSection();
    this._initFormDirectorySection();
    this._initFormSynchronisationSection();
    this.load({'UsersDirectorySettings': settings});
    this._afterLoad();
  },

  /**
   * After the form is loaded
   */
  _afterLoad: function() {
    $('#js-connection-connection-type-input').chosen({width: '100%', disable_search: true}).change(() => {
      const value = $('#js-connection-connection-type-input').val();
      domEvents.dispatch($('#js-connection-connection-type-input')[0], {type: 'changed', data: {value}});
    });
    $('#js-default-user-select').chosen({width: '80%'}).change(() => {
      const value = $('#js-default-user-select').val();
      domEvents.dispatch($('#js-default-user-select')[0], {type: 'changed', data: {value}});
    });
    $('#js-default-group-admin-user-select').chosen({width: '80%'}).change(() => {
      const value = $('#js-default-group-admin-user-select').val();
      domEvents.dispatch($('#js-default-group-admin-user-select')[0], {type: 'changed', data: {value}});
    });
  },

  /**
   * Init section
   * @private
   */
  _initFormGeneralSwitch: function() {
    const disabled = !this.options.edit;

    const settings = this.options.usersDirectorySettings;
    const enabled = settings.isEnabled();
    this.addElement(
      new ToggleButtonComponent('#js-ldap-toggle-button', {
        modelReference: 'UsersDirectorySettings.enabled',
        label: null,
        state: {disabled},
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
   * @private
   */
  _initFormCredantialsSection: function() {
    const disabled = !this.options.edit;

    this.addElement(
      new RadioComponent('#js-directory-type-radio', {
        modelReference: 'UsersDirectorySettings.directory_type',
        state: {disabled},
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
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-domain-name-input-feedback', {}).start()
    );

    this.addElement(
      new DropdownComponent('#js-connection-connection-type-input', {
        modelReference: 'UsersDirectorySettings.connection_type',
        state: {disabled},
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
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-server-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-port-input', {
        modelReference: 'UsersDirectorySettings.port',
        state: {disabled},
        value: 389
      }).start(),
      new FeedbackComponent('#js-port-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-username-input', {
        modelReference: 'UsersDirectorySettings.username',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-username-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-password-input', {
        modelReference: 'UsersDirectorySettings.password',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-password-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-base-dn-input', {
        modelReference: 'UsersDirectorySettings.base_dn',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-base-dn-input-feedback', {}).start()
    );
  },

  /**
   * Init section
   * @private
   */
  _initFormDirectorySection: function() {
    const disabled = !this.options.edit;

    this.addElement(
      new TextboxComponent('#js-group-path-input', {
        modelReference: 'UsersDirectorySettings.group_path',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-group-path-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-user-path-input', {
        modelReference: 'UsersDirectorySettings.user_path',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-user-path-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-group-object-class-input', {
        modelReference: 'UsersDirectorySettings.group_object_class',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-group-object-class-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-user-object-class-input', {
        modelReference: 'UsersDirectorySettings.user_object_class',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-user-object-class-input-feedback', {}).start()
    );
  },

  /**
   * Init section
   * @private
   */
  _initFormSynchronisationSection: function() {
    const disabled = !this.options.edit;

    this.addElement(
      new DropdownComponent('#js-default-user-select', {
        modelReference: 'UsersDirectorySettings.default_user',
        state: {disabled},
        availableValues: this._admins
      }).start(),
      new FeedbackComponent('#js-default-user-select-feedback', {}).start()
    );

    this.addElement(
      new DropdownComponent('#js-default-group-admin-user-select', {
        modelReference: 'UsersDirectorySettings.default_group_admin_user',
        state: {disabled},
        availableValues: this._users
      }).start(),
      new FeedbackComponent('#js-default-group-admin-user-select-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-groups-parent-group-input', {
        modelReference: 'UsersDirectorySettings.groups_parent_group',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-groups-parent-group-input-feedback', {}).start()
    );

    this.addElement(
      new TextboxComponent('#js-users-parent-group-input', {
        modelReference: 'UsersDirectorySettings.users_parent_group',
        state: {disabled}
      }).start(),
      new FeedbackComponent('#js-users-parent-group-input-feedback', {}).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-enabled-users-only-toggle-button', {
        label: __('Only for AD. Synchronize only the users who are enabled'),
        modelReference: 'UsersDirectorySettings.enabled_users_only',
        state: {disabled},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-users-create-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_users_create',
        state: {disabled},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-users-delete-toggle-button', {
        label: __('Delete users'),
        modelReference: 'UsersDirectorySettings.sync_users_delete',
        state: {disabled},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-groups-create-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_groups_create',
        state: {disabled},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-groups-delete-toggle-button', {
        label: __('Delete users'),
        modelReference: 'UsersDirectorySettings.sync_groups_delete',
        state: {disabled},
        value: true
      }).start()
    );

    this.addElement(
      new ToggleButtonComponent('#js-sync-groups-update-toggle-button', {
        label: __('Create users'),
        modelReference: 'UsersDirectorySettings.sync_groups_update',
        state: {disabled},
        value: true
      }).start()
    );
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
