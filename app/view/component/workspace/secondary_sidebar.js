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
import Config from 'passbolt-mad/config/config';
import MadBus from 'passbolt-mad/control/bus';
import View from 'passbolt-mad/view/view';

var SecondarySidebarView = View.extend('passbolt.view.component.SecondarySidebar', /** @static */ {

}, /** @prototype */ {

    /**
     * Set the title
     * @param {string} title The new title
     */
    setTitle: function (title) {
        $('.sidebar .sidebar-header .sidebar-header-title', this.element).text(title);
    },

    /**
     * Set the subtitle
     * @param {string} subtitle The new subtitle
     */
    setSubtitle: function (subtitle) {
        $('.sidebar .sidebar-header .sidebar-header-subtitle', this.element).text(subtitle);
    },

    /**
     * Observe when the user clicks on the close button
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     */
    ' .js_sidebar_close click': function(el, ev) {
        Config.write('ui.workspace.showSidebar', false);
        MadBus.trigger('workspace_sidebar_hide');
    }

});

export default SecondarySidebarView;
