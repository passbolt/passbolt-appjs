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
import $ from 'jquery/dist/jquery.min.js';
import View from 'passbolt-mad/view/view';

const PrimarySidebarSectionView = View.extend('passbolt.view.component.PrimarySidebarSection', /** @static */ {

}, /** @prototype */ {

  /**
   * Open the section.
   */
  open: function() {
    $('.accordion-content', this.element).slideDown(50);
    $(this.element).removeClass('closed');
  },

  /**
   * Close the section
   */
  close: function() {
    $('.accordion-content', this.element).slideUp(50);
    $(this.element).addClass('closed');
  },

  /**
   * Observe when accordion-header is clicked.
   */
  '{element} a.accordion-trigger click': function() {
    if ($(this.element).hasClass('closed')) {
      this.open();
    } else {
      this.close();
    }
  }

});

export default PrimarySidebarSectionView;
