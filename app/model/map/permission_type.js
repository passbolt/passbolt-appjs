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
import DefineMap from 'passbolt-mad/model/map/map';
// eslint-disable-next-line no-unused-vars
import I18n from 'passbolt-mad/util/lang/i18n';

const PermissionType = DefineMap.extend('passbolt.model.PermissionType', {
  serial: 'string',
  name: 'string',
  description: 'string'
});

/**
 * The permission type read.
 * @type {number}
 */
PermissionType.READ = 1;
/**
 * The permission type update.
 * @type {number}
 */
PermissionType.UPDATE = 7;
/**
 * The permission type admin.
 * @type {number}
 */
PermissionType.ADMIN = 15;

/**
 * Translation of the available permissions types.
 */
PermissionType.PERMISSION_TYPES = {
  1: __('read'),
  7: __('update'),
  15: __('owner')
};

/**
 * @inheritdoc
 */
PermissionType.validationRules = {
  serial: [{
    rule: 'choice',
    options: {
      callback: function() {
        // return the available serials (array_keys in js style)
        return $.map(PermissionType.PERMISSION_TYPES, (element, index) => index);
      }
    }
  }]
};

/**
 * Get permission type formated.
 * @return {string}
 */
PermissionType.formatToString = function(permId) {
  switch (permId.toString()) {
    case PermissionType.ADMIN.toString():
      return __('is %s', PermissionType.PERMISSION_TYPES[permId]);
    default:
      return __('can %s', PermissionType.PERMISSION_TYPES[permId]);
  }
};

export default PermissionType;
