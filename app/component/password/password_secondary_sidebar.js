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
import CommentsSection from 'app/component/comment/comments_sidebar_section';
import Config from 'passbolt-mad/config/config';
import DescriptionSection from 'app/component/password/description_sidebar_section';
import InformationSection from 'app/component/password/information_sidebar_section';
import MadBus from 'passbolt-mad/control/bus';
import PasswordSecondarySidebarView from 'app/view/component/password/password_secondary_sidebar';
import PermissionsSection from 'app/component/permission/permissions_sidebar_section';
import SecondarySidebarComponent from 'app/component/workspace/secondary_sidebar';
import TagsSection from 'app/component/password/tags_sidebar_section';

import template from 'app/view/template/component/password/password_secondary_sidebar.stache!';

var PasswordSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.password.PasswordSecondarySidebar', /** @static */ {

	defaults: {
		label: 'Resource Details',
		viewClass: PasswordSecondarySidebarView,
		template: template
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	beforeRender: function () {
		this._super();
		if (this.options.selectedItem != null) {
			this.setViewData('resource', this.options.selectedItem);
		}
	},

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		this._initInformationSection();
		this._initDescriptionSection();
		this._initTagsSection();
		this._initPermissionsSection();
		this._initCommentsSection();
		this._super();
	},

	/**
	 * Initialize the information section
	 */
	_initInformationSection: function() {
		var informationComponent = new InformationSection('#js_rs_details_information', {
			resource: this.options.selectedItem
		});
		informationComponent.start();
	},

	/**
	 * Initialize the description section
	 */
	_initDescriptionSection: function() {
		var descriptionComponent = new DescriptionSection('#js_rs_details_description', {
			resource: this.options.selectedItem,
			cssClasses: ['closed']
		});
		descriptionComponent.start();
	},

	/**
	 * Initialize the tags section
	 */
	_initTagsSection: function() {
		var plugins = Config.read('server.passbolt.plugins');
		if (plugins && plugins.tags) {
			var tagsComponent = new TagsSection('#js_rs_details_tags', {
				resource: this.options.selectedItem,
				cssClasses: ['closed']
			});
			tagsComponent.start();
		}
	},

	/**
	 * Initialize the permissions section
     */
	_initPermissionsSection: function() {
		var permissionsComponent = new PermissionsSection('#js_rs_details_permissions', {
			acoInstance: this.options.selectedItem,
			cssClasses: ['closed']
		});
		permissionsComponent.start();
	},

	/**
	 * Initialize the comments section
     */
	_initCommentsSection: function() {
		var commentsComponent = new CommentsSection('#js_rs_details_comments', {
			resource: this.options.selectedItem,
			foreignModel: 'Resource',
			foreignKey: this.options.selectedItem.id,
			cssClasses: ['closed']
		});
		commentsComponent.start();
	},

	/**
	 * Observe when the item is updated
	 * @param {passbolt.model} item The updated item
	 */
	'{selectedItem} updated': function (item) {
		this.setTitle(item.name)
	}
});

export default PasswordSecondarySidebarComponent;
