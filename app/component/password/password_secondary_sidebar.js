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
import ActivitySection from '../activity/resource_activity_sidebar_section';
import Clipboard from '../../util/clipboard';
import CommentsSection from '../comment/comments_sidebar_section';
import Config from 'passbolt-mad/config/config';
import DescriptionSection from '../password/description_sidebar_section';
import InformationSection from '../password/information_sidebar_section';
import PermissionsSection from '../permission/permissions_sidebar_section';
import Resource from '../../model/map/resource';
import SecondarySidebarComponent from '../workspace/secondary_sidebar';
import TagsSection from '../password/tags_sidebar_section';

import template from '../../view/template/component/password/password_secondary_sidebar.stache';

const PasswordSecondarySidebarComponent = SecondarySidebarComponent.extend('passbolt.component.password.PasswordSecondarySidebar', /** @static */ {

  defaults: {
    label: 'Resource Details',
    resource: null,
    template: template,
    Resource: Resource
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this.sectionsOpenedState = {
      description: false,
      tags: false,
      permissions: false,
      comments: false,
      activity: false
    };
  },

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
      cssClasses: !this.sectionsOpenedState.description ? ['closed'] : [],
      state: {
        opened: this.sectionsOpenedState.description
      }
    });
    descriptionComponent.start();
    descriptionComponent.state.on('opened', (ev, opened) => {
      this.sectionsOpenedState.description = opened;
    });
  },

  /**
   * Initialize the tags section
   */
  _initTagsSection: function() {
    const plugins = Config.read('server.passbolt.plugins');
    if (plugins && plugins.tags) {
      const tagsComponent = new TagsSection('#js_rs_details_tags', {
        resource: this.options.resource,
        cssClasses: !this.sectionsOpenedState.tags ? ['closed'] : [],
        state: {
          opened: this.sectionsOpenedState.tags
        }
      });
      tagsComponent.start();
      tagsComponent.state.on('opened', (ev, opened) => {
        this.sectionsOpenedState.tags = opened;
      });
    }
  },

  /**
   * Initialize the permissions section
   */
  _initPermissionsSection: function() {
    const permissionsComponent = new PermissionsSection('#js_rs_details_permissions', {
      acoInstance: this.options.resource,
      cssClasses: !this.sectionsOpenedState.permissions ? ['closed'] : [],
      state: {
        opened: this.sectionsOpenedState.permissions
      }
    });
    permissionsComponent.start();
    permissionsComponent.state.on('opened', (ev, opened) => {
      this.sectionsOpenedState.permissions = opened;
    });
  },

  /**
   * Initialize the comments section
   */
  _initCommentsSection: function() {
    const commentsComponent = new CommentsSection('#js_rs_details_comments', {
      resource: this.options.resource,
      foreignModel: 'Resource',
      foreignKey: this.options.resource.id,
      cssClasses: !this.sectionsOpenedState.comments ? ['closed'] : [],
      state: {
        opened: this.sectionsOpenedState.comments
      }
    });
    commentsComponent.start();
    commentsComponent.state.on('opened', (ev, opened) => {
      this.sectionsOpenedState.comments = opened;
    });
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
        cssClasses: !this.sectionsOpenedState.activity ? ['closed'] : [],
        state: {
          opened: this.sectionsOpenedState.activity
        }
      });
      activityComponent.start();
      activityComponent.state.on('opened', (ev, opened) => {
        this.sectionsOpenedState.activity = opened;
      });
    }
  },

  /**
   * Observe when a resource is updated, if this is the currently displayed resource, refresh the component.
   * @param {DefineMap.prototype} model The model reference
   * @param {HTMLEvent} ev The event which occurred
   * @param {Resource} resource The updated resource
   */
  '{Resource} updated': function(model, ev, resource) {
    if (resource.id == this.options.resource.id) {
      this.options.resource = resource;
      this.refresh();
    }
  },

  /**
   * Observe when the user want to copy the permalink of the resource in the clipboard
   */
  '{element} .title-link click': function() {
    Clipboard.copy(this.options.resource.getPermalink(), 'permalink');
  }
});

export default PasswordSecondarySidebarComponent;
