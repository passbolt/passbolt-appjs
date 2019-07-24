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
import Plugin from 'app/util/plugin';

export default class ResourceService {

  /**
   * Request the plugin to unmark a resource as favorite
   * @param {string} resourceId The target resource id
   * @return {Promise}
   */
  static deleteAllByIds(resourcesIds) {
    return Plugin.request('passbolt.plugin.resources.delete-all', [resourcesIds]);
  }

  /**
   * Request the plugin to save a resource
   * @param {string} resource The resource to save
   * @return {Promise}
   */
  static save(resource) {
    return Plugin.request('passbolt.plugin.resources.save', [resource]);
  }

  /**
   * Request the plugin to update a resource
   * @param {string} resource The resource to update
   * @return {Promise}
   */
  static update(resource) {
    return Plugin.request('passbolt.plugin.resources.update', [resource]);
  }

  /**
   * Request the plugin to update the resources local storage.
   * @return {Promise}
   */
  static updateLocalStorage() {
    return Plugin.request('passbolt.plugin.resources.update-local-storage');
  }

  /**
   * Request the plugin to insert the resource edit iframe
   * @param {string} resource The target resource id
   */
  static insertEditframe(resourceId) {
    return Plugin.send('passbolt.plugin.resource_edit', resourceId);
  }

  /**
   * Decrypt a secret and copy it to clipboard
   * @param {string} resourceId The resource id to decrypt and copy the secret for
   */
  static decryptSecretAndCopyToClipboard(resourceId) {
    return Plugin.send('passbolt.plugin.decrypt_secret_and_copy_to_clipboard', resourceId);
  }

  /**
   * Request the plugin to insert the bulk share iframe
   * @param {array} resourcesIds The list of resources ids to share
   */
  static insertShareIframe(resourcesIds) {
    return Plugin.send('passbolt.plugin.resources_share', { resourcesIds: resourcesIds });
  }

  /**
   * Find all the resources from the local storage.
   * @param {Object} options
   * - retryOnNotInitialized: @notImplementedYet Retry the request if the resources local storage is not initialized
   * @return {Promise}
   * @static
   */
  static findAllFromLocalStorage(options) {
    return retryRequest(() => {
      return Plugin.request("passbolt.storage.resources.get");
    }, options);
  }
}

const retryRequest = function (callback, options) {
  options = Object.assign({
    attempt: 0,
    timeout: 60000,
    attemptsLimit: 1200
  }, options);

  return new Promise(async (resolve, reject) => {
    try {
      const result = await callback();
      resolve(result);
    } catch (error) {
      if (options.attempt > options.attemptsLimit) {
        reject(error);
      } else {
        setTimeout(async () => {
          try {
            ++options.attempt;
            const result = await retryRequest(callback, options);
            resolve(result);
          } catch (error) {
            reject(error);
          };
        }, options.timeout / options.attemptsLimit);
      }
    }
  });
};
