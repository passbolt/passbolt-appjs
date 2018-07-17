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
import LoadingBarView from 'app/view/component/footer/loading_bar';
import MadBus from 'passbolt-mad/control/bus';

const LoadingBarComponent = Component.extend('passbolt.component.footer.LoadingBar', /** @static */ {

  defaults: {
    label: 'Loading Bar Component',
    viewClass: LoadingBarView,
    currentProcs: 0,
    previousProcs: 0,
    maxProcs: 0,
    loadingPercent: 0,
    postponedUpdate: false,
    progressionLeft: 100
  }

}, /** @prototype */ {

  /**
   * Start a loading.
   */
  loading_start: function(callback) {
    this.view.update(20, true, () => {
      if (callback) {
        callback();
      }
    });
  },

  /**
   * Complete a loading.
   */
  loading_complete: function(callback) {
    const self = this;
    this.options.progressionLeft = 100;
    this.view.update(100, true, () => {
      self.view.update(0, false);
      if (callback) {
        callback();
      }
    });
  },

  /**
   * Refresh the loading bar
   */
  update: function(postponedUpdate) {
    const self = this;

    /*
     * If we are in a postponed update.
     * Release the lock and allow other requests to be postponed.
     */
    if (typeof postponedUpdate != 'undefined' && postponedUpdate) {
      this.options.postponedUpdate = false;
    }

    // If the loading bar is currently updating.
    if (this.state.is('updating')) {
      // Postpone an update, unless one is already scheduled.
      if (!this.options.postponedUpdate) {
        this.options.postponedUpdate = true;
        setTimeout(() => {
          self.update(true);
        }, 100);
      }
      return;
    } else {
      // Lock the component.
      this.state.addState('updating');
    }

    /*
     * Make a temporary working copy of the class' variables.
     * Measurement are based on these variables, and they can change asynchronously.
     */
    const currentProcs = this.options.currentProcs;
    // If we have more processus in the queue than during the previous execution.
    if (this.options.maxProcs < currentProcs) {
      this.options.maxProcs = currentProcs;
    }
    // The variation of processus compare to the latest execution of the function.
    const diffProcs = currentProcs - this.options.previousProcs;

    /*
     * As much as processus than during the previous execution.
     * In asynchronous context it can happened.
     */
    if (!diffProcs) {
      this.state.removeState('updating');
    } else if (!currentProcs) {
      /*
       * All processus have been completed.
       * Even if the bar is not in "progressing" state, complete it.
       */
      this.state.addState('completing');
      this.loading_complete(function() {
        /*
         * Broadcast an event on the app event bus to notify all other components about the
         * the completion of the currents processus.
         */
        MadBus.trigger('passbolt_application_loading_completed', [this]);
        // Mark the loading bar component as ready.
        self.state.setState('ready');
      });
    } else {
      /*
       * Update the loading bar depending on the latest changes.
       * If there was no other processus currently loading.
       */
      if (!this.state.is('progressing')) {
        /*
         * Broadcast an event on the app event bus to notify all other components that some
         * processus are currently in action.
         */
        MadBus.trigger('passbolt_application_loading', [this]);
        this.state.addState('progressing');
      }

      /*
       * A new processus will fill the loading bar at 50%.
       * The other 50% will be filled while the processus will be completed.
       */
      const procSpace = (100 / this.options.maxProcs) * 1 / 2;
      const spaceLeft = (this.options.maxProcs - (this.options.maxProcs - this.options.currentProcs)) * procSpace;

      // The loading bar should only progress.
      if (spaceLeft <= this.options.progressionLeft) {
        this.options.progressionLeft = spaceLeft;
      }

      // Update the view.
      this.view.update(100 - this.options.progressionLeft, true, () => {
        self.state.removeState('updating');
      });
    }

    // The processus which are still active.
    this.options.previousProcs = currentProcs;
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Listen when a component is entering loading state.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} passbolt_component_loading_start': function(el, ev) {
    const component = ev.data.component;
    if (!component.options.silentLoading) {
      this.options.currentProcs++;
      this.update();
    }
  },

  /**
   * Listen when a component is leaving loading state.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} passbolt_component_loading_complete': function(el, ev) {
    const component = ev.data.component;
    if (!component.options.silentLoading) {
      if (this.options.currentProcs) { this.options.currentProcs--; }
      this.update();
    }
  },

  /**
   * Listen when an ajax request is starting from mad.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} mad_ajax_request_start': function(el, ev) {
    const request = ev.data.request;
    MadBus.trigger('passbolt_ajax_request_start', {request: request});
  },

  /**
   * Listen when an ajax request is completed in mad.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} mad_ajax_request_complete': function(el, ev) {
    const request = ev.data.request;
    MadBus.trigger('passbolt_ajax_request_complete',  {request: request});
  },

  /**
   * Listen when an ajax request is starting.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} passbolt_ajax_request_start': function(el, ev) {
    const request = ev.data.request;
    if (!request.silentLoading) {
      this.options.currentProcs++;
      this.update();
    }
  },

  /**
   * Listen when an ajax request is completed.
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} passbolt_ajax_request_complete': function(el, ev) {
    const request = ev.data.request;
    if (!request.silentLoading) {
      this.options.currentProcs--;
      this.update();
    }
  },

  /**
   * Listen the event passbolt_loading and display a feedback to the user
   */
  '{mad.bus.element} passbolt_loading': function() {
    this.options.currentProcs++;
    this.update();
  },

  /**
   * Listen the event passbolt_loading_completed and display a feedback to the user
   */
  '{mad.bus.element} passbolt_loading_complete': function() {
    this.options.currentProcs--;
    this.update();
  }
});

export default LoadingBarComponent;
