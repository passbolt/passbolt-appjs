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

// Initialize the error namespaces.
passbolt.error = passbolt.error || {};
passbolt.error.WRONG_PARAMETER = "Wrong parameter [%0]";
passbolt.error.MISSING_OPTION = "The option [%0] should be defined";
passbolt.error.ELEMENT_NOT_FOUND = "The element [%0] could not be found";

const PassboltException = passbolt.Exception = function() {
};

PassboltException.get = function(exception_message) {
  const reps = Array.prototype.slice.call(arguments, 1);
  const message = exception_message.replace(/%(\d+)/g, (s, key) => reps[key] || s);
  return new Error(message);
};
