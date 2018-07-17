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
import Filter from 'app/model/filter';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import PermissionType from 'app/model/map/permission_type';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';
import Tag from 'app/model/map/tag';
import TreeComponent from 'passbolt-mad/component/tree';
import View from 'passbolt-mad/view/view';
import 'lib/jquery.tag-editor.js';
import 'lib/autocomplete.js';

import template from 'app/view/template/component/password/tag_sidebar_section.stache!';
import itemTemplate from 'app/view/template/component/tag/tree_item.stache!';
import tagUpdateFormTemplate from 'app/view/template/form/tag/update.stache!';

const TagSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.password.TagSidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Tag Controller',
    template: template,
    state: 'loading',
    resource: null
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('resource', this.options.resource);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const tree = this._initTree();
    this.options.tree = tree;
    this._loadTags(this.options.resource.tags);
    this.setState('ready');
  },

  /**
   *
   * Initialize the tree
   * @return {mad.Component}
   */
  _initTree: function() {
    const map = this._getTreeMap();
    const tree = new TreeComponent('#js_rs_details_tags_list', {
      cssClasses: ['tags', 'tags-list'],
      itemClass: Tag,
      itemTemplate: itemTemplate,
      prefixItemId: 'js_rs_details_tags_list_',
      map: map,
      state: 'loading'
    });
    tree.start();

    return tree;
  },

  /**
   * Get the tree map
   *
   * @return {mad.Map}
   */
  _getTreeMap: function() {
    return new MadMap({
      id: 'id',
      label: 'slug'
    });
  },

  /**
   * Init form.
   */
  _initForm: function() {
    const slugs = this.options.resource.tags.attr()
      .reduce((accumulator, currentValue) => [...accumulator, currentValue.slug], []);

    // Remove any message if any.
    this._hideEmptyMessage();

    // Init the form
    const formHtml = View.render(tagUpdateFormTemplate);
    $('.accordion-content', this.element).append(formHtml);
    const tagEditorSelector = '#js_edit_tags_form';
    $(tagEditorSelector).tagEditor({
      startTags: slugs,
      onSave: data => this._onFormSave(data),
      beforeDelete: slug => this._beforeDeleteTag(slug),
      beforeInsert: slug => this._beforeInsertTag(slug)
    });
    $(tagEditorSelector).removeClass('hidden');

    // Give the focus to the editor.
    const tagEditorInputText = '#js_tag_editor_input_text';
    $(tagEditorInputText).focus();

    Tag.findAll()
      .then(tags => this._initAutocomplete(tags));
  },

  /**
   * Hide the empty message if any.
   */
  _hideEmptyMessage: function() {
    $('#js_tag_sidebar_section_empty_message').addClass('hidden');
  },

  /**
   * Show the empty message if required.
   */
  _showEmptyMessage: function() {
    if (!this.options.resource.tags.length) {
      $('#js_tag_sidebar_section_empty_message').removeClass('hidden');
    }
  },

  /**
   * Destroy form
   */
  _destroyForm: function() {
    this.state.removeState('editing');
    const tagEditorSelector = '#js_edit_tags_form';
    $(tagEditorSelector).remove();
    this.options.tree.setState('ready');
  },

  /**
   * Init the autocomplete component
   */
  _initAutocomplete: function(tags) {
    const isAdmin = this.options.resource.permission.isAllowedTo(PermissionType.ADMIN);
    const slugs = this._extractTagSlugs(tags, isAdmin);

    // eslint-disable-next-line no-undef
    new autoComplete({
      selector: '#js_tag_editor_input_text',
      minChars: 1,
      source: (term, suggest) => {
        term = term.toLowerCase();
        const matches = slugs.filter(item => item.toLowerCase().indexOf(term) != -1);
        suggest(matches);
      }
    });
  },

  /**
   * Extract tag slugs
   * @param {can.Model.List} tags The list of tags
   * @param {boolean} withIsShared With the shared tags
   * @return {array} List of slugs
   */
  _extractTagSlugs: function(tags, withIsShared) {
    withIsShared = withIsShared || false;
    return tags.attr()
      .reduce((accumulator, currentValue) => {
      // Remove #shared-tags from the autocomplete list if the user is not admin of the resource.
        if (/^#/.test(currentValue.slug) && !withIsShared) {
          return accumulator;
        }
        return [...accumulator, currentValue.slug];
      }, []);
  },

  /**
   * When the form is updated
   * @param {array} slugs The list of tags slugs.
   */
  _onFormSave: function(slugs) {
    const tree = this.options.tree;
    return Tag.updateResourceTags(this.options.resource.id, slugs)
      .then(tags => {
        this.options.resource.tags = tags;
        tree.reset();
        this._loadTags(tags);
        this._destroyForm();
        MadBus.trigger('resource_tags_updated', [this.options.resource]);
      });
  },

  /**
   * Load tags
   * @param {can.List} tags The list of tags
   */
  _loadTags: function(tags) {
    this._showEmptyMessage();
    if (tags.length) {
      this.options.tree.load(tags);
    }
    this.options.tree.setState('ready');
  },

  /**
   * Before a tag is deleted from the tag editor.
   * Validate the change, return false if the validation failed.
   * A user without edit right on the resource cannot edit shared tags.
   * @param {string} slug The tag slug to validate
   */
  _beforeDeleteTag: function(slug) {
    if (/^#/.test(slug) && !this.options.resource.permission.isAllowedTo(PermissionType.ADMIN)) {
      const message = __('You do not have the permission to edit shared tags on this resource.');
      this._errorForm(message);
      return false;
    }
    return true;
  },

  /**
   * An error occurred on the edit tag form.
   * Display a message.
   * @param {string} message
   */
  _errorForm: function(message) {
    const $feedback = $('#js_edit_tags_form .message');
    $feedback.text(message)
      .removeClass('notice')
      .addClass('error');
  },

  /**
   * Before a tag is inserted from the tag editor.
   * Validate the change, return false if the validation failed.
   * A user without edit right on the resource cannot edit shared tags.
   * @param {string} slug The tag slug to validate
   */
  _beforeInsertTag: function(slug) {
    if (/^#/.test(slug) && !this.options.resource.permission.isAllowedTo(PermissionType.ADMIN)) {
      const message = __('You do not have the permission to edit shared tags on this resource.');
      this._errorForm(message);
      return false;
    }
    return true;
  },

  /**
   * Cancel the changes
   */
  '{element} #js_tags_editor_cancel click': function() {
    this._destroyForm();
  },

  /**
   * Save the list of tags
   */
  '{element} #js_edit_tags_button click': function() {
    if (this.state.is('editing')) {
      return;
    }
    this.state.addState('editing');
    this.options.tree.setState('hidden');
    this._initForm();
  },

  /**
   * Observer when a tag is selected.
   * @param {HTMLElement} el The element the event occurred on
   */
  '{element} a.tag click': function(el) {
    const li = el.closest('li');
    const tag = DomData.get(li, Tag.shortName);
    const filter = new Filter({
      id: `workspace_filter_tag_${tag.id}`,
      label: tag.slug + __(' (tag)'),
      rules: {
        'has-tag': tag.slug
      },
      tag: tag
    });
    MadBus.trigger('filter_workspace', {filter: filter});
  },

  /**
   * Observer when the user press escape.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} keydown': function(el, ev) {
    if (ev.which == 27) {
      this._destroyForm();
    }
  }

});

export default TagSidebarSectionComponent;
