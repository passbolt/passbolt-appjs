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
import PasswordSecondarySidebarComponent from 'app/component/password/password_secondary_sidebar';
import PrimaryMenuComponent from 'app/component/password/workspace_primary_menu';
import PrimarySidebarComponent from 'app/component/password/primary_sidebar';
import ResourceCreateForm from 'app/form/resource/create';
import route from 'can-route';
import SecondaryMenuComponent from 'app/component/workspace/secondary_menu';

import Favorite from 'app/model/map/favorite';
import Filter from 'app/model/filter';
import Group from 'app/model/map/group';
import Resource from 'app/model/map/resource';

import createButtonTemplate from 'app/view/template/component/workspace/create_button.stache!';
import importButtonTemplate from 'app/view/template/component/workspace/import_button.stache!';
import resourceDeleteConfirmTemplate from 'app/view/template/component/password/delete_confirm.stache!';
import template from 'app/view/template/component/password/workspace.stache!';

const PasswordWorkspaceComponent = Component.extend('passbolt.component.password.Workspace', /** @static */ {

  defaults: {
    name: 'password_workspace',
    template: template,
    // The current selected resources
    selectedResources: new Resource.List(),
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
    const filter = new Filter({
      id: 'default',
      label: __('All items'),
      order: ['Resource.modified DESC']
    });
    return filter;
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._initRouteListener();
    return this._super(el, options);
  },

  /**
   * Initialize the route listener
   * @private
   */
  _initRouteListener: function() {
    route.data.on('action', () => {
      if (route.data.controller == 'Password') {
        this._dispatchRoute();
      }
    });
  },

  /**
   * Dispatch route
   * @private
   */
  _dispatchRoute: function() {
    switch (route.data.action) {
      case 'view': {
        const id = route.data.id;
        const resource = Resource.connection.instanceStore.get(id);
        if (resource) {
          this.options.selectedResources.push(resource);
        } else {
          MadBus.trigger('passbolt_notify', {
            status: 'error',
            title: `app_passwords_view_error_not_found`
          });
        }
        break;
      }
      case 'edit': {
        const id = route.data.id;
        const resource = Resource.connection.instanceStore.get(id);
        if (resource) {
          this.openEditResourceDialog(resource);
        } else {
          MadBus.trigger('passbolt_notify', {
            status: 'error',
            title: `app_passwords_edit_error_not_found`
          });
        }
        break;
      }
    }
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initPrimaryMenu();
    this._initSecondaryMenu();
    this._initMainActionButton();
    this._initImportButton();
    this._initBreadcrumb();
    this._initPrimarySidebar();
    this._initGrid();

    // Filter the workspace
    const filter = PasswordWorkspaceComponent.getDefaultFilterSettings();
    MadBus.trigger('filter_workspace', {filter: filter});

    this.on();
    this._super();
  },

  /**
   * Destroy the workspace.
   */
  destroy: function() {
    // Be sure that the primary & secondary workspace menus controllers will be destroyed also.
    $('#js_wsp_primary_menu_wrapper').empty();
    $('#js_wsp_secondary_menu_wrapper').empty();
    $('.main-action-wrapper').empty();
    // Flush the selectedResources list.
    this.options.selectedResources.splice(0, this.options.selectedResources.length);
    this._super();
  },

  /**
   * Init the primary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   */
  _initPrimaryMenu: function() {
    const menu = ComponentHelper.create(
      $('#js_wsp_primary_menu_wrapper'),
      'last',
      PrimaryMenuComponent, {
        selectedResources: this.options.selectedResources
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
    const menu = ComponentHelper.create(
      $('#js_wsp_secondary_menu_wrapper'),
      'last',
      SecondaryMenuComponent, {
        selectedItems: this.options.selectedResources
      }
    );
    menu.start();
  },

  /**
   * Initialize the workspace main action button.
   */
  _initMainActionButton: function() {
    const button = ComponentHelper.create(
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
    this.options.mainButton = button;
  },

  /**
   * Initialize the workspace import action button.
   */
  _initImportButton: function() {
    if (Config.read('server.passbolt.plugins.import')) {
      const button = ComponentHelper.create(
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
    }
  },

  /**
   * Initialize the workspace breadcrumb
   */
  _initBreadcrumb: function() {
    const component = new BreadcrumbComponent('#js_wsp_password_breadcrumb', {
      rootFilter: PasswordWorkspaceComponent.getDefaultFilterSettings()
    });
    component.start();
  },

  /**
   * Initialize the primary sidebar component
   */
  _initPrimarySidebar: function() {
    const component = new PrimarySidebarComponent('#js_password_workspace_primary_sidebar', {
      defaultFilter: PasswordWorkspaceComponent.getDefaultFilterSettings(),
      selectedResources: this.options.selectedResources,
      selectedGroups: this.options.selectedGroups
    });
    component.start();
  },

  /**
   * Initialize the grid component
   */
  _initGrid: function() {
    const component = new GridComponent('#js_wsp_pwd_browser', {
      selectedResources: this.options.selectedResources
    });
    component.start();
    this.options.grid = component;
  },

  /**
   * Open the resource create dialog.
   * @param {Resource} resource The target resource entity.
   */
  openCreateResourceDialog: function(resource) {
    const self = this;
    const dialog = DialogComponent.instantiate({
      label: __('Create Password'),
      cssClasses: ['create-password-dialog', 'dialog-wrapper']
    }).start();

    // Attach the form to the dialog
    const form = dialog.add(ResourceCreateForm, {
      data: resource,
      callbacks: {
        submit: function(data) {
          delete data['Resource']['id'];
          const resourceToSave = new Resource(data['Resource']);
          self._saveResource(resourceToSave, form, dialog);
        }
      }
    });
    form.load(resource);
  },

  /**
   * Save a resource after creating/editing it with the create/edit forms.
   * @param {Resource} resource The target resource
   * @param {Form} form The form object
   * @param {Dialog} dialog The dialog object
   */
  _saveResource: function(resource, form, dialog) {
    resource.save()
      .then(() => {
        dialog.remove();
      }, v => {
        form.showErrors(JSON.parse(v.responseText)['body']);
      });
  },

  /**
   * Open the resource edit dialog.
   *
   * @param {Resource} resource The target user entity.
   */
  openEditResourceDialog: function(resource) {
    const dialog = DialogComponent.instantiate({
      label: __('Edit Password'),
      cssClasses: ['edit-password-dialog', 'dialog-wrapper']
    }).start();

    // Attach the Resource Actions Tab Controller into the dialog
    const tab = dialog.add(ActionsTabComponent, {
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
    const dialog = DialogComponent.instantiate({
      label: __('Share Password'),
      cssClasses: ['share-password-dialog', 'dialog-wrapper']
    }).start();

    // Attach the Resource Actions Tab Controller into the dialog
    const tab = dialog.add(ActionsTabComponent, {
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
    const dialog = ConfirmDialogComponent.instantiate({
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
    const data = {
      foreign_model: 'resource',
      foreign_key: resource.id
    };
    const favorite = new Favorite(data);
    favorite.save()
      .then(favorite => {
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
    const favorite = resource.favorite;
    favorite.destroy()
      .then(() => {
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
    this.options.selectedResources.remove(destroyedItem);
  },

  /**
   * Observe when resources are selected
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   * @param {array<Group>} items The selected items change
   */
  '{selectedResources} add': function(el, ev, items) {
    if (this.options.passwordSecondarySidebar) {
      this.options.passwordSecondarySidebar.remove();
    }
    const resource = items[0];
    const state = Config.read('ui.workspace.showSidebar') ? 'ready' : 'hidden';
    const options = {
      id: 'js_pwd_details',
      resource: resource,
      silentLoading: false,
      cssClasses: ['panel', 'aside', 'js_wsp_pwd_sidebar_second'],
      state: state
    };
    const component = ComponentHelper.create(this.element, 'last', PasswordSecondarySidebarComponent, options);
    component.start();
    this.options.passwordSecondarySidebar = component;
  },

  /**
   * Observe when resources are selected
   */
  '{selectedResources} remove': function() {
    if (this.options.passwordSecondarySidebar) {
      this.options.passwordSecondarySidebar.remove();
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user wants to create a new instance
   */
  '{mainButton.element} click': function() {
    MadBus.trigger('request_resource_creation');
  },

  /**
   * Observe when the user wants to import a password
   */
  '{importButton.element} click': function() {
    MadBus.trigger('passbolt.import-passwords');
  },

  ///**
  // * When a new filter is applied to the workspace.
  // */
  //'{mad.bus.element} filter_workspace': function() {
  //  // When filtering the resources browser, unselect all the resources.
  //  this.options.selectedResources.splice(0, this.options.selectedResources.length);
  //  // Enable the create button
  //  this.options.mainButton.setState('ready');
  //},

  /**
   * Observe when the user requests a resource creation
   */
  '{mad.bus.element} request_resource_creation': function() {
    const resource = new Resource({});
    this.openCreateResourceDialog(resource);
  },

  /**
   * Observe when the user requests a resource edition
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_edition': function(el, ev) {
    const resource = ev.data.resource;
    this.openEditResourceDialog(resource);
  },

  /**
   * Observe when the user requests a resource deletion
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_deletion': function(el, ev) {
    const resource = ev.data.resource;
    this.deleteResource(resource);
  },

  /**
   * Observe when the user requests a resource deletion
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_sharing': function(el, ev) {
    const resource = ev.data.resource;
    this.openShareResourceDialog(resource);
  },

  /**
   * Observe when the user requests to set an instance as favorite
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_favorite': function(el, ev) {
    const resource = ev.data.resource;
    this.favoriteResource(resource);
  },

  /**
   * Observe when the user requests to unset an instance as favorite
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_unfavorite': function(el, ev) {
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
    const resources = this.options.grid.options.items;
    const resourcesFormated = resources.reduce((carry, resource) =>  {
      carry.push({
        id: resource.id,
        name: resource.name,
        uri: resource.uri,
        username: resource.username,
        description: resource.description,
        secrets: [{data: resource.secrets[0].data}]
      });
      return carry;
    }, []);

    const data = {
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
  '{mad.bus.element} passbolt.plugin.import-passwords-complete': function(el, ev, options) {
    // If a tag is provided, then we update the tags list and select the corresponding tag.
    if (options !== undefined && options.tag !== undefined) {
      MadBus.trigger('tags_updated', {selectTag: options.tag});
    } else {
      // else, we simply refresh the entire workspace.
      const workspace = 'password';
      MadBus.trigger('request_workspace', {workspace: workspace});
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE STATE CHANGES */
  /* ************************************************************** */

  /**
   * The application is ready.
   * @param {boolean} go Enter or leave the state
   */
  stateReady: function(go) {
    if (go) {
      this._dispatchRoute();
    }
  }
});

export default PasswordWorkspaceComponent;
