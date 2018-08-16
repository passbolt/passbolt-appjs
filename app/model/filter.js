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

class Filter {
  /**
   * Constructor
   * @param options
   */
  constructor(options) {
    Object.assign(this, {
      id: '',
      type: '',
      forceReload: false,
      label: '',
      rules: {},
      order: {}
    }, options);
  }

  /**
   * Get the order.
   * @returns {*}
   */
  getOrders() {
    if (this.order) {
      return this.order;
    }
    return [];
  }

  /**
   * Get a rule.
   * @param name {string} The rule name
   * @return {mixed} The rule value
   */
  getRule(name) {
    return this.rules[name];
  }

  /**
   * Set a new rule, or change an existing rule value.
   * @param name {string} The rule name
   * @param value {mixed} The rule value
   */
  setRule(name, value) {
    this.rules[name] = value;
  }

  /**
   * Get filters.
   * @param excludedRules {array} The rules to exclude
   * @return {object} Return the data that compose this filter
   */
  getRules(excludedRules) {
    const returnValue = {};
    excludedRules = excludedRules || [];

    for (const ruleName in this.rules) {
      if (excludedRules.indexOf(ruleName) == -1) {
        returnValue[ruleName] = this.rules[ruleName];
      }
    }

    return returnValue;
  }
}

export default Filter;
