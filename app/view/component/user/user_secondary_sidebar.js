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
import domEvents from 'can-dom-events';
import SecondarySidebarView from 'app/view/component/workspace/secondary_sidebar';

const UserSecondarySidebarView = SecondarySidebarView.extend('passbolt.view.component.user.UserSecondarySidebar', /** @static */ {

}, /** @prototype */ {

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user clicks on the copy key button.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} a.copy-public-key click': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    domEvents.dispatch(this.element, {type: 'request_copy_publickey'});
  }
});

export default UserSecondarySidebarView;
