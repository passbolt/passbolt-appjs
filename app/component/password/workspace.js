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
import BreadcrumbComponent from 'app/component/password/workspace_breadcrumb';
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import Config from 'passbolt-mad/config/config';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import DialogComponent from 'passbolt-mad/component/dialog';
import GridComponent from 'app/component/password/grid';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import PasswordSecondarySidebarComponent from 'app/component/password/password_secondary_sidebar';
import Plugin from 'app/util/plugin';

import PrimaryMenuComponent from 'app/component/password/workspace_primary_menu';
import PrimarySidebarComponent from 'app/component/password/primary_sidebar';
import ResourceCreateForm from 'app/form/resource/create';
import ResourceEditForm from 'app/form/resource/edit';
import route from 'can-route';
import SecondaryMenuComponent from 'app/component/workspace/secondary_menu';

import Favorite from 'app/model/map/favorite';
import Filter from 'app/model/filter';
import Group from 'app/model/map/group';
import Resource from 'app/model/map/resource';

import commentDeleteConfirmTemplate from 'app/view/template/component/comment/delete_confirm.stache!';
import createButtonTemplate from 'app/view/template/component/workspace/create_button.stache!';
import importButtonTemplate from 'app/view/template/component/workspace/import_button.stache!';
import resourcesDeleteConfirmTemplate from 'app/view/template/component/password/delete_confirm.stache!';
import template from 'app/view/template/component/password/workspace.stache!';

