/*global chrome*/

const DEFAULT_BOOKMARK_ID = -1;
const BOOKMARKS_BAR_FOLDER_ID = 1;
const PROFILE_FOLDER_NAME = 'Switcher-Profiles';
const PROFILE_NOT_FOUND = new Error('Could not find profile folder');

// Gets the default bookmark id (this is a special profile, i.e the existing bookmark bar)
export const getDefaultProfileId = () => {
    return DEFAULT_BOOKMARK_ID;
}

// Set the active profile
export const setActiveProfileId = (id) => {
    localStorage.setItem('active_profile', id);
}

// Gets the active profile (or undefined)
export const getActiveProfileId = () => {
    return localStorage.getItem('active_profile') || getDefaultProfileId();
}

// Get the profile folder (or return an error if we couldnt find it)
export const getProfileFolder = () => {
    return new Promise(
        (success, reject) => {
            chrome.bookmarks.search({ title: PROFILE_FOLDER_NAME }, function (results) {
                const result = (results || []).filter(
                    (i) => i.title === PROFILE_FOLDER_NAME
                );

                if( result && result.length === 1 ) {
                    success(result[0]);
                } else {
                    reject(PROFILE_NOT_FOUND);
                }
            });
        }
    );
}

// Create or find our profile folder for holding profiles available for switching in.
export const getOrCreateProfileFolder = () => {
    return new Promise(
        (success, reject) => {
            getProfileFolder().then(
                (folder) => {
                    success(folder);
                }
            ).catch(
                (error) => {
                    if( error === PROFILE_NOT_FOUND ) {
                        chrome.bookmarks.create(
                            {
                                title: PROFILE_FOLDER_NAME,
                            },
                            (folder) => {
                                success(folder);
                            }
                        );
                    }
                }
            )
        }
    )
}

// Get the list of available profiles
export const getProfiles = () => {
    return new Promise(
        (success, reject) => {
            getProfileFolder().then(
                (folder) => {
                    chrome.bookmarks.getSubTree(folder.id, (folders) => {
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
export const createProfile = (name) => {
    return new Promise(
        (success, reject) => {
            getOrCreateProfileFolder().then(
                (folder) => {
                    if( name && name.length > 0 ) {
                        chrome.bookmarks.create(
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