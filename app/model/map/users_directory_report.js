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
import DefineMap from 'passbolt-mad/model/map/map';

const UsersDirectoryReport = DefineMap.extend('passbolt.model.UsersDirectoryReport', {
  'users': 'array',
  'groups': 'array'
});
DefineMap.setReference('UsersDirectoryReport', UsersDirectoryReport);

/**
 * Return the synchronized user operations report
 * @return {array}
 */
UsersDirectoryReport.prototype.getUsersSynchronized = function() {
  return this.users.filter(user => user.status != 'error' && user.status != 'ignore');
};

/**
 * Return the synchronized user operations report
 * @return {array}
 */
UsersDirectoryReport.prototype.getUsersError = function() {
  return this.users.filter(user => user.status == 'error');
};

/**
 * Return the synchronized user operations report
 * @return {array}
 */
UsersDirectoryReport.prototype.getUsersIgnored = function() {
  return this.users.filter(user => user.status == 'ignore');
};

/**
 * Return the synchronized group operations report
 * @return {array}
 */
UsersDirectoryReport.prototype.getGroupsSynchronized = function() {
  return this.groups.filter(group => group.status != 'error' && group.status != 'ignore');
};

/**
 * Return the synchronized groups operations report
 * @return {array}
 */
UsersDirectoryReport.prototype.getGroupsError = function() {
  return this.groups.filter(group => group.status == 'error');
};

/**
 * Return the synchronized groups operations report
 * @return {array}
 */
UsersDirectoryReport.prototype.getGroupsIgnored = function() {
  return this.groups.filter(group => group.status == 'ignore');
};

/**
 * Check if the report has error
 * @return {bool}
 */
UsersDirectoryReport.prototype.hasError = function() {
  const errorsUsers = this.getErrorUsers();
  if (!errorsUsers.length) {
    return true;
  }
  const errorsGroups = this.getErrorGroups();
  if (!errorsGroups) {
    return true;
  }
  return false;
};

/**
 * To text
 *
 * @return {string}
 */
UsersDirectoryReport.prototype.toText = function() {
  const usersSynchronized = this.getUsersSynchronized();
  const usersError = this.getUsersError();
  const usersIgnored = this.getUsersIgnored();
  const groupsSynchronized = this.getGroupsSynchronized();
  const groupsError = this.getGroupsError();
  const groupsIgnored = this.getGroupsIgnored();

  let text = '';
  text += '---------------------------------------------------------------------\n';
  text += 'Users\n';
  text += '---------------------------------------------------------------------\n';
  if (usersSynchronized.length) {
    text += '\n';
    text += 'Synchronized:\n';
    usersSynchronized.forEach(user => {
      text += `- ${user.message}\n`;
    });
  }
  if (usersError.length) {
    text += '\n';
    text += 'Errors:\n';
    usersError.forEach(user => {
      text += `- ${user.message}\n`;
    });
  }
  if (usersIgnored.length) {
    text += '\n';
    text += 'Ignored:\n';
    usersIgnored.forEach(user => {
      text += `- ${user.message}\n`;
    });
  }
  if (!usersSynchronized.length && !usersError.length && !usersIgnored.length) {
    text += '\n';
    text += 'No report to display\n';
  }

  text += '\n';
  text += '---------------------------------------------------------------------\n';
  text += 'Groups\n';
  text += '---------------------------------------------------------------------\n';
  if (groupsSynchronized.length) {
    text += '\n';
    text += 'Synchronized:\n';
    groupsSynchronized.forEach(group => {
      text += `- ${group.message}\n`;
    });
  }
  if (groupsError.length) {
    text += '\n';
    text += 'Errors:\n';
    groupsError.forEach(group => {
      text += `- ${group.message}\n`;
    });
  }
  if (groupsIgnored.length) {
    text += '\n';
    text += 'Ignored:\n';
    groupsIgnored.forEach(group => {
      text += `- ${group.message}\n`;
    });
  }
  if (!groupsSynchronized.length && !groupsError.length && !groupsIgnored.length) {
    text += '\n';
    text += 'No report to display\n';
  }

  return text;
};

export default UsersDirectoryReport;
