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
import ButtonComponent from 'passbolt-mad/component/button';
import Component from 'passbolt-mad/component/component';
import MadBus from 'passbolt-mad/control/bus';
import template from 'app/view/template/component/settings/workspace_primary_menu.stache!';

const SettingsWorkspaceMenu = Component.extend('passbolt.component.settings.WorkspacePrimaryMenu', /** @static */ {
  defaults: {
    label: 'Settings Workspace Menu',
    template: template
  }

}, /** @prototype */ {

  /**
   * After start hook.
   * @see {mad.Component}
   */
  afterStart: function() {
    // Edit user
    const editButton = new ButtonComponent('#js_settings_wk_menu_edition_button', {
      state: {hidden: true}
    });
    editButton.start();
    this.options.editButton = editButton;

    // Download public key
    const publicKeyButton = new ButtonComponent('#js_settings_wk_menu_download_public_key', {
      state: {hidden: true}
    });
    publicKeyButton.start();
    this.options.publicKeyButton = publicKeyButton;

    // Download private key
    const privateKeyButton = new ButtonComponent('#js_settings_wk_menu_download_private_key', {
      state: {hidden: true}
    });
    privateKeyButton.start();
    this.options.privateKeyButton = privateKeyButton;

    this.on();
  },

  /* ************************************************************** */
  /* LISTEN TO THE VIEW EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user wants to edit an instance (Resource, User depending of the active workspace)
   */
  '{editButton.element} click': function() {
    MadBus.trigger('request_profile_edition');
  },

  /**
   * Observe when the user wants to download his public key.
   */
  '{publicKeyButton.element} click': function() {
    MadBus.trigger('passbolt.settings.download_public_key');
  },

  /**
   * Observe when the user wants to download his private key.
   */
  '{privateKeyButton.element} click': function() {
    MadBus.trigger('passbolt.settings.download_private_key');
  },

  /* ************************************************************** */
  /* LISTEN TO THE APP EVENTS */
  /* ************************************************************** */

  /**
   * Observe when the user changes section inside the workspace, and adjust the menu items accordingly
   * @param {HTMLElement} el The element the event occurred on
   * @param {HTMLEvent} ev The event which occurred
   */
  '{mad.bus.element} request_settings_section': function(el, ev) {
    const section = ev.data.section;
    if (section == 'profile') {
      this.options.editButton.state.hidden = false;
      this.options.publicKeyButton.state.hidden = true;
      this.options.privateKeyButton.state.hidden = true;
    } else if (section == 'keys') {
      this.options.editButton.state.hidden = true;
      this.options.publicKeyButton.state.hidden = false;
      this.options.privateKeyButton.state.hidden = false;
    }
  }
});

export default SettingsWorkspaceMenu;
