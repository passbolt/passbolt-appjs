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
import CommentCreateForm from 'app/form/comment/create';
import CommentsListComponent from 'app/component/comment/comments_list';
import CommentsSidebarSectionView from 'app/view/component/comment/comments_sidebar_section';
import MadBus from 'passbolt-mad/control/bus';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/comment/comments_sidebar_section.stache!';

var CommentsSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.comment.CommentsSidebarSection', /** @static */ {

    defaults: {
        label: 'Comments Controller',
        viewClass: CommentsSidebarSectionView,
        resource: null,
        foreignModel: null,
        foreignKey: null,
        template: template,
        state: 'loading',
        // For now we are using the can-connect/can/model/model to migrate our v2 models.
        // Canjs should be able to observe Map in a Control as a function, however it doesn't.
        // Test it again after we completed the migration of the model to the canjs style.
        Comment: Comment
    }

}, /** @prototype */ {

    /**
     * @inheritdoc
     */
    afterStart: function () {
        this._initForm();
        this._initCommentsList();
        this._loadComments();

        this._super();
    },

    /**
     * Initialize the form
     */
    _initForm: function() {
        var form = new CommentCreateForm('#js_rs_details_comments_add_form', {
            foreignModel: this.options.foreignModel,
            foreignKey: this.options.foreignKey,
            state: 'hidden'
        });
        form.start();
        this.addForm = form;
    },

    /**
     * Initialize the comments list
     */
    _initCommentsList: function() {
        var component = new CommentsListComponent('#js_rs_details_comments_list', {
            resource: this.options.resource,
            foreignModel: this.options.foreignModel,
            foreignKey: this.options.foreignKey,
            state: 'loading'
        });
        component.start();
        this.commentsList = component;
    },

    /**
     * Retrieve and load the comments
     */
    _loadComments: function() {
        var self = this;

        // Retrieve the comments
        Comment.findAll({
            foreignModel: this.options.foreignModel,
            foreignKey: this.options.foreignKey,
            contain: {creator: 1}
        }).then(function(comments) {
            // If no comments, display the comment add form.
            if (!comments.length) {
                self.addForm.setState('visible');
            } else {
                self.commentsList.load(comments);
            }
            self.commentsList.setState('ready');
            self.setState('ready');
        });
    },

    /**
     * Listen when a comment is created.
     * If the comment belong to the selected resource, display it.
     * @param model
     * @param ev
     * @param comment
     */
    '{Comment} created': function (model, ev, comment) {
        // If the new comment belongs to the displayed resource.
        if (comment.foreign_key == this.options.resource.id) {
            this.setState('loading');
            this.refresh();
        }
    },

    /**
     * Catches event request_delete_comment, and proceed with deleting a comment
     * @param model
     * @param ev
     * @param comment
     */
    '{mad.bus.element} request_delete_comment': function (model, ev, comment) {
        this.setState('loading');
        comment.destroy().then(function () {
            MadBus.trigger('comment_deleted', comment)
        });
    },

    /**
     * Listen when a comment entity is deleted.
     * If the comment belongs to the selected resource, remove it from the list.
     * @param model
     * @param ev
     * @param comment
     */
    '{mad.bus.element} comment_deleted': function (model, ev, comment) {
        this.commentsList.removeItem(comment);
        if (this.commentsList.options.items.length == 0) {
            this.addForm.emptyContent();
            this.addForm.setState('visible');
        }
        this.setState('ready');
    }
});

export default CommentsSidebarSectionComponent;
