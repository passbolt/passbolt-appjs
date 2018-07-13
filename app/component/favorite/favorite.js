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
import ButtonComponent from 'passbolt-mad/component/button';
import FavoriteView from 'app/view/component/favorite/favorite';
import MadBus from 'passbolt-mad/control/bus';

import template from 'app/view/template/component/favorite/favorite.stache!';

var FavoriteComponent = Component.extend('passbolt.component.Favorite', /** @static */ {

	defaults: {
		label: 'Favorite',
		viewClass: FavoriteView,
		instance: null,
        template: template
	}

}, /** @prototype */ {

	init: function (el, options) {
		this._super(el, options);
		this.setViewData('instance', this.options.instance);
	},

	/**
	 * Mark the instance as favorite.
	 */
	favorite: function() {
		this.setState('loading');
		this.view.favorite();
		MadBus.trigger('request_favorite', {resource: this.options.instance});
	},

	/**
	 * Unmark the instance as favorite.
	 */
	unfavorite: function() {
		this.setState('loading');
		this.view.unfavorite();
		MadBus.trigger('request_unfavorite', {resource: this.options.instance});
	},

	/* ************************************************************** */
	/* LISTEN TO THE VIEW EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the mouse leave the component
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	click: function (el, ev) {
		// Block the default behavior and don't propagate the event to avoid the grid controller
		// to catch it and select/unselect the row behind this component.
		ev.preventDefault();
		ev.stopPropagation();

		// If the component is already requesting a change, drop this request.
		if (this.state.is('loading')) {
			return;
		}

		if (!this.options.instance.isFavorite()) {
			this.favorite();
		} else {
			this.unfavorite();
		}
	},

	/* ************************************************************** */
	/* LISTEN TO THE MODEL EVENTS */
	/* ************************************************************** */

	/**
	 * Observe when the instance is updated
	 * @param {passbolt.model} instance The updated instance
	 */
	'{instance} updated': function (instance) {
		if (this.state.is('loading')) {
			this.setState('ready');
		}
	}

});

export default FavoriteComponent;
