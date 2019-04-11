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
import Clipboard from 'app/util/clipboard';
import Plugin from 'app/util/plugin';
import Resource from 'app/model/map/resource';
import SecondarySidebarSectionComponent from 'app/component/workspace/secondary_sidebar_section';

import template from 'app/view/template/component/password/information_sidebar_section.stache!';

const InformationSidebarSectionComponent = SecondarySidebarSectionComponent.extend('passbolt.component.password.InformationSidebarSection', /** @static */ {

  defaults: {
    label: 'Sidebar Section Information Controller',
    template: template,
    resource: null
  }

}, /** @prototype */ {

  init: function(el, options) {
    this._super(el, options);
    // Find missing information on resource.
    this._findResource();
  },

  /**
   * @inheritdoc
   */
  beforeRender: function() {
    this._super();
    this.setViewData('resource', this.options.resource);
  },

  /**
   * Find the resource missing information (creator & modifier).
   */
  _findResource: function() {
    const _this = this;
    const findOptions = {
      id: this.options.resource.id,
      silentLoading: false,
      contain: {creator: 1, modifier: 1}
    };
    Resource.findOne(findOptions).then(function(resource) {
      _this.options.resource.assign(resource);
    });
  },
  
  /**
   * Observe when the item is updated
   */
  '{resource} updated': function() {
    this.refresh();
  },

  /**
   * The password has been clicked.
   */
  '{element} li.password .secret-copy > a click': function() {
    const resource = this.options.resource;
    Plugin.decryptSecretAndCopyToClipboard(resource.id);
  },

  /**
   * The username has been clicked.
   */
  '{element} li.username .value > a click': function() {
    const item = this.options.resource;
    Clipboard.copy(item.username, 'username');
  }

});

export default InformationSidebarSectionComponent;
