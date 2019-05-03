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
import Ajax from 'app/net/ajax';
import connect from 'can-connect';
import connectDataUrl from 'can-connect/data/url/url';
import connectParse from 'can-connect/data/parse/parse';
import connectConstructor from 'can-connect/constructor/constructor';
import connectMap from 'can-connect/can/map/map';
import DefineMap from 'passbolt-mad/model/map/map';

const Favorite = DefineMap.extend('passbolt.model.Favorite', {
  id: 'string',
  user_id: 'string',
  foreign_model: 'string',
  foreign_key: 'string'
});
DefineMap.setReference('Favorite', Favorite);

Favorite.connection = connect([connectParse, connectDataUrl, connectConstructor, connectMap], {
  Map: Favorite,
  List: Favorite.List,
  url: {
    resource: '/',
    destroyData: function(params) {
      return Ajax.request({
        url: `favorites/${params.id}.json?api-version=v2`,
        type: 'DELETE'
      });
    },
    createData: function(params) {
      return Ajax.request({
        url: `favorites/resource/${params.foreign_key}.json?api-version=v2`,
        type: 'POST'
      });
    }
  }
});

export default Favorite;
