const PROFILE_NOT_FOUND = new Error('Could not find profile folder');

export const BOOKMARKS_BAR_FOLDER_ID = "1";
export const DEFAULT_FOLDER_NAME = 'Default';
export const PROFILE_FOLDER_NAME = 'Switcher-Profiles';

export class BookmarkService {
	/**
	 * The bookmark service is used for querying and modifying google chrome bookmarks
	 * @param {*} chrome Google chrome extension API object
	 * @param {*} localStorage Local storage API object
	 * @param {*} logger Log service object
	 */
	constructor(chrome, localStorage, logger) {
		this.chrome = chrome;
		this.localStorage = localStorage;
		this.logger = logger;
	}

	// Basically we will create a default folder (for existing bookmarks bar items)
	_getDefaultProfileId() {
		return new Promise((success, reject) => {
			this._getOrCreateDefaultFolder().then(
				(folder) => {
					success(folder.id);
				}
			)
		});
	}

	// Tests that a given id still exists
	_profileIdExists(id) {
		return new Promise(
			(success, reject) => {
				this._getOrCreateProfileFolder().then(
					(folder) => {
						this.chrome.bookmarks.getSubTree(folder.id, (subtree) => {
							const children = subtree[0].children;
							const defaultFolder = (children || []).filter((i) => i.id === id);

							success(defaultFolder.length > 0);
						});
					}
				)
			}
		);
	}

	// Gets or creates the 'Default' profile folder
	_getOrCreateDefaultFolder() {
		return new Promise(
			(success, reject) => {
				this._getOrCreateProfileFolder().then(
					(folder) => {
						this.chrome.bookmarks.getSubTree(folder.id, (subtree) => {
							const children = subtree[0].children;
							const defaultFolder = (children || []).filter((i) => i.title == DEFAULT_FOLDER_NAME);

							if (defaultFolder && defaultFolder.length > 0) {
								success(defaultFolder && defaultFolder[0]);
							} else {
								this.chrome.bookmarks.create(
									{
										parentId: folder.id,
										title: DEFAULT_FOLDER_NAME,
									},
									(folder) => {
										success(folder);
									}
								);
							}
						});
					}
				)
			}
		)
	}

	// Get the profile folder (or return an error if we couldnt find it)
	_getProfileFolder() {
		return new Promise(
			(success, reject) => {
				this.chrome.bookmarks.search({ title: PROFILE_FOLDER_NAME }, function (results) {
					const result = (results || []).filter(
						(i) => i.title === PROFILE_FOLDER_NAME
					);

					if (result && result.length === 1) {
						success(result[0]);
					} else {
						reject(PROFILE_NOT_FOUND);
					}
				});
			}
		);
	}

	// Create or find our profile folder for holding profiles available for switching in.
	_getOrCreateProfileFolder() {
		return new Promise(
			(success, reject) => {
				this._getProfileFolder().then(
					(folder) => {
						success(folder);
					}
				).catch(
					(error) => {
						if (error === PROFILE_NOT_FOUND) {
							this.chrome.bookmarks.create(
								{
									title: PROFILE_FOLDER_NAME,
								},
								(folder) => {
									success(folder);
								}
							);
						} else {
							reject(error);
						}
					}
				)
			}
		)
	}

	// This will move all items from one folde to another
	_moveAll(oldParentId, newParentId) {
		return new Promise(
			(success, reject) => {
				this.chrome.bookmarks.getSubTree(
					oldParentId,
					(bookmarks) => {
						const promises = bookmarks[0].children.map(
							(b) => {
								return new Promise(
									(success, reject) => {
										this.chrome.bookmarks.move(
											b.id,
											{ parentId: newParentId },
											() => {
												success();
											}
										);
									}
								);
							}
						);
						Promise.all(promises).then(
							() => {
								success();
							}
						)
					}
				);
			}
		);
	}

	// Gets the active profile (or undefined)
	getActiveProfileId() {
		return new Promise((success, failure) => {
			this._getDefaultProfileId().then(
				(id) => {
					const lastActiveId = this.localStorage.getItem('active_profile');

					this._profileIdExists(lastActiveId).then(
						(valid) => {
							if (valid) {
								success(lastActiveId);
							} else {
								success(id);
							}
						}
					)
				}
			);
		});
	}

	// Set the active profile
	setActiveProfileId(id) {
		return new Promise((success, reject) => {
			this.getActiveProfileId().then(
				(oldId) => {
					this.localStorage.setItem('active_profile', id);

					this._moveAll(BOOKMARKS_BAR_FOLDER_ID, oldId).then(
						() => {
							return this._moveAll(id, BOOKMARKS_BAR_FOLDER_ID)
						}
					).then(
						() => {
							success();
						}
					);
				}
			);
		});
	}

	// Get the list of available profiles
	getProfiles() {
		return new Promise(
			(success, reject) => {
				this._getOrCreateProfileFolder().then(
					(folder) => {
						this.chrome.bookmarks.getSubTree(folder.id, (folders) => {
							success(folders[0].children);
						});
					}
				).catch((e) => {
					reject(e);
				});
			}
		)
	}

	// Create a new profile
	createProfile(name) {
		return new Promise(
			(success, reject) => {
				this._getOrCreateProfileFolder().then(
					(folder) => {
						if (name && name.length > 0) {
							this.chrome.bookmarks.create(
								{
									parentId: folder.id,
									title: name,
								},
								(p) => success(p)
							);
						} else {
							reject(new Error('Invalid folder name'));
						}
					}
				)
			}
		);
	}
};