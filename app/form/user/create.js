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
import FeedbackComponent from 'passbolt-mad/form/feedback';
import Form from 'passbolt-mad/form/form';
import getObject from 'can-util/js/get/get';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import User from 'app/model/map/user';
import Role from 'app/model/map/role';

import template from 'app/view/template/form/user/create.stache!';

const CreateForm = Form.extend('passbolt.form.user.Create', /** @static */ {

  defaults: {
    action: 'create',
    template: template,
    userRoleIdElement: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('create', this.options.action == 'create');
    this.setViewData('isAdmin', User.getCurrent().isAdmin());
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const isAdmin = User.getCurrent().isAdmin();

    // Check if current user is editing his own profile.
    let editingOwnProfile = false;
    if (this.options.data != undefined && this.options.data.id == User.getCurrent().id) {
      editingOwnProfile = true;
    }

    // Add user id hidden field
    this.addElement(
      new TextboxComponent('#js_field_user_id', {
        modelReference: 'User.id',
        validate: false
      }).start()
    );

    // Add role id hidden field
    let roleId = getObject(this.options.data, 'User.role_id');
    if (!roleId) {
      roleId = Role.toId('user');
    }
    this.options.userRoleIdElement = this.addElement(
      new TextboxComponent('#js_field_role_id', {
        modelReference: 'User.role_id',
        validate: false,
        value: roleId
      }).start()
    );

    // Add user first name field.
    this.addElement(
      new TextboxComponent('#js_field_first_name', {
        modelReference: 'User.profile.first_name'
      }).start(),
      new FeedbackComponent('#js_field_first_name_feedback', {}).start()
    );

    // Add user last name field
    this.addElement(
      new TextboxComponent('#js_field_last_name', {
        modelReference: 'User.profile.last_name'
      }).start(),
      new FeedbackComponent('#js_field_last_name_feedback', {}).start()
    );

    /*
     * Adapt the is_admin checkbox
     * This checkbox will drive the js_field_role_id hidden field
     */
    if (isAdmin === true) {
      // Check the is_admin checkbox if the user is admin
      if (this.options.data.isAdmin()) {
        $('#js_field_is_admin input').prop('checked', true);
      }
      // Admin cannot edit its own role.
      if (editingOwnProfile == true) {
        $('input[type=checkbox]', $('#js_field_is_admin')).attr('disabled', true);
        $('#js_field_is_admin').parent().addClass('disabled');
      }
    }

    // Add resource username field
    this.addElement(
      new TextboxComponent('#js_field_username', {
        modelReference: 'User.username'
      }).start(),
      new FeedbackComponent('#js_field_username_feedback', {}).start()
    );

    // If an instance of user has been given, load it.
    if (this.options.data != null) {
      this.load({
        User: this.options.data
      });
    }

    // Rebind controller events
    this.on();
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Observe when a role is changed. If no role is selected, select user as default.
   * @param {HTMLElement} el The element the event occurred on
   */
  '#js_field_is_admin input change': function(el) {
    const isChecked = $(el).is(':checked');
    if (isChecked) {
      this.options.userRoleIdElement.setValue(Role.toId('admin'));
    } else {
      this.options.userRoleIdElement.setValue(Role.toId('user'));
    }
  }

});

export default CreateForm;
