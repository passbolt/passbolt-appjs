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
import User from 'app/model/map/user';

var Comment = DefineMap.extend('passbolt.model.Comment', {
	id: 'string',
	parent_id: 'string',
	foreign_model: 'string',
	foreign_key: 'string',
	content: 'string',
	created: 'string',
	modified: 'string',
	creator: User,
	modifier: User
});
DefineMap.setReference('Comment', Comment);
Comment.List = DefineList.extend({'#': { Type: Comment }});

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 * @see https://github.com/passbolt/passbolt_api/src/Model/Table/CommentsTable.php
 */
Comment.validationRules = {
	id: [
		{rule: 'uuid'}
	],
	content: [
		{rule: 'required', message: __('A comment is required.')},
		{rule: ['lengthBetween', 1, 255], message: __('The comment should be between %s and %s characters.', 1, 255)},
		{rule: 'utf8Extended', message: __('The comment should be a valid utf8 string.')}
	]
};

Comment.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
	Map: Comment,
	List: Comment.List,
	url: {
		resource: '/',
		createData: function(params) {
			return Ajax.request({
				url: 'comments/resource/{foreign_key}.json?api-version=v2',
				type: 'POST',
				params: params
			});
		},
		getListData: function(params) {
			params['api-version'] = 'v2';
			return Ajax.request({
				url: 'comments/resource/{foreignKey}.json',
				type: 'GET',
				params: params
			});
		},
		destroyData: function(params) {
			const requestParams = {
				id: params.id,
				'api-version': 'v2'
			};
			return Ajax.request({
				url: 'comments/{id}.json',
				type: 'DELETE',
				params: requestParams
			});
		}
	}
});

export default Comment;
