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
import Ajax from 'app/net/ajax';
import Config from 'passbolt-mad/config/config';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';
import GroupUser from 'app/model/map/group_user';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';
import User from 'app/model/map/user';
import uuid from 'uuid/v4';

const Group = DefineMap.extend('passbolt.model.Group', {
  id: 'string',
  name: 'string',
  created: 'string',
  modified: 'string',
  modifier: User,
  groups_users: GroupUser.List,

  /**
   * Check if a user is a group manager of the group.
   * @param user
   * @returns {boolean}
   */
  isGroupManager: function(user) {
    let isGroupManager = false;

    if (this.groups_users) {
      this.groups_users.forEach(groupUser => {
        if (groupUser.user_id == user.id && groupUser.is_admin == true) {
          isGroupManager = true;
        }
      });
    }
    if (this.my_group_user) {
      isGroupManager = this.my_group_user.is_admin;
    }

    return isGroupManager;
  },

  /**
   * Check if a user can edit a group.
   * @param user
   * @returns {boolean}
   */
  isAllowedToEdit: function(user) {
    const isGroupManager = this.isGroupManager(user);
    const isAdmin = user.role.name == 'admin';
    return isGroupManager || isAdmin;
  },

  /**
   * Attempt a dry run of delete.
   *
   * @param id
   * @returns {*|jQuery.deferred}
   */
  deleteDryRun: function() {
    return Ajax.request({
      url: `groups/${this.id}/dry-run.json?api-version=2`,
      type: 'DELETE',
      silentNotify: true
    });
  }
});
DefineMap.setReference('Group', Group);
Group.List = DefineList.extend({'#': {Type: Group}});

/*
 * Default validation rules.
 * Keep these rules in sync with the passbolt API.
 * @see https://github.com/passbolt/passbolt_api/src/Model/Table/GroupsTable.php
 */
Group.validationRules = {
  id: [
    {rule: 'uuid'}
  ],
  name: [
    {rule: 'required', message: __('A name is required.')},
    {rule: ['lengthBetween', 0, 255], message: __('The name length should be maximum %s characters.', 255)},
    {rule: 'utf8Extended', message: __('The name should be a valid utf8 string.')}
  ]
};

/**
 * Find a group with all required association to display it.
 * @param {string} id The group id
 * @return {Promise}
 */
Group.findView = function(id) {
  const options = {
    id: id,
    contain: {
      'modifier': 1,
      'modifier.profile': 1,
      'group_user': 1,
      'group_user.user': 1,
      'group_user.user.profile': 1,
      'group_user.user.gpgkey': 1
    }
  };
  return Group.findOne(options);
};

/**
 * Return group avatar path.
 * @param group
 * @return {string}
 */
Group.avatarPath = function() {
  return 'img/avatar/group_default.png';
};

/**
 * Delete a group.
 * Use this function instead of the standard destroy function. The destroy function of the can layer does not get
 * extra parameters, however a http DELETE request can get a body we use to pass the transfer data.
 * @param {object} transfer The transfer of rights to apply before deleting the user.
 * @returns {Promise}
 * @inherits
 */
Group.prototype.delete = function(transfer) {
  const request = {
    _xhr: null,
    id: uuid(),
    url: `groups/${this.id}.json?api-version=v2`,
    method: 'DELETE',
    headers: {'X-CSRF-Token': Config.read('app.csrfToken')},
    beforeSend: xhr => { request._xhr = xhr; },
    data: {transfer: transfer}
  };

  Ajax._registerRequest(request);
  return $.ajax(request)
    .then(data => Ajax.handleSuccess(request, data))
    .then(() => {
      // Destroy the local entity.
      this.destroy();
    })
    .then(null, jqXHR => {
      let jsonData = {};
      if (jqXHR.responseText) {
        try {
          jsonData = $.parseJSON(jqXHR.responseText);
        } catch (e) { }
      }
      return Ajax.handleError(request, jsonData);
    });
};

Group.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: Group,
  List: Group.List,
  url: {
    resource: '/',
    destroyData: function() {
      // @see Group::delete() function
      return Promise.resolve({});
    },
    getData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'groups/{id}.json',
        type: 'GET',
        params: params
      });
    },
    getListData: function(params) {
      params = params || {};
      params['api-version'] = 'v2';
      return Ajax.request({
        url: 'groups.json',
        type: 'GET',
        params: params
      });
    }
  }
});

export default Group;
