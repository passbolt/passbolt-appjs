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
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Permission from 'app/model/map/permission';
import PermissionsSidebarSectionView from 'app/view/component/permission/permissions_sidebar_section';
import PermissionType from 'app/model/map/permission_type';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';
import TreeComponent from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';

import template from 'app/view/template/component/permission/permissions_sidebar_section.stache!';
import permissionlistItemTemplate from 'app/view/template/component/permission/permission_list_item_2.stache!';

var PermissionsSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.permission.PermissionsSidebarSection', /** @static */ {

	defaults : {
		label : 'Sidebar Section Permissions Component',
		viewClass : PermissionsSidebarSectionView,
		template : template,
		acoInstance : null,
		state: 'loading'
	}

}, /** @prototype */ {

	/**
	 * The permissions list.
	 */
	permissionsList: null,

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		this._initPermissionsList();
		this._loadPermissions();
		this._super();
	},

	/**
	 * Init the permissions list
	 */
	_initPermissionsList: function() {
		var map = this._getPermissionsListMap();
		var component = new TreeComponent('#js_rs_details_permissions_list', {
			cssClasses: ['permissions', 'shared-with'],
			viewClass: TreeView,
			itemClass: Permission,
			itemTemplate: permissionlistItemTemplate,
			map: map
		});
		component.start();
		this.permissionsList = component;
	},

	/**
	 * Get the list map
	 *
	 * @returns {mad.Map}
     */
	_getPermissionsListMap: function() {
		return new MadMap({
			id: 'id',
			aroLabel: {
				key: 'aro',
				func: function(aro, map, obj) {
					return aro.toLowerCase();
				}
			},
			aroAvatarPath: {
				key: 'id',
				func: function(user, map, obj) {
					if (obj.aro == 'User') {
						return obj.user.profile.avatarPath('small');
					} else if (obj.aro == 'Group') {
						return 'img/avatar/group_default.png';
					}
				}
			},
			permLabel: {
				key: 'type',
				func: function(type, map, obj) {
					return PermissionType.formatToString(type);
				}
			},
			acoLabel: {
				key: 'aco_foreign_key',
				func: function(aco_foreign_key, map, obj) {
					if (obj.aro == 'User') {
						return obj.user.profile.fullName();
					} else if (obj.aro == 'Group') {
						return obj.group.name;
					}
				}
			},
			acoDetails: {
				key: 'aco_foreign_key',
				func: function(aco_foreign_key, map, obj) {
					if (obj.aro == 'User') {
						return obj.user.username;
					} else if (obj.aro == 'Group') {
						return __('group');
					}
				}
			}
		});
	},

	/**
	 * @inheritdoc
	 */
	beforeRender: function () {
		this._super();

		// Tell the view if the user has the admin right for the given resource.
		var permission = this.options.acoInstance.permission;
		var administrable = permission.isAllowedTo(PermissionType.ADMIN);
		this.setViewData('administrable', administrable);
	},

	/**
	 * Retrieve and load permissions in the list.
	 *
	 * @returns {promise}
	 */
	_loadPermissions: function() {
		var self = this,
			aco_name = 'resource',
			aco_foreign_key = this.options.acoInstance.id;

		this.setState('loading');

		// Reset the list
		this.permissionsList.reset();

		// Retrieve the permissions.
		return Permission.findAll({
			aco: aco_name,
			aco_foreign_key: aco_foreign_key,
			contain: {group:1, user:1, 'user.profile': 1}
		}).then(function (permissions, response, request) {
			self.permissionsList.load(permissions);
			self.setState('ready');
		});
	},

	/**
	 * Observe when the item is updated
	 * @param {passbolt.model} item The updated item
	 */
	'{acoInstance} updated': function (item) {
		this.refresh();
	},

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS                                      */
	/* ************************************************************** */

	/**
	 * Observe when the user want to edit the instance's resource description
	 * @param {HTMLElement} el The element
	 * @param {HTMLEvent} ev The event which occurred
	 */
	' request_resource_permissions_edit' : function(el, ev) {
		MadBus.trigger('request_resource_sharing', this.options.acoInstance);
	}

});

export default PermissionsSidebarSectionComponent;
