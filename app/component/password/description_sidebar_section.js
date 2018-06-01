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
import DescriptionView from 'app/view/component/password/description_sidebar_section';
import PermissionType from 'app/model/map/permission_type';
import ResourceEditDescriptionForm from 'app/form/resource/edit_description';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/password/description_sidebar_section.stache!';

var DescriptionSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.password.DescriptionSidebarSection', /** @static */ {

	defaults: {
		label: 'Sidebar Section Description Controller',
		viewClass: DescriptionView,
		template: template,
		resource: null,
		editDescriptionFormCtrl: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	beforeRender: function () {
		this._super();
		// pass the new resource to the view
		var resource = this.options.resource;
		this.setViewData('resource', resource);
		this.setViewData('editable', resource.permission.isAllowedTo(PermissionType.UPDATE));
	},

	/**
	 * @inheritdoc
	 */
	afterStart : function() {
		var self = this;

		// create a form to edit the description
		var resource = this.options.resource;
		var form = new ResourceEditDescriptionForm('#js_rs_details_edit_description', {
			resource: resource,
			state: 'hidden',
			data: {
				Resource: resource
			},
			callbacks: {
				submit: function (formData) {
					self._saveResource(resource, formData);
				}
			}
		}).start();
		this.options.editDescriptionFormCtrl = form;
	},

	/**
	 * Save a resource after the description is edited.
	 *
	 * @param {Resource} resource The target resource
	 * @param {mad.Form} form The form data object
	 */
	_saveResource: function(resource, formData) {
		resource.description = formData['Resource']['description']
		resource.__FILTER_CASE__ = 'edit_description';
		resource.save();
	},

	/**
	 * Observe when the user want to edit the instance's resource description
	 * @param {HTMLElement} el The element
	 * @param {HTMLEvent} ev The event which occurred
	 */
	' request_resource_description_edit' : function(el, ev) {
		if(!this.state.is('edit')) {
			this.setState('edit');
		}
		else {
			this.setState('ready');
		}
	},

	/**
	 * Observe when the item is updated
	 * @param {passbolt.model} item The updated item
	 */
	'{resource} updated': function (item) {
		this.refresh();
	},

	/* ************************************************************** */
	/* LISTEN TO THE STATE CHANGES */
	/* ************************************************************** */

	/**
	 * Switch to edit mode
	 * @param {boolean} go Go or leave the state
	 */
	'stateEdit': function(go) {
		if (go) {
			this.options.editDescriptionFormCtrl.setState('ready');
			this.view.showDescription(false);
		}
		else {
			this.options.editDescriptionFormCtrl.setState('hidden');
            this.options.editDescriptionFormCtrl.reset();
			this.view.showDescription(true);
		}
	}
});

export default DescriptionSidebarSectionComponent;