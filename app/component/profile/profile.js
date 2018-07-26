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
import MadBus from 'passbolt-mad/control/bus';
import template from 'app/view/template/component/profile/profile.stache!';

const ProfileComponent = Component.extend('passbolt.component.profile.Profile', /** @static */ {

  defaults: {
    template: template,
    user: null
  }

}, /** @prototype */ {

  /**
   * Before render.
   */
  'beforeRender': function() {
    this._super();
    this.setViewData('user', this.options.user);
  },

  /* ************************************************************** */
  /* LISTEN TO THE MODEL EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user is updated
   */
  '{user} updated': function() {
    this.refresh();
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * The user want to edit his personal information
   */
  '{element} .edit-action click': function() {
    const user = this.options.user;
    MadBus.trigger('request_profile_edition', {user: user});
  },

  /**
   * The user want to edit his avatar
   */
  '{element} .edit-avatar-action click': function() {
    const user = this.options.user;
    MadBus.trigger('request_profile_avatar_edition', {user: user});
  }
});

export default ProfileComponent;
