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
  parent_id: 'string',
  created: 'string',
  modified: 'string',
  permission: Permission,
});
DefineMap.setReference('Folder', Folder);
Folder.List = DefineList.extend({'#': {Type: Folder}});

/**
 * Sort the folder alphabetically.
 */
Folder.List.prototype.sortAlphabetically = function() {
  this.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
};

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 */
Folder.validationRules = {
  id: [
    {rule: 'uuid'}
  ],
  parent_id: [
    {rule: 'uuid'}
  ],
  name: [
    {rule: 'required', message: __('A name is required.')},
    {rule: ['maxLength', 255], message: __('The name length should be maximum %s characters.', 255)},
    {rule: 'utf8Extended', message: __('The name should be a valid utf8 string.')}
  ],
};

/**
 * @inherited-doc
 */
Folder.getFilteredFields = function(filteredCase) {
  let filteredFields = false;

  switch (filteredCase) {
    case 'edit':
      filteredFields = [
        'id',
        'name',
        'parent_id'
      ];
      break;
  }

  return filteredFields;
};

/**
 * Update folders after they have been shared.
 * @param foldersIds
 * @return {Promise}
 */
Folder.findAllByIds = function(foldersIds) {
  // Retrieve the folder by batch of 100 to avoid any 414 response.
  const batchSize = 100;
  if (foldersIds.length > batchSize) {
    const foldersIdsPart = chunk(foldersIds, batchSize);
    return foldersIdsPart.reduce((promise, foldersIdsPart) => promise.then(carry => Folder.findAllByIds(foldersIdsPart)
      .then(folders => carry.concat(folders))), Promise.resolve(new Folder.List()));
  }

  const findOptions = {
    // contain: {favorite: 1, permission: 1, tag: 1},
    // filter: {
    //   'has-id': resourcesIds
    // }
  };
  return Resource.findAll(findOptions);
};

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
    },
    // createData: function(params) {
    //   return FolderService.save(params);
    // },
    // updateData: function(params) {
    //   const _params = Folder.filterAttributes(params);
    //   return FolderService.update(_params);
    // }
  }
});

export default Folder;
