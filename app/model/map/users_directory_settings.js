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
import Ajax from 'app/net/ajax';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import DefineMap from 'passbolt-mad/model/map/map';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import 'urijs/src/punycode';
import 'urijs/src/SecondLevelDomains';
import 'urijs/src/IPv6';
import uuid from 'uuid/v4';

const UsersDirectorySettings = DefineMap.extend('passbolt.model.UsersDirectorySettings', {
  id: {
    type: 'string',
    value: () => uuid()
  },
  directory_type: 'string',
  domain_name: 'string',
  connection_type: 'string',
  server: 'string',
  port: 'number',
  username: 'string',
  password: 'string',
  base_dn: 'string',
  group_path: 'string',
  user_path: 'string',
  group_object_class: 'string',
  user_object_class: 'string',
  use_email_prefix_suffix: 'boolean',
  email_prefix: 'string',
  email_suffix: 'string',
  default_user: 'string',
  default_group_admin_user: 'string',
  groups_parent_group: 'string',
  users_parent_group: 'string',
  enabled_users_only: 'boolean',
  sync_users_create: 'boolean',
  sync_users_delete: 'boolean',
  sync_groups_create: 'boolean',
  sync_groups_delete: 'boolean',
  sync_groups_update: 'boolean'
});
DefineMap.setReference('UsersDirectorySettings', UsersDirectorySettings);

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 */
UsersDirectorySettings.validationRules = {
  domain_name: [
    {rule: 'required', message: __('A domain name is required.')},
    {rule: 'utf8', message: __('The domain name should be a valid utf8 string.')}
  ],
  server: [
    {rule: 'required', message: __('A host is required.')},
    {rule: 'utf8', message: __('The host should be a valid utf8 string.')}
  ],
  port: [
    {rule: 'required', message: __('A port is required.')},
    {rule: 'num', message: __('The port should be a valid integer.')}
  ],
  username: [
    {rule: 'utf8', message: __('The username should be a valid utf8 string.')}
  ],
  password: [
    {rule: 'utf8', message: __('The password should be a valid utf8 string.')}
  ],
  base_dn: [
    {rule: 'utf8', message: __('The base DN should be a valid utf8 string.')}
  ],
  group_path: [
    {rule: 'utf8', message: __('The group path should be a valid utf8 string.')}
  ],
  user_path: [
    {rule: 'utf8', message: __('The user path should be a valid utf8 string.')}
  ],
  group_object_class: [
    {rule: 'utf8', message: __('The group object class should be a valid utf8 string.')}
  ],
  user_object_class: [
    {rule: 'utf8', message: __('The user object class should be a valid utf8 string.')}
  ],
  default_user: [
    {rule: 'required', message: __('A default admin is required.')},
    {rule: 'uuid', message: __('The default admin should be a valid uuid.')}
  ],
  default_group_admin_user: [
    {rule: 'required', message: __('A default group admin is required.')},
    {rule: 'uuid', message: __('The default group admin should be a valid uuid.')}
  ],
  groups_parent_group: [
    {rule: 'utf8', message: __('The users parent group should be a valid utf8 string.')}
  ],
  users_parent_group: [
    {rule: 'utf8', message: __('The groups parent group should be a valid utf8 string.')}
  ],
};

/**
 * Is a users directory enabled.
 */
UsersDirectorySettings.prototype.isEnabled = function() {
  if (this.domain_name) {
    return true;
  }
  return false;
};

/**
 * Test settings and return retrieved objects.
 */
UsersDirectorySettings.prototype.testSettings = function(params) {
  return Ajax.request({
    url: 'directorysync/settings/test.json?api-version=v2',
    type: 'POST',
    params: params
  });
};

UsersDirectorySettings.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: UsersDirectorySettings,
  url: {
    resource: '/',
    getData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'directorysync/settings.json',
        type: 'GET',
        params: params
      });
    },
    updateData: function(params) {
      return Ajax.request({
        url: 'directorysync/settings.json?api-version=v2',
        type: 'PUT',
        params: params
      });
    },
    destroyData: function() {
      return Ajax.request({
        url: 'directorysync/settings.json?api-version=v2',
        type: 'DELETE'
      });
    }
  }
});

export default UsersDirectorySettings;
