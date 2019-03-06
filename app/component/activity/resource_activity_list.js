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
import ActionLog from 'app/model/map/action_log';
import MadMap from 'passbolt-mad/util/map/map';
import Tree from 'passbolt-mad/component/tree';
import Resource from 'app/model/map/resource';
import itemTemplate from 'app/view/template/component/activity/resource_activity_item.stache!';
import PermissionUpdatedDetail from "../../model/action_log_detail/permission_updated_detail";
import ActionLogDetail from "../../model/action_log_detail/action_log_detail";

const ResourceActivityListComponent = Tree.extend('passbolt.component.activity.ResourceActivityList', /** @static */ {
  defaults: {
    label: 'Resource Activity List Controller',
    itemClass: ActionLog,
    itemTemplate: itemTemplate
  },
}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    options.map = this._getMap();
    this._super(el, options);
  },

  /**
   * Map data.
   * @param data
   * @param map
   * @param el
   * @return {*}
   */
  mapData: function(data, map, el) {
    if (el.type === 'Permissions.updated' && data.permissions) {
      const res = new PermissionUpdatedDetail(null, data.resource, data.permissions);
      return res;
    } else {
      const res = new ActionLogDetail(null, data.resource);
      return res;
    }
  },

  /**
   * Map label.
   * @param type
   * @return {*}
   */
  mapLabel: function(type) {
    const defaultLabel = __('did something on item');
    const labels = {
      'Resources.created': __('created item'),
      'Resources.updated': __('updated item'),
      'Resource.Secrets.read': __('accessed secret of item'),
      'Permissions.updated': __('changed permissions of item'),
    };

    if (labels[type]) {
      return labels[type];
    }

    return defaultLabel;
  },

  /**
   * Get the map
   *
   * @return {UtilMap}
   */
  _getMap: function() {
    return new MadMap({
      id: 'id',
      type: 'type',
      label: {
        key: 'type',
        func: this.mapLabel
      },
      data: {
        key: 'data',
        func: this.mapData
      },
      resource: {
        key: 'data.resource',
        func: function(resource) {
          if (resource) {
            resource.permalink = Resource.getPermalink(resource);
          }
          return resource;
        }
      },
      created: 'created',
      creatorAvatarPath: {
        key: 'creator',
        func: creator => creator.profile.avatarPath('small')
      },
      creatorName: {
        key: 'creator',
        func: creator => creator.profile.fullName()
      },
    });
  }
});

export default ResourceActivityListComponent;
