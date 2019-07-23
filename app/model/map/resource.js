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
import 'urijs/src/punycode';
import 'urijs/src/SecondLevelDomains';
import 'urijs/src/IPv6';
import URI from 'urijs/src/URI';
/*
 *import Secret from 'app/model/map/secret';
 *import Tag from 'app/model/map/tag';
 */
import User from './user';
import ResourceService from '../service/plugin/resource';

const Resource = DefineMap.extend('passbolt.model.Resource', {
  id: 'string',
  name: 'string',
  username: 'string',
  uri: 'string',
  created: 'string',
  modified: 'string',
  description: 'string',
  creator: User,
  favorite: 'object',
  permission: Permission,

  /**
   * Check if the resource is marked as favorite.
   * @return {boolean}
   */
  isFavorite: function() {
    return this.favorite && this.favorite.id;
  }
});
DefineMap.setReference('Resource', Resource);
Resource.List = DefineList.extend({'#': {Type: Resource}});

/**
 * Return an url based on the resource uri.
 * Only what is considered as an url is returned.
 * Javascript url is not considered as safe and so an empty string is returned.
 * Non parsable uris are not considered as safe and so an empty string is returned.
 *
 * Note this function does not prevent from DOM XSS injection, you have to take of escaping the string between injecting
 * it into the DOM. With mustach {{ safeUrl }} by instance.
 *
 * @return {string}
 */
Resource.prototype.safeUrl = function() {
  if (typeof this.uri != 'string' || this.uri == '') {
    return '';
  }

  let safeUrl, protocol;
  try {
    safeUrl = URI(this.uri);
    protocol = safeUrl.protocol().trim().toLowerCase();
  } catch (e) {
    // Uris that cannot be parsed are not safe.
    return '';
  }

  if (safeUrl.is('url')) {
    // Javascript is not safe.
    if (protocol === "javascript") {
      return '';
    }
    // If no protocol defined or a relative url is given, force the http protocol.
    if (!safeUrl.is('absolute') || protocol == '') {
      safeUrl.protocol('http');
    }

    // Trim the latest /
    return safeUrl.toString().replace(/\/$/, '');
  }

  return '';
};

/**
 * Get the resource permalink.
 * @param resource
 * @return {string}
 */
Resource.getPermalink = function(resource) {
  return `${APP_URL}app/passwords/view/${resource.id}`;
};

/**
 * Get the resource permalink.
 * @return {string}
 */
Resource.prototype.getPermalink = function() {
  return Resource.getPermalink(this);
};

/**
 * Sort the permissions alphabetically.
 */
Resource.List.prototype.sortAlphabetically = function() {
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
 * @see https://github.com/passbolt/passbolt_api/src/Model/Table/ResourcesTable.php
 */
Resource.validationRules = {
  id: [
    {rule: 'uuid'}
  ],
  name: [
    {rule: 'required', message: __('A name is required.')},
    {rule: ['maxLength', 64], message: __('The name length should be maximum %s characters.', 64)},
    {rule: 'utf8Extended', message: __('The name should be a valid utf8 string.')}
  ],
  username: [
    {rule: ['maxLength', 64], message: __('The username length should be maximum %s characters.', 64)},
    {rule: 'utf8Extended', message: __('The username should be a valid utf8 string.')}
  ],
  uri: [
    {rule: ['maxLength', 255], message: __('The uri length should be maximum %s characters.', 255)},
    {rule: 'utf8', message: __('The uri should be a valid utf8 string (emoticons excluded).')}
  ],
  description: [
    {rule: ['maxLength', 10000], message: __('The description length should be maximum %s characters.', 10000)},
    {rule: 'utf8Extended', message: __('The description should be a valid utf8 string.')}
  ]
};

/**
 * @inherited-doc
 */
Resource.getFilteredFields = function(filteredCase) {
  let filteredFields = false;

  switch (filteredCase) {
    case 'edit':
      filteredFields = [
        'id',
        'name',
        'username',
        'expiry_date',
        'uri',
        'description'
      ];
      break;
    case 'edit_with_secrets':
      filteredFields = [
        'id',
        'name',
        'username',
        'expiry_date',
        'uri',
        'description',
        'secrets'
      ];
      break;
    case 'edit_description':
      filteredFields = [
        'id',
        'description'
      ];
      break;
  }

  return filteredFields;
};

/**
 * Update resources after they have been shared.
 * @param resourcesIds
 * @return {Promise}
 */
Resource.findAllByIds = function(resourcesIds) {
  // Retrieve the resources by batch of 100 to avoid any 414 response.
  const batchSize = 100;
  if (resourcesIds.length > batchSize) {
    const resourcesIdsParts = chunk(resourcesIds, batchSize);
    return resourcesIdsParts.reduce((promise, resourcesIdsPart) => promise.then(carry => Resource.findAllByIds(resourcesIdsPart)
      .then(resources => carry.concat(resources))), Promise.resolve(new Resource.List()));
  }

  const findOptions = {
    contain: {favorite: 1, permission: 1, tag: 1},
    filter: {
      'has-id': resourcesIds
    }
  };
  return Resource.findAll(findOptions);
};

Resource.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: Resource,
  List: Resource.List,
  url: {
    resource: '/',
    getData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'resources/{id}.json',
        type: 'GET',
        params: params
      });
    },
    getListData: function(params) {
      if (params.source && params.source == 'storage') {
        return ResourceService.findAllFromLocalStorage(params);
      } else {
        params = params || {};
        params['api-version'] = 'v2';
        return Ajax.request({
          url: 'resources.json',
          type: 'GET',
          params: params
        });
      }
    },
    createData: function(params) {
      return ResourceService.save(params);
    },
    updateData: function(params) {
      const _params = Resource.filterAttributes(params);
      return ResourceService.update(_params);
    }
  }
});

export default Resource;
