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
import TextboxComponent from 'passbolt-mad/form/element/textbox';

import template from '../../view/template/form/group/create.stache';

const CreateForm = Form.extend('passbolt.form.group.Create', /** @static */ {

  defaults: {
    action: 'create',
    template: template,
    cssClasses: ['group_edit_form'],
    canUpdateName: true
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    // Add user first name field.
    this.addElement(
      new TextboxComponent('#js_field_name', {
        modelReference: 'Group.name',
        state: {
          disabled: !this.options.canUpdateName
        }
      }).start(),
      new FeedbackComponent('#js_field_name_feedback', {}).start()
    );

    this.on();
  }

});

export default CreateForm;
