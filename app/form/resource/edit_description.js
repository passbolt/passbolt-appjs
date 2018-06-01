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

import template from 'app/view/template/form/resource/edit_description.stache!';

var EditDescriptionForm = Form.extend('passbolt.form.resource.EditDescription', /** @static */ {

	defaults : {
		template: template,
		// The current resource
		resource: null,
		// Description field.
		descriptionField: null
	}

}, /** @prototype */ {
	
	/**
	 * @inheritdoc
	 */
	afterStart : function() {
		// id hidden field
		//@todo ID_ERROR
		this.addElement(new TextboxComponent('#' + this.element.id + ' .js_resource_id', {
			modelReference : 'Resource.id'
		}).start().setValue(this.options.resource.id));

		// Init the description field.
		this.options.descriptionField = this.addElement(
			new TextboxComponent('#' + this.element.id + ' .js_resource_description', {
				modelReference : 'Resource.description'
			}).start(),
			new FeedbackComponent('#' + this.element.id + ' .js_resource_description_feedback', {}).start()
		);

		// Update the resource description with current value
		this.options.descriptionField.setValue(this.options.resource.description);

		// Force event submit event (not thrown by default)
		// TODO : understand why we need to do that... weird
		$('.button.resource-submit').click(function(){
			$(this).trigger('submit');
		});
	},

    /**
     * Reset description in description field.
     * @param description
     */
    reset : function(description) {
        this._super();
        if (description == undefined) {
            description = this.options.resource.description;
        }
        this.options.descriptionField.setValue(description);
    }
});

export default EditDescriptionForm;
