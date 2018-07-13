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
import DomData from 'can-dom-data';
import domEvents from 'can-dom-events';
import TreeView from 'passbolt-mad/view/component/tree';

var CommentsListView = TreeView.extend('passbolt.view.component.comment.CommentsList', /** @static */ {

}, /** @prototype */ {

	/**
	 * Observe when the user clicks on the delete button for comment
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	' .actions a.js_delete_comment click': function (el, ev) {
		ev.stopPropagation();
		ev.preventDefault();

		var data = null;
		var $li = $(el).parents('li.comment-wrapper');
		var itemClass = this.getController().getItemClass();

		if (itemClass) {
			data = DomData.get($li[0], itemClass.shortName);
		} else {
			data = $li[0].id;
		}

		domEvents.dispatch(el, {type: 'request_delete_comment', data: {item: data}});
	}
});

export default CommentsListView;
