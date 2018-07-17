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
import SecondarySidebarSectionView from 'app/view/component/workspace/secondary_sidebar_section';

const CommentsSidebarSectionView = SecondarySidebarSectionView.extend('passbolt.view.component.comment.CommentsSidebarSection', /** @static */ {

}, /** @prototype */ {

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user clicks on the plus button, to add a comment
   */
  '{element} a.js_add_comment click': function() {
    // Displays the add comment form
    this.getController().addForm.setState('ready');
  }
});

export default CommentsSidebarSectionView;
