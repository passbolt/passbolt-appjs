/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.14.0
 */
import React from "react";

export default class ContextualMenu extends React.Component {

  /**
   * Constructor
   * Initialize state and bind methods
   */
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.createRefs();
    this.bindCallbacks();
  }

  /**
   * Return default state
   * @returns {Object} default state
   */
  getDefaultState() {
    return {
      show: false,
      folder: null,
      top: 0,
      left: 0
    };
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createRefs() {
    this.elementRef = React.createRef();
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleClickOutsideComponentEvent = this.handleClickOutsideComponentEvent.bind(this);
    this.handleCreateFolderItemClickEvent = this.handleCreateFolderItemClickEvent.bind(this);
    this.handleRenameFolderItemClickEvent = this.handleRenameFolderItemClickEvent.bind(this);
    this.handleMoveFolderItemClickEvent = this.handleMoveFolderItemClickEvent.bind(this);
    this.handleShareFolderItemClickEvent = this.handleShareFolderItemClickEvent.bind(this);
    this.handleDeleteFolderItemClickEvent = this.handleDeleteFolderItemClickEvent.bind(this);
  }

  /**
   * Handle click outside of the contextual menu event.
   * @param {ReactEvent} event The event
   */
  handleClickOutsideComponentEvent(event) {
    if (this.elementRef.current.contains(event.target)) {
      return;
    }
    this.hide();
  }

  /**
   * Handle click on the create a folder menu option.
   * @param {ReactEvent} event The event
   */
  handleCreateFolderItemClickEvent(event) {
    const bus = document.querySelector("#bus");
    const contextualMenuEvent = document.createEvent("CustomEvent");
    contextualMenuEvent.initCustomEvent("request_folder_create", true, true, {folder: this.state.folder, srcEv: event});
    bus.dispatchEvent(contextualMenuEvent);
    this.hide();
  }

  /**
   * Handle click on the rename a folder menu option.
   * @param {ReactEvent} event The event
   */
  handleRenameFolderItemClickEvent(event) {
    const bus = document.querySelector("#bus");
    const contextualMenuEvent = document.createEvent("CustomEvent");
    contextualMenuEvent.initCustomEvent("request_folder_rename", true, true, {folder: this.state.folder, srcEv: event});
    bus.dispatchEvent(contextualMenuEvent);
    this.hide();
  }

  /**
   * Handle click on the move a folder menu option.
   * @param {ReactEvent} event The event
   */
  handleMoveFolderItemClickEvent(event) {
    const bus = document.querySelector("#bus");
    const contextualMenuEvent = document.createEvent("CustomEvent");
    contextualMenuEvent.initCustomEvent("request_folder_move", true, true, {folder: this.state.folder, srcEv: event});
    bus.dispatchEvent(contextualMenuEvent);
    this.hide();
  }

  /**
   * Handle click on the share a folder menu option.
   * @param {ReactEvent} event The event
   */
  handleShareFolderItemClickEvent(event) {
    this.hide();
  }

  /**
   * Handle click on the delete a folder menu option.
   * @param {ReactEvent} event The event
   */
  handleDeleteFolderItemClickEvent(event) {
    const bus = document.querySelector("#bus");
    const contextualMenuEvent = document.createEvent("CustomEvent");
    contextualMenuEvent.initCustomEvent("request_folder_delete", true, true, {folder: this.state.folder, srcEv: event});
    bus.dispatchEvent(contextualMenuEvent);
    this.hide();
  }

  /**
   * Get the contextual menu style.
   */
  getStyle() {
    return {
      display: "block",
      position: "absolute",
      top: this.state.top,
      left: this.state.left
    };
  }

  /**
   * Show the contextual menu.
   * @param {Object} folder The folder
   * @param {int} top The Y position to display the menu on the screen
   * @param {int} left The X position to display the menu on the screen
   */
  show(folder, top, left) {
    const show = true;
    this.setState({show, folder, top, left});
    document.addEventListener('click', this.handleClickOutsideComponentEvent);
    document.addEventListener('contextmenu', this.handleClickOutsideComponentEvent);
  }

  /**
   * Hide the contextual menu
   */
  hide() {
    const show = false;
    this.setState({show});
    document.removeEventListener('click', this.handleClickOutsideComponentEvent);
    document.removeEventListener('contextmenu', this.handleClickOutsideComponentEvent);
  }

  /**
   * Render the component.
   * @returns {JSX}
   */
  render() {
    return (
      <div ref={this.elementRef}>
        {this.state.show &&
        <ul className="contextual-menu" style={this.getStyle()}>
          <li className="ready closed">
            <div className="row">
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.handleCreateFolderItemClickEvent}><span>Create folder</span></a>
                </div>
              </div>
            </div>
          </li>
          <li className="separator-after ready closed">
            <div className="row">
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.handleRenameFolderItemClickEvent}><span>Rename</span></a>
                </div>
              </div>
            </div>
          </li>
          <li className="ready closed">
            <div className="row">
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.handleMoveFolderItemClickEvent}><span>Move</span></a>
                </div>
              </div>
            </div>
          </li>
          <li className="ready hidden closed">
            <div className="row">
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.handleShareFolderItemClickEvent}><span>Share</span></a>
                </div>
              </div>
            </div>
          </li>
          <li className="ready closed">
            <div className="row">
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.handleDeleteFolderItemClickEvent}><span>Delete</span></a>
                </div>
              </div>
            </div>
          </li>
        </ul>
        }
      </div>
    );
  }
}
