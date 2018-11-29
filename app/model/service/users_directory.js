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
import AppAjax from 'app/net/ajax';

class UsersDirectory {}

const DUMMY_DATA = {
  users: {
    created: {
      sync: [
        {username: 'ada@passbolt.com', message: 'The user ada@passbolt.com was mapped with an existing user in passbolt.'},
        {username: 'betty@passbolt.com', message: 'The user betty@passbolt.com was mapped with an existing user in passbolt.'}
      ],
      success: [
        {username: 'zoe@passbolt.com', message: 'The user zoe@passbolt.com was successfully added to passbolt.'},
        {username: 'neil@passbolt.com', message: 'The user neil@passbolt.com was successfully added to passbolt.'}
      ],
      error: [
        {username: 'sofia@passbolt.com', message: 'The previously deleted user sofia@passbolt.com was not re-added to passbolt.', details: './bin/cake directory_sync ignore-create --id=16789f75-2cf7-4755-9bd9-634d1ff42240 --model=DirectoryEntries'}
      ],
      ignore: []
    },
    deleted: {
      success: [],
      error: [],
      ignore: []
    },
  },
  groups: {
    created: {
      success: [
        {name: 'Finance', message: 'The group Finance was successfully added to passbolt.'},
        {name: 'DevOps', message: 'The group DevOps was successfully added to passbolt.'}
      ],
      sync: [],
      error: [
        {name: 'Operations', message: 'The group Operations could not be mapped with an existing group in passbolt because it was created after.', details: 'To ignore this error in the next sync please run ./bin/cake directory_sync ignore-create --id=91ea4dda-8925-4799-8b0a-279b9cde0610 --model=DirectoryEntries'}
      ],
      ignore: [
        {message: 'The user CN=Zoe Logos,OU=PassboltUsers,DC=passbolt,DC=local could not be added to group Finance because there is no matching directory entry in passbolt.'},
        {message: 'The user CN=Zoe Logos,OU=PassboltUsers,DC=passbolt,DC=local could not be added to group Operations because there is no matching directory entry in passbolt.'}
      ]
    },
    deleted: {
      success: [],
      error: [],
      ignore: []
    },
    updated: {
      success: [],
      error: [],
      ignore: []
    },
  }
};

/**
 * Simulate a synchronization
 * @return {Promise}
 * @static
 */
UsersDirectory.dryRunSynchronize = function() {
  // return AppAjax.request({
  //   url: `${APP_URL}directorysync/synchronize/dry-run.json`,
  //   type: 'GET'
  // });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(DUMMY_DATA);
    }, 500);
  });
};

/**
 * Synchronize
 * @return {Promise}
 * @static
 */
UsersDirectory.synchronize = function() {
  // return AppAjax.request({
  //   url: `${APP_URL}directorysync/synchronize.json`,
  //   type: 'GET'
  // });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(DUMMY_DATA);
    }, 500);
  });
};

export default UsersDirectory;
