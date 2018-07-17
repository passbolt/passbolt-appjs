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
import DefineList from 'passbolt-mad/model/list/list';
import DefineMap from 'passbolt-mad/model/map/map';
import Group from 'app/model/map/group';
import User from 'app/model/map/user';

const GroupUser = DefineMap.extend('passbolt.model.GroupUser', {
  id: 'string',
  group_id: 'string',
  user_id: 'string',
  is_admin: 'boolean',
  user: User,
  group: Group
});
DefineMap.setReference('GroupUser', GroupUser);
GroupUser.List = DefineList.extend({'#': {Type: GroupUser}});

export default GroupUser;
