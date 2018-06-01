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
import Component from 'passbolt-mad/component/component';
import Config from 'passbolt-mad/config/config';
import SecondarySidebarView from 'app/view/component/workspace/secondary_sidebar';

import template from 'app/view/template/component/workspace/secondary_sidebar.stache!';

var SecondarySidebarComponent = Component.extend('passbolt.component.workspace.SecondarySidebar', /** @static */ {

    defaults: {
        label: 'Sidebar Component',
        // View class.
        viewClass: SecondarySidebarView,
        // The selectedItem to bind the component on.
        selectedItem: null,
        // Items selected in the interface. We need them to deduct the selectedItem.
        selectedItems: null,
        // template uri.
        template: template
    }

}, /** @prototype */ {

    /**
     * before start hook.
     */
    beforeRender: function () {
        this._super();
        // pass the new item to the view
        this.setViewData('selectedItem', this.options.selectedItem);
    },

    /**
     * Load details of a resource
     * @param {passbolt.model.Resource} resource The resource to load
     */
    load: function (item) {
		// push the new resource in the options to be able to listen the resource
        // change in the function name
        this.options.selectedItem = item;

		// Display or not the sidebar regarding the sidebar configuration variable.
		if (Config.read('ui.workspace.showSidebar')) {
			// If the component has not been already started
			if (this.state.is(null)) {
				this.start();
			}
			// Else refresh the component, the afterStart will be replayed.
			else {
				this.refresh();
			}
		}

        // Some options changed, make the controller able to listen changes on this new options
        this.on();
    },

	/**
	 * Unload the component.
	 */
	unload: function() {
		this.options.selectedItem = null;
		this.on();

		if (this.state.is('ready')) {
			this.setState('hidden');
		}
	},

    /**
     * Check if the component is disabled or it is planned to disable it right after
     * its start
     * @return {boolean}
     */
    isDisabled: function() {
        // if the component is disabled
        if (this.state.is('disabled') ||
            // OR the component is not started AND it will be disabled right after its start
            (this.state.is(null) &&
            	(
					this.options.state == 'disabled' ||
					($.isArray(this.options.state) && this.options.state.indexOf('disabled') != -1)
            	)
            )
        ) {
            return true;
        }
        return false;
    },

    /**
     * Set the title
     * @param {string} title The new title
     */
    setTitle: function(title) {
        this.view.setTitle(title);
    },

    /**
     * Set the subtitle
     * @param {string} subtitle The new subtitle
     */
    setSubtitle: function(subtitle) {
        this.view.setSubtitle(subtitle);
    },

    /* ************************************************************** */
    /* LISTEN TO THE STATE CHANGES */
    /* ************************************************************** */

    /**
     * Listen to the change relative to the state Ready
     * @param {boolean} go Enter or leave the state
     */
    stateReady: function(go) {
        if(go) {
            // because by default the component is hidden (see associated ejs)
            this.view.show();
        }
        this._super(go);
    },

    /* ************************************************************** */
    /* LISTEN TO THE APP EVENTS */
    /* ************************************************************** */

    /**
     * Observe when the user desire to show the sidebar
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
     */
    '{mad.bus.element} workspace_sidebar_show': function(el, ev) {
		if (this.options.selectedItem != null) {
			this.load(this.options.selectedItem);
		}
    },

	/**
	 * Observe when the user desire to hide the sidebar
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} workspace_sidebar_hide': function(el, ev) {
		if (this.state.is('ready')) {
			this.setState('hidden');
		}
	},

    /**
     * Observe when a item is selected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.User||passbolt.model.Resource} item The selected item
     */
    '{selectedItems} add': function (el, ev, item) {
        // If more than one resource selected, or no resource selected.
        if (this.options.selectedItems.length == 0 || this.options.selectedItems.length > 1) {
            this.unload();
        }
		// Else if only 1 resource selected show the details.
		else {
			this.load(this.options.selectedItems[0]);
        }
    },

    /**
     * Observe when an item is unselected
     * @param {HTMLElement} el The element the event occurred on
     * @param {HTMLEvent} ev The event which occurred
     * @param {passbolt.model.User||passbolt.model.Resource} item The unselected item
     */
    '{selectedItems} remove': function (el, ev, item) {
        // If more than one item selected, or no item selected.
        if (this.options.selectedItems.length == 0 || this.options.selectedItems.length > 1) {
            this.unload();
        }
		// Else if only 1 item selected show the details.
		else {
			this.load(this.options.selectedItems[0]);
        }
    }

});

export default SecondarySidebarComponent;
