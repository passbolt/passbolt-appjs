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
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import connectStore from 'can-connect/constructor/store/store';
import connectConstructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';

const Role = DefineMap.extend('passbolt.model.User', {
  id: 'string',
  name: 'string'
});
DefineMap.setReference('Role', Role);
Role.List = DefineList.extend({'#': {Type: Role}});

/**
 * Get the stored roles.
 * @returns {DefineList<Role>}
 */
Role.getCache = function() {
  return this.cache;
};

/**
 * Put the roles in cache
 * @param {DefineList<Role>} roles
 */
Role.setCache = function(roles) {
  this.cache = roles;
};

/**
 * Get role id from name.
 * @param {string} roleName
 */
Role.toId = function(roleName) {
  return this.cache.reduce((carry, item) => {
    if (roleName == item.name) {
      carry = item.id;
    }
    return carry;
  }, '');
};

Role.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
  Map: Role,
  List: Role.List,
  url: {
    resource: '/',
    getListData: function(params) {
      return Ajax.request({
        url: 'roles.json?api-version=v2',
        type: 'GET',
        params: params
      });
    }
  }
});

export default Role;
