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
import GroupsFilterSidebarSectionComponent from 'app/component/user/groups_filter_sidebar_section';
import PrimarySidebarAbstractComponent from 'app/component/workspace/primary_sidebar';
import ShortcutsFilterSidebarSectionComponent from 'app/component/user/shortcuts_filter_sidebar_section';

import template from 'app/view/template/component/user/primary_sidebar.stache!';

var PrimarySidebarComponent = PrimarySidebarAbstractComponent.extend('passbolt.component.user.PrimarySidebar', /** @static */ {

    defaults: {
        label: 'USer Workspace Primary Sidebar',
        template: template,
        defaultFilter: null,
        selectedRs: null,
        selectedGroups: null
    }

}, /** @prototype */ {

    /**
     * @inheritdoc
     */
    afterStart: function() {
        this._initShortcutsFilterSection();
        this._initGroupsFilterSection();
        this._super();
    },

    /**
     * Initialize the shortcuts filter section
     */
    _initShortcutsFilterSection: function() {
        var component = new ShortcutsFilterSidebarSectionComponent('#js_wsp_users_filter_shortcuts', {
            allFilter: this.options.defaultFilter
        });
        component.start();
    },

    /**
     * Initialize the groups filter section
     */
    _initGroupsFilterSection: function() {
        var component = new GroupsFilterSidebarSectionComponent('#js_wsp_users_groups', {
            selectedGroups: this.options.selectedGroups
        });
        component.start();
    }

});

export default PrimarySidebarComponent;
