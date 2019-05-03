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
import ComponentHelper from 'passbolt-mad/helper/component';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/comment/comments_sidebar_section.stache!';

const CommentsSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.comment.CommentsSidebarSection', /** @static */ {

  defaults: {
    label: 'Comments Controller',
    loadedOnStart: false,
    resource: null,
    foreignModel: null,
    foreignKey: null,
    template: template,
    Comment: Comment
  },

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initCommentsList();
    if (this.state.opened) {
      this.open();
    }
    this._super();
  },

  /**
   * Initialize the comments list
   */
  _initCommentsList: function() {
    const component = new CommentsListComponent('#js_rs_details_comments_list', {
      resource: this.options.resource,
      foreignModel: this.options.foreignModel,
      foreignKey: this.options.foreignKey,
      state: 'loading'
    });
    component.start();
    this.commentsList = component;
  },

  /**
   * @inheritdoc
   */
  open: function() {
    $('.processing-wrapper', this.element).show();
    this.commentsList.reset();
    this._findComments()
      .then(comments => {
        $('.processing-wrapper', this.element).hide();
        this._loadComments(comments);
      });
    this._super();
  },

  /**
   * Find the comments
   */
  _findComments: function() {
    const findOptions = {
      foreignKey: this.options.foreignKey,
      contain: {creator: 1}
    };
    return Comment.findAll(findOptions);
  },

  /**
   * Load comments in the list or display the form.
   * @param {Comment.List} comments
   * @private
   */
  _loadComments: function(comments) {
    if (this.state.destroyed) {
      return;
    }
    this.commentsList.reset();
    if (comments.length) {
      this.commentsList.load(comments);
    } else {
      this._enableForm();
    }
    this.commentsList.state.loaded = true;
    this.state.loaded = true;
  },

  /**
   * Initialize the form
   */
  _enableForm: function() {
    if (this.form) {
      return;
    }
    const formOptions = {
      id: 'js_rs_details_comments_add_form',
      foreignModel: this.options.foreignModel,
      foreignKey: this.options.foreignKey,
      tag: 'div',
      callbacks: {
        submit: formData => {
          this._saveComment(formData, form);
        }
      }
    };
    const selector = $('.accordion-content #js_rs_details_comments_list', this.element);
    const form = ComponentHelper.create(selector, 'before', CommentCreateForm, formOptions);
    form.start();
    this.form = form;
  },

  /**
   * Save a comment
   * @param {array} formData Data returned by the form
   * @private
   */
  _saveComment: function(formData) {
    const comment = new Comment(formData['Comment']);
    comment.save()
      .then(() => {
        $(this.form.destroyAndRemove());
        this.form = null;
      });
  },

  /**
   * Listen when a comment is created.
   * @param {Comment.prototype} Comment The comment defined map
   * @param {HTMLElement} el The element the event occurred on
   * @param {Comment} comment The created comment
   */
  '{Comment} created': function(model, ev, comment) {
    // If the new comment belongs to the displayed resource, refresh the component.
    if (comment.foreign_key == this.options.resource.id) {
      this.state.loaded = false;
      this._findComments()
        .then(comments => this._loadComments(comments));
    }
  },

  /**
   * Listen when a comment is created.
   * @param {Comment.prototype} Comment The comment defined map
   * @param {HTMLElement} el The element the event occurred on
   * @param {Comment} comment The created comment
   */
  '{Comment} destroyed': function(model, ev, comment) {
    this.commentsList.removeItem(comment);
    if (this.commentsList.options.items.length == 0) {
      this._enableForm();
    }
  },

  /**
   * Observe when the user clicks on the plus button, to add a comment
   */
  '{element} a.js_add_comment click': function() {
    this._enableForm();
  }
});

export default CommentsSidebarSectionComponent;
