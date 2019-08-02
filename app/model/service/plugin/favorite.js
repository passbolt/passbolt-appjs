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
 * @since         2.11.0
 */
import Plugin from '../../../util/plugin';

export default class FavoriteService {
  /**
   * Mark a resource as favorite.
   * @return {Promise}
   * @static
   */
  static addFavorite(resourceId) {
    return Plugin.request('passbolt.plugin.favorite.add', [resourceId]);
  }

  /**
   * Unmark a resource as favorite.
   * @return {Promise}
   * @static
   */
  static deleteFavorite(resourceId) {
    return Plugin.request('passbolt.plugin.favorite.delete', [resourceId]);
  }
}
