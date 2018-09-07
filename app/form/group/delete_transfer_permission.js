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
import DropdownComponent from 'passbolt-mad/form/element/dropdown';
import Form from 'passbolt-mad/form/form';
import getObject from 'can-util/js/get/get';
import Permission from 'app/model/map/permission';

import template from 'app/view/template/form/group/delete_transfer_permissions.stache!';

const DeleteTransferPermissionForm = Form.extend('passbolt.form.group.DeleteTransferPermissionForm', /** @static */ {

  defaults: {
    template: template,
    group: null,
    groupDelete: {}
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this.group = this.options.group;
    const groupDelete = this.options.groupDelete;
    this.resources = groupDelete.getResourcesToTransferOwner();
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this.setViewData('resources', this.resources);
    this.setViewData('group', this.group);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initResourcesTransferSection();
  },

  /**
   * Initialize the resources transfer section
   */
  _initResourcesTransferSection: function() {
    this.resources.forEach(resource => {
      const permissions = new Permission.List(resource.permissions);
      permissions.sortAlphabetically();
      const aros = this._prepareResourcesTransferArosViewData(permissions);
      const dropdownSelector = `transfer_resource_owner_${resource.id}`;
      const dropdown = new DropdownComponent(`#${dropdownSelector}`, {
        emptyValue: false,
        validate: false,
        modelReference: `transfer.owners.${resource.id}`,
        availableValues: aros,
        value: Object.keys(aros)[0]
      });
      dropdown.start();
      this.addElement(dropdown);
    });
  },

  /**
   * Prepare a resource transfer available users or groups for the view.
   * @param {Permission.List} permissions
   * @return {object}
   */
  _prepareResourcesTransferArosViewData: function(permissions) {
    return permissions.reduce((carry, permission) => {
      const value = permission.id;
      const label = permission.user ? `${permission.user.profile.first_name} ${permission.user.profile.last_name} (${permission.user.username})` : `${permission.group.name} (Group)`;
      carry[value] = label;
      return carry;
    }, {});
  },

  /**
   * Format the data.
   * @inheritdoc
   */
  getData: function() {
    const data = this._super();
    const owners = getObject(data, 'transfer.owners') || {};
    const transfer = {owners: []};

    for (const aco in owners) {
      transfer.owners.push({aco_foreign_key: aco, id: owners[aco]});
    }

    return transfer;
  }

});

export default DeleteTransferPermissionForm;
