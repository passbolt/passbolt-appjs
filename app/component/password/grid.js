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
import $ from 'jquery';
import Component from 'passbolt-mad/component/component';
import getObject from 'can-util/js/get/get';
import GridContextualMenuComponent from '../password/grid_contextual_menu';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import Lock from '../../util/lock';
import MadBus from 'passbolt-mad/control/bus';
import PasswordsGrid from "../../../src/components/Workspace/Passwords/Grid/Grid";
import React from "react";
import ReactDOM from "react-dom";
import Resource from '../../model/map/resource';
import ResourceService from '../../model/service/plugin/resource';
import PermissionType from '../../model/map/permission_type';
import PasswordWorkspaceComponent from "./workspace";

// Filter stategies
const FILTER_GROUP = "group";
const FILTER_TAG = "tag";
const FILTER_FAVORITE = "favorite";
const FILTER_SHARED_WITH_ME = "shared_with_me";
const FILTER_OWNER = "owner";
const FILTER_FOLDER = "folder";

const GridComponent = Component.extend('passbolt.component.password.Grid', {

  defaults: {
    selectedResources: new Resource.List(),
    prefixItemId: 'resource_',
    silentLoading: false,
    loadedOnStart: false,
    isFirstLoad: true
  }

}, {
    // @inheritdoc
    init: function (el, options) {
      this._super(el, options);
      this._filterLock = new Lock();
      this.filteredResources = new Resource.List();
      this.gridRef = React.createRef();
    },

    // @inheritdoc
    afterStart: function () {
      this.renderGrid();
    },

    /**
     * Observe when the user filters the workspace
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{mad.bus.element} filter_workspace': async function (el, ev) {
      const filter = ev.data.filter;
      await this.filterWorkspace(filter);
    },

    /**
     * Observe when the resources local storage is updated.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{document} passbolt.storage.resources.updated': function (el, ev) {
      if (!Array.isArray(ev.data)) {
        console.warn('The local storage has been flushed by the addon. The view is not in sync anymore');
        return;
      }

      this.handleResourcesLocalStorageUpdated();
    },

    /**
     * Observer when the plugin requests the appjs to select and scroll to a resource.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{mad.bus.element} passbolt.plugin.resources.select-and-scroll-to': function(el, ev) {
      const resourceId = ev.data;
      const resourceIndex = this.filteredResources.indexOf({id: resourceId});

      // If the resource is filtered with the current filter, select it and scroll to it.
      if (resourceIndex !== -1) {
        this.options.selectedResources.splice(0, this.options.selectedResources.length, this.resources[resourceIndex]);
        this.renderGrid();
        this.gridRef.current.scrollTo(resourceId);
      } else {
        // If not, reset the filter, and try to select it in the all items view.
        const filter = PasswordWorkspaceComponent.getDefaultFilterSettings();
        filter.selectedResourceId = resourceId;
        MadBus.trigger('filter_workspace', {filter: filter});
      }
    },

    /**
     * Render the grid
     * @param {array} resources The resources
     */
    renderGrid:function () {
      const resources = this.filteredResources ? this.filteredResources.get() : null;
      const selectedResources = this.options.selectedResources.get();
      const filter = this.filter || {};
      const search = getObject(filter, "rules.keywords") || "";
      const filterType = getObject(filter, "type") || "default";

      ReactDOM.render(<PasswordsGrid
        ref={this.gridRef}
        resources={resources}
        selectedResources={selectedResources}
        search={search}
        filterType={filterType}
        onRightSelect={(event, resource) => this.onResourceRightSelected(event, resource)}
        onSelect={(resources) => this.onResourcesSelected(resources)}
      />, this.element);
    },

    /**
     * Handle when the user selects resources.
     * @param {array} resources The target resources
     */
    onResourcesSelected: function(resources) {
      this.options.selectedResources.splice(0, this.options.selectedResources.length, ...resources);
      this.renderGrid();
    },

    /**
     * Handle when the user right selects a resource.
     * @param {HtmlEvent} event The right select event
     * @param {object} resource The target resource
     */
    onResourceRightSelected: function(event, resource) {
      // Select the right selected resource.
      const selectedResources = this.resources.filter(item => item.id == resource.id);
      this.options.selectedResources.splice(0, this.options.selectedResources.length, ...selectedResources);
      this.renderGrid();

      // Get the offset position of the clicked item.
      const $item = $(`#${this.options.prefixItemId}${resource.id}`);
      const itemOffset = $item.offset();

      // Show contextual menu.
      const coordinates = {
        x: event.pageX - 3,
        y:  itemOffset.top
      };
      const contextualMenu = GridContextualMenuComponent.instantiate({ resource: this.options.selectedResources[0], coordinates: coordinates });
      contextualMenu.start();
    },

    /**
     * Filter the grid
     * @param {Filter} filter The filter to apply
     */
    filterWorkspace: async function (filter) {
      // Generate a random id to identify the current filter request.
      // This random id will allow us to identify the latest filter request.
      // Only the latest request will be treated, the others will be ignore.
      const filterRequestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
      this.filterRequestId = filterRequestId;
      await this._filterLock.acquire();
      if (this.filterRequestId !== filterRequestId) {
        this._filterLock.release();
        return;
      }

      this.filter = filter;
      this.beforeFilter();
      this.resources = await this.findResources(filter);
      this.filteredResources = this.filterResources(this.resources);
      this.afterFilterSelectResource(filter);
      this.renderGrid();
      this.afterFilterScrollTo(filter);

      if (!this.options.isFirstLoad) {
        ResourceService.updateLocalStorage();
      }
      this.options.isFirstLoad = false;
      this.state.loaded = true;
      this._filterLock.release();
    },

    /**
     * Execute before filter.
     */
    beforeFilter: function() {
      // If the user filters on group or tag. As the resources will be retrieved from the server, empty the grid
      // and mark the component as loading before the find.
      if (this.filter.type === FILTER_GROUP || this.filter.type === FILTER_TAG) {
        this.resources = null;
        this.filteredResources = null;
        this.options.selectedResources.splice(0, this.options.selectedResources.length);
        this.state.loaded = false;
        this.renderGrid();
      }
    },

    /**
     * Handle when the resources local storage is udpated.
     */
    handleResourcesLocalStorageUpdated: async function () {
      if (this.options.isFirstLoad) {
        return;
      }

      await this._filterLock.acquire();

      this.resources = await this.getUpdatedResources();
      this.filteredResources = this.filterResources(this.resources);
      this.cleanupSelectedResources();
      this.renderGrid();

      this._filterLock.release();
    },

    /**
     * Cleanup the selected resources:
     * - Remove the resource that are selected but are deleted or not filtered.
     */
    cleanupSelectedResources: function() {
      const selectedResources = this.options.selectedResources;
      const filteredSelectedResources = selectedResources.filter(selectedResource => {
        return this.filteredResources.indexOf({id: selectedResource.id}) !== -1;
      });
      if (selectedResources.length !== filteredSelectedResources.length) {
        selectedResources.splice(0, this.options.selectedResources.length, ...filteredSelectedResources);
      }
    },

    /**
     * Find the resources.
     * @param {Filter} filter The filter to apply
     * @return {Promise<Resource.List>}
     */
    findResources: function (filter) {
      let promise;

      switch (filter.type) {
        case FILTER_GROUP:
          promise = Resource.findByGroup(this.filter.rules['is-shared-with-group']);
          break;
        case FILTER_TAG:
          promise = Resource.findByTag(this.filter.rules['has-tag']);
          break;
        default:
          promise = Resource.findAll({ source: 'storage', retryOnNotInitialized: true });
          break;
      }

      return promise;
    },

    /**
     * Get the resources after a local storage update
     * @todo do something, can/react it's a bit shit
     * @return {Resource.List}
     */
    getUpdatedResources: async function () {
      const updatedResources = await Resource.findAll({ source: 'storage' });

      // Filtering by tags and groups doesn't yet benefit from the local storage.
      // Update the resources local variable with the one returned by the cache.
      if (this.filter.type === FILTER_GROUP || this.filter.type === FILTER_TAG) {
        for (let i = this.resources.length - 1; i >= 0; i--) {
          const updatedResourceIndex = updatedResources.indexOf(this.resources[i]);
          if (updatedResourceIndex === -1) {
            this.resources.splice(updatedResourceIndex, 1);
          } else {
            this.resources[i] = updatedResources[updatedResourceIndex];
          }
        }

        return this.resources;
      }

      return updatedResources;
    },

    /**
     * Filter the resources.
     * @param {Resource.list} resources The list of resource to filter
     * @return {Resources.List}
     */
    filterResources: function (resources) {
      switch (this.filter.type) {
        case FILTER_FAVORITE:
          return resources.filter(resource => resource.favorite !== null);
        case FILTER_SHARED_WITH_ME:
          return resources.filter(resource => resource.permission.type !== PermissionType.ADMIN);
        case FILTER_OWNER:
          return resources.filter(resource => resource.permission.type === PermissionType.ADMIN);
        case FILTER_FOLDER:
          return resources.filter(resource => resource.folder_parent_id === this.filter.folder.id);
        default:
          return resources;
      }
    },

    /**
     * Select a resource if any passed with the filter.
     * @param {Filter} The applied filter
     */
    afterFilterSelectResource: function (filter) {
      const selectedResources = this.options.selectedResources;

      if (filter.selectedResourceId) {
        const resourceIndex = this.resources.indexOf({ id: filter.selectedResourceId });
        if (resourceIndex !== -1) {
          selectedResources.push(this.resources[resourceIndex]);
        } else {
          if (this.options.isFirstLoad) {
            MadBus.trigger('passbolt_notify', { status: 'error', title: 'app_passwords_edit_error_not_found' });
          }
        }
      } else {
        selectedResources.splice(0, selectedResources.length);
      }
    },

    /**
     * Scroll to a resource if any given with the filter
     * @param {Filter} The applied filter
     */
    afterFilterScrollTo: function (filter) {
      if (filter.selectedResourceId) {
        const resourceIndex = this.filteredResources.indexOf({ id: filter.selectedResourceId });
        if (resourceIndex !== -1) {
          this.gridRef.current.scrollTo(filter.selectedResourceId);
        }
      }
    }

  });

export default GridComponent;
