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
import ActionLog from 'app/model/map/action_log';
import ResourceActivityListComponent from 'app/component/activity/resource_activity_list';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';
import template from 'app/view/template/component/activity/resource_activity_sidebar_section.stache!';


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
  },

  /**
   * Find action logs and display content.
   * @private
   */
  _loadContent: function() {
    this._findActionLog()
    .then(actionLogs => this._loadActionLogs(actionLogs));
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
    actionLogs.forEach(function(obj) {
      self.resourceActivityList.insertItem(obj, null, 'last');
    });
    self._manageCallToAction(actionLogs);
  },

  /**
   * Prepend action logs.
   * @param actionLogs
   * @private
   */
  _prependActionLogs: function(actionLogs) {
    const self = this;
    actionLogs = actionLogs.reverse();
    actionLogs.forEach(actionLog => {
      self.resourceActivityList.insertItem(actionLog, null, 'first');
    });

    // Highlight new items in the list. (animation is done in css).
    $('.activity-details-content > ul > li').each((i, el) => {
      const liId = $(el).attr('id');
      actionLogs.forEach(actionLog => {
        if (liId == actionLog.id) {
          $(el).addClass('highlight');
        }
      });
    });
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
  },

  /**
   * On update.
   * @private
   */
  _onUpdate: function() {
    if (!this.state.loaded) {
      return;
    }

    const rememberPage = this.options.page;
    const self = this;
    this.options.page = 1;

    const firstItemId = self.resourceActivityList.options.items[0].id;

    this._findActionLog()
    .then(actionLogs => {
      const actionLogsToPrepend = [];
      actionLogs = Array.from(actionLogs);
      for(const i in actionLogs) {
        if (actionLogs[i].id === firstItemId) {
          break;
        }
        actionLogsToPrepend.push(actionLogs[i]);
      }
      self._prependActionLogs(actionLogsToPrepend);
    });
    this.options.page = rememberPage;
  },

  /**
   * Section has been opened
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occured
   */
  '{element} section_opened': function() {
    this._loadContent();
  },

  /**
   * Observe when the item is updated
   */
  '{resource} updated': function() {
    this._onUpdate();
  }
});

export default ResourceActivitySidebarSectionComponent;
