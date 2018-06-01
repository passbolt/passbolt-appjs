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
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import Group from 'app/model/map/group';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Permission from 'app/model/map/permission';
import PermissionType from 'app/model/map/permission_type';
import PermissionsView from 'app/view/component/permission/permissions';
import Resource from 'app/model/map/resource'
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import TreeComponent from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';
import User from 'app/model/map/user';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/permission/permissions.stache!';
import permissionListItemTemplate from 'app/view/template/component/permission/permission_list_item.stache!';

var PermissionsComponent = Component.extend('passbolt.component.permission.Permissions', /** @static */ {

	defaults: {
		label: 'Permissions Controller',
        // Override the viewClass option.
		viewClass: PermissionsView,
		// The resource instance to bind the component on.
		acoInstance: null,
		// The list of changes.
		changes: [],
        // The template used to render the permissions component.
		template: template,
        // Override the silentLoading parameter.
        silentLoading: false,
		// The initial state the component will be initialized on (after start).
		state: 'loading',
		// Component callbacks
		callbacks: {
			shared: null
		}
	}

}, /** @prototype */ {

	// A list of permission change type dropdown components.
	_permissionChangeTypeDropDowns: {},
	// A list of permission delete button components.
	_permissionDeleteButtons: {},

	// Constructor like
	init: function (el, opts) {
		this._super(el, opts);
		this.setViewData('canAdmin', this._isAdmin());
	},

	/**
	 * Check that the current user has admin right on the resource.
	 * @return {boolean}
	 */
	_isAdmin: function() {
		var permission = this.options.acoInstance.permission;
		return permission.isAllowedTo(PermissionType.ADMIN);
	},

	/**
	 * After start hook.
	 * @see {mad.Component}
	 */
	afterStart: function() {
		var self = this;

		// List defined permissions
		this.permList = new TreeComponent('#js_permissions_list', {
			cssClasses: ['permissions'],
			viewClass: TreeView,
			itemClass: Permission,
			itemTemplate: permissionListItemTemplate,
			// The map to use to make jstree working with our permission model
			map: new MadMap({
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
						} else {
							return 'img/avatar/group_default.png';
						}
					}
				},
				permType: 'PermissionType.serial',
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
			})
		});
		this.permList.start();

		if (this._isAdmin()) {
			// Add an hidden element to the form to carry the aro id
			this.permAroHiddenTxtbx = new TextboxComponent('#js_perm_create_form_aro', {}).start();
			this.permAroHiddenTxtbx.setValue(this.options.acoInstance.id);

			// Notify the plugin that the share dialog is ready to interact with it.
			// The plugin will inject the form to grant new users.
			MadBus.trigger('passbolt.plugin.resource_share', {
				resourceId: this.options.acoInstance.id,
				armored: this.options.acoInstance.secrets[0].data
			});
		}

		// Load the component for the aco instance given in options.
		this.load(this.options.acoInstance);

		// Add a button to control the final save action
		this.options.saveChangesButton = new ButtonComponent('#js_rs_share_save', {
			// By default it is disabled, it will be enabled once the user has changed something.
			state: 'disabled'
		}).start();

		this.on();
	},

	/**
	 * Load a new permission in the list.
	 * @param permission
	 */
	loadPermission: function(permission) {
		var permTypeSelector = '#js_share_rs_perm_' + permission.id,
			actionSelector = '#js_actions_rs_perm_' + permission.id,
			permSelector = '#' + permission.id,
            availablePermissionTypes = {},
            permissionTypes = [1, 7, 15]; // Hardcoded for Resource and direct permission.

		// Gather the available permission types
        for (var permType in permissionTypes) {
            availablePermissionTypes[permissionTypes[permType]] = PermissionType.formatToString(permissionTypes[permType]);
        }

		// Add the permission to the list of permissions
		this.permList.insertItem(permission);

		// Add a selectbox to display the permission type (and allow to change)
		this._permissionChangeTypeDropDowns[permission.id] = new DropdownComponent(permTypeSelector + ' .js_share_rs_perm_type', {
			id: 'js_share_perm_type_' + permission.id,
			emptyValue: false,
			modelReference: 'passbolt.model.Permission.type',
			availableValues: availablePermissionTypes,
			// If the current user has no admin right, disable this action.
			state: this._isAdmin() ? 'ready' : 'disabled'
		})
			.start()
			.setValue(permission.type);

		// Add a button to allow the user to delete the permission
		this._permissionDeleteButtons[permission.id] = new ButtonComponent(actionSelector + ' .js_perm_delete', {
			id: 'js_share_perm_delete_' + permission.id,
			// If the current user has no admin right, disable this action.
			state: this._isAdmin() ? 'ready' : 'disabled'
		}).start();

		// If the permission is temporary and requires a final save action to be applied.
		if(permission.is_new) {
			// Mark the row as updated.
			$(permSelector).addClass('permission-updated');
			// Scroll the permissions list to the last permission.
			$(this.permList.element).scrollTop($(permSelector).offset().top);
		}
	},

	/**
	 * load permission for a given instance
	 * @param {mad.model.Model} obj The target instance
	 */
	load: function(obj) {
		var self = this;
		this.options.acoInstance = obj;
		this.options.changes = {};

		// change the state of the component to loading.
		this.setState('loading');

		// get permissions for the given resource
		return Permission.findAll({
			aco: 'resource',
			aco_foreign_key: this.options.acoInstance.id,
			contain: {group:1, user:1, 'user.profile': 1}
		}).then(function (permissions) {
			for (var i=0; i<permissions.length; i++) {
				self.loadPermission(permissions[i]);
			}
			// Check the permission must have a owner case
			// This check is not necessary if the current user has no admin right, as all actions
			// will be disabled.
			if (self._isAdmin()) {
				self.checkOwner();
			}

			// change the state of the component to loading
			self.setState('ready');
		}, function() {
			console.log('an error occured');
			console.log(arguments);
		});
	},

	/**
	 * Refresh
	 */
	refresh: function() {
		var self = this;

		// hide the user feedback.
		$('#js_permissions_changes').addClass('hidden');

		// reset the permissions list.
		this.permList.reset();

		// if the user lost his admin right, hide the add users form.
		if (!this._isAdmin()) {
			$('#js_permissions_create_wrapper', this.element).hide();
		}

		// reload the component with the updated permissions
		this.load(this.options.acoInstance)
			.done(function() {
				// Switch the component in ready state.
				self.setState('ready');
			});
	},

	/**
	 * Show the apply feedback.
	 */
	showApplyFeedback: function() {
		var $permissionChanges = $('#js_permissions_changes');
		$permissionChanges.removeClass('hidden');

		// Enable the save change button
		if (this.options.saveChangesButton.state.is('disabled')) {
			this.options.saveChangesButton.setState('ready');
		}
	},

	/**
	 * Hide the apply feedback.
	 */
	hideApplyFeedback: function() {
		var $permissionChanges = $('#js_permissions_changes');
		$permissionChanges.addClass('hidden');

		// Disable the save change button
		if (this.options.saveChangesButton.state.is('ready')) {
			this.options.saveChangesButton.setState('disabled');
		}
	},

	/**
	 * Owner permission check.
	 * A permission must have at least a owner.
	 * If there is only one owner, the permissions should be locked.
	 */
	checkOwner: function() {
		var self = this,
			ownerPermissions = [];

		// Get all the owner.
		this.permList.options.items.each(function (item) {
			var isOwner = false;
			// Is owner ?
			if (item.type == 15) {
				isOwner = true;
			}
			// A permission has been updated
			if (typeof self.options.changes[item.id] != 'undefined') {
				// got owner right
				if (self.options.changes[item.id].Permission.type == 15) {
					isOwner = true;
				} else {
					isOwner = false;
				}
			}
			// Add the permission to the list of owner permissions
			if (isOwner) {
				ownerPermissions.push(item);
			}
		});

		// If only one owner, make the edition of the owner permission unavailable
		if (ownerPermissions.length == 1) {
			var permTypeDropdown = this._permissionChangeTypeDropDowns[ownerPermissions[0].id];
			var permDeleteButton = this._permissionDeleteButtons[ownerPermissions[0].id];

			// Disable the permission type field and the permission delete button
			permTypeDropdown.setState('disabled');
			permDeleteButton.setState('disabled');
		}
		// If several owners, make the permission type dropdown and permission delete button enabled
		else if (ownerPermissions.length > 1) {
			for (var i in ownerPermissions) {
				var permTypeDropdown = this._permissionChangeTypeDropDowns[ownerPermissions[i].id];
				var permDeleteButton = this._permissionDeleteButtons[ownerPermissions[i].id];

				// Disable the permission type field and the permission delete button
				permTypeDropdown.setState('ready');
				permDeleteButton.setState('ready');
			}
		}
	},

	/**
	 * Add a new permission.
	 * @param permission The permission to add
	 */
	addPermission: function(permission) {
		// Load this temporary permission in the permissions list component.
		this.loadPermission(permission);

		// Store the change.
		this.options.changes[permission.id] = {
			Permission: {
				isNew: true,
				aco: permission.aco,
				aco_foreign_key: permission.aco_foreign_key,
				aro: permission.aro,
				aro_foreign_key: permission.aro_foreign_key,
				type: permission.type
			}
		};

		// Propagate an event notifying other component regarding the changes.
		$(this.element).trigger('changed', this.options.changes);
		// Display the change feedback.
		this.showApplyFeedback();
	},

	/**
	 * Update an existing permission
	 * @param id The permission id
	 * @param type The permission type
	 */
	updateTypePermission: function(id, type) {
		// Store the change in the list of permissions changes.
		// If a permission change already exists for the given permission id.
		if (this.options.changes[id]) {
			this.options.changes[id].Permission.type = type;
		}
		// Otherwise add a new update change.
		else {
			this.options.changes[id] = {
				Permission: {
					id: id,
					type: type
				}
			}
		}

		// Propagate an event notifying other component regarding the changes.
		$(this.element).trigger('changed', this.options.changes);
		// Display the change feedback.
		this.showApplyFeedback();

		// Check the permission must have a owner case
		this.checkOwner();
	},

	/**
	 * Delete a permission
	 * @param permission The permission to update
	 */
	deletePermission: function(permission) {
		// Remove the permission from the list.
		this.permList.removeItem(permission);

		// Store the change in the list of permissions changes.
		// If a permission change already exists for the given permission id.
		if (typeof this.options.changes[permission.id] != 'undefined') {

			// If the changes is relative to a new permission. Remove this new temporary change.
			if (typeof this.options.changes[permission.id].Permission.isNew != 'undefined' &&
				typeof this.options.changes[permission.id].Permission.isNew) {

				// Remove the change.
				delete this.options.changes[permission.id];

				// Notify the plugin, the user can be listed by the autocomplete again.
				MadBus.trigger('passbolt.share.remove_permission', {
					userId: permission.aro_foreign_key,
					isTemporaryPermission: true
				});
			}
			// Otherwise replace it with a delete change.
			else {
				this.options.changes[permission.id] = {
					Permission: {
						id : permission.id,
						delete : 1
					}
				};
				// Notify the plugin, the user shouldn't be listed by the autocomplete anymore.
				MadBus.trigger('passbolt.share.remove_permission', {
					userId: permission.aro_foreign_key,
					isTemporaryPermission: false
				});
			}
		}
		// Otherwise add a new delete change.
		else {
			this.options.changes[permission.id] = {
				Permission: {
					id : permission.id,
					delete : 1
				}
			};
			// Notify the plugin, the user shouldn't be listed by the autocomplete anymore.
			MadBus.trigger('passbolt.share.remove_permission', {
				userId: permission.aro_foreign_key,
				isTemporaryPermission: false
			});
		}

		// Regarding the length of the permissions changes show or hide the apply feedback.
		if ($.isEmptyObject(this.options.changes)) {
			this.hideApplyFeedback();
		}
		else {
			// Propagate an event notifying other component regarding the changes.
			$(this.element).trigger('changed', this.options.changes);
			// Display the change feedback.
			this.showApplyFeedback();
		}

		// Check the permission must have a owner case
		this.checkOwner();
	},

	/**
	 * Save the permissions changes.
	 * @param {array} armoreds (optional) the secret encrypted for new users.
	 */
	save: function(armoreds) {
		var self = this,
			data = {},
			aco = this.options.acoInstance.constructor.shortName,
			acoForeignKey = this.options.acoInstance.id;

		// Add the changes to the array that will be send to the server.
		data.Permissions = [];
		for (var i in this.options.changes) {
			data.Permissions.push(this.options.changes[i]);
		}

		// If the secret has been encrypted for new users, add the armored
		// secrets.
		if (armoreds) {
			data.Secrets = [];
			for (var userId in armoreds) {
				data.Secrets.push({
					Secret: {
						resource_id: acoForeignKey,
						user_id: userId,
						data: armoreds[userId]
					}
				});
			}
		}

		// Share the resource
		this.options.acoInstance.share(data)
			.then(function() {
				if (self.options.callbacks.shared) {
					self.options.callbacks.shared();
				}
			});
	},

	/* ************************************************************** */
	/* LISTEN TO THE MODEL EVENTS */
	/* ************************************************************** */

	/**
	* Listen to the destroyed event on the edited/shared resource.
	*
	* It can happen when :
	* * the user removes his own permission ;
	* * someone removed remotely the user permission ;
	* * the resource has been destroyed remotely.
	*/
	'{acoInstance} destroyed': function () {
		// For now do nothing, the only case which is managed is: the user removes his own permission.
		// This case is managed in the save function.
	},

	/* ************************************************************** */
	/* LISTEN TO THE PLUGIN EVENTS */
	/* ************************************************************** */

	/**
	 * Once the secret has been encrypted for the new users selected, the plugin
	 * trigger resource_share_encrypted event.
	 * Save the permission changes and the new encrypted secrets.
	 */
	'{mad.bus.element} resource_share_encrypted': function(el, ev, armoreds) {
		// Save the permissions changes including the secret encrypted for the new users.
		this.save(armoreds);
	},

	/**
	 * The encryption has been canceled.
	 */
	'{mad.bus.element} passbolt.plugin.share.canceled': function(el, ev) {
		this.setState('ready');
	},

	/**
	 * Listen when a permission has been added through the plugin.
	 * @todo v1 support to be removed
	 */
	'{mad.bus.element} resource_share_add_permission': function(el, ev, data) {
		// V1 format to v2 manually.
		var dataV2 = {
			aco: data.aco,
			aco_foreign_key: data.aco_foreign_key,
			aro: data.aro,
			aro_foreign_key: data.aro_foreign_key,
			type: data.type,
			is_new: true
		};
		if (data.User) {
			dataV2.user = {
				id: data.User.User.id,
					username: data.User.User.username,
					profile: {
					id: data.User.Profile.id,
						first_name: data.User.Profile.first_name,
						last_name: data.User.Profile.last_name
				},
				gpgkey: {
					id: data.User.Gpgkey.id,
						armored_key: data.User.Gpgkey.armored_key
				}
			};
		} else {
			dataV2.group = {
				id: data.Group.Group.id,
				name: data.Group.Group.name
			}
		}
		var permission = new Permission(dataV2);

		// Fake the id, so the the permission can be retrieve and associated to other components, such as the
		// delete button or the change permission type dropdown.
		permission.id = uuid();
		this.addPermission(permission);
	},

	/* ************************************************************** */
	/* LISTEN TO THE COMPONENT EVENTS */
	/* ************************************************************** */

	/**
	 * The user want to remove a permission
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @param {passbolt.model.Permission} permission The permission to remove
	 */
	 ' request_permission_delete': function (el, ev, permission) {
		this.deletePermission(permission);
	},

	/**
	 * A permission has been updated.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @param {string} permission The permission to edit
	 * @param {string} type The new permission type
	 */
	 ' request_permission_edit': function (el, ev, permission, type) {
		this.updateTypePermission(permission.id, type);
	},

	/**
	 * The user request the form to be saved.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{saveChangesButton.element} click': function(el, ev) {
		var usersIds = [];

		// Switch the component in loading state.
		// The ready state will be restored once the component will be refreshed.
		this.setState('loading');

		// Extract the users the secret should be encrypted for by extracting the information from the changes.
		// This information shouldn't be trusted.
		for (var permissionId in this.options.changes) {

			// If the permission is a new permission, add the user id the permission is targeting to the
			// list of users the secret should be encrypted for.
			if (this.options.changes[permissionId].Permission.isNew) {
				usersIds.push(this.options.changes[permissionId].Permission.aro_foreign_key);
			}
		}

		// Request the plugin to encrypt the secret for the new users.
		// Once the plugin has encrypted the secret, it sends back an event resource_share_encrypted.
		MadBus.trigger('passbolt.share.encrypt');
	},

	/* ************************************************************** */
	/* LISTEN TO ANY STATES CHANGES */
	/* ************************************************************** */

	/**
	 * Listen to any changes relative to the state Loading
	 * Override this function if you want add a specific behavior.
	 *
	 * @param {boolean} go Entering or leaving the state
	 */
	stateLoading: function (go) {
		var saveButton = this.options.saveChangesButton;
		if (go) {
			if (saveButton) {
				saveButton.setState('disabled');
			}
		}
		else {
			if (this.options.changes.length) {
				saveButton.setState('ready');
			}
		}

		this._super(go);
	}

});

export default PermissionsComponent;
