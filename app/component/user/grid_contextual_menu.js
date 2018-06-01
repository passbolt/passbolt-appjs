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
import Action from 'passbolt-mad/model/map/action';
import ContextualMenuComponent from 'passbolt-mad/component/contextual_menu';
import MadBus from 'passbolt-mad/control/bus';
import User from 'app/model/map/user';

var GridContextualMenuComponent = ContextualMenuComponent.extend('passbolt.component.user.GridContextualMenu', /** @static */ {

    defaults: {
        user: null
    }

}, /** @prototype */ {

    /**
     * @inheritdoc
     */
    afterStart: function () {
        var user = this.options.user;

        // Is the user an admin.
        var isAdmin = User.getCurrent().isAdmin();

        // Is the selected user same as the current user.
        var isSelf = User.getCurrent().id == user.id;

        // Copy public key
        var copyPublicKeyItem = new Action({
            id: 'js_user_browser_menu_copy_key',
            label: 'Copy public key',
            action: () => this._copyPublicKey()
        });
        this.insertItem(copyPublicKeyItem);

        // Copy email
        var copyEmailItem = new Action({
            id: 'js_user_browser_menu_copy_email',
            label: 'Copy email address',
            cssClasses: (isAdmin ? ['separator-after'] : []),
            action: () => this._copyEmail()
        });
        this.insertItem(copyEmailItem);

        // Edit
        // Only admin can edit
        if (isAdmin) {
            var action = new Action({
                id: 'js_user_browser_menu_edit',
                label: 'Edit',
                action: () => this._edit()
            });
            this.insertItem(action);
        }

        // Delete
        // Only admin can delete, but admin cannot delete its own account
        if (isAdmin && !isSelf) {
            var action = new Action({
                id: 'js_user_browser_menu_delete',
                label: 'Delete',
                action: () => this._delete()
            });
            this.insertItem(action);
        }

        this._super();
    },

    /**
     * Copy public key to clipboard
     */
    _copyPublicKey: function() {
        var data = {
            name: 'public key',
            data: this.options.user.gpgkey.armored_key
        };
        MadBus.trigger('passbolt.clipboard', data);
        this.remove();
    },

    /**
     * Copy email to clipboard
     */
    _copyEmail: function () {
        var data = {
            name: 'email',
            data: this.options.user.username
        };
        MadBus.trigger('passbolt.clipboard', data);
        this.remove();
    },

    /**
     * Edit the user
     */
    _edit: function() {
        MadBus.trigger('request_user_edition', this.options.user);
        this.remove();
    },


    /**
     * Delete the user
     */
    _delete: function() {
        MadBus.trigger('request_user_deletion', this.options.user);
        this.remove();
    }

});

export default GridContextualMenuComponent;
