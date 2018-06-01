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
import Group from 'app/model/map/group';
import MadMap from 'passbolt-mad/util/map/map';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';
import Tree from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';

import template from 'app/view/template/component/group_user/user_groups_sidebar_section.stache!';
import groupListItemTemplate from 'app/view/template/component/group_user/user_groups_list_item.stache!';

var UserGroupsSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.group_user.UserGroupsSidebarSection', /** @static */ {

	defaults : {
		label: 'Sidebar Section User Groups Component',
		template: template,
		user: null,
		state: 'loading'
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		var self = this;

		var tree = this._initTree();
		this._findUserGroups()
			.then(function(groups) {
				tree.load(groups);
				self.setState('ready');
				tree.setState('ready');
			});
	},

	/**
	 *
	 * Initialize the tree
	 * @return {mad.Component}
     */
	_initTree: function() {
		var map = this._getTreeMap();

		var tree = new Tree('#js_user_groups_list', {
			cssClasses: ['groups', 'shared-with'],
			viewClass: TreeView,
			itemClass: Group,
			itemTemplate: groupListItemTemplate,
			prefixItemId: 'js_user_groups_list_',
			map: map,
			state: 'loading'
		});
		tree.start();

		return tree;
	},

	/**
	 * Get the tree map
	 *
	 * @return {mad.Map}
     */
	_getTreeMap: function() {
		return new MadMap({
			id: 'id',
			name: 'name',
			role: {
				key: 'groups_users',
				func: (value, map, item, mappedValues) => this._mapRoleField(value, map, item, mappedValues)
			}
		});
	},

	/**
	 * Map the role field
	 *
	 * @inheritdoc
     */
	_mapRoleField: function(value, map, item, mappedValues) {
		return value.reduce((carry, item) => {
			if (item.user_id == this.options.user.id) {
				carry = item.is_admin ? __('Group manager') : __('Member');
			}
			return carry;
		}, null);
	},

	/**
	 * Find the groups the users is member of
	 *
	 * @return {promise}
	 */
	_findUserGroups: function() {
		var findOptions = {
			contain: {group_user: 1},
			order: ['Group.name ASC'],
			filter: {
				'has-users' : this.options.user.id
			}
		};
		return Group.findAll(findOptions);
	},

	/* ************************************************************** */
	/* LISTEN TO THE MODEL EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when a group is created.
	 * Update the component.
	 *
	 * @param {mad.Model} group The updated group
	 * @param {object} group The updated group
	 * @param {passbolt.model.Group} group The updated group
	 */
	'{passbolt.model.Group} created': function (model, event, group) {
		this.refresh();
	},

	/**
	 * Observe when a group is updated.
	 * Update the component.
	 *
	 * @param {mad.Model} group The updated group
	 * @param {object} group The updated group
	 * @param {passbolt.model.Group} group The updated group
	 */
	'{passbolt.model.Group} updated': function (model, event, group) {
		this.refresh();
	},

	/**
	 * Observe when a group is deleted.
	 * Update the component.
	 *
	 * @param {mad.Model} group The updated group
	 * @param {object} group The updated group
	 * @param {passbolt.model.Group} group The updated group
	 */
	'{passbolt.model.Group} deleted': function (model, event, group) {
		this.refresh();
	}

});

export default UserGroupsSidebarSectionComponent;
