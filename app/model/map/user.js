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
import canEvent from 'can-event';
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
import Profile from 'app/model/map/profile';
import Response from 'passbolt-mad/net/response';
import Role from 'app/model/map/role';

var User = DefineMap.extend('passbolt.model.User', {
	id: 'string',
	username: 'string',
	email: 'string',
	active: 'boolean',
	profile: Profile,
	role: Role,

	/**
	 * Is the user an admin.
	 * @return boolean
	 */
	isAdmin: function() {
		return this.role && this.role.name == 'admin';
	},

	/**
	 * Attempt a dry run of delete.
	 * @returns {Promise}
	 */
	deleteDryRun : function() {
		// @todo To migrate to API v2
		return Ajax.request({
			url: 'users/' + this.id + '/dry-run.json',
			type: 'DELETE',
			silentNotify: true
		});
	}
});
DefineMap.setReference('User', User);
User.List = DefineList.extend({'#': { Type: User }});

User.validationRules = {
	id: [
		{rule: 'uuid'}
	],
	username: [
		{rule: 'required', message:  __('A username is required.')},
		{rule: 'notEmpty', message:  __('A username is required.')},
		{rule: ['lengthBetween', 0, 255], message: __('The username length should be maximum 254 characters.')},
		{rule: ['email'], message: __('The username should be a valid email address.')}
	]
};

/**
 * The current logged-in user
 * @type {User}
 */
User.current = null;

/**
 * Get the logged-in user.
 * @return {User}
 */
User.getCurrent = function() {
	return User.current;
};

/**
 * Set the logged-in user.
 * @param user {User} The logged-in user
 */
User.setCurrent = function(user) {
	User.current = user;
};

/**
 * Update the user avatar
 * @param params {array} The file to save
 */
User.prototype.saveAvatar = function(file) {
	var request = {};
	request._xhr = null;
	request.params = new FormData();
	request.params.id = this.id;
	request.params.append('id', this.id);
	request.params.append('profile[avatar][file]', file);

	// @todo Cannot use Ajax.request, the can ajax layer cannot use the multipart/form-data content type.
	Ajax._triggerAjaxStartEvent(request);
	return $.ajax({
		url: 'users/' + this.id + '.json?api-version=v2',
		method: 'POST',
		cache: false,
		contentType: false,
		processData: false,
		data: request.params,
		headers: {'X-CSRF-Token': Config.read('app.csrfToken')},
		beforeSend: (xhr) => { request._xhr = xhr; }
	}).then(data => {
		return Ajax.handleSuccess(request, data)
			.then(data => {
				this.profile.assign({avatar: data.profile.avatar});
				canEvent.dispatch.call(this, 'updated', [this]);
				return Promise.resolve(this);
			});
	}, jqXHR => {
		var jsonData = {};
		if (jqXHR.responseText) {
			try {
				jsonData = $.parseJSON(jqXHR.responseText);
			} catch(e) { }
		}
		return Ajax.handleError(request, jsonData);
	});
};

User.connection = connect([connectParse, connectDataUrl, connectConstructor, connectStore, connectMap, connectConstructorHydrate], {
	Map: User,
	List: User.List,
	url: {
		resource: '/',
		createData: function(params) {
			return Ajax.request({
				url: 'users.json?api-version=v2',
				type: 'POST',
				params: params
			});
		},
		updateData: function(params) {
			// Filter the attributes that need to be send by the request.
			var params = User.filterAttributes(params);
			return Ajax.request({
				url: 'users/{id}.json?api-version=v2',
				type: 'PUT',
				params: params
			});
		},
		getData: function(params) {
			params = params || {};
			return Ajax.request({
				url: 'users/{id}.json?api-version=v2',
				type: 'GET',
				params: params
			});
		},
		getListData: function(params) {
			params = params || {};
			params['api-version'] = 'v2';
			return Ajax.request({
				url: 'users.json',
				type: 'GET',
				params: params
			});
		},
		destroyData: function(params) {
			var params = {
				id: params.id,
				'api-version': 'v2'
			};
			return Ajax.request({
				url: 'users/{id}.json',
				type: 'DELETE',
				params: params
			});
		}
	}
});

export default User;