const PasswordWorkspaceComponent = Component.extend('passbolt.component.password.Workspace', /** @static */ {

  defaults: {
    name: 'password_workspace',
    template: template,
    silentLoading: false,
    loadedOnStart: false,
    selectedResources: new Resource.List(),
    selectedGroups: new Group.List(),
    filter: null,
    Resource: Resource
  },

  /**
   * Return the default filter used to filter the workspace
   * @return {Filter}
   */
  getDefaultFilterSettings: function() {
    const filter = new Filter({
      id: 'default',
      type: 'default',
      label: __('All items'),
      order: ['Resource.modified DESC']
    });
    return filter;
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const primaryMenu = this._initPrimaryMenu();
    const secondaryMenu = this._initSecondaryMenu();
    const mainActionButton = this._initMainActionButton();
    const importButton = this._initImportButton();
    const breadcrumb = this._initBreadcrumb();
    const primarySidebar = this._initPrimarySidebar();
    const grid = this._initGrid();

    primaryMenu.start();
    secondaryMenu.start();
    mainActionButton.start();
    if (importButton) {
      importButton.start();
    }
    breadcrumb.start();
    primarySidebar.start();
    grid.start();

    // Filter the workspace
    const filter = this.getFilter();
    MadBus.trigger('filter_workspace', {filter: filter});

    this.on();
    this._super();
  },

  /**
   * Get the filter to apply to the workspace.
   * @return {Filter}
   */
  getFilter: function() {
    const filter = PasswordWorkspaceComponent.getDefaultFilterSettings();
    filter.viewResourceId = null;

    const action = route.data.action;
    switch (action) {
      case 'commentsView':
      case 'view': {
        filter.viewResourceId = route.data.id;
      }
    }

    return filter;
  },

  /**
   * Init the primary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   * @return {Component}
   */
  _initPrimaryMenu: function() {
    const $el = $('#js_wsp_primary_menu_wrapper');
    const options =  {selectedResources: this.options.selectedResources};
    const component = ComponentHelper.create($el, 'last', PrimaryMenuComponent, options);
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Init the secondary workspace menu.
   * The menu is not instantiated as a child of this component DOM Element, remove it manually from the DOM when
   * this component is destroyed.
   * @see destroy()
   * @return {Component}
   */
  _initSecondaryMenu: function() {
    const component = ComponentHelper.create(
      $('#js_wsp_secondary_menu_wrapper'),
      'last',
      SecondaryMenuComponent, {
        selectedItems: this.options.selectedResources
      }
    );
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the workspace main action button.
   * @return {Component}
   */
  _initMainActionButton: function() {
    const selector = $('.main-action-wrapper');
    const options = {
      id: 'js_wsp_create_button',
      template: createButtonTemplate,
      tag: 'button',
      cssClasses: ['button', 'primary']
    };
    const component = ComponentHelper.create(selector, 'last', ButtonComponent, options);
    this.options.mainButton = component;
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the workspace import action button.
   * @return {Component}
   */
  _initImportButton: function() {
    if (Config.read('server.passbolt.plugins.import')) {
      const selector = $('.main-action-wrapper');
      const options = {
        id: 'js_wsp_pwd_import_button',
        template: importButtonTemplate,
        tag: 'button',
        cssClasses: ['button']
      };
      const component = ComponentHelper.create(selector, 'last', ButtonComponent, options);
      this.options.importButton = component;
      this.addLoadedDependency(component);
      return component;
    }
  },

  /**
   * Initialize the workspace breadcrumb
   * @return {Component}
   */
  _initBreadcrumb: function() {
    const component = new BreadcrumbComponent('#js_wsp_password_breadcrumb', {
      rootFilter: PasswordWorkspaceComponent.getDefaultFilterSettings()
    });
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the primary sidebar component
   * @return {Component}
   */
  _initPrimarySidebar: function() {
    const component = new PrimarySidebarComponent('#js_password_workspace_primary_sidebar', {
      defaultFilter: PasswordWorkspaceComponent.getDefaultFilterSettings(),
      selectedResources: this.options.selectedResources,
      selectedGroups: this.options.selectedGroups
    });
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Initialize the grid component
   * @return {Component}
   */
  _initGrid: function() {
    if (this.options.grid) {
      $(this.options.grid.element).empty().removeClass();
      this.options.grid.destroy(); 
    }
    const component = new GridComponent('#js_wsp_pwd_browser', {
      selectedResources: this.options.selectedResources,
      cssClasses: ['tableview']
    });
    this.options.grid = component;
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Init the secondary sidebar.
   * @return {Component}
   * @private
   */
  _initSecondarySidebar: function() {
    this._destroySecondarySidebar();
    const showSidebar = Config.read('ui.workspace.showSidebar');
    if (!showSidebar) {
      return;
    }
    const resource = this.options.selectedResources[0];
    const options = {
      id: 'js_pwd_details',
      resource: resource,
      silentLoading: false,
      cssClasses: ['panel', 'aside', 'js_wsp_pwd_sidebar_second']
    };
    const component = ComponentHelper.create(this.element, 'last', PasswordSecondarySidebarComponent, options);
    this.options.passwordSecondarySidebar = component;
    this.addLoadedDependency(component);
    return component;
  },

  /**
   * Destroy the secondary sidebar
   * @private
   */
  _destroySecondarySidebar: function() {
    if (this.options.passwordSecondarySidebar) {
      this.options.passwordSecondarySidebar.destroyAndRemove();
      this.options.passwordSecondarySidebar = null;
    }
  },

  /**
   * Open the resource create dialog.
   * @param {Resource} resource The target resource entity.
   */
  openCreateResourceDialog: function(resource) {
    const dialog = DialogComponent.instantiate({
      label: __('Create Password'),
      cssClasses: ['create-password-dialog', 'dialog-wrapper']
    }).start();

    // Attach the form to the dialog
    const form = dialog.add(ResourceCreateForm, {
      data: resource,
      callbacks: {
        submit: data => {
          delete data['Resource']['id'];
          const resourceToSave = new Resource(data['Resource']);
          this._saveResource(resourceToSave, form, dialog);
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
    this.state.loaded = false;
    dialog.remove();
    resource.save()
      .then(() => {
        const filter = PasswordWorkspaceComponent.getDefaultFilterSettings();
        filter.forceReload = true;
        MadBus.trigger('filter_workspace', {filter: filter});
        this.state.loaded = true;
      }, v => {
        form.showErrors(JSON.parse(v.responseText)['body']);
      });
  },

  /**
   * Open the resource edit dialog.
   * @param {Resource} resource The target user entity.
   */
  openEditResourceDialog: function(resource) {
    const dialog = DialogComponent.instantiate({
      label: __('Edit'),
      subtitle: resource.name,
      cssClasses: ['edit-password-dialog', 'dialog-wrapper']
    }).start();

    // Attach the form to the dialog
    dialog.add(ResourceEditForm, {
      id: 'js_rs_edit',
      label: __('Edit'),
      action: 'edit',
      data: resource,
      callbacks: {
        submit: data => {
          const resourceData = data['Resource'];
          // If not secrets present, no need to add them to the API request.
          if (resourceData.secrets.length > 0) {
            resourceData['__FILTER_CASE__'] = 'edit_with_secrets';
          } else {
            resourceData['__FILTER_CASE__'] = 'edit';
          }
          resource.assign(resourceData);
          resource.save();
          dialog.remove();
        }
      }
    });
  },

  /**
   * Open the bulk resources share dialog.
   *
   * @param {Resource.List} resources The target resources.
   */
  openShareResourcesDialog: function(resources) {
    Plugin.insertShareIframe(resources.map(resource => resource.id));
  },

  /**
   * Open the resource(s) delete dialog.
   *
   * @param {Resource.List} resources The resource to delete
   */
  openDeleteResourcesDialog: function(resources) {
    const multipleDelete = resources.length > 1;
    const dialog = ConfirmDialogComponent.instantiate({
      label: __('Do you really want to delete?'),
      content: resourcesDeleteConfirmTemplate,
      submitButton: {
        label: multipleDelete ? __('delete passwords') : __('delete password'),
        cssClasses: ['warning']
      },
      action: () => this._deleteResources(resources)
    });
    dialog.setViewData('multipleDelete', multipleDelete);
    dialog.start();
  },

  /**
   * Perform the resource(s) delete
   *
   * @param {Resource.List} resources The resource to delete
   */
  _deleteResources: function(resources) {
    const multipleDelete = resources.length > 1;
    this.state.loaded = false;
    this.options.selectedResources.splice(0, this.options.selectedResources.length);
    if (multipleDelete) {
      Resource.deleteAll(resources)
        .then(() =>  {
          MadBus.trigger('passbolt_notify', {
            title: 'app_resources_delete_all_success',
            status: 'success'
          });
          this.state.loaded = true;
        });
    } else {
      resources[0].destroy().then(() => {
        this.state.loaded = true;
      });
    }
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

  /**
   * Delete a comment
   * @param {Comment} comment The target comment
   */
  deleteComment: function(comment) {
    const confirm = ConfirmDialogComponent.instantiate({
      label: __('Do you really want to delete?'),
      content: commentDeleteConfirmTemplate,
      submitButton: {
        label: __('delete comment'),
        cssClasses: ['warning']
      },
      action: function() {
        comment.destroy();
      }
    });
    confirm.start();
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
   */
  '{selectedResources} length': function() {
    const selectedResources = this.options.selectedResources;
    if (selectedResources.length == 1) {
      const component = this._initSecondarySidebar();
      if (component) {
        component.start();
      }
      route.data.update({controller: 'Password', action: 'view', id: selectedResources[0].id});
    } else {
      this._destroySecondarySidebar();
      route.data.update({controller: 'Password', action: 'index'});
    }
  },

  /**
   * Observe when the workspace sidebar setting change.
   */
  '{mad.bus.element} workspace_sidebar_state_change': function() {
    const resource = this.options.selectedResources[0];
    if (resource) {
      const component = this._initSecondarySidebar(resource);
      if (component) {
        component.start();
      }
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user wants to create a new instance
   */
  '{mainButton.element} click': function() {
    MadBus.trigger('request_resource_create');
  },

  /**
   * Observe when the user wants to import a password
   */
  '{importButton.element} click': function() {
    MadBus.trigger('passbolt.import-passwords');
  },

  /**
   * When a new filter is applied to the workspace.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;

    // When filtering the resources browser, unselect all the resources.
    this.options.selectedResources.splice(0, this.options.selectedResources.length);

    // Unselect all group if the filter does not target a group (dirty).
    if (!filter.rules['is-shared-with-group']) {
      this.options.selectedGroups.splice(0, this.options.selectedGroups.length);
    }

    // Rebuild the grid each time the workspace is filtered except if: 
    // - The user is searching on all items.
    // - The user empty the search on all items.
    // If no filterSettings, it means that the grid had never been filtered, no need to reinit it.
    if (this.options.grid.filterSettings) {
      const wasSearchingAllItems = filter.id == "default" && this.options.grid.filterSettings.id == "search";
      const isSearchingAllItems = filter.id == "search" && this.options.grid.filterSettings.id == "default";
      const isUpdatingSearch = filter.id == "search" && this.options.grid.filterSettings.id == "search";
      if (!wasSearchingAllItems && !isSearchingAllItems && !isUpdatingSearch) {
        const grid = this._initGrid();
        grid.start();
      }
    }


    MadBus.trigger('filter_grid', { filter: filter });
  }, 

  /**
   * Observe when the user requests a resource creation
   */
  '{mad.bus.element} request_resource_create': function() {
    const resource = new Resource({});
    this.openCreateResourceDialog(resource);
  },

  /**
   * Observe when the user wants to edit a resource
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_edit': function(el, ev) {
    const resource = ev.data.resource;
    this.openEditResourceDialog(resource);
  },

  /**
   * Observe when the user wants to delete a resource
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_delete': function(el, ev) {
    const resource = ev.data.resource;
    const resources = new Resource.List([resource]);
    this.openDeleteResourcesDialog(resources);
  },

  /**
   * Observe when the user wants to delete resources
   *
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resources_delete': function(el, ev) {
    const resources = ev.data.resources;
    this.openDeleteResourcesDialog(resources);
  },

  /**
   * Observe when the user wants to share a resource
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_share': function(el, ev) {
    const resource = ev.data.resource;
    this.openShareResourcesDialog([resource]);
  },

  /**
   * Observe when the user wants to share a resources
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resources_share': function(el, ev) {
    const resources = ev.data.resources;
    this.openShareResourcesDialog(resources);
  },

  /**
   * Observe when the user wants to mark a resource as favorite
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_favorite': function(el, ev) {
    const resource = ev.data.resource;
    this.favoriteResource(resource);
  },

  /**
   * Observe when the user wants to unmark a resource from favorite
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_resource_unfavorite': function(el, ev) {
    const resource = ev.data.resource;
    this.unfavoriteResource(resource);
  },

  /**
   * Listen to the workspace request_export
   */
  '{mad.bus.element} request_export': function() {
    const resourcesIds = this.options.selectedResources.reduce((carry, resource) =>  [...carry, resource.id], []);
    Plugin.send('passbolt.plugin.export_resources', resourcesIds);
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

  /**
   * Observe when the plugin informs that the share operation has been completed.
   */
  '{mad.bus.element} passbolt.share.complete': function() {
    const selectedResources = this.options.selectedResources;
    const selectedResourcesIds = selectedResources.map(resource => resource.id).get();

    /*
     * Unselect all the resources.
     * The user could have lost his access to some of them.
     * Retrieve the resources and then select the ones the user can still access.
     */
    selectedResources.splice(0);
    Resource.updateResourcesAfterShare(selectedResourcesIds)
      .then(resources => {
        if (resources.length) {
          selectedResources.replace(resources);
        }
      });
  },

  /**
   * Observe when the plugin informs that the user wants to go to the edit dialog from the share dialog
   */
  '{mad.bus.element} passbolt.share.go-to-edit': function() {
    const resource = this.options.selectedResources.get(0);
    MadBus.trigger('request_resource_edit', {resource: resource});
  },

  /**
   * Observe to comment delete request.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_delete_comment': function(el, ev) {
    const comment = ev.data.comment;
    this.deleteComment(comment);
  }
});

export default PasswordWorkspaceComponent;
