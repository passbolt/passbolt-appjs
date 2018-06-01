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
import Comment from 'app/model/map/comment';
import CommentsListView from 'app/view/component/comment/comments_list';
import ConfirmComponent from 'passbolt-mad/component/confirm';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Tree from 'passbolt-mad/component/tree';
import User from 'app/model/map/user';

import commentDeleteConfirmTemplate from 'app/view/template/component/comment/delete_confirm.stache!';
import itemTemplate from 'app/view/template/component/comment/comment_item.stache!';

var CommentsListComponent = Tree.extend('passbolt.component.comment.CommentsList', /** @static */ {

	defaults: {
		label: 'Comments List Controller',
		viewClass: CommentsListView,
		itemClass: Comment,
		itemTemplate: itemTemplate,
		foreignModel: null,
		foreignKey: null
	}

}, /** @prototype */ {

	/**
	 * @inheritdoc
	 */
	init: function (el, options) {
		options.map = this._getMap();
		this._super(el, options);
	},

	/**
	 * Get the map
	 *
	 * @return {mad.Map}
	 */
	_getMap: function() {
		return new MadMap({
			id: 'id',
			content: 'content',
			modified: 'modified',
			creatorAvatarPath: {
				key: 'creator',
				func: function(creator, map, obj) {
					return creator.profile.avatarPath('small');
				}
			},
			creatorName: {
				key: 'creator',
				func: function(creator, map, obj) {
					return creator.profile.fullName();
				}
			}
		});
	},

    /**
     * @inheritdoc
     */
    insertItem: function (item, refItem, position) {
        this._super(item, refItem, position);

        // Unhide delete action if user is owner.
        var isOwner = item.created_by != undefined && item.created_by == User.getCurrent().id;
        if (isOwner) {
            var $deleteActionEl = $('li#' + item.id + ' .js_delete_comment', this.element);
            $deleteActionEl.removeClass('hidden');
        }
    },

	/**
	 * Catches a request_delete_comment coming from an item in the list then redistribute on mad bus
	 * @param elt
	 * @param evt
	 * @param data
	 */
	' request_delete_comment': function(elt, evt, data) {
        var confirm = ConfirmComponent.instantiate({
			label: __('Do you really want to delete?'),
			content: commentDeleteConfirmTemplate,
			submitButton: {
				label: __('delete comment'),
				cssClasses: ['warning']
			},
			action: function() {
				MadBus.trigger('request_delete_comment', data);
			}
		});
		confirm.start();
	}
});

export default CommentsListComponent;
