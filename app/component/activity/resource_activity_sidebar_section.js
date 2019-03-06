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
    this._findActionLog()
      .then(actionLogs => this._loadActionLogs(actionLogs));
    this._super();
    this._dispatchRoute();
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
   * Find the comments
   */
  _findActionLog: function() {
    const findOptions = {
      foreignModel: this.options.foreignModel,
      foreignKey: this.options.foreignKey,
      contain: {creator: 1}
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
      this.resourceActivityList.load(actionLogs);
    }
    this.resourceActivityList.state.loaded = true;
    this.state.loaded = true;
  }
});

export default ResourceActivitySidebarSectionComponent;
