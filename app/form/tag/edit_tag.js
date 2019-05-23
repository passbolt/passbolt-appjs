/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.11.0
 */

import Form from "passbolt-mad/form/form";
import Button from "passbolt-mad/component/button";
import User from "app/model/map/user";
import TextboxComponent from "passbolt-mad/form/element/textbox";
import FeedbackComponent from "passbolt-mad/form/feedback";
import template from "app/view/template/form/tag/edit.stache!";

const EditTagForm = Form.extend(
  "passbolt.form.tag.Edit",
  /** @static */ {
    defaults: {
      template: template
    }
  },
  /** @prototype */ {
    /**
     * @inheritdoc
     */
    init: function(el, options) {
      this._super(el, options);
    },

    /**
     * @inheritdoc
     */
    afterStart: function() {
      // Add resource id hidden field
      this.addElement(
        new TextboxComponent("#js_field_tag_id", {
          modelReference: "Tag.id",
          validate: false
        }).start()
      );

      // Add resource name field
      this.addElement(
        new TextboxComponent("#js_field_tag_slug", {
          modelReference: "Tag.slug"
        }).start(),
        new FeedbackComponent("#js_field_tag_slug_feedback", {}).start()
      );

      this.saveButton = new Button("#js-tag-edit-dialog-submit");

      if (this.options.data != null) {
        this.load({
          Tag: this.options.data
        });
      }
    },

    /**
     * Observe change in the tag edit form
     * and warn if a non admin tries to change a personal tag
     * into a shared tag
     */
    "{element} #js_field_tag_slug keyup": function(el) {
      const wrapper = document.getElementById("js_field_tag_slug_wrapper");
      const feedback = document.getElementById("js_field_tag_slug_feedback");
      const oldSlug = this.options.data.slug;
      const newSlug = el.value;

      if (/^#/.test(newSlug) && !User.getCurrent().isAdmin()) {
        wrapper.classList.add("error");
        feedback.textContent =
          "A personal tag cannot be renamed as a shared tag.";
        feedback.classList.add("error");
        this.saveButton.state.disabled = true;
      } else if (/^#/.test(oldSlug) && !/^#/.test(newSlug)) {
        wrapper.classList.add("error");
        feedback.textContent =
          "A shared tag cannot be renamed as a personal tag.";
        feedback.classList.add("error");
        this.saveButton.state.disabled = true;
      } else {
        wrapper.classList.remove("error");
        feedback.textContent = "";
        feedback.classList.remove("error");
        this.saveButton.state.disabled = false;
      }
    },

    /**
     * Listen when the user want to save the changes.
     */
    "{window} form.passbolt\\.form\\.tag\\.Edit submit": function() {
      if (this.validate()) {
        this.state.loaded = false;
        const formData = this.getData();
        this.options.data.assign(formData.Tag);
        this.options.data
          .save()
          .then(updatedTag => {
            this.options.callbacks.save(updatedTag);
            this.state.loaded = true;
          })
          .catch(() => {
            this.state.loaded = true;
          });
      }
    }
  }
);

export default EditTagForm;
