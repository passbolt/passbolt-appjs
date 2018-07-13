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
import ActionsTabComponent from 'app/component/password/actions_tab';
import BreadcrumbComponent from 'app/component/password/workspace_breadcrumb';
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import Config from 'passbolt-mad/config/config';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import DialogComponent from 'passbolt-mad/component/dialog';
import GridComponent from 'app/component/password/grid';
import MadBus from 'passbolt-mad/control/bus';
import PrimaryMenuComponent from 'app/component/password/workspace_primary_menu';
import PrimarySidebarComponent from 'app/component/password/primary_sidebar';
import ResourceCreateForm from 'app/form/resource/create';
import SecondaryMenuComponent from 'app/component/workspace/secondary_menu';
import PasswordSecondarySidebarComponent from 'app/component/password/password_secondary_sidebar';

import Favorite from 'app/model/map/favorite';
import Filter from 'app/model/map/filter';
import Group from 'app/model/map/group';
import Resource from 'app/model/map/resource';

import createButtonTemplate from 'app/view/template/component/workspace/create_button.stache!';
import importButtonTemplate from 'app/view/template/component/workspace/import_button.stache!';
import resourceDeleteConfirmTemplate from 'app/view/template/component/password/delete_confirm.stache!';
import template from 'app/view/template/component/password/workspace.stache!';

