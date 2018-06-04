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
import connectStore from 'can-connect/constructor/store/store';
import connectConstructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';
import Response from 'passbolt-mad/net/response';

var AccountSetting = DefineMap.extend('passbolt.model.AccountSetting', {
	id: 'string',
	user_id: 'string',
	property_id: 'string',
	property: 'string',
	value: 'string'
});
DefineMap.setReference('AccountSetting', AccountSetting);
AccountSetting.List = DefineList.extend({'#': { Type: AccountSetting }});

/**
 * Store the account settings in the config.
 * @param accountSettings
 */
AccountSetting.saveInConfig = function(accountSettings) {
	accountSettings.forEach((accountSetting) => {
		Config.write('accountSetting.' + accountSetting.property, accountSetting.value);
	});
};

AccountSetting.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
	Map: AccountSetting,
	List: AccountSetting.List,
	url: {
		resource: '/',
		getListData: function(params) {
			params = params || {};
			params['api-version'] = 'v2';
			return Ajax.request({
				url: '/account/settings.json',
				type: 'GET',
				params: params
			});
		}
	}
});

export default AccountSetting;
