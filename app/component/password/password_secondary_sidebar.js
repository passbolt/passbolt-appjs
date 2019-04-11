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
import ActivitySection from 'app/component/activity/resource_activity_sidebar_section';
import Clipboard from 'app/util/clipboard';
import CommentsSection from 'app/component/comment/comments_sidebar_section';
import Config from 'passbolt-mad/config/config';
import DescriptionSection from 'app/component/password/description_sidebar_section';
import InformationSection from 'app/component/password/information_sidebar_section';
import PermissionsSection from 'app/component/permission/permissions_sidebar_section';
import SecondarySidebarComponent from 'app/component/workspace/secondary_sidebar';
import TagsSection from 'app/component/password/tags_sidebar_section';

import template from 'app/view/template/component/password/password_secondary_sidebar.stache!';

const PasswordSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.password.PasswordSecondarySidebar', /** @static */ {

  defaults: {
    label: 'Resource Details',
    resource: null,
    template: template
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
    this._initInformationSection();
    this._initDescriptionSection();
    this._initTagsSection();
    this._initPermissionsSection();
    this._initCommentsSection();
    this._initActivitySection();
    this._super();
  },

  /**
   * Initialize the information section
   */
  _initInformationSection: function() {
    const informationComponent = new InformationSection('#js_rs_details_information', {
      resource: this.options.resource
    });
    informationComponent.start();
  },

  /**
   * Initialize the description section
   */
  _initDescriptionSection: function() {
    const descriptionComponent = new DescriptionSection('#js_rs_details_description', {
      resource: this.options.resource,
      cssClasses: ['closed']
    });
    descriptionComponent.start();
  },

  /**
   * Initialize the tags section
   */
  _initTagsSection: function() {
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins && plugins.tags) {
      const tagsComponent = new TagsSection('#js_rs_details_tags', {
        resource: this.options.resource,
        cssClasses: ['closed']
      });
      tagsComponent.start();
    }
  },

  /**
   * Initialize the permissions section
   */
  _initPermissionsSection: function() {
    const permissionsComponent = new PermissionsSection('#js_rs_details_permissions', {
      acoInstance: this.options.resource,
      cssClasses: ['closed']
    });
    permissionsComponent.start();
  },

  /**
   * Initialize the comments section
   */
  _initCommentsSection: function() {
    const commentsComponent = new CommentsSection('#js_rs_details_comments', {
      resource: this.options.resource,
      foreignModel: 'Resource',
      foreignKey: this.options.resource.id,
      cssClasses: ['closed']
    });
    commentsComponent.start();
  },

  /**
   * Initialize the activity section
   */
  _initActivitySection: function() {
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins && plugins.audit_log) {
      const activityComponent = new ActivitySection('#js_rs_details_activity', {
        resource: this.options.resource,
        foreignModel: 'Resource',
        foreignKey: this.options.resource.id,
        cssClasses: ['closed']
      });
      activityComponent.start();
    }
  },

  /**
   * Observe when the item is updated
   * @param {Resource} resource The updated item
   */
  '{resource} updated': function(resource) {
    $(".sidebar-header-title-text", this.element).text(resource.name);
  },

  /**
   * Observe when the user want to copy the permalink of the resource in the clipboard
   */
  '{element} .title-link click': function() {
    Clipboard.copy(this.options.resource.getPermalink(), 'permalink');
  }
});

export default PasswordSecondarySidebarComponent;
