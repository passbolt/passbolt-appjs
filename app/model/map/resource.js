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
import chunk from 'passbolt-mad/util/array/chunk';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import connectStore from 'can-connect/constructor/store/store';
import connectConstructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';
import Favorite from 'app/model/map/favorite';
import Permission from 'app/model/map/permission';
import 'urijs/src/punycode';
import 'urijs/src/SecondLevelDomains';
import 'urijs/src/IPv6';
import URI from 'urijs/src/URI';
/*
 *import Secret from 'app/model/map/secret';
 *import Tag from 'app/model/map/tag';
 */
import User from 'app/model/map/user';

const Resource = DefineMap.extend('passbolt.model.Resource', {
  id: 'string',
  name: 'string',
  username: 'string',
  uri: 'string',
  created: 'string',
  modified: 'string',
  description: 'string',
  creator: User,
  favorite: Favorite,
  permission: Permission,

  /**
   * Check if the resource is marked as favorite.
   * @return {boolean}
   */
  isFavorite: function() {
    return this.favorite && this.favorite.id;
  },
  /**
   * Find the resource that may have change.
   * If the resource is found, canjs will throw an event to notify about the changes.
   * If the resource cannot be found, notify about its destruction.
   * @private
   */
  _reloadResource: function() {
    const findOptions = {
      id: this.id,
      silentLoading: false,
      contain: {creator: 1, favorite: 1, modifier: 1, secret: 1, permission: 1}
    };
    Resource.findOne(findOptions)
      .then(null, () => {
      /*
       * If there is an error, it means the user does not have anymore access to the resource.
       * Notify other components about it.
       */
        Resource.dispatch('destroyed', [this]);
      });
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
 * Delete all the resources.
 * @param {Resource.List} resources
 * @return {Promise}
 */
Resource.deleteAll = function(resources) {
  const promises = resources.reduce((promise, resource) => {
    resource.__SILENT_NOTIFY__ = true;
    return promise.then(() => resource.destroy());
  }, Promise.resolve([]));
  return promises;
};

/**
 * Update resources after they have been shared.
 * - Update the permission of the current user locally
 * - Destroy them locally if the user has not access to them
 * @param resourcesIds
 * @return {Promise}
 */
Resource.updateResourcesAfterShare = function(resourcesIds) {
  // Retrieve the resources by batch of 100 to avoid any 414 response.
  const batchSize = 100;
  if (resourcesIds.length > batchSize) {
    const resourcesIdsParts = chunk(resourcesIds, batchSize);
    return resourcesIdsParts.reduce((promise, resourcesIdsPart) => promise.then(carry => Resource.updateResourcesAfterShare(resourcesIdsPart)
      .then(resources => carry.concat(resources))), Promise.resolve(new Resource.List()));
  }

  const findOptions = {
    contain: {permission: 1},
    filter: {
      'has-id': resourcesIds
    }
  };
  return Resource.findAll(findOptions)
    .then(resources => {
      // Delete locally the resources that are not returned by the API request, it means the user does not have access to it anymore.
      const updatedResourcesIds = resources.map(resource => resource.id).get();
      const deletedResourcesIds = resourcesIds.filter(item => !updatedResourcesIds.includes(item));
      deletedResourcesIds.forEach(deletedResourceId => {
        const resource = Resource.connection.instanceStore.get(deletedResourceId);
        Resource.dispatch('destroyed', [resource]);
      });
      return resources;
    });
};

Resource.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
  Map: Resource,
  List: Resource.List,
  url: {
    resource: '/',
    getData: function(params) {
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'resources/{id}.json',
        type: 'GET',
        params: params
      });
    },
    getListData: function(params) {
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'resources.json',
        type: 'GET',
        params: params
      });
    },
    destroyData: function(params) {
      const _params = {
        id: params.id,
        'api-version': 'v2'
      };
      return Ajax.request({
        url: 'resources/{id}.json?api-version=v2',
        type: 'DELETE',
        silentNotify: params.__SILENT_NOTIFY__ ? params.__SILENT_NOTIFY__ : false,
        params: _params
      });
    },
    createData: function(params) {
      return Ajax.request({
        url: 'resources.json?api-version=v2',
        type: 'POST',
        params: params
      });
    },
    updateData: function(params) {
      // Filter the attributes that need to be send by the request.
      const _params = Resource.filterAttributes(params);
      return Ajax.request({
        url: 'resources/{id}.json?api-version=v2',
        type: 'PUT',
        params: _params
      });
    }
  }
});

export default Resource;
