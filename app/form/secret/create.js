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
import Form from 'passbolt-mad/form/form';
import TextboxComponent from 'passbolt-mad/form/element/textbox';

const CreateForm = Form.extend('passbolt.form.secret.Create', /** @static */ {

  defaults: {
    action: 'create',
    secret_i: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    // Add secret id hidden field.
    this.addElement(
      new TextboxComponent(`#js_field_secret_id_${this.options.secret_i}`, {
        modelReference: 'Secret.id',
        validate: false
      }).start()
    );

    // Add secret user id hidden field.
    this.addElement(
      new TextboxComponent(`#js_field_secret_user_id_${this.options.secret_i}`, {
        modelReference: 'Secret.user_id',
        validate: false
      }).start()
    );

    // Add secret data hidden field.
    this.addElement(
      new TextboxComponent(`#js_field_secret_data_${this.options.secret_i}`, {
        state: {
          hidden: true
        },
        modelReference: 'Secret.data',
        validate: false
      }).start()
    );

    // Rebind controller events
    this.on();
  }

});

export default CreateForm;
