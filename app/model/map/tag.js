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
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';

const Tag = DefineMap.extend('passbolt.model.Tag', {
  id: 'string',
  slug: 'string',
  user_id: 'string',
  is_shared: 'boolean'
});
DefineMap.setReference('Tag', Tag);
Tag.List = DefineList.extend({'#': {Type: Tag}});

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 */
Tag.validationRules = {
  id: [
    {rule: 'uuid'}
  ],
  slug: [
    {rule: 'required', message: __('Tag can not be empty')},
    {rule: ['maxLength', 128], message: __('Tag can not be more than %s characters in length', 128)},
    {rule: 'utf8Extended', message: __('Tag should be a valid utf8 string.')}
  ]
};

/**
 * Update the resource tags
 * @param {string} resourceId The target resource to update the tags for
 * @param {array} slugs The list tags
 */
Tag.updateResourceTags = function(resourceId, slugs) {
  return Ajax.request({
    url: 'tags/{resourceId}.json?api-version=v2',
    type: 'POST',
    params: {Tags: slugs, resourceId: resourceId}
  }).then(data => Promise.resolve(new Tag.List(data)));
};

Tag.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: Tag,
  List: Tag.List,
  url: {
    resource: '/',
    getListData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'tags.json',
        type: 'GET',
        params: params
      });
    },
    destroyData: function(params) {
      return Ajax.request({
        url: `tags/${params.id}.json?api-version=v2`,
        type: 'DELETE'
      });
    },
    updateData: function(params) {
      return Ajax.request({
        url: `tags/${params.id}.json?api-version=v2`,
        type: 'PUT',
        params: params
      });
    }
  }
});

export default Tag;
