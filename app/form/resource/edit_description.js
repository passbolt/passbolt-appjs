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
import Feedback from 'passbolt-mad/form/feedback';
import Form from 'passbolt-mad/form/form';
import Textbox from 'passbolt-mad/form/element/textbox';

import template from '../../view/template/form/resource/edit_description.stache';

const EditDescriptionForm = Form.extend('passbolt.form.resource.EditDescription', /** @static */ {

  defaults: {
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    // Resource id
    const idSelector = `#${this.element.id} .js_resource_id`;
    const idOptions = {
      modelReference: 'Resource.id',
      value: this.options.data.Resource.id
    };
    const idTextbox = new Textbox(idSelector, idOptions);
    this.addElement(idTextbox).start();

    // Description
    const descriptionSelector = `#${this.element.id} .js_resource_description`;
    const descriptionOptions = {
      modelReference: 'Resource.description',
      value: this.options.data.Resource.description
    };
    const descriptionTextbox = new Textbox(descriptionSelector, descriptionOptions).start();
    const descriptionFeedback = new Feedback(`#${this.element.id} .js_resource_description_feedback`).start();
    this.addElement(descriptionTextbox, descriptionFeedback);
  }
});

export default EditDescriptionForm;
