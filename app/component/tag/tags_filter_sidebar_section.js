/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import $ from 'jquery/dist/jquery.min.js';
import DomData from 'can-dom-data';
import Action from 'passbolt-mad/model/map/action';
import ContextualMenuComponent from 'passbolt-mad/component/contextual_menu';
import Filter from '../../model/filter';
import getObject from 'can-util/js/get/get';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import PrimarySidebarSectionComponent from '../workspace/primary_sidebar_section';
import TagMap from '../../model/map/tag';
import User from '../../model/map/user';
import TreeComponent from 'passbolt-mad/component/tree';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import DialogComponent from 'passbolt-mad/component/dialog';
import EditTagForm from '../../form/tag/edit_tag';
import template from '../../view/template/component/tag/tags_filter_sidebar_section.stache';
import itemTemplate from '../../view/template/component/tag/tag_filter_sidebar_item.stache';
import templateTagDeleteConfirmationDialog from '../../view/template/component/tag/tag_delete_confirmation_dialog.stache';

const TagsFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.tag.TagsFilterSidebarSection', /** @static */ {

  defaults: {
    template: template,
    selectedTags: new TagMap.List(),
    silentLoading: false,
    loadedOnStart: false,
    tree: null,
    filter: null,
    treeFilter: 'all_tags',
    state: {
      disabled: true
    }
  }
},
  /** @prototype */ {
  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initTree();
    this._findTags().then(tags => this._loadTree(tags));
  },

  /**
   * Init the filter tree
   */
  _initTree: function() {
    const tree = new TreeComponent('#js_wsp_password_filter_tags_list', {
      map: this._getTreeMap(),
      itemClass: TagMap,
      itemTemplate: itemTemplate
    });
    tree.state.on('empty', (ev, empty) => this._onTagListEmptyChange(empty));
    tree.start();
    this.options.tree = tree;
  },

  /**
   * Observe when the component is empty / filled
   * @param {boolean} empty True if empty, false otherwise
   */
  _onTagListEmptyChange: function(empty) {
    this.state.empty = empty;
  },

  /**
   * Find tags.
   */
  _findTags: function() {
    return TagMap.findAll().then(tags => {
      this.options.tags = tags;
      return tags;
    });
  },

  /**
   * Filter tags based on a scenario.
   * @param {string} scenario The scenario e.g. "all" or "my_tags"
   */
  _filterTree: function(scenario) {
    let tags = this.options.tags;
    this.options.treeFilter = scenario;

    if (scenario == 'my_tags') {
      // Filter on my tags.
      tags = this.options.tags.filter(item => !item.is_shared);
    } else if (scenario == 'shared_tags') {
      // Filter on shared tags.
      tags = this.options.tags.filter(item => item.is_shared);
    }
    this._loadTree(tags);

    // If a tag was previously selected
    if (this.options.selectedTags.length) {
      const found = tags.filter(item => item.id == this.options.selectedTags[0].id);
      // If the selected tag is still visible
      if (found.length) {
        this.options.tree.view.selectItem(this.options.selectedTags[0]);
      } else {
        // If the previously selected tag is not visible, reset the workspace.
        const filter = new Filter({
          id: 'default',
          type: 'default',
          label: __('All items'),
          order: ['Resource.modified DESC']
        });
        MadBus.trigger('filter_workspace', {filter: filter});
      }
    }
  },

  /**
   * Get the tree map.
   */
  _getTreeMap: function() {
    return new MadMap({
      id: 'id',
      label: 'slug',
      // canEdit: {
      //   key: 'id',
      //   func: (id, map, item) =>
      //     !item.is_shared || User.getCurrent().isAdmin()
      // }
    });
  },

  /**
   * Load the tree with tags
   * @param {array<Tag>} tags
   */
  _loadTree: function(tags) {
    if (this.state.destroyed) {
      return;
    }
    this.options.tree.reset();
    this.options.tree.load(tags);
    this.state.loaded = true;
  },

  /**
   * Display the section more menu.
   */
  _showTreeFilterMenu: function(x, y) {
    // Instantiate the contextual menu menu.
    const contextualMenu = ContextualMenuComponent.instantiate({
      coordinates: {
        x: x,
        y: y
      }
    });
    contextualMenu.start();

    // Filter on all tags
    const allTagsFilter = new Action({
      id: 'js_filter_tags_section_all_tags_options',
      label: __('All tags'),
      cssClasses: [],
      action: () => {
        this._setTitle(__('All tags'));
        this._filterTree('all_tags');
        contextualMenu.destroyAndRemove();
      }
    });
    contextualMenu.insertItem(allTagsFilter);

    // Filter on my tags
    const myTagsFilter = new Action({
      id: 'js_filter_tags_section_my_tags_options',
      label: __('My tags'),
      cssClasses: [],
      action: () => {
        this._setTitle(__('My tags'));
        this._filterTree('my_tags');
        contextualMenu.destroyAndRemove();
      }
    });
    contextualMenu.insertItem(myTagsFilter);

    // Filter on shared tags
    const sharedTagsFilter = new Action({
      id: 'js_filter_tags_section_shared_tags_options',
      label: __('Shared tags'),
      cssClasses: [],
      action: () => {
        this._setTitle(__('Shared tags'));
        this._filterTree('shared_tags');
        contextualMenu.destroyAndRemove();
      }
    });
    contextualMenu.insertItem(sharedTagsFilter);
  },

  /**
   * Show the tag contextual menu.
   *
   * @param {Tag} Tag tag model of the li element.
   * @param {float} x x coordinate where the menu should be shown.
   * @param {float} y y coordinate where the menu should be shown.
   */
  _showTagContextualMenu: function(Tag, x, y) {
    // Instantiate the contextual menu.
    const contextualMenu = ContextualMenuComponent.instantiate({
      coordinates: {
        x: x,
        y: y
      }
    });
    contextualMenu.start();

    // Edit a Tag action
    const tagEditAction = this._createEditTagAction(Tag, () => {
      contextualMenu.destroyAndRemove();
    });

    // Add 'Edit Tag' action to contextual menu.
    contextualMenu.insertItem(tagEditAction);

    // Delete a Tag action
    const tagDeleteAction = this._createDeleteTagAction(Tag, () => {
      contextualMenu.destroyAndRemove();
    });

      // Add 'Delete Tag' action to contextual menu.
    contextualMenu.insertItem(tagDeleteAction);
  },

  /**
   * Change the section title
   * @param {string} title
   */
  _setTitle: function(title) {
    $('h3 a', this.element).text(title);
  },

  /**
   * Delete a Tag
   * @param {TagMap} Tag The Tag to delete
   */
  _deleteTag: function(Tag, callback) {
    Tag.destroy().then(() => {
      $(`#js_wsp_password_filter_tags_list li#${Tag.id}`).hide('fast', function() {
        $(this).remove();
        callback(Tag);
      });
    });
  },

  /**
   * Create Delete Tag Action
   * @param {TagMap} Tag Tag to delete
   * @param {function} callback to run after delete
   */
  _createDeleteTagAction: function(Tag, callback) {
    return new Action({
      id: 'js_tag_operation_delete_trigger',
      label: __('Delete Tag'),
      cssClasses: [],
      action: () => {
        const dialog = this._createDeleteTagConfirmationDialog(Tag);
        dialog.start();
        callback();
      }
    })},

  /**
   * Create the 'Delete Tag' confirmation dialog
   * @param {TagMap} Tag
   */
  _createDeleteTagConfirmationDialog: function(Tag) {
    const that = this;
    return ConfirmDialogComponent.instantiate({
      label: __('Do you really want to delete tag?'),
      subtitle: __(`You are about to delete the tag '${Tag.slug}'`),
      cssClasses: ['delete-tag-dialog', 'dialog-wrapper'],
      content: templateTagDeleteConfirmationDialog,
      submitButton: {
        label: 'Delete tag',
        cssClasses: ['primary warning']
      },
      action: () => {
        that._deleteTag(Tag, deletedTag => {
          if (this.options.filter && this.options.filter.tag.id === deletedTag.id) {
            // If the previously selected tag is deleted, reset the workspace.
            const filter = new Filter({
              id: 'default',
              type: 'default',
              label: __('All items'),
              order: ['Resource.modified DESC']
            });
            MadBus.trigger('filter_workspace', {filter: filter});
          }

          // Remove the deleted item from tag tree and update the tree
          const items = that.options.tree.options.items.filter(item => item.id !== deletedTag.id);
          that.options.tree.options.items = items;
          that.options.tree.state.empty = !items.length;

          // Broadcast the "tag_deleted" event
          MadBus.trigger('tag_deleted', {tag: deletedTag});
        });
      }
    });
  },

  /**
   * Create Edit Tag Action
   *
   * @param {TagMap} Tag Tag to edit.
   * @param {function} callback callback to run after save.
   */
  _createEditTagAction: function(Tag, callback) {
    return new Action({
      id: 'js_tag_operation_edit_trigger',
      label: __('Edit Tag'),
      cssClasses: [],
      action: () => {
        this._createEditTagConfirmationDialog(Tag);
        callback();
      }
    });
  },

  /**
   * Create the "Edit Tag" confirmation dialog
   * @param {TagMap} Tag
   */
  _createEditTagConfirmationDialog: function(Tag) {
    const dialog = DialogComponent.instantiate({
      label: __('Edit tag'),
      cssClasses: ['edit-tag-dialog', 'dialog-wrapper']
    }).start();

    // Attach the Tag Edit form to the dialog
    dialog.add(EditTagForm, {
      id: 'js_rs_edit',
      data: Tag,
      callbacks: {
        save: updatedTag => {
          this._findTags().then(tags => {
            this._loadTree(tags);
            // Check if a filter was applied before
            if (this.options.filter) {
              let filter;
              // Was it a tag filter?
              if (this.options.filter.tag) {
                filter = new Filter({
                  id: `workspace_filter_tag_${updatedTag.id}`,
                  type: 'tag',
                  label: updatedTag.slug + __(' (tag)'),
                  rules: {
                    'has-tag': updatedTag.slug
                  },
                  tag: updatedTag
                });
                this.options.filter = filter;
              } else {
                // For other type filters, simply reapply it
                filter = this.options.filter;
              }
              MadBus.trigger('filter_workspace', {filter: filter});

              // Select the last active tag
              if (this.options.filter.tag) {
                this.options.tree.view.selectItem(updatedTag);
              }
            }
            dialog.remove();
          });
        }
      }
    });

    $('#js_field_tag_slug').focus();
  },

  /**
   * Observe when the user select a tag.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} item_selected': function(el, ev) {
    const tag = ev.data.item;
    this.options.selectedTags.splice(0, this.options.selectedTags.length);
    this.options.selectedTags.push(tag);

    const filter = new Filter({
      id: `workspace_filter_tag_${tag.id}`,
      type: 'tag',
      label: tag.slug + __(' (tag)'),
      rules: {
        'has-tag': tag.slug
      },
      tag: tag
    });
    this.options.filter = filter;
    MadBus.trigger('filter_workspace', {filter: filter});
  },

  /**
   * Observe when the workspace is filtered, if it's not a tags filter, unselect any previously selected tag.
   * @param {jQuery} element The source element
   * @param {Event} event The jQuery event
   */
  '{mad.bus.element} filter_workspace': function(el, ev) {
    const filter = ev.data.filter;
    // If the workspace is not filtered by tag.
    if (filter.type != 'tag') {
      this.options.filter = null;
      this.options.tree.unselectAll();
    } else {
      /*
       * If the workspace is filtered by tag.
       * This event can be fired from the password tag secondary sidebar section.
       */
      this.options.filter = filter;
      const treeItems = this.options.tree.options.items;
      // If we filter on a tag that is not visible in the current tag list, reset any tree filter.
      const found = treeItems.filter(tag => tag.id == filter.tag.id);
      if (!found.length) {
        this._setTitle(__('All tags'));
        this._filterTree('all_tags');
      }
      this.options.tree.view.selectItem(filter.tag);
    }
  },

  /**
   * Observe when the tags of a resources are updated
   * @param {mad.model.Model} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {passbolt.model.Resource} resource The updated resource
   */
  '{mad.bus.element} resource_tags_updated': function(model, ev, resource) {
    // Refresh the list of tags.
    this._findTags()
      .then(tags => {
        if (this.state.destroyed) {
          return;
        }
        this._loadTree(tags);

        // Filter the list how it was.
        if (this.options.treeFilter) {
          this._filterTree(this.options.treeFilter);
        }

        // Select a tag that was previously selected
        if (this.options.filter && this.options.filter.tag) {
          const filter = this.options.filter;
          const treeItems = this.options.tree.options.items;
          const found = treeItems.filter(tag => tag.id == filter.tag.id);

          // If the previously selected tag still exist, select it
          if (found.length) {
            this.options.tree.view.selectItem(filter.tag);
          } else {
            /*
             * Otherwise change reset all the filter to the default workspace "All Items" filter.
             * Keep the password selected
             */
            const filter = new Filter({
              id: 'default',
              type: 'default',
              label: __('All items'),
              order: ['Resource.modified DESC'],
              resource: resource
            });
            MadBus.trigger('filter_workspace', {filter: filter});
          }
        }
      });
  },

  /**
   * Observe when the tags of a resources are updated
   * @param {mad.model.Model} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {object} options Optional parameters
   *   * selectTag {string}: select a tag after the list is updated (useful for after import for instance).
   */
  '{mad.bus.element} tags_updated': async function(el, ev, options) {
    const tags = await this._findTags();
    const selectedTagId = getObject(ev, 'data.selectTag');
    if (this.state.destroyed) {
      return;
    }
    this._loadTree(tags);

    if (selectedTagId) {
      const tag = Array.from(tags).find(tag => tag.slug == selectedTagId);
      const filter = new Filter({
        id: `workspace_filter_tag_${tag.id}`,
        type: 'tag',
        label: tag.slug + __(' (tag)'),
        rules: { 'has-tag': tag.slug },
        tag: tag
      });
      this.options.filter = filter;
      MadBus.trigger('filter_workspace', {filter: filter});
    } else {
      if (this.options.treeFilter) {
        this._filterTree(this.options.treeFilter);
      }
    }
  },

  /**
   * Observe when the tree filter button launcher is clicked.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} #js_wsp_pwd_password_filter_tags_more click': function(el, ev) {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    ev.preventDefault();
    const p = $(el).offset();
    const x = p.left - 4;
    const y = p.top + 16;
    this._showTreeFilterMenu(x, y);
    return false;
  },

  /**
   * Observe when the tag contextual menu button is clicked.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} #js_wsp_password_filter_tags_list li .right-cell.more-ctrl click': function(
    el,
    ev
  ) {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    ev.preventDefault();
    const p = $(el).offset();
    const x = p.left - 4;
    const y = p.top + 16;

    const tag = DomData.get($(el).parents('li')[0], TagMap.shortName);
    this._showTagContextualMenu(tag, x, y);
    return false;
  }
}
);

export default TagsFilterSidebarSectionComponent;
