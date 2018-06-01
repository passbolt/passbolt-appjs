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
import Config from 'passbolt-mad/config/config';
import FeedbackComponent from 'passbolt-mad/form/feedback';
import Form from 'passbolt-mad/form/form';
import MadBus from 'passbolt-mad/control/bus';
import Resource from 'app/model/map/resource';
import SecretCreateForm from 'app/form/secret/create';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import User from 'app/model/map/user';

import template from 'app/view/template/form/resource/create.stache!';

var CreateForm = Form.extend('passbolt.form.resource.Create', /** @static */ {

	defaults: {
		secretField: null,
		// @todo should be dynamic functions of creation or update
		action: 'create',
		secretsForms: [],
		resource: null,
		template: template,
		lastValidationResult: false
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	beforeRender: function() {
		this._super();
		this.setViewData('resource', this.options.data);
	},

	/**
	 * @inheritdoc
	 */
	afterStart: function () {
		var self = this;
		// temporary for update demonstration
		this.options.data.Resource = this.options.data.Resource || {};

		// Add resource id hidden field
		this.addElement(
			new TextboxComponent('#js_field_resource_id', {
				modelReference: 'Resource.id',
				validate: false
			}).start()
		);
		// Add resource name field
		this.addElement(
			new TextboxComponent('#js_field_name', {
				modelReference: 'Resource.name'
			}).start(),
			new FeedbackComponent('#js_field_name_feedback', {}).start()
		);
		// Add resource uri field
		this.addElement(
			new TextboxComponent('#js_field_uri', {
				modelReference: 'Resource.uri'
			}).start(),
			new FeedbackComponent('#js_field_uri_feedback', {}).start()
		);
		// Add resource username field
		this.addElement(
			new TextboxComponent('#js_field_username', {
				modelReference: 'Resource.username'
			}).start(),
			new FeedbackComponent('#js_field_username_feedback', {}).start()
		);
		// Add secrets forms.
		// @todo Cleanup wanted.
		var secrets = this.options.data.secrets;
		if (secrets) {
			var secret = secrets.filter(secret => secret.user_id == User.getCurrent().id)[0];
			var secretForm = new SecretCreateForm('#js_secret_edit_0', {
				data: secret,
				secret_i: 0
			});
			secretForm.start();
			secretForm.load({
				Secret: secret
			});
			self.options.secretsForms.push(secretForm);
		}
		// Add resource description field
		this.addElement(
			new TextboxComponent('#js_field_description', {
				modelReference: 'Resource.description'
			}).start(),
			new FeedbackComponent('#js_field_description_feedback', {}).start()
		);

		// If an instance of resource has been given, load it.
		if (this.options.data != null) {
			this.load({
				Resource: this.options.data
			});
		}

		// Notify the plugin that the resource is ready to be edited.
		MadBus.trigger('passbolt.plugin.resource_edition');

		// Force focus on first element.
		setTimeout(function() {
			self.setInitialFocus();
		}, 100);
	},

	/**
	 * Set initial focus on the name field.
	 *
	 * If field is populated, then also select the content.
	 */
	setInitialFocus: function() {
		var initialFocusEl = $('#js_field_name');
		initialFocusEl.focus();
		if (initialFocusEl.val() != '') {
			initialFocusEl.select();
		}
	},

	/**
	 * @see parent::validate();
	 */
	validate: function() {
		// Request the plugin to validate the secret.
		// Once the secret has been validated, the plugin will trigger the event secret_edition_secret_validated.
		MadBus.trigger('passbolt.secret_edition.validate');

		// Validate the form elements.
		this.lastValidationResult = this._super();
	},

	/**
	 * Encrypt the secret.
	 */
	encrypt: function() {
		var usersIds = [];

		if (this.options.action == 'edit') {
			// Get the users to encrypt the resource for.
			// @todo #PASSBOLT-1248 #security
			var findOptions = {
				filter: {
					'has-access': this.options.data.id
				}
			};
			User.findAll(findOptions)
				.then(function (users) {
					var usersIds = [];
					users.forEach(function(user) {
						usersIds.push(user.id);
					});
					// Request the plugin to encrypt the secrets.
					// When the secrets are encrypted the plugin will trigger the event secret_edition_secret_encrypted.
					MadBus.trigger('passbolt.secret_edition.encrypt', usersIds);
				});
		} else {
			usersIds.push(User.getCurrent().id);
			// Request the plugin to encrypt the secrets.
			// When the secrets are encrypted the plugin will trigger the event secret_edition_secret_encrypted.
			MadBus.trigger('passbolt.secret_edition.encrypt', usersIds);
		}
	},

	/**
	 * @See parent::submit();
	 */
	' submit': function (el, ev) {
		ev.preventDefault();
		this.validate();
	},

	/**
	 * Listen when the plugin has validated the secret.
	 * This function is called as callback of the event passbolt.secret_edition.validate.
	 * The validation of the secret is done aynchronously, once the validation is done
	 * continue the submit process.
	 */
	'{mad.bus.element} secret_edition_secret_validated': function(el, ev, secretValidated) {
		// If the validation of the secret failed.
		if (!secretValidated) {
			// Mark the field wrapper as in error.
			$('.js_form_secret_wrapper').addClass('error');
		} else {
			// Unmark the field wrapper in case it was marked as in error.
			$('.js_form_secret_wrapper').removeClass('error');
		}

		// If the something went wrong during the validation.
		if (!this.lastValidationResult || !secretValidated){
			// If the validation failed, call the error callback, if given.
			if (this.options.callbacks.error) {
				this.options.callbacks.error();
			}
			return;
		}

		// If all fields are valid, encrypt the secret and continue.
		this.encrypt();
	},

	/**
	 * Listen when the plugin has encrypted the secrets.
	 * This function is called as callback of the event passbolt.secret_edition.encrypt.
	 */
	'{mad.bus.element} secret_edition_secret_encrypted': function(el, ev, armoreds) {
		var data = this.getData();
		data['Resource'].secrets = [];

		for (var userId in armoreds) {
			data['Resource'].secrets.push({
				user_id: userId,
				data: armoreds[userId]
			});
		}

		// if a submit callback is given, call it
		if (this.options.callbacks.submit) {
			this.options.callbacks.submit(data);
		}
	},

	/**
	 * Listen when the plugin observed a change on the password.
	 */
	'{mad.bus.element} secret_edition_secret_changed': function(el, ev, armoreds) {
		$(this.element).trigger('changed', 'secret');
	},

	/* ************************************************************** */
	/* KEYBOARDS EVENTS */
	/* ************************************************************** */

	/**
	 * Listen when a tab key is pressed inside the username field.
	 * @param el
	 * @param ev
	 */
	'#js_field_username keydown': function(el, ev) {
		var code = ev.keyCode || ev.which;
		if (code == '9') {
			// Put focus on secret field (in plugin).
			MadBus.trigger('passbolt.secret.focus');
		}
	},

	/**
	 * Listen when a tab key is pressed inside the description field.
	 * @param el
	 * @param ev
	 */
	'#js_field_description keydown': function(el, ev) {
		var code = ev.keyCode || ev.which;
		if (code == '9' && ev.shiftKey) {
			// Put focus on secret field (in plugin).
			MadBus.trigger('passbolt.secret.focus');
		}
	},

	/**
	 * Listen when tab key is pressed inside secret field.
	 * (secret field is provided by plugin)
	 * @param el
	 * @param ev
	 */
	'{mad.bus.element} secret_tab_pressed': function(el, ev) {
		// Put focus on description field.
		$('#js_field_description').focus();
	},

	/**
	 * Listen when backtab key is pressed inside secret field.
	 * (secret field is provided by plugin)
	 * @param el
	 * @param ev
	 */
	'{mad.bus.element} secret_backtab_pressed': function(el, ev) {
		// Put focus on username field.
		$('#js_field_username').focus();
	}
});

export default CreateForm;
