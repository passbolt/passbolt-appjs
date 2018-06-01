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
import DefineList from 'passbolt-mad/model/list/list';

var Filter = DefineMap.extend('passbolt.model.Filter', {
    id: 'string',
    label: 'string',
    rules: {
        type: 'any',
        value: {}
    },
    order: {
        type: 'any',
        value: []
    }
});

/**
 * Get the order.
 * @returns {*}
 */
Filter.prototype.getOrders = function() {
    if (this.order) {
        return this.order;
    }
    return [];
};

/**
 * Get a rule.
 * @param name {string} The rule name
 * @return {mixed} The rule value
 */
Filter.prototype.getRule = function(name) {
    return this.rules[name];
};

/**
 * Set a new rule, or change an existing rule value.
 * @param name {string} The rule name
 * @param value {mixed} The rule value
 */
Filter.prototype.setRule = function(name, value) {
    this.rules[name] = value;
};

/**
 * Get filters.
 * @param excludedRules {array} The rules to exclude
 * @return {object} Return the data that compose this filter
 */
Filter.prototype.getRules = function(excludedRules) {
    var returnValue = {};
    excludedRules = excludedRules || [];

    for (var ruleName in this.rules) {
        if (excludedRules.indexOf(ruleName) == -1) {
            returnValue[ruleName] = this.rules[ruleName];
        }
    }

    return returnValue;
};

export default Filter;
