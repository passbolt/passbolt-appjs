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
 * @since         2.0.0
 */
import Ajax from 'app/net/ajax';
import Config from 'passbolt-mad/config/config';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';

const Theme = DefineMap.extend('passbolt.model.Theme', {
  id: 'string',
  name: 'string',
  preview: 'string'
});
DefineMap.setReference('Theme', Theme);
Theme.List = DefineList.extend({'#': {Type: Theme}});

/**
 * Select a theme
 * @param {Theme} theme The target theme
 */
Theme.select = function(theme) {
  return Ajax.request({
    url: '/account/settings/themes.json',
    type: 'POST',
    params: {value: theme.name}
  }).then(() => {
    Config.write('accountSetting.theme', theme.name);
  });
};

Theme.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: Theme,
  List: Theme.List,
  url: {
    resource: '/',
    getListData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: '/account/settings/themes.json',
        type: 'GET',
        params: params
      });
    }
  }
});

export default Theme;
