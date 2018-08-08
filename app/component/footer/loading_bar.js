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
import Ajax from 'passbolt-mad/net/ajax';
import Component from 'passbolt-mad/component/component';
import LoadingState from 'app/model/state/loadingState';

const LoadingBarComponent = Component.extend('passbolt.component.footer.LoadingBar', /** @static */ {

  defaults: {
    label: 'Loading Bar Component',
    stateClass: LoadingState,
    components: Component._components,
    requests: Ajax._requests
  }

}, /** @prototype */ {

  init: function(el, options) {
    this._super(el, options);
    this._maxProcesses = 0;
    this._initialized = false;
    this._progressing = false;
    this._completing = false;
    this._progressedSpace = 100;
    this._scheduledProgress = null;
    this._initListeners();
  },

  /**
   * Listen to application loading events :
   * - When components are instantiated
   * - When request are executed
   * @private
   */
  _initListeners: function() {
    Component._components.on('add', (ev, components) => this._listenComponentInitialized(components));
    Ajax._requests.on('add', (ev, requests) => this._listenRequestExecuted(requests));
    Ajax._requests.on('remove', (ev, requests) => this._listenRequestCompleted(requests));
    this.state.on('loadingProcesses', () => this._update());
  },

  /**
   * Handle components instantiation
   * @param {DefineList} components List of instantiated components.
   * @private
   */
  _listenComponentInitialized: function(components) {
    components.forEach(component => {
      if (!component.options.silentLoading) {
        if (!component.state.loaded && !component.state.destroyed) {
          this.state.loadingProcesses++;
        }
        this._initComponentListeners(component);
      }
    });
  },

  /**
   * Handle request execution
   * @param {DefineList} request List of executed requests.
   * @private
   */
  _listenRequestExecuted: function(requests) {
    requests.forEach(request => {
      if (!request.silentLoading) {
        this.state.loadingProcesses++;
      }
    });
  },

  /**
   * Handle request completion
   * @param {DefineList} request List of completed requests.
   * @private
   */
  _listenRequestCompleted: function(requests) {
    requests.forEach(request => {
      if (!request.silentLoading) {
        if (this.state.loadingProcesses) {
          this.state.loadingProcesses--;
        }
      }
    });
  },

  /**
   * Listen to component state changes :
   * - A component is loading
   * - A component is loaded
   * - A component is destroyed
   * @param {DefineList} request List of executed requests.
   * @private
   */
  _initComponentListeners: function(component) {
    component.state.on('loaded', (ev, loaded) => this._listenComponentLoadedChanges(component, loaded));
    component.state.on('destroyed', (ev, loaded) => this._listenComponentDestroyedChanges(component, loaded));
  },

  /**
   * Handle components loading / loaded
   * @param {Component} component
   * @param {boolean} loaded
   * @private
   */
  _listenComponentLoadedChanges: function(component, loaded) {
    if (loaded) {
      if (this.state.loadingProcesses) {
        this.state.loadingProcesses--;
      }
    } else {
      this.state.loadingProcesses++;
    }
  },

  /**
   * Handle components destroyed
   * @param {Component} component
   * @param {boolean} destroyed
   * @private
   */
  _listenComponentDestroyedChanges: function(component, destroyed) {
    if (destroyed) {
      if (this.state.loadingProcesses) {
        this.state.loadingProcesses--;
      }
    }
  },

  /**
   * Update the loading bar.
   * @param {integer} size Loading percentage
   * @param {integer} duration The duration of the animation (default 400)
   */
  _animateBar: function(size, duration) {
    duration = duration || 400;
    const width = `${size}%`;
    const animateOptions = {width: width, duration: duration};
    return new Promise(resolve => {
      $('.progress-bar span', this.element).animate(animateOptions, resolve);
    });
  },

  /**
   * The loading processes number is evolving, update the component.
   * @private
   */
  _update: function() {
    // If the view is already updating, schedule a new update.
    if (this._progressing) {
      if (this._scheduledProgress != null) {
        clearTimeout(this._scheduledProgress);
      }
      this._scheduledProgress = setTimeout(() => this._update(), 100);
      return;
    }

    this._progressing = true;
    if (!this._initialized) {
      this._initProgress();
    } else if (!this.state.loadingProcesses) {
      this._completeProgress();
    } else {
      this._updateProgress();
    }
  },

  /**
   * Initialize the progress.
   * @private
   */
  _initProgress: function() {
    this._animateBar(15, 0)
      .then(() => {
        this._initialized = true;
        this._progressing = false;
      });
  },

  /**
   * Complete the progress.
   * @private
   */
  _completeProgress: function() {
    if (this._completing) {
      return;
    }

    this._completing = true;
    this._animateBar(100, 100)
      .then(() => {
        $('.progress-bar span', this.element).width(0);
        this._completing = false;
        this._progressing = false;
        this._initialized = false;
        this._progressedSpace = 100;
        if (!this.state.loadingProcesses) {
          this._maxProcesses = 0;
        }
      });
  },

  /**
   * Update the progress.
   * @private
   */
  _updateProgress: function() {
    this._maxProcesses = Math.max(this._maxProcesses, this.state.loadingProcesses);
    const procSpace = (100 / this._maxProcesses) * 1 / 2;
    const spaceLeft = (this._maxProcesses - (this._maxProcesses - this.state.loadingProcesses)) * procSpace;

    // The loading bar should only progress.
    if (spaceLeft <= this._progressedSpace) {
      this._progressedSpace = spaceLeft;
    }
    this._animateBar(100 - this._progressedSpace, 100)
      .then(() => this._progressing = false);
  }
});

export default LoadingBarComponent;
