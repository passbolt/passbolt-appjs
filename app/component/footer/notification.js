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
import Common from 'app/util/common';
import Component from 'passbolt-mad/component/component';
import Config from 'passbolt-mad/config/config';
import getObject from 'can-util/js/get/get';
import Notification from 'app/model/map/notification';
import NotificationView from 'app/view/component/footer/notification';
import uuid from 'uuid/v4';
import 'app/util/common';

import template from 'app/view/template/component/footer/notification.stache!';

var NotificationComponent = Component.extend('passbolt.component.footer.Notification', /** @static */ {

	defaults: {
		label: 'Notification Component',
		viewClass: NotificationView,
		status: 'hidden',
		notifications: [],
		template: template
	}

}, /** @prototype */ {

	/**
	 * Read settings from the configuration file.
	 *
	 * If no settings are provided, but the notification is an error,
	 * then return error settings. Otherwise return null.
	 *
	 * @param notification
	 * @returns {*}
	 * @private
	 */
	_readSettings: function(notification) {
		var notifSettings = Config.read('notification.messages.' + notification.title);
		if (notifSettings == undefined) {
			// Exception in case of errors.
			// We want to return all errors without exceptions.
			if (notification.status == "error") {
				return {
					msg: notification.data.header.message,
					severity: "error"
				};
			}
			return null;
		}
		return notifSettings;
	},

	/**
	 * Get settings for a given notification.
	 * @param notification
	 * @returns {*}
	 * @private
	 */
	_getNotificationSettings: function(notification) {
		var notifSettings = this._readSettings(notification);
		if (notifSettings == null) {
			return null;
		}

		// Severity is taken from the configuration.
		// If there is no configuration, then from the message status.
		// If no status, then it is the default : notice.
		if (getObject(notifSettings, 'severity') == undefined) {
			notifSettings.severity = (notification.status != undefined) ? notification.status : 'notice';
		}
		// If no group is provided, then it is put in the main.
		if (getObject(notifSettings, 'group') == undefined) {
			notifSettings.group = 'main';
		}
		// If no message is provided, we return null.
		if (getObject(notifSettings, 'msg') == undefined) {
			return null;
		}
		return notifSettings;
	},

	/**
	 * Build the message string for a given notification, and given settings.
	 * @param notification
	 * @param settings
	 * @returns {*|Object}
	 * @private
	 */
	_buildMessage: function(notification, settings) {
		var msg = getObject(settings, 'msg');
		var variables = msg.match(/%([^%]*)%/g);
		var data = notification.data;
		for (let i in variables) {
			let dataKey = variables[i].replace(/%/g, '');
			let value = getObject(data, dataKey);
			if (value == undefined) {
				value = 'undefined';
			}
			msg = msg.replace(variables[i], value);
		}
		return msg;
	},

	/**
	 * Populate a notification object from given settings.
	 * @param notification
	 * @param settings
	 * @returns {*}
	 * @private
	 */
	_populateNotification: function(notification, settings) {
		notification.message = this._buildMessage(notification, settings);
		// Status is equal to the status given, or if not defined the severity defined in the config.
		notification.status = (notification.status != undefined) ? notification.status : settings.severity;
		// Set severity.
		notification.severity = settings.severity;
		// Generate id.
		notification.id = uuid();

		return notification;
	},

	/**
	 * Check whether a notification should be displayed depending on the configuration given.
	 * @param notification
	 * @param settings
	 * @returns {boolean}
	 * @private
	 */
	_checkShouldBeDisplayed: function(notification, settings) {
		// Check the settings provided in the configuration file.
		var displaySeverity = Config.read('notification.displaySeverity');
		// If settings are not provided, we return false. (should not be displayed).
		if (displaySeverity == undefined) {
			return false;
		}
		// If the notification severity is included in the severity options in the config, we return true.
		if (displaySeverity.indexOf(notification.severity) != -1) {
			return true;
		}

		return false;
	},

	/**
	 * Load a notification.
	 * Basically receive a configuration and get the corresponding configuration for the given notification.
	 * The configuration is provided in the configuration file.
	 * The strategy is the following :
	 * 1. We check if a configuration is given for the received notification (conf retrieved with the title).
	 *   a. If no configuration, we do nothing.
	 *   b. If there is a configuration, we continue.
	 * 2. From the configuration given, and the defaults, populate the configuration with the missing information.
	 *   - message : the final message, formatted, translated, and with variables replaced by their match in data.
	 *   - status : type of notification
	 *   - severity : the severity of the notification. With this information we can then configure whether or not to display the notif.
	 *   - id : is recalculated locally as per the title, always in a previsible way (for css and tests).
	 * 3. Check whether or not the notification should be displayed on the interface.
	 *    This is decided through the severity and the severityDisplay settings.
	 * Once it is confirmed that the message should be displayed, push it on the interface.
	 * @param {passbolt.model.Notification} notification
	 */
	load: function (notification) {
		// Only notification with a title can be displayed.
		if (notification.title == undefined) {
			return;
		}
		// Check if notification should be processed.
		var notifSettings = this._getNotificationSettings(notification);
		if (notifSettings === null) {
			return;
		}
		var notification = this._populateNotification(notification, notifSettings);
		var display = this._checkShouldBeDisplayed(notification, notifSettings);
		if (notification === null) {
			return;
		}
		if (display === false) {
			return;
		}
		this.options.notifications.push(notification);

		// The component is not already started, start it
		if(this.view == null) {
			this.start();
		}
		// If the component is not ready restart it, otherwise the view will take care of the notifications queue.
		else if (this.state.is('hidden') || this.state.is('hiddening')) {
			this.refresh();
			this.setState('ready');
		}
	},

	/* ************************************************************** */
	/* LISTEN TO THE APP EVENTS */
	/* ************************************************************** */

	/**
	 * Listen the event passbolt_notify and display load the corresponding notification.
	 * @param {HTMLElement} el The element the event occurred on
	 * @param {HTMLEvent} ev The event which occurred
	 */
	'{mad.bus.element} passbolt_notify': function (el, ev) {
		const notif = ev.data;
		// When we receive a notification, we load it in the main system.
		this.load(new Notification(notif));
	}

});

export default NotificationComponent;
