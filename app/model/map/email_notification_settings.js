/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
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
import Ajax from '../../net/ajax';
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

const EmailNotificationSettings = DefineMap.extend('passbolt.model.EmailNotificationSettings', {
  id: {
    type: 'string',
    value: () => uuid()
  },
  'show_comment': 'boolean',
  'show_description': 'boolean',
  'show_secret': 'boolean',
  'show_uri': 'boolean',
  'show_username': 'boolean',
  'send_comment_add': 'boolean',
  'send_password_create': 'boolean',
  'send_password_share': 'boolean',
  'send_password_update': 'boolean',
  'send_password_delete': 'boolean',
  'send_user_create': 'boolean',
  'send_user_recover': 'boolean',
  'send_group_delete': 'boolean',
  'send_group_user_add': 'boolean',
  'send_group_user_delete': 'boolean',
  'send_group_user_update': 'boolean',
  'send_group_manager_update': 'boolean',
});
DefineMap.setReference('EmailNotificationSettings', EmailNotificationSettings);

/**
 * Check if the settings are overridden by file
 * @param {object} data
 * @returns boolean
 */
EmailNotificationSettings.settingsOverridenByfile = function(data) {
  return data.sources_file === true && data.sources_database === true;
};

EmailNotificationSettings.fileConfigExists = function(data) {
  return data.sources_file === true;
};

EmailNotificationSettings.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: EmailNotificationSettings,
  url: {
    resource: '/',
    getData: function() {
      const params = {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'settings/emails/notifications.json',
        type: 'GET',
        params: params
      });
    },
    updateData: function(params) {
      return Ajax.request({
        url: 'settings/emails/notifications.json?api-version=v2',
        type: 'POST',
        params: params
      });
    }
  }
});

export default EmailNotificationSettings;
