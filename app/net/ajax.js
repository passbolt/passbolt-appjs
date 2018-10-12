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
import Ajax from 'passbolt-mad/net/ajax';
import Config from 'passbolt-mad/config/config';
import DialogComponent from 'passbolt-mad/component/dialog';
import MadBus from 'passbolt-mad/control/bus';
import SessionExpiredComponent from 'app/component/session/session_expired';
import MfaRequiredComponent from 'app/component/mfa/mfa_required';

/**
 * @inherits passbolt-mad/Ajax
 * @see mad.net.Ajax
 * @parent passbolt-mad/Ajax
 *
 * Override the passbolt mad ajax class.
 * Broadcast notification events on POST/PUT/DELETE requests
 *
 */
const AppAjax = Ajax.extend('app.net.Ajax', /** @static */ {

  /**
   * @inheritsdoc
   */
  request: function(request) {
    // Set the CSRF request header.
    request.beforeSend = function(xhr) {
      request._xhr = xhr;
      const csrfToken = Config.read('app.csrfToken');
      xhr.setRequestHeader('X-CSRF-Token', csrfToken);
    };

    return this._super(request);
  },

  /**
   * @inheritsdoc
   */
  handleSuccess: function(request, data) {
    return this._super(request, data)
      .then(data => {
        this._triggerNotification(request, request._response);
        return Promise.resolve(data);
      });
  },

  /**
   * @inheritsdoc
   */
  handleError: function(request, data) {
    return this._super(request, data)
      .then(null, data => {
        this._triggerNotification(request, request._response);
        this._sessionExpired(request, data);
        this._mfaRequired(request, request._response);
        return Promise.reject(data);
      });
  },

  /**
   * Trigger a notification event.
   *
   * @param request
   * @param response
   * @private
   */
  _triggerNotification: function(request, response) {
    /*
     * send a notification on the event bus for any successful response.
     * the notification system will take care of filtering what should be displayed.
     */
    if (MadBus.bus && (request.silentNotify === undefined || !request.silentNotify)) {
      MadBus.trigger('passbolt_notify', {
        title: response.header.title,
        status: response.header.status,
        data: response
      });
    }
  },

  /**
   * Redirect the user to the multiple factor authentication page if required
   *
   * @param request
   * @param response
   * @private
   */
  _mfaRequired: function(request, response) {
    if (response.header) {
      if (response.header.code === 403 && response.header.url.startsWith('/mfa/verify/error')) {
        // If the mfa required dialog is already displayed.
        if ($('.mfa-required-dialog').length > 0) {
          return;
        }

        const dialog = DialogComponent.instantiate({
          label: __('MFA Required'),
          cssClasses: ['mfa-required-dialog', 'dialog-wrapper']
        }).start();

        // attach the component to the dialog
        // let the server redirect where needed
        dialog.add(MfaRequiredComponent, {url: '/'});
      }
      return true;
    }
    return false;
  },

  /**
   * Treat the session expired API response.
   *
   * @param request
   * @param response
   * @private
   */
  _sessionExpired: function(request, response) {
    /*
     * If the user is not logged in to the application.
     * Redirect the user to the front page.
     */
    if (response.header) {
      const sessionExpiredAutoRedirect = request.sessionExpiredAutoRedirect !== undefined ? request.sessionExpiredAutoRedirect : true;
      if (response.header.code === 403 && response.header.message === 'You need to login to access this location.' && sessionExpiredAutoRedirect) {
        // If the session expired dialog is already displayed.
        if ($('.session-expired-dialog').length > 0) {
          return;
        }

        const dialog = DialogComponent.instantiate({
          label: __('Session expired'),
          cssClasses: ['session-expired-dialog', 'dialog-wrapper']
        }).start();

        // attach the component to the dialog
        dialog.add(SessionExpiredComponent, {});
      }
    } else {
      // @todo Same for success we use message as title, maybe we should to something cleaner.
      this.response.header.title = response.header.message;
    }
  }

}, /** @prototype */ {

});

export default AppAjax;
