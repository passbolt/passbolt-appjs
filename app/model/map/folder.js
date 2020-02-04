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
 * @since         2.13.0
 */
import Ajax from '../../net/ajax';
import chunk from 'passbolt-mad/util/array/chunk';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import Permission from './permission';
import FolderService from '../service/plugin/folder';

const Folder = DefineMap.extend('passbolt.model.Folder', {
  id: 'string',
  name: 'string',
  folder_parent_id: 'string',
  created: 'string',
  modified: 'string',
  permission: Permission,
});
DefineMap.setReference('Folder', Folder);
Folder.List = DefineList.extend({'#': {Type: Folder}});

Folder.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: Folder,
  List: Folder.List,
  url: {
    resource: '/',
    getData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'folders/{id}.json',
        type: 'GET',
        params: params
      });
    },
    getListData: function(params) {
      if (params.source && params.source == 'storage') {
        return FolderService.findAllFromLocalStorage(params);
      } else {
        params = params || {};
        params['api-version'] = 'v2';
        return Ajax.request({
          url: 'folders.json',
          type: 'GET',
          params: params
        });
      }
    }
  }
});

export default Folder;
