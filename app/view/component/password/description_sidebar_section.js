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
import SidebarSectionView from 'app/view/component/workspace/secondary_sidebar_section';

var Description = SidebarSectionView.extend('passbolt.view.component.sidebarSection.Description', /** @static */ {

}, /** @prototype */ {

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the user clicks on the edit button, or the description content, to modify the description content
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'a#js_edit_description_button, p.description_content click': function (el, ev) {
        if (this.getController().getViewData('editable') !== false) {
			$(this.element).trigger('request_resource_description_edit');
        }
	},

    /**
     * Observe when a click is done anywhere in the window.
     * If a click is done while being in edit mode, we cancel the edit and back to normal state.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
     */
    '{window} click': function(el, ev) {
        // Are we in edit state.
        var isEditState = this.getController().state.is('edit');
        // Source of the click.
        var evtSrc = ev.originalEvent.target;
        // Description p element.
        var descriptionElt = $('p.description_content', this.getController().element).get(0);
        // Edit button element.
        var editButtonElement = $('a#js_edit_description_button i', this.getController().element).get(0);
        // Is the click providing from an element that triggers edit ?
        var clickIsOnEditElement = descriptionElt == evtSrc || editButtonElement == evtSrc;

        // If we are in edit mode, and the click doesn't come from the element containing the description.
        if (isEditState && ! clickIsOnEditElement) {
            // We intercept the click only if it's outside of the form.
            var $form = $('.form-content', this.getController().element);
            var contained = $.contains($form.get(0), evtSrc);
            if (!contained) {
                this.getController().setState('ready');
            }
        }
    },

	/**
	 * Set the visibility of the description
	 *
	 * @param {boolean} visible Whether it is visible
	 */
	showDescription: function(visible) {
		if(visible) {
			$('.description_content', $(this.element)).show();
		}
		else {
			$('.description_content', $(this.element)).hide();
		}
	}
});
export default Description;
