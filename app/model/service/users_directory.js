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
 * @since         2.6.0
 */
import AppAjax from '../../net/ajax';
import UsersDirectoryReport from '../../model/map/users_directory_report';

class UsersDirectoryService {}

/**
 * Simulate a synchronization
 * @return {Promise}
 * @static
 */
UsersDirectoryService.dryRunSynchronize = function(params) {
  params = params || {};
  params['api-version'] = 'v2';
  return AppAjax.request({
    url: 'directorysync/synchronize/dry-run.json',
    type: 'GET',
    params: params
  }).then(data => new UsersDirectoryReport(data));
};

/**
 * Synchronize
 * @return {Promise}
 * @static
 */
UsersDirectoryService.synchronize = function(params) {
  params = params || {};
  params['api-version'] = 'v2';
  return AppAjax.request({
    url: 'directorysync/synchronize.json',
    type: 'GET',
    params: params
  }).then(data => new UsersDirectoryReport(data));
};

export default UsersDirectoryService;
