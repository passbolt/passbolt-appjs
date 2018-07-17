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
import ConfirmComponent from 'passbolt-mad/component/confirm';
import PermissionsComponent from 'app/component/permission/permissions';
import ResourceCreateForm from 'app/form/resource/create';
import TabComponent from 'passbolt-mad/component/tab';

import template from 'passbolt-mad/view/template/component/tab/tab.stache!';

const ActionsTabComponent = TabComponent.extend('passbolt.component.password.ActionsTab', /** @static */ {

  defaults: {
    cssClasses: ['tabs'],
    template: template,
    resource: null,
    dialog: null
  }

}, /** @prototype */ {

  /**
   * Something has changed on a tab controlled by this component.
   * @type boolean
   */
  _hasChanged: false,

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._super();

    // Add the edit form to the tab
    this.addComponent(ResourceCreateForm, {
      id: 'js_rs_edit',
      label: __('Edit'),
      action: 'edit',
      data: this.options.resource,
      callbacks: {
        submit: data => this._save(data)
      }
    });

    // Add the permission component to the tab
    this.addComponent(PermissionsComponent, {
      id: 'js_rs_permission',
      label: 'Share',
      resource: this.options.resources,
      cssClasses: ['share-tab'],
      acoInstance: this.options.resource,
      callbacks: {
        shared: () => this.options.dialog.remove()
      }
    });
  },

  /**
   * Save the resource
   *
   * @param {array} data The form data
   */
  _save: function(data) {
    const self = this;
    const resourceData = data['Resource'];

    // define in which edit case we are.
    if (resourceData.secrets.length > 0) {
      resourceData['__FILTER_CASE__'] = 'edit_with_secrets';
    } else {
      resourceData['__FILTER_CASE__'] = 'edit';
    }

    this.options.resource.assign(resourceData);
    this.options.resource.save()
      .then(() => {
        self.options.dialog.remove();
      });
  },

  /**
   * Enable a tab
   * @param {string} tabId id of the tab to enable
   * @param {boolean} force Should the action be forced, or a confirmation is required. Default false.
   */
  enableTab: function(tabId, force) {
    force = force || false;

    // If the request tab is the same than the active one.
    if (this.enabledTabId == tabId) {
      return;
    }

    // If a change occurred on the current tab, and a confirmation is required.
    if (this._hasChanged && force === false) {
      return this._confirmChangeTab(tabId);
    }

    // The tab to enable.
    const targetTabCtl = this.getComponent(tabId);

    // The dialog should have a relevant title.
    this.options.dialog.setTitle(targetTabCtl.options.label);
    this.options.dialog.setSubtitle(this.options.resource.name);

    this._hasChanged = false;
    this._super(tabId);
  },

  /**
   * Make the user confirm the tab change
   * @param {string} tabId id of the tab to enable
   */
  _confirmChangeTab: function(tabId) {
    const self = this;

    const confirmDialog = ConfirmComponent.instantiate({
      label: __('Do you really want to leave ?'),
      content: __('If you continue you\'ll lose your changes'),
      action: function() {
        self.enableTab(tabId, true);
      }
    });
    confirmDialog.start();
  },

  /* ************************************************************** */
  /* LISTEN TO THE COMPONENT EVENTS */
  /* ************************************************************** */

  /**
   * Listen to any changed event which occurred on the form elements contained by
   * the form controller.
   *
   * When a change occurred, if the user wants to change the current tab, ensure
   * he is notified regarding the changes he's going to lose.
   *
   * Ensure the component controlled by this component trigger an event "changed" while
   * their content is updated.
   */
  '{element} changed': function() {
    this._hasChanged = true;
  }

});

export default ActionsTabComponent;
