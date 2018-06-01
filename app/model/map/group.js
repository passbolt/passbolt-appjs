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
import connectDeepMerge from 'can-connect/helpers/map-deep-merge';
import connectMap from 'can-connect/can/map/map';
// @todo had to disable these features. When removing a user from the list of members, the groups_users attribute was well upgraded.
//import connectStore from 'can-connect/constructor/store/store';
//import connectConstructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';
import GroupUser from 'app/model/map/group_user';
import User from 'app/model/map/user';

var Group = DefineMap.extend('passbolt.model.Group', {
	id: 'string',
	name: 'string',
	created: 'string',
	modified: 'string',
	modifier: User,
	groups_users: GroupUser.List,

	/**
	 * Check if a user is a group manager of the group.
	 * @param user
	 * @returns {boolean}
	 */
	isGroupManager: function(user) {
		var isGroupManager = false;

		if(this.groups_users) {
			this.groups_users.forEach(function(groupUser) {
				if (groupUser.user_id == user.id && groupUser.is_admin == true) {
					isGroupManager = true;
				}
			});
		}
		if (this.my_group_user) {
			isGroupManager = this.my_group_user.is_admin;
		}

		return isGroupManager;
	},

	/**
	 * Check if a user can edit a group.
	 * @param user
	 * @returns {boolean}
	 */
	isAllowedToEdit: function(user) {
		var isGroupManager = this.isGroupManager(user),
			isAdmin = user.role.name == 'admin';
		return isGroupManager || isAdmin;
	},

	/**
	 * Attempt a dry run of delete.
	 *
	 * @param id
	 * @returns {*|jQuery.deferred}
	 */
	deleteDryRun : function() {
		return Ajax.request({
			url: 'groups/{id}/dry-run.json?api-version=2',
			type: 'DELETE',
			params: {id: this.id},
			silentNotify: true
		});
	}
});
DefineMap.setReference('Group', Group);
Group.List = DefineList.extend({'#': { Type: Group }});

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 * @see https://github.com/passbolt/passbolt_api/src/Model/Table/GroupsTable.php
 */
Group.validationRules = {
	id: [
		{rule: 'uuid'}
	],
	name: [
		{rule: 'required', message: __('A name is required.')},
		{rule: ['lengthBetween', 0, 255], message: __('The name length should be maximum %s characters.', 255)},
		{rule: 'utf8Extended', message: __('The name should be a valid utf8 string.')}
	]
};

/**
 * Find a group with all required association to display it.
 * @param {string} id The group id
 * @return {Promise}
 */
Group.findView = function(id) {
	var options = {
		id: id,
		contain: {
			'modifier': 1,
			'modifier.profile': 1,
			'group_user': 1,
			'group_user.user': 1,
			'group_user.user.profile': 1,
			'group_user.user.gpgkey': 1
		}
	};
	return Group.findOne(options);
};

Group.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
	Map: Group,
	List: Group.List,
	url: {
		resource: '/',
		destroyData: function(params) {
			var params = {
				id: params.id
			};
			return Ajax.request({
				url: 'groups/{id}.json?api-version=v2',
				type: 'DELETE',
				params: params
			});
		},
		getData: function(params) {
			return Ajax.request({
				url: 'groups/{id}.json?api-version=v2',
				type: 'GET',
				params: params
			});
		},
		getListData: function(params) {
			params['api-version'] = 'v2';
			return Ajax.request({
				url: 'groups.json',
				type: 'GET',
				params: params
			});
		}
	}
});

export default Group;
