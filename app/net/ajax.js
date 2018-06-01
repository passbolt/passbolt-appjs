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
import DialogComponent from 'passbolt-mad/component/dialog';
import MadBus from 'passbolt-mad/control/bus';
import Response from 'passbolt-mad/net/response';
import SessionExpiredComponent from 'app/component/session/session_expired';

/**
 * @inherits passbolt-mad/Ajax
 * @see mad.net.Ajax
 * @parent passbolt-mad/Ajax
 *
 * Override the passbolt mad ajax class.
 * Broadcast notification events on POST/PUT/DELETE requests
**/
var AppAjax = Ajax.extend('app.net.Ajax', /** @static */ {

    /**
     * @inheritsdoc
     */
    handleSuccess: function(request, data) {
        var response = null;
        if (Response.isResponse(data)) {
            response = new Response(data);
        } else {
            response = data;
        }

        this._triggerNotification(request, response);
        this._triggerAjaxCompleteEvent(request);

        if (response instanceof Response) {
            return response.body;
        }
        return response;
    },

    /**
     * @inheritsdoc
     */
    handleError: function(request, jqXHR) {
        var response = null;

        // ResponseText is provided if the server is reachable.
        if (jqXHR.responseText) {
            try {
                // Passbolt returns always a json result.
                var jsonData = $.parseJSON(jqXHR.responseText);
                if (Response.isResponse(jsonData)) {
                    jsonData.code = jqXHR.status;
                    response = new Response(jsonData);
                }
            } catch(e) {
                response = Response.getResponse(jqXHR.status);
            }
        } else {
            response = Response.getResponse(0);
        }

        this._triggerAjaxCompleteEvent(request, response);
        this._triggerNotification(request, response);
        this._sessionExpired(request, response);

        return Promise.reject(response);
    },

    /**
     * Trigger a notification event.
     *
     * @param request
     * @param response
     * @private
     */
    _triggerNotification: function(request, response) {
        // send a notification on the event bus for any successful response.
        // the notification system will take care of filtering what should be displayed.
        if (MadBus.bus && (request.silentNotify == undefined || !request.silentNotify)) {
            MadBus.trigger('passbolt_notify', {
                title: response.header.title,
                status: response.header.status,
                data: response
            });
        }
    },

    /**
     * Treat the session expired API response.
     *
     * @param request
     * @param response
     * @private
     */
    _sessionExpired: function(request, response) {
        // If the user is not logged in to the application.
        // Redirect the user to the front page.
        if (response.header) {
            if (response.header.status == Response.STATUS_ERROR && response.header.code == 403) {
                // If the session expired dialog is already displayed.
                if ($('.session-expired-dialog').length > 0) {
                    return;
                }

                var dialog = DialogComponent.instantiate({
                    label: __('Session expired'),
                    cssClasses : ['session-expired-dialog', 'dialog-wrapper']
                }).start();

                // attach the component to the dialog
                dialog.add(SessionExpiredComponent, {});
            }
        }
        else {
            // @todo Same for success we use message as title, maybe we should to something cleaner.
            this.response.header.title = response.header.message;
        }
    }

}, /** @prototype */ {

});

export default AppAjax;
