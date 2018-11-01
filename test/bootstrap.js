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
 */
import $ from 'jquery';
import "passbolt-mad/test/lib/stealMocha.js";
import chai from "chai";

// Define the global context.
const glbl = typeof window !== "undefined" ? window : global;

// Extract the expect & assert functions from chai and make them global
glbl.expect = chai.expect;
glbl.assert = chai.assert;

// Make a global reference to the root reference element.
glbl.$rootElement = $('#test-html');
