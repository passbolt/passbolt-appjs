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
import FavoriteView from 'app/view/component/favorite/favorite';
import MadBus from 'passbolt-mad/control/bus';

import template from 'app/view/template/component/favorite/favorite.stache!';

const FavoriteComponent = Component.extend('passbolt.component.Favorite', /** @static */ {

  defaults: {
    label: 'Favorite',
    viewClass: FavoriteView,
    instance: null,
    template: template
  }

}, /** @prototype */ {

  init: function(el, options) {
    this._super(el, options);
    this.setViewData('instance', this.options.instance);
  },

  /**
   * Mark the instance as favorite.
   */
  favorite: function() {
    this.state.loaded = false;
    this.view.favorite();
    MadBus.trigger('request_favorite', {resource: this.options.instance});
  },

  /**
   * Unmark the instance as favorite.
   */
  unfavorite: function() {
    this.state.loaded = false;
    this.view.unfavorite();
    MadBus.trigger('request_unfavorite', {resource: this.options.instance});
  },

  /**
   * Observe when the mouse leave the component
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{element} click': function(el, ev) {
    // Block the event so the grid does not listen to this event and select a row.
    ev.preventDefault();
    ev.stopPropagation();

    // If the component is already requesting a change, ignore this request.
    if (!this.state.loaded) {
      return;
    }
    if (!this.options.instance.isFavorite()) {
      this.favorite();
    } else {
      this.unfavorite();
    }
  },

  /**
   * Observe when the instance is updated
   */
  '{instance} updated': function() {
    if (!this.state.loaded) {
      this.state.loaded = true;
    }
  }

});

export default FavoriteComponent;
