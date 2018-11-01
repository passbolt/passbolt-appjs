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
import Group from 'app/model/map/group';
import DefineMap from 'passbolt-mad/model/map/map';
import PermissionType from 'app/model/map/permission_type';
import User from 'app/model/map/user';

const Permission = DefineMap.extend('passbolt.model.Permission', {
  id: 'string',
  type: 'number',
  aco: 'string',
  aco_foreign_key: 'string',
  aro: 'string',
  aro_foreign_key: 'string',
  aro_foreign_label: 'string',
  group: Group,
  user: User
});
DefineMap.setReference('Permission', Permission);

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 * @see https://github.com/passbolt/passbolt_api/src/Model/Table/PermissionsTable.php
 */
Permission.validationRules = {
  aro_foreign_key: ['required', 'uid'],
  aro_foreign_label: ['required'],
  type: [
    'required',
    {
      rule: 'foreignRule',
      options: {
        model: PermissionType,
        attribute: 'serial'
      }
    }
  ]
};

/**
 * Check that the permission level allows requested permission
 * @param permissionType
 * @returns {boolean}
 */
Permission.prototype.isAllowedTo = function(permissionType) {
  return this.type >= permissionType;
};

/**
 * Permission list.
 */
Permission.List = DefineList.extend({'#': {Type: Permission}});

/**
 * Sort the permissions alphabetically.
 */
Permission.List.prototype.sortAlphabetically = function() {
  this.sort((a, b) => {
    const aValue = a.user ? a.user.profile.first_name : a.group.name;
    const bValue = b.user ? b.user.profile.first_name : b.group.name;
    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    }
    return 0;
  });
};

Permission.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
  Map: Permission,
  List: Permission.List,
  url: {
    resource: '/',
    getListData: function(params) {
      let url = 'permissions.json';
      if (params.aco_foreign_key) {
        url = 'permissions/{aco}/{aco_foreign_key}.json';
      }
      params['api-version'] = 'v2';
      return Ajax.request({
        url: url,
        type: 'GET',
        params: params
      });
    },
    createData: function(params) {
      return Ajax.request({
        url: 'permissions.json?api-version=v2',
        type: 'POST',
        params: params
      });
    }
  }
});

export default Permission;
