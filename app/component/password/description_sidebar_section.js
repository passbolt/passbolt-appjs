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
import ComponentHelper from 'passbolt-mad/helper/component';
import PermissionType from 'app/model/map/permission_type';
import ResourceEditDescriptionForm from 'app/form/resource/edit_description';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/password/description_sidebar_section.stache!';

const DescriptionSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.password.DescriptionSidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Description Controller',
    template: template,
    resource: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this.editing = false;
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('resource', this.options.resource);
    this.setViewData('canEdit', this._canUpdate());
  },

  /**
   * Check if the user can update the description
   * @return {boolean} True if yes, false otherwise
   * @private
   */
  _canUpdate: function() {
    const resource = this.options.resource;
    return resource.permission.isAllowedTo(PermissionType.UPDATE);
  },

  /**
   * Observe when the user click on the edit button
   */
  '{element} a#js_edit_description_button click': function() {
    if (!this._canUpdate()) {
      return;
    }
    if (!this.editing) {
      this.enableEditMode();
    } else {
      this.disableEditMode();
    }
  },

  /**
   * Observe when the user click on the edit button
   */
  '{element} p.description_content click': function() {
    if (!this._canUpdate() || this._editing) {
      return;
    }
    this.enableEditMode();
  },

  /**
   * Observe when the user click on the edit button
   */
  '{element} em.empty-content click': function() {
    if (!this._canUpdate() || this._editing) {
      return;
    }
    this.enableEditMode();
  },

  /**
   * Observe when the user want to cancel the edit operation.
   */
  '{element} #js_resource_description_edit_cancel click': function() {
    if (this.editing) {
      this.disableEditMode();
    }
  },

  /**
   * If a click is done while editing and this click is not on the component, cancel the edit.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{window} click': function(el, ev) {
    if (!this.editing) {
      return;
    }

    const componentIsSrc = this.element.id == ev.target.id;
    const componentIsParent = $(ev.target).parents(`#${this.getId()}`).length;
    if (!componentIsSrc && !componentIsParent) {
      this.disableEditMode();
    }
  },

  /**
   * Enable the description edit mode.
   */
  enableEditMode: function() {
    this.editing = true;
    const resource = this.options.resource;
    const formOptions = {
      id: 'js_rs_details_edit_description',
      resource: resource,
      data: {
        Resource: resource
      },
      callbacks: {
        submit: formData => {
          this._saveResource(resource, formData);
        }
      }
    };
    $('.description_content, .empty-content', this.element).addClass('hidden');
    const selector = $('.accordion-content', this.element);
    const form = ComponentHelper.create(selector, 'last', ResourceEditDescriptionForm, formOptions);
    form.start();
    this.form = form;
  },

  /**
   * Enable the description edit mode.
   */
  disableEditMode: function() {
    this.editing = false;
    this.form.destroyAndRemove();
    $('.description_content, .empty-content', this.element).removeClass('hidden');
  },

  /**
   * Save a resource after the description is edited.
   * @param {Resource} resource The target resource
   * @param {Form} form The form data object
   */
  _saveResource: function(resource, formData) {
    resource.description = formData['Resource']['description'];
    resource.__FILTER_CASE__ = 'edit_description';
    resource.save();
    this.disableEditMode();
  }
});

export default DescriptionSidebarSectionComponent;
