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
import Action from 'passbolt-mad/model/map/action';
import ContextualMenuComponent from 'passbolt-mad/component/contextual_menu';
import Filter from 'app/model/filter';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import PrimarySidebarSectionComponent from 'app/component/workspace/primary_sidebar_section';
import Tag from 'app/model/map/tag';
import TreeComponent from 'passbolt-mad/component/tree';

import template from 'app/view/template/component/tag/tags_filter_sidebar_section.stache!';

const TagsFilterSidebarSectionComponent = PrimarySidebarSectionComponent.extend('passbolt.component.tag.TagsFilterSidebarSection', /** @static */ {

  defaults: {
    template: template,
    selectedTags: new Tag.List(),
    silentLoading: false,
    loadedOnStart: false,
    tree: null,
    filter: null,
    treeFilter: 'all_tags',
    state: {
      disabled: true
    }
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initTree();
    this._findTags()
      .then(tags => {
        if (this.state.destroyed) {
          return;
        }
        this._loadTree(tags);
      });
  },

  /**
   * Init the filter tree
   */
  _initTree: function() {
    const tree = new TreeComponent('#js_wsp_password_filter_tags_list', {
      map: this._getTreeMap()
    });
    tree.start();
    this.options.tree = tree;
  },

  /**
   * Find tags.
   */
  _findTags: function() {
    return Tag.findAll()
      .then(tags => {
        this.options.tags = tags;
        return tags;
      });
  },

  /**
   * Find the tags.
   * @param {string} scenario Find all the tags for a given scenario: all or my_tags
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
      label: 'slug'
    });
  },

  /**
   * Load the tree with tags
   * @param {array<Tag>} tags
   */
  _loadTree: function(tags) {
    this.options.tree.reset();
    if (tags.length) {
      this.options.tree.load(tags);
      this.state.hidden = false;
    }
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
   * Change the section title
   * @param {string} title
   */
  _setTitle: function(title) {
    $('h3 a', this.element).text(title);
  },

  /**
   * Observe when the user select a tag.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} item_selected': function(el, ev) {
    const tag = ev.data.item;
    this.options.selectedTags.splice(0, this.options.selectedTags.length);
    this.options.selectedTags.push(tag);

    const filter = new Filter({
      id: `workspace_filter_tag_${tag.id}`,
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
    if (!filter.id.match(/^workspace_filter_tag_/)) {
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
  '{mad.bus.element} tags_updated': function(model, ev, options) {
    // Refresh the list of tags.
    this._findTags()
      .then(tags => {
        if (this.state.destroyed) {
          return;
        }
        this._loadTree(tags);

        if (options.selectTag !== undefined) {
        // Retrieve corresponding tag in the list.
          const tag = Array.from(tags).find(tag => tag.slug == options.selectTag);

          // Retrieve tag.
          const filter = new Filter({
            id: `workspace_filter_tag_${tag.id}`,
            label: tag.slug + __(' (tag)'),
            rules: {
              'has-tag': tag.slug
            },
            tag: tag
          });
          this.options.filter = filter;
          MadBus.trigger('filter_workspace', {filter: filter});
        } else {
        // Filter the list how it was.
          if (this.options.treeFilter) {
            this._filterTree(this.options.treeFilter);
          }
        }
      });
  },

  /**
   * Observe when the tree filter button launcher is clicked.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
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
  }

});

export default TagsFilterSidebarSectionComponent;
