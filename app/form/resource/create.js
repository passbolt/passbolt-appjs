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
import $ from 'jquery';
import domEvents from 'can-dom-events';
import FeedbackComponent from 'passbolt-mad/form/feedback';
import Form from 'passbolt-mad/form/form';
import MadBus from 'passbolt-mad/control/bus';
import ResourceService from '../../model/service/plugin/resource';
import SecretCreateForm from '../../form/secret/create';
import TextboxComponent from 'passbolt-mad/form/element/textbox';
import User from '../../model/map/user';

import template from '../../view/template/form/resource/create.stache';

const CreateForm = Form.extend('passbolt.form.resource.Create', /** @static */ {

  defaults: {
    secretField: null,
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
  afterStart: function() {
    const self = this;
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
    /*
     * Add secrets forms.
     * @todo Cleanup wanted.
     */
    const secrets = this.options.data.secrets;
    if (secrets) {
      const secret = secrets.filter(secret => secret.user_id == User.getCurrent().id)[0];
      const secretForm = new SecretCreateForm('#js_secret_edit_0', {
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

    // Request the plugin to insert the secret iframe
    ResourceService.insertEditframe(this.options.data.id);

    // Force focus on first element.
    setTimeout(() => {
      self.setInitialFocus();
    }, 100);
  },

  /**
   * Set initial focus on the name field.
   *
   * If field is populated, then also select the content.
   */
  setInitialFocus: function() {
    const initialFocusEl = $('#js_field_name');
    initialFocusEl.focus();
    if (initialFocusEl.val() != '') {
      initialFocusEl.select();
    }
  },

  /**
   * @see parent::validate();
   */
  validate: function() {
    /*
     * Request the plugin to validate the secret.
     * Once the secret has been validated, the plugin will trigger the event secret_edition_secret_validated.
     */
    MadBus.trigger('passbolt.secret_edition.validate');

    // Validate the form elements.
    this.lastValidationResult = this._super();
  },

  /**
   * Encrypt the secret.
   */
  encrypt: function() {
    if (this.options.action == 'edit') {
      /*
       * Get the users to encrypt the resource for.
       * @todo #PASSBOLT-1248 #security
       */
      const findOptions = {
        filter: {
          'has-access': this.options.data.id
        }
      };
      User.findAll(findOptions)
        .then(users => {
          const usersIds = [];
          users.forEach(user => {
            usersIds.push(user.id);
          });
          /*
           * Request the plugin to encrypt the secrets.
           * When the secrets are encrypted the plugin will trigger the event secret_edition_secret_encrypted.
           */
          MadBus.triggerPlugin('passbolt.secret_edition.encrypt', usersIds);
        });
    }
  },

  /**
   * @See parent::submit();
   */
  '{element} submit': function(el, ev) {
    ev.preventDefault();
    this.validate();
  },

  /**
   * Listen when the plugin has validated the secret.
   * This function is called as callback of the event passbolt.secret_edition.validate.
   * The validation of the secret is done aynchronously, once the validation is done
   * continue the submit process.
   */
  '{mad.bus.element} secret_edition_secret_validated': function(el, ev) {
    const secretValidated = ev.data[0];

    // If the validation of the secret failed.
    if (!secretValidated) {
      // Mark the field wrapper as in error.
      $('.js_form_secret_wrapper').addClass('error');
    } else {
      // Unmark the field wrapper in case it was marked as in error.
      $('.js_form_secret_wrapper').removeClass('error');
    }

    // If the something went wrong during the validation.
    if (!this.lastValidationResult || !secretValidated) {
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
  '{mad.bus.element} secret_edition_secret_encrypted': function(el, ev) {
    const armoreds = ev.data;
    const data = this.getData();
    data['Resource'].secrets = [];

    for (const userId in armoreds) {
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
  '{mad.bus.element} secret_edition_secret_changed': function() {
    domEvents.dispatch(this.element, {type: 'changed'});
  },

  /* ************************************************************** */
  /* KEYBOARDS EVENTS */
  /* ************************************************************** */

  /**
   * Listen when a tab key is pressed inside the username field.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} #js_field_username keydown': function(el, ev) {
    const code = ev.keyCode || ev.which;
    if (code == '9') {
      // Put focus on secret field (in plugin).
      MadBus.trigger('passbolt.secret.focus');
    }
  },

  /**
   * Listen when a tab key is pressed inside the description field.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} #js_field_description keydown': function(el, ev) {
    const code = ev.keyCode || ev.which;
    if (code == '9' && ev.shiftKey) {
      // Put focus on secret field (in plugin).
      MadBus.trigger('passbolt.secret.focus');
    }
  },

  /**
   * Listen when tab key is pressed inside secret field.
   * (secret field is provided by plugin)
   */
  '{mad.bus.element} secret_tab_pressed': function() {
    // Put focus on description field.
    $('#js_field_description').focus();
  },

  /**
   * Listen when backtab key is pressed inside secret field.
   * (secret field is provided by plugin)
   */
  '{mad.bus.element} secret_backtab_pressed': function() {
    // Put focus on username field.
    $('#js_field_username').focus();
  }
});

export default CreateForm;
