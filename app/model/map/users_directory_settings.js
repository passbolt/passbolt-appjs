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
import Ajax from 'app/net/ajax';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import connectStore from 'can-connect/constructor/store/store';
import connectConstructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import DefineMap from 'passbolt-mad/model/map/map';
import 'urijs/src/punycode';
import 'urijs/src/SecondLevelDomains';
import 'urijs/src/IPv6';
import uuid from 'uuid/v4';

const UsersDirectorySettings = DefineMap.extend('passbolt.model.UsersDirectorySettings', {
  id: {
    type: 'string',
    value: () => uuid()
  },
  directory: 'string',
  domain: 'string',
  protocol: 'string',
  host: 'string',
  port: 'integer',
  username: 'string',
  base_dn: 'string',
  group_path: 'string',
  user_path: 'string',
  group_object_class: 'string',
  user_object_class: 'string',
  default_admin: 'string',
  default_group_admin: 'string',
  sync_create_users: 'boolean',
  sync_delete_users: 'boolean',
  sync_create_groups: 'boolean',
  sync_delete_groups: 'boolean',
  sync_update_groups: 'boolean'
});
DefineMap.setReference('UsersDirectorySettings', UsersDirectorySettings);

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 */
UsersDirectorySettings.validationRules = {
  domain: [
    {rule: 'required', message: __('A domain is required.')},
    {rule: 'utf8', message: __('The domain should be a valid utf8 string.')}
  ],
  host: [
    {rule: 'required', message: __('A host is required.')},
    {rule: 'utf8', message: __('The host should be a valid utf8 string.')}
  ],
  port: [
    {rule: 'required', message: __('A port is required.')},
    {rule: 'num', message: __('The port should be a valid integer.')}
  ],
  username: [
    {rule: 'required', message: __('A username is required.')},
    {rule: 'utf8', message: __('The username should be a valid utf8 string.')}
  ],
  password: [
    {rule: 'required', message: __('A password is required.')},
    {rule: 'utf8', message: __('The password should be a valid utf8 string.')}
  ],
  base_dn: [
    {rule: 'required', message: __('A base DN is required.')},
    {rule: 'utf8', message: __('The base DN should be a valid utf8 string.')}
  ],
  group_path: [
    {rule: 'required', message: __('A group path is required.')},
    {rule: 'utf8', message: __('The group path should be a valid utf8 string.')}
  ],
  user_path: [
    {rule: 'required', message: __('A user path is required.')},
    {rule: 'utf8', message: __('The user path should be a valid utf8 string.')}
  ],
  group_object_class: [
    {rule: 'required', message: __('A group object class is required.')},
    {rule: 'utf8', message: __('The group object class should be a valid utf8 string.')}
  ],
  user_object_class: [
    {rule: 'required', message: __('A user object class is required.')},
    {rule: 'utf8', message: __('The user object class should be a valid utf8 string.')}
  ],
  default_admin: [
    {rule: 'required', message: __('A default admin is required.')},
    {rule: 'uuid', message: __('The default admin should be a valid uuid.')}
  ],
  default_group_admin: [
    {rule: 'required', message: __('A default group admin is required.')},
    {rule: 'utf8', message: __('The default group admin should be a valid uuid.')}
  ]
};

/**
 * Disable the users directory
 */
UsersDirectorySettings.prototype.disable = function() {
  return Ajax.request({
    url: 'settings/ldap/disable.json?api-version=v2',
    type: 'PUT'
  });
};

/**
 * Is a users directory enabled.
 */
UsersDirectorySettings.prototype.isEnabled = function() {
  if (this.domain) {
    return true;
  }
};

UsersDirectorySettings.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
  Map: UsersDirectorySettings,
  url: {
    resource: '/',
    getData: function() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            directory: 'ldap',
            domain: 'my domain',
            protocol: 'ldap',
            host: 'my host',
            port: 999,
            username: 'my username',
            password: 'my password',
            base_dn: 'my base_dn',
            group_path: 'my group_path',
            user_path: 'my user_path',
            group_object_class: 'my group_object_class',
            user_object_class: 'my user_object_class',
            default_admin: 'd57c10f5-639d-5160-9c81-8a0c6c4ec856',
            default_group_admin: 'd57c10f5-639d-5160-9c81-8a0c6c4ec856',
            sync_create_users: true,
            sync_delete_users: false,
            sync_create_groups: true,
            sync_delete_groups: false,
            sync_update_groups: true
          });
        }, 1000);
      });
      /*
       *params['api-version'] = 'v2';
       *return Ajax.request({
       *  url: 'settings/ldap.json',
       *  type: 'GET',
       *  params: params
       *});
       */
    },
    updateData: function(params) {
      return Ajax.request({
        url: 'settings/users_directory.json?api-version=v2',
        type: 'PUT',
        params: params
      });
    }
  }
});

export default UsersDirectorySettings;
