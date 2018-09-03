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
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
import Clipboard from 'app/util/clipboard';
import Config from 'passbolt-mad/config/config';
import Button from 'passbolt-mad/component/button';
import ButtonDropdownComponent from 'passbolt-mad/component/button_dropdown';
import MadBus from 'passbolt-mad/control/bus';
import PermissionType from 'app/model/map/permission_type';
import Plugin from 'app/util/plugin';
import Resource from 'app/model/map/resource';
import uuid from 'uuid/v4';

import template from 'app/view/template/component/password/workspace_primary_menu.stache!';

const PasswordWorkspaceMenuComponent = Component.extend('passbolt.component.PasswordWorkspaceMenu', /** @static */ {

  defaults: {
    label: 'Workspace Menu Controller',
    tag: 'ul',
    selectedResources: new Resource.List(),
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    // Copy secret button
    const copySecretButton = new Button('#js_wk_menu_secretcopy_button', {
      state: {disabled: true},
      events: {
        click: () => this._copySecret()
      }
    });
    copySecretButton.start();
    /*
     * @todo Check how the click event is resolved, if the stopImmediatePropagation/stopPropagation of the button avoid this callback to eb called, it would be magic ... magic...
     * copySecretButton.on('click', () => this._copySecret());
     */
    this.secretCopyButton = copySecretButton;

    // Edit button
    const editButton = new Button('#js_wk_menu_edition_button', {
      state: {disabled: true},
      events: {
        click: () => this._edit()
      }
    });
    editButton.start();
    this.editButton = editButton;

    // Share button
    const shareButton = new Button('#js_wk_menu_sharing_button', {
      state: {disabled: true},
      events: {
        click: () => this._share()
      }
    });
    shareButton.start();
    this.shareButton = shareButton;

    // Export
    this._initExportButton();

    // More button items
    const moreButtonMenuItems = [];

    // Copy login
    const copyLoginItem = new Action({
      id: 'js_wk_menu_copy_login_action',
      label: __('copy username to clipboard'),
      cssClasses: [],
      action: () => this._copyLogin()
    });
    moreButtonMenuItems.push(copyLoginItem);

    // Copy secret
    const copySecretItem = new Action({
      id: 'js_wk_menu_copy_secret_action',
      label: __('copy password to clipboard'),
      cssClasses: [],
      action: () => this._copySecret()
    });
    moreButtonMenuItems.push(copySecretItem);

    // Delete
    const deleteItem = new Action({
      id: 'js_wk_menu_delete_action',
      label: __('delete'),
      cssClasses: [],
      action: () => this._delete()
    });
    moreButtonMenuItems.push(deleteItem);

    const moreButton = new ButtonDropdownComponent('#js_wk_menu_more_button', {
      state: {disabled: true},
      items: moreButtonMenuItems,
      template: null
    });
    moreButton.start();
    this.moreButton = moreButton;
  },

  /**
   * Init export button.
   * @private
   */
  _initExportButton: function() {
    if (Config.read('server.passbolt.plugins.export')) {
      const exportButtonSelector = '#js_wk_menu_export_button';
      $(exportButtonSelector).removeClass('hidden');
      const exportButton = new Button(exportButtonSelector, {
        events: {
          click: () => this._export()
        }
      });
      exportButton.start();
      this.options.exportButton = exportButton;
    }
  },

  /**
   * Copy login to clipboard.
   */
  _copyLogin: function() {
    const item = this.options.selectedResources[0];
    Clipboard.copy(item.username, 'username');
  },

  /**
   * Decrypt and copy secret to clipboard
   */
  _copySecret: function() {
    const secret = this.options.selectedResources[0].secrets[0];
    Plugin.decryptAndCopyToClipboard(secret.data);
  },

  /**
   * Delete
   */
  _delete: function() {
    const resources = this.options.selectedResources.slice(0);
    MadBus.trigger('request_resources_delete', {resources: resources});
  },

  /**
   * Edit
   */
  _edit: function() {
    const resource = this.options.selectedResources[0];
    MadBus.trigger('request_resource_edit', {resource: resource});
  },

  /**
   * Share
   */
  _share: function() {
    const resource = this.options.selectedResources[0];
    MadBus.trigger('request_resource_sharing', {resource: resource});
  },

  /**
   * Export
   */
  _export: function() {
    const type = 'csv';
    MadBus.trigger('request_export', {type: type});
  },

  /**
   * Observe when a resource is selected
   */
  '{selectedResources} length': function() {
    const resources = this.options.selectedResources;
    switch(resources.length) {
      case 0: {
        this.reset();
        break;
      }
      case 1: {
        this.reset();
        this.resourceSelected();
        break;
      }
      default: {
        this.reset();
        this.resourcesSelected();
      }
    }
  },

  /**
   * Observe when a resource is selected
   */
  '{selectedResources} remove': function() {
    const resources = this.options.selectedResources;
    switch(resources.length) {
      case 0: {
        this.reset();
        break;
      }
      case 1: {
        this.reset();
        this.resourceSelected();
        break;
      }
      default: {
        this.reset();
        this.resourcesSelected();
      }
    }
  },

  /**
   * Observe when a resource is unselected
   */
  '{selectedResources} remove': function() {
    this.reset();
  },

  /**
   * A resource is selected, adapt the buttons states.
   */
  resourceSelected: function() {
    const resource = this.options.selectedResources[0];
    const permission = resource.permission;
    const canEdit = permission.isAllowedTo(PermissionType.UPDATE);
    const canAdmin = permission.isAllowedTo(PermissionType.ADMIN);
    const moreButtonDeleteItemId = 'js_wk_menu_delete_action';
    const moreButtonCopyLoginItemId = 'js_wk_menu_copy_login_action';
    this.secretCopyButton.state.disabled = false;
    this.editButton.state.disabled = !canEdit;
    this.shareButton.state.disabled = !canAdmin;
    this.moreButton.state.disabled = false;
    if (canEdit) {
      this.moreButton.enableItem(moreButtonDeleteItemId);
    } else {
      this.moreButton.disableItem(moreButtonDeleteItemId);
    }
    if (resource.username == null) {
      this.moreButton.disableItem(moreButtonCopyLoginItemId);
    } else {
      this.moreButton.enableItem(moreButtonCopyLoginItemId);
    }
  },

  /**
   * Resourecs is selected, adapt the buttons states.
   */
  resourcesSelected: function() {
    const moreButtonDeleteItemId = 'js_wk_menu_delete_action';
    const moreButtonCopyLoginItemId = 'js_wk_menu_copy_login_action';
    const moreButtonCopySecretItemId = 'js_wk_menu_copy_secret_action';
    const canDelete = this.options.selectedResources.reduce((carry, resource) => {
      return resource.permission.isAllowedTo(PermissionType.UPDATE) && carry;
    }, true);
    if (canDelete) {
      this.moreButton.state.disabled = false;
      this.moreButton.disableItem(moreButtonCopyLoginItemId);
      this.moreButton.disableItem(moreButtonCopySecretItemId);
      this.moreButton.enableItem(moreButtonDeleteItemId);
    } else {
      this.moreButton.state.disabled = true;
    }
  },

  /**
   * Reset the buttons states to their original.
   */
  reset: function() {
    const moreButtonCopyLoginItemId = 'js_wk_menu_copy_login_action';
    const moreButtonCopySecretItemId = 'js_wk_menu_copy_secret_action';
    this.secretCopyButton.state.disabled = true;
    this.editButton.state.disabled = true;
    this.shareButton.state.disabled = true;
    this.moreButton.state.disabled = true;
    this.moreButton.enableItem(moreButtonCopyLoginItemId);
    this.moreButton.enableItem(moreButtonCopySecretItemId);
  }

});

export default PasswordWorkspaceMenuComponent;
