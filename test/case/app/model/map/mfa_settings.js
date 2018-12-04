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
 */
import "test/bootstrap";
import getObject from 'can-util/js/get/get';
import MfaSettings from "app/model/map/mfa_settings";
import setObject from 'passbolt-mad/util/set/set';

function getDummyMfaSettings() {
  return {
    totp_provider: true,
    yubikey_provider: true,
    yubikey_client_id: '40123',
    yubikey_secret_key: 'i2/j3jIQBO/axOl3ah4mlgXlXUY=',
    duo_provider: true,
    duo_host_name: 'api-45e9f2ca.duosecurity.com',
    duo_integration_key: 'UICPIC93F14RWR5F55SJ',
    duo_salt: 'SALTSALTSALTSALTSALTSALTSALTSALTSALTSALTSALTSALT1234567890',
    duo_secret_key: '8tkYNgi8aGAqa3KW1eqhsJLfjc1nJnHDYC1siNYX'
  };
};

function checkMapPropery(MapClass, field, data, checks) {
  for (let rule in checks) {
    for (let i in checks[rule]) {
      let copy = JSON.parse(JSON.stringify(data));
      setObject(copy, field, checks[rule][i].value);
      const result = MapClass.validateAttribute(field, getObject(copy, field));
      if (checks[rule][i].result === true) {
        expect(result).to.be.empty;
      } else {
        expect(result).to.not.be.empty;
      }
    }
  }
};

describe("MfaSettings", () => {

  describe("validate() should validate as expected", () => {

    it('validates yubikey_client_id', () => {
      const checks = {
        'integer': [
          {result: false, value: 'abc'},
          {result: false, value: ' '},
          {result: true, value: '123'},
        ],
        'maxLength': [
          {result: true, value: '12345'},
          {result: false, value: '1234567890123456789012345678901234567890123456789012345678901234567890'},
        ],
      };
      checkMapPropery(MfaSettings, 'yubikey_client_id', getDummyMfaSettings(), checks);
    });

    it('validates yubikey_secret_key', () => {
      const checks = {
        'validYubikeySecretKey': [
          {result: true, value: 'i2/j3jIQBO/axOl3ah4mlgXlXUY='},
          {result: false, value: '123456789'},
          {result: false, value: ' '}
        ],
      };
      checkMapPropery(MfaSettings, 'yubikey_secret_key', getDummyMfaSettings(), checks);
    });

    it('validates duo_host_name', () => {
      const checks = {
        'validDuoHostName': [
          {result: true, value: 'api-aaAAFF09.duosecurity.com'},
          {result: false, value: '123456789'},
          {result: false, value: ' '}
        ],
      };
      checkMapPropery(MfaSettings, 'duo_host_name', getDummyMfaSettings(), checks);
    });

    it('validates duo_integration_key', () => {
      const checks = {
        'validDuoIntegrationKey': [
          {result: true, value: 'UICPIC93F14RWR5F55SJ'},
          {result: false, value: 'ABCD-0123'},
          {result: false, value: ' '}
        ],
      };
      checkMapPropery(MfaSettings, 'duo_integration_key', getDummyMfaSettings(), checks);
    });

    it('validates duo_salt', () => {
      const checks = {
        'lengthBetween': [
          {result: true, value: 'SALTSALTSALTSALTSALTSALTSALTSALTSALTSALTSALTSALT1234567890'},
          {result: false, value: 'SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890SALTSALTSALTSALTSALTSALT1234567890'},
          {result: false, value: ' '}
        ],
      };
      checkMapPropery(MfaSettings, 'duo_salt', getDummyMfaSettings(), checks);
    });

    it('validates duo_secret_key', () => {
      const checks = {
        'lengthBetween': [
          {result: true, value: '8tkYNgi8aGAqa3KW1eqhsJLfjc1nJnHDYC1siNYX'},
          {result: false, value: '8tkYNgi8aGAqa3KW1eqhsJLfjc1nJnHDYC1siNYX/*='},
          {result: false, value: ' '}
        ],
      };
      checkMapPropery(MfaSettings, 'duo_secret_key', getDummyMfaSettings(), checks);
    });

  });
});