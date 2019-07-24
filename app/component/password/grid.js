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

import Component from 'passbolt-mad/component/component';
import getObject from 'can-util/js/get/get';
import GridContextualMenuComponent from 'app/component/password/grid_contextual_menu';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import Lock from 'app/util/lock';
import MadBus from 'passbolt-mad/control/bus';
import PasswordsGrid from "../../../src/components/PasswordsGrid/PasswordsGrid";
import React from "react";
import ReactDOM from "react-dom";
import Resource from 'app/model/map/resource';
import ResourceService from 'app/model/service/plugin/resource';
import PermissionType from 'app/model/map/permission_type';
import route from 'can-route';

const GridComponent = Component.extend('passbolt.component.password.Grid', {

  defaults: {
    selectedResources: new Resource.List(),
    prefixItemId: 'resource_',
    silentLoading: false,
    loadedOnStart: false,
    isFirstLoad: true,
    Resource: Resource
  }

}, {
    // @inheritdoc
    init: function (el, options) {
      this._super(el, options);
      this._filterLock = new Lock();
    },

    // @inheritdoc
    afterStart: async function () {
      this.gridRef = React.createRef();
      const grid = React.createElement(PasswordsGrid, { ref: this.gridRef });
      ReactDOM.render(grid, this.element);
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
      if (filter.type !== 'search') {
        this.state.loaded = false;
        this.gridRef.current.resetState({ resources: null });
      }
      this.resources = await this.getResources();
      this.filteredResources = this.filterResources(this.resources);
      const selectedResourcesIds = this.selectResourcesOnWorkspaceFiltered();

      this.gridRef.current.resetState({
        resources: this.filteredResources.get(),
        selectedResources: selectedResourcesIds,
        search: getObject(filter, "rules.keywords") || "",
        filterType: this.filter.type
      });

      this.options.isFirstLoad = false;
      this.state.loaded = true;
      ResourceService.updateLocalStorage();
      this._filterLock.release();
    },

    /**
     * Handle the resources local storage update.
     */
    handleResourcesLocalStorageUpdated: async function () {
      await this._filterLock.acquire();
      this.resources = await this.getUpdatedResources();
      this.filteredResources = this.filterResources(this.resources);

      // Remove from the selected resources the ones which have not filtered anymore.
      const selectedResources = this.options.selectedResources;
      const selectedResourcesIds = selectedResources.reduce((carry, resource) => [...carry, resource.id], []);
      const newSelectedResources = this.filteredResources.filter(resource => selectedResourcesIds.includes(resource.id));
      if (newSelectedResources.length !== selectedResources.length) {
        selectedResources.splice(0, selectedResources.length, ...newSelectedResources);
      }

      this.gridRef.current.updateState({
        resources: this.filteredResources.get()
      });

      this._filterLock.release();
    },
    
    /**
     * Select and scroll to a given a resource
     * @param {Resource} resource 
     */
    selectAndScrollTo: async function(resource) {
      this.gridRef.current.updateState({ selectedResources: [resource.id] });
      // Force the local storage update, so the resource is in its final position.
      await this.handleResourcesLocalStorageUpdated();
      const resourceIndex = this.resources.indexOf(resource);
      this.gridRef.current.scrollTo(resource.id);
      this.options.selectedResources.splice(0, this.options.selectedResources.length, this.resources[resourceIndex]);
    },

    /**
     * Get the resources (in canJS format)
     * @return {Resource.List}
     */
    getResources: function () {
      if (this.filter.type === "group") {
        const groupId = this.filter.rules['is-shared-with-group'];
        const contain = { favorite: 1, permission: 1, tag: 1 };
        const filter = { 'is-shared-with-group': groupId };
        return Resource.findAll({ contain, filter });
      }
      if (this.filter.type === "tag") {
        const groupId = this.filter.rules['has-tag'];
        const contain = { favorite: 1, permission: 1, tag: 1 };
        const filter = { 'has-tag': groupId };
        return Resource.findAll({ contain, filter });
      }

      return Resource.findAll({ source: 'storage', retryOnNotInitialized: true });
    },

    /**
     * Get the resources after a local storage update
     * @return {Resource.List}
     */
    getUpdatedResources: async function () {
      const updatedResources = await Resource.findAll({ source: 'storage' });

      // Filtering by tags and groups doesn't yet benefit from the local storage.
      // Update the resources local variable with the one returned by the cache.
      if (this.filter.type === "group" || this.filter.type === "tag") {
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
     * Filter the resources
     * @param {Resources.List} resources 
     */
    filterResources: function (resources) {
      if (this.filter.type == "favorite") {
        return resources.filter(resource => resource.favorite !== null);
      }
      if (this.filter.type == "shared_with_me") {
        return resources.filter(resource => resource.permission.type !== PermissionType.ADMIN);
      }
      if (this.filter.type == "owner") {
        return resources.filter(resource => resource.permission.type === PermissionType.ADMIN);
      }

      return resources;
    },

    /**
     * Select resources after the workspace is filtered.
     * @return {array} The selected resource ids.
     */
    selectResourcesOnWorkspaceFiltered: function () {
      const selectedResourcesIds = [];

      // During the first load, we check if a resource id has been given in parameter.
      // Otherwise unselect all the resources.
      if (this.options.isFirstLoad && ["commentsView", "view"].includes(route.data.action)) {
        const selectedResourceIndex = this.resources.indexOf({ id: route.data.id });
        if (selectedResourceIndex !== -1) {
          this.options.selectedResources.push(this.resources[selectedResourceIndex]);
          selectedResourcesIds.push(route.data.id);
        } else {
          MadBus.trigger('passbolt_notify', { status: 'error', title: 'app_passwords_edit_error_not_found' });
        }
      } else {
        const selectedResources = this.options.selectedResources;
        selectedResources.splice(0, selectedResources.length);
      }

      return selectedResourcesIds;
    },

    /**
     * Handle resources selected event.
     * @param {array} resourcesIds 
     */
    selectResources: function (resourcesIds) {
      const selectedResources = this.resources.reduce((carry, resource) => {
        if (resourcesIds.includes(resource.id)) {
          carry = [...carry, resource];
        }
        return carry;
      }, []);

      this.options.selectedResources.splice(0, this.options.selectedResources.length, ...selectedResources);
    },

    /**
     * Handle resource right selected event.
     * @param {strinf} resourceId 
     * @param {HTMLEvent} srcEv The source event
     */
    rightSelectResource: function (resourceId, srcEv) {
      // Find the resource and select it.
      const selectedResources = this.resources.filter(resource => resource.id == resourceId);
      this.options.selectedResources.splice(0, this.options.selectedResources.length, ...selectedResources);

      // Get the offset position of the clicked item.
      const $item = $(`#${this.options.prefixItemId}${resourceId}`);
      const itemOffset = $item.offset();

      // Show contextual menu.
      this.showContextualMenu(selectedResources[0], srcEv.pageX - 3, itemOffset.top, srcEv.target);
    },

    /**
     * Show the contextual menu
     * @param {Resource} resource The resource to show the contextual menu for
     * @param {string} x The x position where the menu will be rendered
     * @param {string} y The y position where the menu will be rendered
     */
    showContextualMenu: function (resource, x, y) {
      const coordinates = { x: x, y: y };
      const contextualMenu = GridContextualMenuComponent.instantiate({ resource: resource, coordinates: coordinates });
      contextualMenu.start();
    },

    /**
     * Observe when the workspace has been filtered.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{mad.bus.element} filter_workspace': async function (el, ev) {
      await this.filterWorkspace(ev.data.filter);
      if (ev.data.selectAndScrollTo) {
        this.selectAndScrollTo(ev.data.selectAndScrollTo);
      }
    },

    /**
     * The resources local storate has been updated.
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{document} passbolt.storage.resources.updated': async function (el, ev) {
      if (!Array.isArray(ev.data)) {
        console.warn('The local storage has been flushed by the addon. The view is not in sync anymore');
        return;
      }

      this.handleResourcesLocalStorageUpdated();
    },

    /**
     * Items have been selected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{mad.bus.element} grid_resources_selected': function (el, ev) {
      const resourcesIds = ev.detail;
      this.selectResources(resourcesIds);
    },

    /**
     * An item has been right selected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    '{mad.bus.element} grid_resource_right_selected': function (el, ev) {
      const resourceId = ev.detail.resource.id;
      const srcEv = ev.detail.srcEv;
      this.rightSelectResource(resourceId, srcEv);
    }
  });

export default GridComponent;
