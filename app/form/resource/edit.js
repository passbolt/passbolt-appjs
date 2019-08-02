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
 * @since         2.4.0
 */
import $ from 'jquery/dist/jquery.min.js';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import CreateForm from '../../form/resource/create';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';

import createTemplatetemplate from '../../view/template/form/resource/create.stache';
import template from '../../view/template/form/resource/edit.stache';

const EditForm = CreateForm.extend('passbolt.form.resource.Edit', /** @static */ {

  defaults: {
    secretField: null,
    action: 'edit',
    secretsForms: [],
    template: template,
    lastValidationResult: false
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('createTemplate', createTemplatetemplate);
  },

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
    const text = __('You need to save to apply the changes.');
    $('#js-edit-feedbacks', this.element)
      .text(text)
      .addClass('warning')
      .removeClass('hidden');
  },

  /**
   * Go to the share tab
   * @private
   */
  _goToShareTab: function() {
    MadBus.trigger('request_resource_share', {
      resource: this.options.data
    });
  },

  /**
   * Make the user confirm the tab change
   * @param {string} tabId id of the tab to enable
   */
  _confirmChangeTab: function() {
    if (!this._hasChanged) {
      return this._goToShareTab();
    }

    const confirmDialog = ConfirmDialogComponent.instantiate({
      label: __('Do you really want to leave ?'),
      content: __('There are unsaved changes, you might want to save them before leaving.'),
      submitButton: {
        label: __('Leave anyway'),
        cssClasses: ['warning']
      },
      action: () => this._goToShareTab()
    });
    confirmDialog.start();
  },

  /**
   * The user wants to go to the share tab.
   */
  '{element} #js-share-go-to-share click': function() {
    this._confirmChangeTab();
  }
});

export default EditForm;