var PasswordWorkspaceComponent = Component.extend('passbolt.component.password.Workspace', /** @static */ {

	defaults: {
		name: 'password_workspace',
		template: template,
		// The current selected resources
		selectedRs: new Resource.List(),
		//// The current selected groups
		selectedGroups: new Group.List(),
		// The current filter
		filter: null,
		// Override the silentLoading parameter.
		silentLoading: false,
		// Models to listen to
		Resource: Resource
	},

	/**
	 * Return the default filter used to filter the workspace
	 * @return {Filter}
	 */
	getDefaultFilterSettings: function() {
		return new Filter({
			id: 'default',
			label: __('All items'),
			order: ['Resource.modified DESC']
		});
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	afterStart: function() {
		this._initPrimaryMenu();
		this._initSecondaryMenu();
		this.options.mainButton = this._initMainActionButton();
		this._initImportButton();
		this._initBreadcrumb();
		this._initPrimarySidebar();
		this.options.grid = this._initGrid();
		this._initSecondarySidebar();

		// Filter the workspace
		var filter = this.constructor.getDefaultFilterSettings();
		MadBus.trigger('filter_workspace', {filter});

		this.on();
	},

	/**
	 * Destroy the workspace.
	 */
	destroy: function() {
		// Be sure that the primary & secondary workspace menus controllers will be destroyed also.
		$('#js_wsp_primary_menu_wrapper').empty();
		$('#js_wsp_secondary_menu_wrapper').empty();
		$('.main-action-wrapper').empty();

        // Destroy Selected resource.
        this.options.selectedRs.splice(0, this.options.selectedRs.length);

        // Call parent.
		this._super();
	},

	/**
	 * Init the primary workspace menu.
	 * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
	 * this component is destroyed.
	 * @see destroy()
     */
	_initPrimaryMenu: function() {
		var menu = ComponentHelper.create(
			$('#js_wsp_primary_menu_wrapper'),
			'last',
			PrimaryMenuComponent, {
				selectedRs: this.options.selectedRs
			}
		);
		menu.start();
	},

	/**
	 * Init the secondary workspace menu.
	 * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
	 * this component is destroyed.
	 * @see destroy()
	 */
	_initSecondaryMenu: function() {
		var menu = ComponentHelper.create(
			$('#js_wsp_secondary_menu_wrapper'),
			'last',
			SecondaryMenuComponent, {
				selectedItems: this.options.selectedRs
			}
		);
		menu.start();
	},

	/**
	 * Initialize the workspace main action button.
	 * @returns {mad.Component}
     */
	_initMainActionButton: function() {
		var button = ComponentHelper.create(
			$('.main-action-wrapper'),
			'last',
			ButtonComponent, {
				id: 'js_wsp_create_button',
				template: createButtonTemplate,
				tag: 'button',
				cssClasses: ['button', 'primary']
			}
		);
		button.start();
		return button;
	},

	/**
	 * Initialize the workspace import action button.
	 * @returns {mad.Component}
	 */
	_initImportButton: function() {
		if (Config.read('server.passbolt.plugins.import')) {
			var button = ComponentHelper.create(
				$('.main-action-wrapper'),
				'last',
				ButtonComponent, {
					id: 'js_wsp_pwd_import_button',
					template: importButtonTemplate,
					tag: 'button',
					cssClasses: ['button']
				}
			);
			button.start();
			this.options.importButton = button;
			return this.options.importButton;
		}
		return null;
	},

	/**
	 * Initialize the workspace breadcrumb
     */
	_initBreadcrumb: function() {
		var component = new BreadcrumbComponent('#js_wsp_password_breadcrumb', {
			rootFilter: PasswordWorkspaceComponent.getDefaultFilterSettings()
		});
		component.start();
	},

	/**
	 * Initialize the primary sidebar component
	 */
	_initPrimarySidebar: function() {
		var component = new PrimarySidebarComponent('#js_password_workspace_primary_sidebar', {
			defaultFilter: PasswordWorkspaceComponent.getDefaultFilterSettings(),
			selectedRs: this.options.selectedRs,
			selectedGroups: this.options.selectedGroups
		});
		component.start();
	},

	/**
	 * Initialize the grid component
	 */
	_initGrid: function() {
		var component = new GridComponent('#js_wsp_pwd_browser', {
			selectedRs: this.options.selectedRs
		});
		component.start();
		return component;
	},

	/**
	 * Initialize the secondary sidebar component
	 */
	_initSecondarySidebar: function() {
		new PasswordSecondarySidebarComponent('.js_wsp_pwd_sidebar_second', {
			selectedItems: this.options.selectedRs
		});
	},

	/**
	 * Open the resource create dialog.
	 *
	 * @param {Resource} resource The target resource entity.
	 */
	openCreateResourceDialog: function(resource) {
		var self = this;
		var dialog = DialogComponent.instantiate({
			label: __('Create Password'),
			cssClasses : ['create-password-dialog', 'dialog-wrapper']
		}).start();

		// Attach the form to the dialog
		var form = dialog.add(ResourceCreateForm, {
			data: resource,
			callbacks : {
				submit: function (data) {
					delete data['Resource']['id'];
					var resourceToSave = new Resource(data['Resource']);
					self._saveResource(resourceToSave, form, dialog);
				}
			}
		});
		form.load(resource);
	},

	/**
	 * Save a resource after creating/editing it with the create/edit forms.
	 *
	 * @param {Resource} resource The target resource
	 * @param {mad.Form} form The form object
	 * @param {Dialog} dialog The dialog object
	 */
	_saveResource: function(resource, form, dialog) {
		resource.save()
			.then(function(resource) {
				dialog.remove();
			}, function(v) {
				form.showErrors(JSON.parse(v.responseText)['body']);
			});
	},

	/**
	 * Open the resource edit dialog.
	 *
	 * @param {Resource} resource The target user entity.
	 */
	openEditResourceDialog: function(resource) {
		var dialog = DialogComponent.instantiate({
			label: __('Edit Password'),
			cssClasses : ['edit-password-dialog', 'dialog-wrapper']
		}).start();

		// Attach the Resource Actions Tab Controller into the dialog
		var tab = dialog.add(ActionsTabComponent, {
			resource: resource,
			dialog: dialog
		});
		tab.enableTab('js_rs_edit');
	},

	/**
	 * Open the resource share dialog.
	 *
	 * @param {Resource} resource The target user entity.
	 */
	openShareResourceDialog: function(resource) {
		var dialog = DialogComponent.instantiate({
			label: __('Share Password'),
			cssClasses : ['share-password-dialog', 'dialog-wrapper']
		}).start();

		// Attach the Resource Actions Tab Controller into the dialog
		var tab = dialog.add(ActionsTabComponent, {
			resource: resource,
			dialog: dialog
		});
		tab.enableTab('js_rs_permission');
	},

	/**
	 * Perform a resource deletion.
	 *
	 * @param {Resource} resource The resource to delete
	 */
	deleteResource: function(resource) {
		var dialog = ConfirmDialogComponent.instantiate({
			label: __('Do you really want to delete?'),
			content: resourceDeleteConfirmTemplate,
			submitButton: {
				label: __('delete password'),
				cssClasses: ['warning']
			},
			action: function() {
				resource.destroy();
			}
		});
		dialog.start();
	},

	/**
	 * Mark a resource as favorite.
	 *
	 * @param {Resource} resource The target resource entity
     */
	favoriteResource: function(resource) {
		var data = {
			foreign_model: 'resource',
			foreign_key: resource.id
		};
		var favorite = new Favorite(data);
		favorite.save()
			.then(function(favorite){
				resource.favorite = favorite;
				Resource.connection.hydrateInstance(resource);
			});
	},

	/**
	 * Unmark a resource as favorite.
	 *
	 * @param {Resource} resource The target resource entity
     */
	unfavoriteResource: function(resource) {
		var favorite = resource.favorite;
		favorite.destroy()
			.then(function(){
				resource.favorite = null;
				Resource.connection.hydrateInstance(resource);
			});
	},

	/* ************************************************************** */
	/* LISTEN TO THE MODEL EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when a resource is destroyed.
	 * - Remove it from the list of selected resources;
	 * @param {DefineMap} model The target model
	 * @param {Event} event The even
	 * @param {DefineMap} destroyedItem The destroyed item
	 */
	'{Resource} destroyed': function(model, event, destroyedItem) {
		this.options.selectedRs.remove(destroyedItem);
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user wants to create a new instance
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mainButton.element} click': function (el, ev) {
		MadBus.trigger('request_resource_creation');
	},

	/**
	 * Observe when the user wants to import a password
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{importButton.element} click': function(el, ev) {
		MadBus.trigger('passbolt.import-passwords');
	},

	/**
	 * When a new filter is applied to the workspace.
	 * @param {jQuery} element The source element
	 * @param {Event} event The jQuery event
	 */
	'{mad.bus.element} filter_workspace': function (el, ev) {
		// When filtering the resources browser, unselect all the resources.
		this.options.selectedRs.splice(0, this.options.selectedRs.length);
		// Enable the create button
		this.options.mainButton.setState('ready');
	},

	/**
	 * Observe when the user requests a resource creation
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_resource_creation': function (el, ev) {
		var resource = new Resource({});
		this.openCreateResourceDialog(resource);
	},

	/**
	 * Observe when the user requests a resource edition
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_resource_edition': function (el, ev) {
		const resource = ev.data.resource;
		this.openEditResourceDialog(resource);
	},

	/**
	 * Observe when the user requests a resource deletion
	 *
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_resource_deletion': function (el, ev) {
		const resource = ev.data.resource;
		this.deleteResource(resource);
	},

	/**
	 * Observe when the user requests a resource deletion
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_resource_sharing': function (el, ev) {
		const resource = ev.data.resource;
		this.openShareResourceDialog(resource);
	},

	/**
	 * Observe when the user requests to set an instance as favorite
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_favorite': function (el, ev) {
		const resource = ev.data.resource;
		this.favoriteResource(resource);
	},

	/**
	 * Observe when the user requests to unset an instance as favorite
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_unfavorite': function (el, ev) {
		const resource = ev.data.resource;
		this.unfavoriteResource(resource);
	},

	/**
	 * Listen to the workspace request_export
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} request_export': function(el, ev) {
		const type = ev.data.type;
		var resources = this.options.grid.options.items;
		var resourcesFormated = resources.reduce((carry, resource) =>  {
			carry.push({
				id: resource.id,
				name: resource.name,
				uri: resource.uri,
				username: resource.username,
				description: resource.description,
				secrets: [{ data: resource.secrets[0].data }]
			});
			return carry;
		}, []);

		var data = {
			format: type,
			resources: resourcesFormated
		};
		MadBus.trigger('passbolt.export-passwords', data);
	},

	/**
	 * Observe when the plugin informs that an import is complete.
	 * If a tag has been created for the import, then the same tag will be selected in the workspace.
	 * If no tag has been created (no tag integration) then just refresh the workspace.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 * @param options
	 *   * tag : the tag created during the import.
	 */
	'{mad.bus.element} passbolt.plugin.import-passwords-complete': function (el, ev, options) {
		// If a tag is provided, then we update the tags list and select the corresponding tag.
		if (options !== undefined && options.tag !== undefined) {
			MadBus.trigger('tags_updated', {selectTag: options.tag});
		}
		// else, we simply refresh the entire workspace.
		else {
			const workspace = 'password';
			MadBus.trigger('request_workspace', {workspace});
		}
	}
});

export default PasswordWorkspaceComponent;
