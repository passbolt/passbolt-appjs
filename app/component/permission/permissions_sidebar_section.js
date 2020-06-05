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
import $ from 'jquery';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import MadBus from 'passbolt-mad/control/bus';
import MadMap from 'passbolt-mad/util/map/map';
import Permission from '../../model/map/permission';
import PermissionType from '../../model/map/permission_type';
import SecondarySidebarSectionComponent from '../workspace/secondary_sidebar_section';
import TreeComponent from 'passbolt-mad/component/tree';
import TreeView from 'passbolt-mad/view/component/tree';

import template from '../../view/template/component/permission/permissions_sidebar_section.stache';
import permissionlistItemTemplate from '../../view/template/component/permission/permissions_sidebar_list_item.stache';

const PermissionsSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.permission.PermissionsSidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Permissions Component',
    template: template,
    acoInstance: null
  }

}, /** @prototype */ {

  /**
   * The permissions list.
   */
  permissionsList: null,

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    const permission = this.options.acoInstance.permission;
    const canAdmin = permission.isAllowedTo(PermissionType.ADMIN);
    this.setViewData('canAdmin', canAdmin);
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initPermissionsList();
    if (this.state.opened) {
      this.open();
    }
    this._super();
  },

  /**
   * @inheritdoc
   */
  open: function() {
    this._showLoading();
    this._loadPermissions();
    this._super();
  },

  /**
   * Init the permissions list
   */
  _initPermissionsList: function() {
    const map = this._getPermissionsListMap();
    const component = new TreeComponent('#js_rs_details_permissions_list', {
      cssClasses: ['permissions', 'shared-with'],
      viewClass: TreeView,
      itemClass: Permission,
      itemTemplate: permissionlistItemTemplate,
      map: map
    });
    component.start();
    this.permissionsList = component;
  },

  /**
   * Get the list map
   * @return {UtilMap}
   */
  _getPermissionsListMap: function() {
    return new MadMap({
      id: 'id',
      aroLabel: {
        key: 'aro',
        func: function(aro) {
          return aro.toLowerCase();
        }
      },
      aroAvatarPath: {
        key: 'id',
        func: function(user, map, obj) {
          if (obj.aro == 'User') {
            return obj.user.profile.avatarPath('small');
          } else if (obj.aro == 'Group') {
            return 'img/avatar/group_default.png';
          }
        }
      },
      permLabel: {
        key: 'type',
        func: function(type) {
          return PermissionType.formatToString(type);
        }
      },
      acoLabel: {
        key: 'aco_foreign_key',
        func: function(aco_foreign_key, map, obj) {
          if (obj.aro == 'User') {
            return obj.user.profile.fullName();
          } else if (obj.aro == 'Group') {
            return obj.group.name;
          }
        }
      },
      acoDetails: {
        key: 'aco_foreign_key',
        func: function(aco_foreign_key, map, obj) {
          if (obj.aro == 'User') {
            return obj.user.username;
          } else if (obj.aro == 'Group') {
            return __('group');
          }
        }
      }
    });
  },

  /**
   * Show the loading.
   */
  _showLoading: function() {

  },

  /**
   * Retrieve and load permissions in the list.
   * @return {promise}
   */
  _loadPermissions: async function() {
    const self = this;
    const aco_name = 'resource';
    const aco_foreign_key = this.options.acoInstance.id;
    $('.processing-wrapper', this.element).show();

    this.state.loaded = false;
    this.permissionsList.reset();
    let permissions = await Permission.findAll({
      aco: aco_name,
      aco_foreign_key: aco_foreign_key,
      contain: {group: 1, user: 1, 'user.profile': 1}
    });

    permissions.sort((permission1, permission2) => {
      console.log(permission1, permission2);
      const permission1Name = permission1.user ? `${permission1.user.profile.first_name} ${permission1.user.profile.last_name}`.toLowerCase() : permission1.group.name.toLowerCase();
      const permission2Name = permission2.user ? `${permission2.user.profile.first_name} ${permission2.user.profile.last_name}`.toLowerCase() : permission2.group.name.toLowerCase();
      if (permission1Name < permission2Name) return -1;
      if (permission1Name > permission2Name) return 1;
      return 0;
    });

    $('.processing-wrapper', this.element).hide();
    self.permissionsList.load(permissions);
    this.state.loaded = true;
  },

  /**
   * Observe permissions are updated
   */
  '{mad.bus.element} permissions_updated': function() {
    if ($(this.element).hasClass('closed')) {
      return;
    }
    this._loadPermissions();
  },

  /**
   * Observe when the edit permission button is clicked
   */
  '{element} a#js_edit_permissions_button click': function() {
    const resource = this.options.acoInstance;
    MadBus.trigger('request_resource_share', {resource: resource});
  }

});

export default PermissionsSidebarSectionComponent;
