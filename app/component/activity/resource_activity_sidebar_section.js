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
 */
import $ from 'jquery/dist/jquery.min.js';
import ActionLog from '../../model/map/action_log';
import ResourceActivityListComponent from './resource_activity_list';
import SecondarySidebarSectionComponent from '../workspace/secondary_sidebar_section';
import template from '../../view/template/component/activity/resource_activity_sidebar_section.stache';

const ResourceActivitySidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.activity.ResourceActivitySidebarSection', /** @static */ {

  defaults: {
    label: 'Resource Activity Sidebar Controller',
    loadedOnStart: false,
    resource: null,
    foreignModel: null,
    foreignKey: null,
    template: template,
    pagination: {
      limit: 5,
      page: 1
    }
  }
}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initResourceActivityList();
    if (this.state.opened) {
      this.open();
    }
    this._super();
  },

  /**
   * @inheritdoc
   */
  open: function() {
    this._loadContent();
    this._super();
  },

  /**
   * Initialize the comments list
   */
  _initResourceActivityList: function() {
    const component = new ResourceActivityListComponent('#js_rs_details_activity_list', {
      resource: this.options.resource,
      foreignModel: this.options.foreignModel,
      foreignKey: this.options.foreignKey,
      state: 'loading'
    });
    component.start();
    this.resourceActivityList = component;
    this.options.pagination.page = 1;
  },

  /**
   * Find action logs and display content.
   * @private
   */
  _loadContent: function() {
    if (this.resourceActivityList.options.items.length === 0) {
      this._findActionLog()
        .then(actionLogs => this._loadActionLogs(actionLogs));
    }
  },

  /**
   * Find the comments
   */
  _findActionLog: function() {
    const findOptions = {
      foreignModel: this.options.foreignModel,
      foreignKey: this.options.foreignKey,
      page: this.options.pagination.page,
      limit: this.options.pagination.limit,
      contain: {creator: 1},
    };
    return ActionLog.findAll(findOptions);
  },

  /**
   * Load comments in the list or display the form.
   * @param {Comment.List} comments
   * @private
   */
  _loadActionLogs: function(actionLogs) {
    if (this.state.destroyed) {
      return;
    }

    if (actionLogs.length) {
      this._setNotEmpty();
      this.resourceActivityList.load(actionLogs);
      this._manageCallToAction(actionLogs);
    } else {
      this._setEmpty();
    }

    this._initCallToAction();
    this.resourceActivityList.state.loaded = true;
    this.state.loaded = true;
  },

  /**
   * Set empty state.
   * @private
   */
  _setEmpty: function() {
    $('.activity-details-content', this.element).addClass('hidden');
    $('.empty-content', this.element).removeClass('hidden');
  },

  /**
   * Set not empty state.
   * @private
   */
  _setNotEmpty: function() {
    $('.activity-details-content', this.element).removeClass('hidden');
    $('.empty-content', this.element).addClass('hidden');
  },

  /**
   * Load next page of action logs.
   * @private
   */
  _loadNextPage: function() {
    const self = this;
    this.options.pagination.page += 1;
    this._findActionLog()
      .then(actionLogs => self._appendActionLogs(actionLogs));
  },

  /**
   * Init call to action.
   * @private
   */
  _initCallToAction: function() {
    const self = this;

    $('.load-more', $('.activity-list-actions')).click(function() {
      $(this).addClass('processing');
      self._loadNextPage();
      return false;
    });
  },

  /**
   * Append action logs at the end of the list.
   * @param actionLogs
   */
  _appendActionLogs: function(actionLogs) {
    const self = this;
    actionLogs.forEach(obj => {
      self.resourceActivityList.insertItem(obj, null, 'last');
    });
    self._manageCallToAction(actionLogs);
  },

  /**
   * Manage call to actions depending on the last action logs loaded.
   * @param actionLogs
   */
  _manageCallToAction: function(actionLogs) {
    // processing class is removed since any loading operation is finished.
    $('.load-more', $('.activity-list-actions')).removeClass('processing');
    // If there are less actionLogs that the pagination limit, we know we have reached the end of the list.
    if (actionLogs.length < this.options.pagination.limit) {
      // We hide the call to actions.
      $('.activity-list-actions').addClass('hidden');
    }
  }
});

export default ResourceActivitySidebarSectionComponent;
