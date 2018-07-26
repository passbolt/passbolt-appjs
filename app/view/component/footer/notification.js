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
import View from 'passbolt-mad/view/view';

const NotificationView = View.extend('passbolt.view.component.Notification', /** @static */ {

  defaults: {
    timeout: 2500,
    notifications: [],
    timeoutProcess: null,
    pause: false
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(elt, opts) {
    const timeoutConf = Config.read('notification.timeout');
    if (typeof timeoutConf != 'undefined') {
      this.options.timeout = timeoutConf;
    }
    this._super(elt, opts);
  },

  /**
   * Load a new notification
   */
  load: function(notification) {
    this.notifications.push(notification);
  },

  /**
   * Display the next notification.
   */
  displayNext: function() {
    const notifications = this.getController().options.notifications;

    if (notifications.length) {
      this.getController().refresh();
    } else {
      $('.message', this.element)
        .removeClass('fadeInUp')
        .addClass('fadeOutUp');

      this.getController().state.hiddening = true;
      setTimeout(() => {
        if (this.getController().state.hiddening) {
          this.getController().state.hidden = true;
        }
      }, 500);
    }
  },

  /**
   * Prepare the next display.
   */
  prepareNextDisplay: function() {
    this.options.timeoutProcess = setTimeout(() => {
      this.displayNext();
    }, this.options.timeout);
  },

  /**
   * Override mad.view.View.render() function.
   */
  render: function() {
    this.options.pause = false;
    // Set the view data with the next notification in the queue.
    const notifications = this.getController().options.notifications;
    const notification = notifications.shift();
    this.getController().setViewData(notification);

    // Hide the notification after a defined timeout.
    this.prepareNextDisplay();

    $('.message', this.element)
      .removeClass('fadeOutUp')
      .addClass('fadeInUp');

    return this._super();
  },

  /**
   * Observe the mouse down event.
   * Put the notificator in pause.
   */
  '{element} mousedown': function() {
    this.options.pause = true;
    clearTimeout(this.options.timeoutProcess);
  },

  /**
   * Observe the mouse up event.
   * Display the next notification if the user is not trying to select the notification text.
   * Otherwise keep the notificator in pause.
   */
  '{element} mouseup': function() {
    const selection = window.getSelection().toString();
    if (selection === '') {
      this.displayNext();
    }
  },

  /**
   * Observe when the user click on the window.
   * If the notificator was in pause restart the timeout process, to display the next notification.
   */
  '{window} click': function(el, ev) {
    if (this.options.pause && !$(ev.target).parents('#js_app_notificator').length) {
      this.prepareNextDisplay();
    }
  }

});

export default NotificationView;
