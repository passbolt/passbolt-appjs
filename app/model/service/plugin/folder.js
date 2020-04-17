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
 * @since         2.13.0
 */
import Plugin from '../../../util/plugin';

export default class FolderService {
  /**
   * Request the plugin to update the folders local storage.
   * @return {Promise}
   */
  static updateLocalStorage() {
    return Plugin.request('passbolt.plugin.folders.update-local-storage');
  }

  /**
  * Request the plugin to insert the folder create dialog.
  */
  static openCreateDialog(folderParentId) {
    return Plugin.send('passbolt.plugin.folders.open-create-dialog', { folderParentId });
  }

  /**
   * Request the plugin to insert the folder rename dialog.
   */
  static openRenameDialog(folder) {
    return Plugin.send('passbolt.plugin.folders.open-rename-dialog', {folderId: folder.id});
  }

  /**
   * Request the plugin to insert the folder rename dialog.
   */
  static openShareDialog(foldersId) {
    return Plugin.send('passbolt.plugin.folders.open-share-dialog', {foldersId: foldersId});
  }

  /**
   * Request the plugin to insert the folder delete dialog.
   */
  static openDeleteDialog(folder) {
    return Plugin.send('passbolt.plugin.folders.open-delete-dialog', {folderId: folder.id});
  }

  /**
   * Request the plugin to insert the folder move dialog.
   */
  static openMoveDialog(folder) {
    return Plugin.send('passbolt.plugin.folders.open-move-dialog', {folderId: folder.id});
  }

  /**
   * Request the plugin to move a folder.
   * @param {array} folders The folders to move.
   * @param {array} resources The resources to move.
   * @param {string} folderParentId The parent folder.
   */
  static openMoveConfirmationDialog(folders, resources, folderParentId) {
    return Plugin.send('passbolt.plugin.folders.open-move-confirmation-dialog', {folders, resources, folderParentId});
  }

  /**
   * Find all the folders from the local storage.
   * @param {Object} options
   * - retryOnNotInitialized: @notImplementedYet Retry the request if the folders local storage is not initialized
   * @return {Promise}
   * @static
   */
  static findAllFromLocalStorage(options) {
    return retryRequest(() => {
      return Plugin.request("passbolt.storage.folders.get");
    }, options);
  }
}

const retryRequest = function (callback, options) {
  options = Object.assign({
    attempt: 0,
    timeout: 60000,
    attemptsLimit: 240
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
