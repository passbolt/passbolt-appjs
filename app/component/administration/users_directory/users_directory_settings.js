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
 * @since         2.5.0
 */
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import UsersDirectorySettings from 'app/model/map/users_directory_settings';
import UsersDirectorySettingsForm from 'app/form/administration/users_directory/settings';
import MenuComponent from 'passbolt-mad/component/menu';
import PrimaryMenu from 'app/component/administration/users_directory/primary_menu';
import route from 'can-route';
import template from 'app/view/template/component/administration/users_directory/settings.stache!';
import templateItemBreadcrumb from 'app/view/template/component/breadcrumb/breadcrumb_item.stache!';

const UsersDirectorySettingsAdmin = Component.extend('passbolt.component.administration.users_directory.UsersDirectorySettings', /** @static */ {

  defaults: {
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  afterStart: function() {
    const edit = route.data.action == 'usersDirectory/edit';
    this._initPrimaryMenu(edit);
    this._initBreadcrumb(edit);
    this._initForm(edit);
  },

  /**
   * Init the primary menu
   * @param {bool} edit Start the component in edit mode
   * @private
   */
  _initPrimaryMenu: function(edit) {
    const selector = $('#js_wsp_primary_menu_wrapper');
    const menu = ComponentHelper.create(selector, 'inside_replace', PrimaryMenu, {
      edit: edit
    });
    menu.start();
  },

  /**
   * Init the breadcrumb
   * @param {bool} edit Start the component in edit mode
   */
  _initBreadcrumb: function(edit) {
    const breadcrumbWrapperSelector = '#js_wsp_administration_breadcrumb';
    const options = {
      itemTemplate: templateItemBreadcrumb
    };
    const breadcrumb = ComponentHelper.create($(breadcrumbWrapperSelector), 'inside_replace', MenuComponent, options);
    breadcrumb.start();

    const items = [];
    const administrationAction = new Action({
      label: __('Administration'),
      action: () => this._goToSection('mfa')
    });
    items.push(administrationAction);
    const UsersDirectoryAction = new Action({
      label: __('Users Directory'),
      action: () => this._goToSection('usersDirectory')
    });
    items.push(UsersDirectoryAction);
    const configurationAction = new Action({
      label: __('Settings'),
      action: () => this._goToSection('usersDirectory')
    });
    items.push(configurationAction);
    if (edit) {
      const UsersDirectoryEditAction = new Action({
        label: __('edit'),
        action: () => this._goToSection('usersDirectory/edit')
      });
      items.push(UsersDirectoryEditAction);
    }
    breadcrumb.load(items);
  },

  /**
   * Init the form
   * @param {bool} edit Start the component in edit mode
   * @private
   */
  _initForm: function(edit) {
    this.form = new UsersDirectorySettingsForm('#js-ldap-settings-form', {edit: edit});
    this.addLoadedDependency(this.form);
    return UsersDirectorySettings.findOne()
      .then(usersDirectorySettings => {
        this.usersDirectorySettings = usersDirectorySettings;
        this.form.loadAndStart(usersDirectorySettings);
      });
  },

  /**
   * Go to a section
   * @private
   */
  _goToSection: function(section) {
    route.data.update({controller: 'Administration', action: section});
    this.refresh();
  },

  /**
   * Listen when the user want to edit the settings.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-edit-button click': function() {
    route.data.update({controller: 'Administration', action: 'usersDirectory/edit'});
    this.refresh();
  },

  /**
   * Listen when the user want to save the changes.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-save-button click': function() {
    const data = this.form.getData();
    if (data.UsersDirectorySettings.enabled) {
      if (this.form.validate()) {
        this.usersDirectorySettings.assign(data.UsersDirectorySettings);
        this.usersDirectorySettings.save()
          .then(() => {
            route.data.update({controller: 'Administration', action: 'usersDirectory'});
            this.refresh();
          });
      }
    } else {
      this.usersDirectorySettings.disable()
        .then(() =>  {
          route.data.update({controller: 'Administration', action: 'usersDirectory'});
          this.refresh();
        });
    }
  },

  /**
   * Listen when the user want to cancel the edit.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-cancel-button click': function() {
    route.data.update({controller: 'Administration', action: 'usersDirectory'});
    this.refresh();
  }
});

export default UsersDirectorySettingsAdmin;
