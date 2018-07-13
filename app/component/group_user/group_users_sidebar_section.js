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
import GroupUser from 'app/model/map/group_user';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';
import TreeComponent from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';
import User from 'app/model/map/user';

import template from 'app/view/template/component/group_user/group_users_sidebar_section.stache!';
import groupMembersListItemTemplate from 'app/view/template/component/group/group_members_list_item.stache!';

var GroupUsersSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.group_user.GroupUsersSidebarSection', /** @static */ {

	defaults : {
		label: 'Sidebar Section Group Users Component',
		template: template,
		group: null,
		tree: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	beforeRender: function () {
		this._super();
		this.setViewData('editable', this.options.group.isAllowedToEdit(User.getCurrent()));
		this.setViewData('group', this.options.group);
	},

	/**
	 *
	 * Initialize the tree
	 * @return {mad.Component}
     */
	_initTree: function(group) {
		var map = this._getTreeMap();
		var tree = new TreeComponent('#js_group_details_group_members_list', {
			label: 'Group Members List Controller',
			itemClass: GroupUser,
			itemTemplate: groupMembersListItemTemplate,
			map: map
		});
		tree.start();
		tree.load(group.groups_users);

		this.options.tree = tree;
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
			userFullName: {
				key: 'user.profile',
				func: function(profile) {
					return profile.fullName();
				}
			},
			isAdmin: 'is_admin',
			userAvatarPath: {
				key: 'user.profile',
				func: function(profile) {
					return profile.avatarPath('small');
				}
			}
		});
	},

	/**
	 * Observe when the item is updated
	 * @param {passbolt.model} item The updated item
	 */
	'{group} updated': function () {
		this.refresh();
	},

	/* ************************************************************** */
	/* LISTEN TO THE DOM EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the edit button is clicked
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{element} a#js_edit_members_button click': function (el, ev) {
		ev.preventDefault();
		const group = this.options.group;
		MadBus.trigger('request_group_edition', group);
	},

	/**
	 * Observe when accordion-header is clicked.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{element} .accordion-header click': function(el, ev) {
		if (this.options.tree == null) {
			Group.findView(this.options.group.id)
				.then(group => this._initTree(group));
		}
	}

});

export default GroupUsersSidebarSectionComponent;
