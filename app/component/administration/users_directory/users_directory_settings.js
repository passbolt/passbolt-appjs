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
 * @since         2.6.0
 */
import Action from 'passbolt-mad/model/map/action';
import Component from 'passbolt-mad/component/component';
import ComponentHelper from 'passbolt-mad/helper/component';
import ConfirmDialogComponent from 'passbolt-mad/component/confirm';
import UsersDirectoryService from 'app/model/service/users_directory';
import UsersDirectorySettings from 'app/model/map/users_directory_settings';
import UsersDirectorySettingsForm from 'app/form/administration/users_directory/settings';
import MenuComponent from 'passbolt-mad/component/menu';
import PrimaryMenu from 'app/component/administration/users_directory/primary_menu';
import ProgressDialog from 'app/component/dialog/progress';
import route from 'can-route';
import template from 'app/view/template/component/administration/users_directory/settings.stache!';
import templateItemBreadcrumb from 'app/view/template/component/breadcrumb/breadcrumb_item.stache!';
import templateSynchronizeReport from 'app/view/template/component/administration/users_directory/synchronize_report.stache!';
import templateSynchronizeSimulationReport from 'app/view/template/component/administration/users_directory/synchronize_simulation_report.stache!';

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
    this._findUsersDirectorySettings()
      .then(() => this._initPrimaryMenu(edit))
      .then(() => this._initBreadcrumb(edit))
      .then(() => this._initForm(edit));
  },

  /**
   * Init the primary menu
   * @param {bool} edit Start the component in edit mode
   * @private
   */
  _initPrimaryMenu: function(edit) {
    const selector = $('#js_wsp_primary_menu_wrapper');
    const menu = ComponentHelper.create(selector, 'inside_replace', PrimaryMenu, {
      edit: edit,
      settings: this.usersDirectorySettings
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
    this.form.loadAndStart(this.usersDirectorySettings);
  },

  /**
   * Find the settings
   * @private
   */
  _findUsersDirectorySettings: function() {
    return UsersDirectorySettings.findOne()
      .then(usersDirectorySettings => {
        this.usersDirectorySettings = usersDirectorySettings;
        return this.usersDirectorySettings
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
   * Show the progress dialog
   * 
   * @return ProgressDialog
   */
  _showProgressDialog: function() {
    const label = __('Synchronize simulation');
    const progressDialog = ProgressDialog.instantiate({label});
    progressDialog.start();

    return progressDialog;
  },

  /**
   * Synchronize simulation.
   * 
   * @return Promise
   */
  _synchronizeSimulation: function() {
    const progressDialog = this._showProgressDialog();
    return UsersDirectoryService.dryRunSynchronize()
      .then(report => { 
        progressDialog.destroyAndRemove();
        this._showSynchronizeSimulationReport(report);
      });
  },

  /**
   * Display the synchronize simulation report
   * 
   * @param {object} report The report
   */
  _showSynchronizeSimulationReport: function(report)
  {
    const simulateReportDialog = ConfirmDialogComponent.instantiate({
      label: __('Synchronize simulation report'),
      subtitle: __('The operation was successfull.'),
      content: templateSynchronizeSimulationReport,
      submitButton: {
        label: 'Synchronize',
        cssClasses: ['primary']
      },
      action: () => {
        simulateReportDialog.destroyAndRemove();
        setTimeout(() => this._synchronize(), 0);
      }
    });
    const usersSynchronized = report.users.created.success.length + report.users.created.sync.length + report.users.deleted.success.length;
    const usersError = report.users.created.error.length + report.users.deleted.error.length;
    const groupsSynchronized = report.groups.created.success.length + report.groups.created.sync.length + report.groups.deleted.success.length;
    const groupsError = report.groups.created.error.length + report.groups.deleted.error.length;

    simulateReportDialog.setViewData('usersSynchronized', usersSynchronized);
    simulateReportDialog.setViewData('usersError', usersError);
    simulateReportDialog.setViewData('groupsSynchronized', groupsSynchronized);
    simulateReportDialog.setViewData('groupsError', groupsError);
    simulateReportDialog.start();
    
    // Display the full report once the format is defined.
    // $('textarea', simulateReportDialog.element).text(JSON.stringify(result, null, 4));
  },

  /**
   * Synchronize simulation.
   * 
   * @return Promise
   */
  _synchronize: function() {
    const progressDialog = this._showProgressDialog();
    return UsersDirectoryService.synchronize()
      .then(report => { 
        progressDialog.destroyAndRemove();
        this._showSynchronizeReport(report);
      });
  },

 /**
   * Display the synchronize simulation report
   * 
   * @param {object} report The report
   */
  _showSynchronizeReport: function(report)
  {
    const synchronizeReportDialog = ConfirmDialogComponent.instantiate({
      label: __('Synchronize report'),
      subtitle: __('The operation was successfull.'),
      content: templateSynchronizeReport,
      submitButton: {
        label: 'OK',
        cssClasses: ['primary']
      },
      cancelButton: {
        cssClasses: ['hidden']
      },
      action: () => synchronizeReportDialog.destroyAndRemove()
    });
    const usersSynchronized = report.users.created.success.length + report.users.created.sync.length + report.users.deleted.success.length;
    const usersError = report.users.created.error.length + report.users.deleted.error.length;
    const groupsSynchronized = report.groups.created.success.length + report.groups.created.sync.length + report.groups.deleted.success.length;
    const groupsError = report.groups.created.error.length + report.groups.deleted.error.length;

    synchronizeReportDialog.setViewData('usersSynchronized', usersSynchronized);
    synchronizeReportDialog.setViewData('usersError', usersError);
    synchronizeReportDialog.setViewData('groupsSynchronized', groupsSynchronized);
    synchronizeReportDialog.setViewData('groupsError', groupsError);
    synchronizeReportDialog.start();
    
    // Display the full report once the format is defined.
    // $('textarea', synchronizeReportDialog.element).text(JSON.stringify(result, null, 4));
  },

  /**
   * Listen when the user want to edit the settings.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-edit-button click': function() {
    route.data.update({controller: 'Administration', action: 'usersDirectory/edit'});
    this.refresh();
  },

  /**
   * Listen when the user want to edit the settings.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-simulate-button click': function() {
    this._synchronizeSimulation();
  },

  /**
   * Listen when the user want to edit the settings.
   */ 
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-synchronize-button click': function() {
    this._synchronize();
  },

  /**
   * Observe when accordion-header is clicked.
   */
  '{window} .operation-details .accordion-header click': function() {
    $('.operation-details .accordion-content').toggle();
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
      this.usersDirectorySettings.destroy()
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
