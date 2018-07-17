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
import ButtonComponent from 'passbolt-mad/component/button';
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
    // the selected resources, you can pass an existing list as parameter of the constructor to share the same list
    selectedRs: new Resource.List(),
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    // Copy secret button
    const copySecretButton = new ButtonComponent('#js_wk_menu_secretcopy_button', {
      state: 'disabled',
      events: {
        click: () => this._copySecret()
      }
    });
    copySecretButton.start();
    this.options.secretCopyButton = copySecretButton;

    // Edit button
    const editButton = new ButtonComponent('#js_wk_menu_edition_button', {
      state: 'disabled',
      events: {
        click: () => this._edit()
      }
    });
    editButton.start();
    this.options.editButton = editButton;

    // Share button
    const shareButton = new ButtonComponent('#js_wk_menu_sharing_button', {
      state: 'disabled',
      events: {
        click: () => this._share()
      }
    });
    shareButton.start();
    this.options.shareButton = shareButton;

    // Export
    this._initExportButton();

    // More button items
    const moreButtonMenuItems = [];

    // Copy login
    const copyLoginItem = new Action({
      id: uuid(),
      label: __('copy login to clipboard'),
      cssClasses: [],
      action: () => this._copyLogin()
    });
    moreButtonMenuItems.push(copyLoginItem);

    // Copy secret
    const copySecretItem = new Action({
      id: uuid(),
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
      state: 'disabled',
      items: moreButtonMenuItems,
      template: null
    });
    moreButton.start();
    this.options.moreButton = moreButton;

    // @todo URGENT, buggy, it rebinds 2 times external element event (such as madbus)
    this.on();
  },

  /**
   * Init export button.
   * @private
   */
  _initExportButton: function() {
    if (Config.read('server.passbolt.plugins.export')) {
      const exportButtonSelector = '#js_wk_menu_export_button';
      $(exportButtonSelector).removeClass('hidden');
      const exportButton = new ButtonComponent(exportButtonSelector, {
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
    const item = this.options.selectedRs[0];
    Clipboard.copy(item.username, 'username');
  },

  /**
   * Decrypt and copy secret to clipboard
   */
  _copySecret: function() {
    const secret = this.options.selectedRs[0].secrets[0];
    Plugin.decryptAndCopyToClipboard(secret.data);
  },

  /**
   * Delete
   */
  _delete: function() {
    const resource = this.options.selectedRs[0];
    MadBus.trigger('request_resource_deletion', {resource: resource});
  },

  /**
   * Edit
   */
  _edit: function() {
    const resource = this.options.selectedRs[0];
    MadBus.trigger('request_resource_edition', {resource: resource});
  },

  /**
   * Share
   */
  _share: function() {
    const resource = this.options.selectedRs[0];
    MadBus.trigger('request_resource_sharing', {resource: resource});
  },

  /**
   * Export
   */
  _export: function() {
    const type = 'csv';
    MadBus.trigger('request_export', {type: type});
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when a resource is selected
   */
  '{selectedRs} add': function() {
    // If a resource is selected
    if (this.options.selectedRs.length == 1) {
      this.setState('selection');
    } else if (this.options.selectedRs.length == 0) {
      this.setState('ready');
    }
  },

  /**
   * Observe when a resource is unselected
   */
  '{selectedRs} remove': function() {
    // If a resource is selected
    if (this.options.selectedRs.length == 1) {
      this.setState('selection');
    } else if (this.options.selectedRs.length == 0) {
      this.setState('ready');
    }
  },

  /* ************************************************************** */
  /* LISTEN TO THE STATE CHANGES */
  /* ************************************************************** */

  /**
   * Listen to the change relative to the state selected
   * @param {boolean} go Enter or leave the state
   */
  stateSelection: function(go) {
    if (go) {
      const permission = this.options.selectedRs[0].permission;
      // Is the resource editable ?
      const updatable = permission.isAllowedTo(PermissionType.UPDATE);
      // Is the resource administrable ?
      const administrable = permission.isAllowedTo(PermissionType.ADMIN);

      this.options.secretCopyButton
        .setValue(this.options.selectedRs[0])
        .setState('ready');
      this.options.editButton
        .setValue(this.options.selectedRs[0])
        .setState(updatable ? 'ready' : 'disabled');
      this.options.shareButton
        .setValue(this.options.selectedRs)
        .setState(administrable ? 'ready' : 'disabled');
      this.options.moreButton
        .setValue(this.options.selectedRs[0])
        .setState('ready');
      this.options.moreButton.setItemState('js_wk_menu_delete_action', updatable ? 'ready' : 'disabled');
    } else {
      this.options.secretCopyButton
        .setValue(null)
        .setState('disabled');
      this.options.editButton
        .setValue(null)
        .setState('disabled');
      this.options.shareButton
        .setValue(null)
        .setState('disabled');
      this.options.moreButton
        .setValue(null)
        .setState('disabled');
      this.options.moreButton.setItemState('js_wk_menu_delete_action', 'disabled');
    }
  }

});

export default PasswordWorkspaceMenuComponent;
