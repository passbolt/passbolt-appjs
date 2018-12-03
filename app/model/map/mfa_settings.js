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
import connectStore from 'can-connect/constructor/store/store';
import connectConstructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import DefineMap from 'passbolt-mad/model/map/map';
import getObject from 'can-util/js/get/get';
import 'urijs/src/punycode';
import 'urijs/src/SecondLevelDomains';
import 'urijs/src/IPv6';
import uuid from 'uuid/v4';

const MfaSettings = DefineMap.extend('passbolt.model.MfaSettings', {
  id: {
    type: 'string',
    value: () => uuid()
  },
  totp_provider: 'boolean',
  yubikey_provider: 'boolean',
  yubikey_client_id: 'string',
  yubikey_secret_key: 'string',
  duo_provider: 'boolean',
  duo_host_name: 'string',
  duo_integration_key: 'string',
  duo_salt: 'string',
  duo_secret_key: 'string'
});
DefineMap.setReference('MfaSettings', MfaSettings);

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 */
MfaSettings.validationRules = {
  yubikey_client_id: [
    {rule: 'required', message: __('A client identifier is required.')},
    {rule: '/^[0-9]{1,64}$/', message: __('The client identifier should be an integer.')}
  ],
  yubikey_secret_key: [
    {rule: 'required', message: __('A secret key is required.')},
    {rule:'/^[a-zA-Z0-9\/=]{10,128}$/', message: __('This secret key is not valid.')}
  ],
  duo_host_name: [
    {rule: 'required', message: __('A hostname is required.')},
    {rule: '/^api-[a-fA-F0-9]{8,16}\.duosecurity\.com$/', message: __('This is not a valid hostname.')}
  ],
  duo_integration_key: [
    {rule: 'required', message: __('An integration key is required.')},
    {rule: '/^[a-zA-Z0-9]{16,32}$/', message: __('This is not a valid integration key.')}
  ],
  duo_salt: [
    {rule: 'required', message: __('A salt is required.')},
    {rule: ['lengthBetween', 40, 128], message: __('The salt should be between 40 and 128 characters in length.')}
  ],
  duo_secret_key: [
    {rule: 'required', message: __('A secret key is required.')},
    {rule: '/^[a-zA-Z0-9]{32,128}$/', message: __('This is not a valid secret key.')}
  ]
};

/**
 * Map the data from the API.
 * @param {object} data
 * @returns {object}
 */
MfaSettings.mapFromApi = function(data) {
  data.providers = data.providers || [];
  return {
    totp_provider: data.providers.find(provider => provider == 'totp') != undefined,
    yubikey_provider: data.providers.find(provider => provider == 'yubikey') != undefined,
    yubikey_client_id: getObject(data, 'yubikey.clientId'),
    yubikey_secret_key: getObject(data, 'yubikey.secretKey'),
    duo_provider: data.providers.find(provider => provider == 'duo') != undefined,
    duo_host_name: getObject(data, 'duo.hostName'),
    duo_integration_key: getObject(data, 'duo.integrationKey'),
    duo_salt: getObject(data, 'duo.salt'),
    duo_secret_key: getObject(data, 'duo.secretKey')
  };
};

/**
 * Map the data for the API.
 * @param {object} data
 * @returns {object}
 */
MfaSettings.mapToApi = function(data) {
  const result = {
    providers: []
  };
  if (data.totp_provider) {
    result.providers.push('totp');
  }
  if (data.yubikey_provider) {
    result.providers.push('yubikey');
    result.yubikey = {
      clientId: data.yubikey_client_id,
      secretKey: data.yubikey_secret_key
    };
  }
  if (data.duo_provider) {
    result.providers.push('duo');
    result.duo = {
      hostName: data.duo_host_name,
      integrationKey: data.duo_integration_key,
      salt: data.duo_salt,
      secretKey: data.duo_secret_key
    };
  }
  return result;
};

MfaSettings.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap], {
  Map: MfaSettings,
  url: {
    resource: '/',
    getData: function() {
      const params = {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'mfa/settings.json',
        type: 'GET',
        params: params
      }).then(settings => MfaSettings.mapFromApi(settings));
    },
    updateData: function(params) {
      return Ajax.request({
        url: 'mfa/settings.json?api-version=v2',
        type: 'POST',
        params: MfaSettings.mapToApi(params)
      });
    }
  }
});

export default MfaSettings;
