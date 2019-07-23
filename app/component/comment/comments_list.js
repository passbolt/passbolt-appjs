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
import Comment from '../../model/map/comment';
import DomData from 'can-dom-data';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Tree from 'passbolt-mad/component/tree';
import User from '../../model/map/user';

import itemTemplate from '../../view/template/component/comment/comment_item.stache';

const CommentsListComponent = Tree.extend('passbolt.component.comment.CommentsList', /** @static */ {

  defaults: {
    label: 'Comments List Controller',
    itemClass: Comment,
    itemTemplate: itemTemplate
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    options.map = this._getMap();
    this._super(el, options);
  },

  /**
   * Get the map
   *
   * @return {UtilMap}
   */
  _getMap: function() {
    return new MadMap({
      id: 'id',
      content: 'content',
      modified: 'modified',
      creatorAvatarPath: {
        key: 'creator',
        func: creator => creator.profile.avatarPath('small')
      },
      creatorName: {
        key: 'creator',
        func: creator => creator.profile.fullName()
      },
      isOwner: {
        key: 'created_by',
        func: createdBy => createdBy == User.getCurrent().id
      }
    });
  },

  /**
   * Observe when the user clicks on the delete button for comment
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} .actions a.js_delete_comment click': function(el, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const $li = $(el).parents('li.comment-wrapper');
    const comment = DomData.get($li[0], Comment.shortName);
    MadBus.trigger('request_delete_comment', {comment: comment});
  }
});

export default CommentsListComponent;
