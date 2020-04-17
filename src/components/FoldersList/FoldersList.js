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
import SvgCaretDownIcon from "../../img/svg/caret-down";
import SvgFolderIcon from "../../img/svg/folder";
import SvgSharedFolderIcon from "../../img/svg/shared-folder";
import SvgSpinnerIcon from "../../img/svg/spinner";
import Folder from "../../../app/model/map/folder";
import FolderService from "../../../app/model/service/plugin/folder";

const rootFolder = {
  id: null,
  name: "root",
  folderParentId: null
};

export default class FoldersList extends React.Component {

  /**
   * Constructor
   * Initialize state and bind methods
   */
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.createInputRef();
    this.bindCallbacks();
    this.initEventHandlers();
  }

  /**
   * Return default state
   * @returns {Object} default state
   */
  getDefaultState() {
    return {
      loading: true,
      folders: [],
      selectedFolder: null,
      rootFolderOpened: true,
      openedFoldersIds: [],
      isDragging: false,
      isDraggingOverRoot: false,
      dragOverFolder: null,
      draggedSources: {
        folders: [],
        resources: []
      },
    };
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.dragFeedbackElement = React.createRef();
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleRootFolderClickCaretEvent = this.handleRootFolderClickCaretEvent.bind(this);
    this.handleFolderClickCaretEvent = this.handleFolderClickCaretEvent.bind(this);
    this.handleFolderSelectEvent = this.handleFolderSelectEvent.bind(this);
    this.handleFolderRightSelectEvent = this.handleFolderRightSelectEvent.bind(this);
    this.handleFolderClickMoreEvent = this.handleFolderClickMoreEvent.bind(this);
    this.handleFoldersLocalStorageUpdate = this.handleFoldersLocalStorageUpdate.bind(this);
    this.handleGridDragStartEvent = this.handleGridDragStartEvent.bind(this);
    this.handleGridDragEndEvent = this.handleGridDragEndEvent.bind(this);
    this.handleFolderCreatedEvent = this.handleFolderCreatedEvent.bind(this);
    this.handleFilterWorkspaceEvent = this.handleFilterWorkspaceEvent.bind(this);
  }

  /**
   * Bind event handlers.
   */
  initEventHandlers() {
    document.addEventListener('passbolt.storage.folders.updated', this.handleFoldersLocalStorageUpdate);
    document.addEventListener('passbolt.resources.drag-start', this.handleGridDragStartEvent);
    document.addEventListener('passbolt.resources.drag-end', this.handleGridDragEndEvent);
    document.addEventListener('passbolt.plugin.folders.select-and-scroll-to', this.handleFolderCreatedEvent);
    document.addEventListener('filter_workspace', this.handleFilterWorkspaceEvent);
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   */
  async componentDidMount() {
    const folders = await Folder.findAll({source: 'storage'});
    this.loadFolders(folders);
  }

  /**
   * Handle fold/unfold root folder icon click
   */
  handleRootFolderClickCaretEvent() {
    const rootFolderOpened = !this.isRootFolderOpened();
    this.setState({rootFolderOpened});
  }

  /**
   * Handle fold/unfold folders icon click
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFolderClickCaretEvent(event, folder) {
    // Stop the propagation to avoid the listener on the parent (select folder) to react to it.
    event.stopPropagation();
    if (!this.isFolderOpened(folder)) {
      this.openFolder(folder);
    } else {
      this.closeFolder(folder);
    }
  }

  /**
   * Handle more folders icon click
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFolderClickMoreEvent(event, folder) {
    event.stopPropagation();
    const top = event.pageY;
    const left = event.pageX;
    this.showFolderContextualMenu(folder, top, left);
  }

  /**
   * Handle folders local storage update event
   * @param {ReactEvent} event The event
   */
  handleFoldersLocalStorageUpdate(event) {
    const folders = event.data;
    this.loadFolders(folders);
  }

  /**
   * Handle grid start dragging event.
   * @param {ReactEvent} event The event
   */
  handleGridDragStartEvent(event) {
    const draggedSources = event.detail;
    this.setState({draggedSources});
  }

  /**
   * Handle grid stop dragging event.
   */
  handleGridDragEndEvent() {
    const draggedSources = {
      folders: [],
      resources: []
    };
    this.setState({draggedSources});
  }

  /**
   * Handle folders has been created event
   * @param {ReactEvent} event The event
   */
  handleFolderCreatedEvent(event) {
    const folderId = event.data;
    const folder = this.state.folders.find(item => item.id === folderId);
    this.selectFolder(folder);
  }

  /**
   * Handle dragging an element of the list is starting.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFoldersListDragStartEvent(event, folder) {
    const state = {
      isDragging: true,
      draggedSources: {
        folders: [folder.id]
      }
    };
    this.setState(state);
    event.dataTransfer.setDragImage(this.dragFeedbackElement.current, 5, 5);
  }

  /**
   * Handle dragging over an element of the list.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFoldersListDragOverEvent(event, folder) {
    event.preventDefault();

    if (this.isDraggingOverFolder(folder)) {
      return;
    }

    const dragOverFolder = folder;
    this.setState({dragOverFolder});
  }

  /**
   * Handle dragging is leaving an element of the list.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFoldersListDragLeaveEvent() {
    const state = {
      dragOverFolder: null
    };
    this.setState(state);
  }

  /**
   * Handle dragging is ending.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFoldersListDragEndEvent() {
    this.resetDragState();
  }

  /**
   * Handle dropping on an element of the list.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder the drop happened
   */
  handleFoldersListDropEvent(event, folder) {
    const folders = this.state.draggedSources.folders;
    const resources = this.state.draggedSources.resources;
    FolderService.openMoveConfirmationDialog(folders, resources, folder.id);
    this.resetDragState();
  }

  /**
   * Handle workspace filtered event.
   * @param {ReactEvent} event The event
   */
  handleFilterWorkspaceEvent(event) {
    if (event.data.filter.type !== "folder") {
      this.unselectFolder();
    }
  }

  /**
   * Handle an element of the list is selected.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFolderSelectEvent(event, folder) {
    this.selectFolder(folder);
  }

  /**
   * Handle an element of the list is right selected.
   * @param {ReactEvent} event The event
   * @param {Object} folder The folder
   */
  handleFolderRightSelectEvent(event, folder) {
    event.preventDefault();
    const top = event.pageY;
    const left = event.pageX;
    this.showFolderContextualMenu(folder, top, left);
  }

  /**
   * Load a list of folders in the list.
   * @param {Array} folders The list of folders.
   */
  loadFolders(folders) {
    const loading = false;
    const state = {folders, loading};
    const foldersIds = folders.map(folder => folder.id);

    // Cleanup the selected folder. Unselect removed folder.
    if (this.state.selectedFolder) {
      if (!foldersIds.includes(this.state.selectedFolder.id)) {
        state.selectedFolder = null;
      }
    }

    // Cleanup the opened folders. Remove folder which have been removed.
    let openedFoldersIds = this.state.openedFoldersIds;
    if (openedFoldersIds.length) {
      state.openedFoldersIds = openedFoldersIds.reduce((accumulator, folderId) => {
        if (foldersIds.includes(folderId)) {
          accumulator.push(folderId);
        }
        return accumulator;
      }, []);
    }

    this.setState(state);
  }

  /**
   * Open a folder
   * @param {Object} folder The folder
   */
  openFolder(folder) {
    const openedFoldersIds = this.state.openedFoldersIds;
    openedFoldersIds.push(folder.id);
    this.setState({openedFoldersIds});
  }

  /**
   * Close a folder
   * @param {Object} folder The folder
   */
  closeFolder(folder) {
    const openedFoldersIds = this.state.openedFoldersIds;
    const folderIndex = openedFoldersIds.indexOf(folder.id);
    openedFoldersIds.splice(folderIndex, 1);
    this.setState({openedFoldersIds});
  }

  /**
   * Select a folder
   * @param {Object} folder The folder
   */
  selectFolder(folder) {
    let selectedFolder = null;
    if (folder.id !== rootFolder.id) {
      selectedFolder = folder;
    }
    this.setState({selectedFolder});
    const bus = document.querySelector("#bus");
    const event = document.createEvent("CustomEvent");
    event.initCustomEvent("folders_list_folder_selected", true, true, {folder});
    bus.dispatchEvent(event);
  }

  /**
   * Unselect the currently selected folder.
   */
  unselectFolder() {
    const selectedFolder = null;
    this.setState({selectedFolder});
  }

  /**
   * Show the contextual menu for a folder.
   * @param {Object} folder The folder
   * @param {int} top The Y position to display the menu on the screen
   * @param {int} left The X position to display the menu on the screen
   */
  showFolderContextualMenu(folder, top, left) {
    const bus = document.querySelector("#bus");
    const contextualMenuEvent = document.createEvent("CustomEvent");
    contextualMenuEvent.initCustomEvent("folders_list_folder_contextual_menu", true, true, {folder, top, left});
    bus.dispatchEvent(contextualMenuEvent);
  }

  /**
   * Reset the dragging state variables
   */
  resetDragState() {
    const state = {
      isDragging: false,
      draggedSources: {
        folders: [],
        resources: []
      },
      dragOverFolder: null
    };
    this.setState(state);
  }

  /**
   * Check if a folder is selected
   * @param {Object} folder The folder
   * @returns {boolean}
   */
  isFolderSelected(folder) {
    if (!this.state.selectedFolder) {
      return;
    }

    return this.state.selectedFolder.id === folder.id;
  }

  /**
   * Check if a folder is opened
   * @param {Object} folder The folder
   * @returns {boolean}
   */
  isFolderOpened(folder) {
    return this.state.openedFoldersIds.includes(folder.id);
  }

  /**
   * Check if the root folder is opened
   * @param {Object} folder The folder
   * @returns {boolean}
   */
  isRootFolderOpened() {
    return this.state.rootFolderOpened;
  }

  /**
   * Check if a folder is disabled
   * @param {Object} folder The folder
   * @returns {boolean}
   */
  isFolderDisabled(folder, isParentDisabled) {
    if (this.state.isDragging) {
      return this.isFolderDragged(folder) || isParentDisabled;
    }

    return false || isParentDisabled;
  }

  /**
   * Check if a folder is currently dragged
   * @param {Object} folder The folder
   * @returns {boolean}
   */
  isFolderDragged(folder) {
    return this.state.draggedSources.folders.some(source => source === folder.id);
  }

  /**
   * Check if the user is dragging on a folder
   * @param {Object} folder The folder
   * @returns {boolean}
   */
  isDraggingOverFolder(folder) {
    if (!this.state.dragOverFolder) {
      return;
    }

    return this.state.dragOverFolder.id === folder.id;
  }

  /**
   * Render a folder
   * @param {Object} folder The folder
   * @param {boolean} isParentDisabled Is the parent folder disabled. If yes disable also the folder.
   * @returns {boolean}
   * @returns {JSX}
   */
  renderFolder(folder, isParentDisabled) {
    const isOpen = this.isFolderOpened(folder);
    const isSelected = this.isFolderSelected(folder);
    const isDisabled = this.isFolderDisabled(folder, isParentDisabled);
    const isDraggingOver = this.isDraggingOverFolder(folder);

    return (
      <li key={folder.id} className={`${isOpen ? "opened" : "closed"} folder-item`}>
        <div className={`row ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""} ${isDraggingOver && !isDisabled ? "drop-focus" : ""}`}
          draggable="true"
          onDragStart={event => this.handleFoldersListDragStartEvent(event, folder)}
          onDragOver={event => this.handleFoldersListDragOverEvent(event, folder)}
          onDragLeave={event => this.handleFoldersListDragLeaveEvent(event, folder)}
          onDragEnd={event => this.handleFoldersListDragEndEvent(event, folder)}
          onDrop={event => this.handleFoldersListDropEvent(event, folder)}
          onClick={event => this.handleFolderSelectEvent(event, folder)}
          onContextMenu={(ev) => this.handleFolderRightSelectEvent(ev, folder)}>
          <div className="main-cell-wrapper">
            <div className="main-cell">
              <a>
                <SvgCaretDownIcon class={isOpen ? "" : "rotate-right"} onClick={event => this.handleFolderClickCaretEvent(event, folder)}/>
                <SvgFolderIcon/>
                <span title={folder.name} className="folder-name">{folder.name}</span>
              </a>
            </div>
          </div>
          <div className="right-cell more-ctrl">
            <a onClick={(event) => this.handleFolderClickMoreEvent(event, folder)}><span>more</span></a>
          </div>
        </div>
        {isOpen &&
        <ul>
          {this.renderChildrenFolders(folder.id, isDisabled)}
        </ul>
        }
      </li>
    );
  }

  /**
   * Render the children of a folder.
   * @param {string} id The parent folder identifier
   * @param {boolean} isParentDisabled Is the parent folder disabled. If yes disable also the children.
   * @returns {Array<JSX>}
   */
  renderChildrenFolders(id, isParentDisabled) {
    const folders = this.state.folders.filter(folder => folder.folderParentId === id);

    return folders.reduce((accumulator, folder) => {
      accumulator.push(this.renderFolder(folder, isParentDisabled));
      return accumulator;
    }, []);
  }

  /**
   * Render the component
   * @returns {JSX}
   */
  render() {
    const dragFeedbackText = this.state.draggedSource ? this.state.draggedSource.name : "";
    const isRootFolderOpened = this.isRootFolderOpened(rootFolder);
    const isDraggingOverRoot = this.isDraggingOverFolder(rootFolder);
    const empty = this.state.folders.length === 0;

    return (
      <div className="folders navigation first accordion">
        <div ref={this.dragFeedbackElement} className="drag-and-drop">
          {dragFeedbackText}
        </div>
        <div className="accordion-header1">
          <div className={`${isRootFolderOpened ? "open" : "close"} node root`}>
            <div className={`row title ${isDraggingOverRoot ? "drop-focus" : ""}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <h3>
                    <span className="folders-label">
                      {this.state.loading &&
                      <SvgSpinnerIcon/>
                      }
                      {!this.state.loading && !empty &&
                      <SvgCaretDownIcon class={isRootFolderOpened ? "" : "rotate-right"}
                        onClick={this.handleRootFolderClickCaretEvent}/>
                      }
                      <span href="demo/LU_folders.php"
                        onDragOver={(event) => this.handleFoldersListDragOverEvent(event, rootFolder)}
                        onDragLeave={(event) => this.handleFoldersListDragLeaveEvent(event, rootFolder)}
                        onDragEnd={(event) => this.handleFoldersListDragEndEvent(event, rootFolder)}
                        onDrop={(event) => this.handleFoldersListDropEvent(event, rootFolder)}
                        onClick={event => this.handleFolderSelectEvent(event, rootFolder)}
                      >Folders</span>
                    </span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isRootFolderOpened &&
        <ul className="folders-tree">
          {this.renderChildrenFolders(null, false)}
        </ul>
        }
      </div>
    );
  }
}
