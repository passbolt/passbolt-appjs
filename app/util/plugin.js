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
    if ($('html').hasClass('passboltplugin-ready')) {
      resolve();
    } else {
      setTimeout(() => {
        this._isReady(resolve);
      }, 50);
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
   * Request the plugin.
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

  /**
   * Request the plugin until success or timeout
   * @param {string} message The event type
   * @param {mixed} data The data to send with the event
   * @param {object} options The retry options
   * @return {Promise}
   */
  static requestUntilSuccess(message, data, options) {
    options = Object.assign({
      attempt: 0,
      timeout: 60000,
      attemptsLimit: 240
    }, options);

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.request(message, data);
        resolve(result);
      } catch (error) {
        if (options.attempt > options.attemptsLimit) {
          reject(error);
        } else {
          setTimeout(async () => {
            try {
              ++options.attempt;
              const result = await this.request(message, data);
              resolve(result);
            } catch (error) {
              reject(error);
            };
          }, options.timeout / options.attemptsLimit);
        }
      }
    });
  }
}
