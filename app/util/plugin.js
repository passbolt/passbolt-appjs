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
 * @since         2.2.0
 */

/**
 * Is the addon ready.
 * @type {boolean}
 */
let isReady = false;

export default class Plugin {

  /**
   * Check that the plugin is ready
   * @return {Promise}
   */
  static isReady() {
    return new Promise(resolve => {
      this._isReady(resolve);
    });
  }

  /**
   * Loop until the plugin is ready.
   * @param {func} resolve The resolver
   * @return {Promise}
   */
  static async _isReady(resolve) {
    // If the plugin is already ready, return.
    if (isReady) return;

    try {
      let requestPluginPromise = this.request('passbolt.plugin.is-ready');
      // Don't wait the promise to be resolved, and schedule another check in Xms.
      setTimeout(() => Plugin._isReady(resolve), 1000);
      await requestPluginPromise;
      isReady = true;
      resolve();
    } catch (error) {
      // An error can occur if the request promise is not resolved.
      // It can happen in case of timeout, if the Plugin event listener was not ready at the moment
      // the request has been done.
    }
  }

  /**
   * Send a message to the plugin
   * @param {string} type The event type
   * @param {mixed} data The data to send with the event
   */
  static send(type, data) {
    data = data || {};
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, data);
    document.documentElement.dispatchEvent(event);
  }

  /**
   * Send a message to the plugin
   * @param {string} type The event type
   * @param {mixed} data The data to send with the event
   * @return {Promise}
   */
  static request(message, data) {
    // The generated requestId used to identify the request.
    const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
    // Add the requestId to the request parameters.
    let requestArgs = [requestId];
    if (data) {
      requestArgs = requestArgs.concat(Array.prototype.slice.call(data));
    }

    // The promise that is return when you call passbolt.request.
    return new Promise((resolve, reject) => {
      // Observe when the request has been completed.
      // Or if a progress notification is sent.
      document.addEventListener(requestId, function (event) {
        if (event.data.status === 'SUCCESS') {
          resolve(event.data.body);
        } else {
          reject(event.data.body);
        }
      });

      // Emit the message to the addon-code.
      this.send(message, requestArgs);
    });
  }
}
