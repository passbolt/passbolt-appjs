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
import MadBus from 'passbolt-mad/control/bus';
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
import User from 'app/model/map/user';

const UsersDirectorySettingsAdmin = Component.extend('passbolt.component.administration.users_directory.UsersDirectorySettings', /** @static */ {

  defaults: {
    template: template
  }

}, /** @prototype */ {

  /**
   * @inheritdoc
   */
  init: function(el, options) {
    this._super(el, options);
    this.usersDirectorySettings = null;
    this.users = null
  },

  /**
   * @inheritdoc
   */
  afterStart: function() {
    this._initPrimaryMenu();
    this._initBreadcrumb();
    this._initForm();
    this._getSettingsAndLoad();
  },

  /**
   * Init the primary menu
   * @private
   */
  _initPrimaryMenu: function() {
    const selector = $('#js_wsp_primary_menu_wrapper');
    this.primaryMenu = ComponentHelper.create(selector, 'inside_replace', PrimaryMenu, {
      settings: this.usersDirectorySettings
    });
    this.primaryMenu.start();
  },

  /**
   * Init the breadcrumb
   * @private
   */
  _initBreadcrumb: function() {
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
    breadcrumb.load(items);
  },

  /**
   * Init the form
   * @private
   */
  _initForm: function() {
    this.form = new UsersDirectorySettingsForm('#js-ldap-settings-form');
    this.addLoadedDependency(this.form);
    this.form.start();
  },

  /**
   * Find and load the settings
   * @private
   */
  _getSettingsAndLoad: function() {
    if (!this.usersDirectorySettings) {
      return UsersDirectorySettings.findOne()
      .then(usersDirectorySettings => {
        this.usersDirectorySettings = usersDirectorySettings;
      }).then(() => User.findAll({contain: {profile: 1}}))
      .then(users => {
        this.users = users;
        this.form.loadForm(this.usersDirectorySettings, this.users);
        this._initPrimaryMenu();
      })
    } else {
      this.form.loadForm(this.usersDirectorySettings, this.users);
      this._initPrimaryMenu();
    }
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
   * @param {string} title the dialog title
   * @return ProgressDialog
   */
  _showProgressDialog: function(title) {
    const label = title;
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
    const progressDialog = this._showProgressDialog(__('Synchronize simulation'));
    return UsersDirectoryService.dryRunSynchronize()
      .then(report => { 
        progressDialog.destroyAndRemove();
        this._showSynchronizeSimulationReport(report);
      }, () => {
        progressDialog.destroyAndRemove();
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

    simulateReportDialog.setViewData('usersSynchronized', report.getUsersSynchronized().length);
    simulateReportDialog.setViewData('usersError', report.getUsersError().length);
    simulateReportDialog.setViewData('groupsSynchronized', report.getGroupsSynchronized().length);
    simulateReportDialog.setViewData('groupsError', report.getGroupsError().length);
    simulateReportDialog.setViewData('resourcesSynchronized', (report.getUsersSynchronized().length + report.getGroupsSynchronized().length) == 0);
    simulateReportDialog.start();
    
    // Display the full report once the format is defined.
    $('textarea', simulateReportDialog.element).text(report.toText());
  },

  /**
   * Synchronize simulation.
   * 
   * @return Promise
   */
  _synchronize: function() {
    const progressDialog = this._showProgressDialog(__('Synchronize'));
    return UsersDirectoryService.synchronize()
      .then(report => { 
        progressDialog.destroyAndRemove();
        this._showSynchronizeReport(report);
      }, () => {
        progressDialog.destroyAndRemove();
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

    synchronizeReportDialog.setViewData('usersSynchronized', report.getUsersSynchronized().length);
    synchronizeReportDialog.setViewData('usersError', report.getUsersError().length);
    synchronizeReportDialog.setViewData('groupsSynchronized', report.getGroupsSynchronized().length);
    synchronizeReportDialog.setViewData('groupsError', report.getGroupsError().length);
    synchronizeReportDialog.setViewData('resourcesSynchronized', (report.getUsersSynchronized().length + report.getGroupsSynchronized().length) == 0);
    synchronizeReportDialog.start();
    
    // Display the full report once the format is defined.
    $('textarea', synchronizeReportDialog.element).text(report.toText());
  },

  /**
   * Listen when the form is updated.
   * When the form is updated enable the save settings button
   */
  '#js-ldap-settings-form changed': function() {
    this.primaryMenu.saveButton.state.disabled = false;
  },

  /**
   * Listen when the user want to simulate a synchronization.
   */
  '{window} #js_wsp_primary_menu_wrapper #js-ldap-settings-simulate-button click': function() {
    this._synchronizeSimulation();
  },

  /**
   * Listen when the user want to synchronize.
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
            MadBus.trigger('passbolt_notify', {
              title: 'app_directorysync_settings_update_success',
              status: 'success',
            });
          });
      }
    } else {
      this.usersDirectorySettings.destroy()
        .then(() =>  {
          this.usersDirectorySettings = new UsersDirectorySettings({});
          route.data.update({controller: 'Administration', action: 'usersDirectory'});
          this.refresh();
        });
    }
  }
});

export default UsersDirectorySettingsAdmin;
