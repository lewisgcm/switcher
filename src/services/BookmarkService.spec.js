import sinon from 'sinon';
import chrome from 'sinon-chrome';

import { LogService } from './LogService';
import { BookmarkService, PROFILE_FOLDER_NAME, DEFAULT_FOLDER_NAME, BOOKMARKS_BAR_FOLDER_ID } from './BookmarkService';

beforeEach(() => {
	chrome.flush();
	chrome.extension.getBackgroundPage.returns({
		console: {
			log: sinon.fake.returns()
		}
	})
});

/**
 * This should:
 * * Make sure profiles are returned
 */
it('getProfiles: should return profiles from the profiles bookmarks folder', () => {
	const localStorage = {
		getItem: sinon.fake.throws("should not be called")
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields([{
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.yields([{
			children: [{
				id: "9",
				title: "A profile"
			}]
		}]);

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.getProfiles().then(
		(profiles) => {
			expect(profiles.length).toBe(1);
			expect(profiles[0].title).toBe("A profile");
			expect(chrome.bookmarks.getSubTree.calledOnce).toBe(true);
			expect(chrome.bookmarks.search.calledOnce).toBe(true);
			expect(chrome.bookmarks.create.called).toBe(false);
		}
	)
});

/**
 * This should:
 * * Make sure profile folder is created as it does not exist
 * * Make sure an empty list of profiles are returned
 */
it('getProfiles: should create the bookmarks profile folder and return an empty list of profiles if the profiles bookmarks folder does not exist', () => {
	const localStorage = {
		getItem: sinon.fake.throws("should not be called")
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.onFirstCall().yields([]) // On first call, return empty
		.yields([{ // Once created, we should return it all the time
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	// Creating the profile folder should yield it
	chrome.bookmarks.create
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields({
			id: "5",
			title: PROFILE_FOLDER_NAME,
		});

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.yields([{ children: [] }]);

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.getProfiles().then(
		(profiles) => {
			expect(profiles.length).toBe(0);
			expect(chrome.bookmarks.create.calledOnce).toBe(true);
		}
	)
});

/**
 * This should:
 * * Make sure profile folder gets created as it does not exist
 * * Make sure profile -> default folder gets created as it does not exist
 * * Make sure we return the ID of the default profile when getActiveProfileId as there are no other profiles
 */
it('getActiveProfileId: should create the profile and default folders if they do not exist and return the default profile id', () => {
	const localStorage = {
		getItem: () => null
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.onFirstCall().yields([]) // On first call, return empty
		.yields([{ // Once created, we should return it all the time
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	// Creating the profile folder should yield it
	chrome.bookmarks.create
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields({
			id: "5",
			title: PROFILE_FOLDER_NAME,
		});

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.onFirstCall().yields([{ children: [] }])
		.onSecondCall().yields([{
			children: [{
				id: "5",
				title: PROFILE_FOLDER_NAME,
			}]
		}]);

	// Creating the default profile folder should yield it
	chrome.bookmarks.create
		.withArgs(sinon.match({ title: DEFAULT_FOLDER_NAME }))
		.yields({
			id: "6",
			title: DEFAULT_FOLDER_NAME,
			parentId: "5"
		});

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.getActiveProfileId().then(
		(id) => {
			// We should return the ID of the default profile if we have never set or created a folder before
			expect(id).toBe("6");

			// We should create the default and profile folders of they did not exist
			expect(chrome.bookmarks.create.calledWithMatch(sinon.match({ title: DEFAULT_FOLDER_NAME }))).toBe(true);
			expect(chrome.bookmarks.create.calledWithMatch(sinon.match({ title: PROFILE_FOLDER_NAME }))).toBe(true);
		}
	)
});

/**
 * This should:
 * * Will return the default profile id if the current active profile id does not exist
 */
it('getActiveProfileId: should return the default profile id if the last active profile id is incorrect', () => {
	const localStorage = {
		getItem: () => "7"
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields([{
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.yields([{
			children: [{
				id: "6",
				title: DEFAULT_FOLDER_NAME,
				parentId: "5",
			}]
		}]);

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.getActiveProfileId().then(
		(id) => {
			// We should return the ID of the default profile if the id we used before does not exist
			expect(id).toBe("6");
			expect(chrome.bookmarks.create.called).toBe(false);
		}
	)
});

/**
 * This should:
 * * Return the active profile id as the folder exists
 */
it('getActiveProfileId: should return the last active valid profile id', () => {
	const localStorage = {
		getItem: () => "9"
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields([{
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.yields([{
			children: [
				{
					id: "6",
					title: DEFAULT_FOLDER_NAME,
					parentId: "5",
				},
				{
					id: "9",
					title: "My Profile",
					parentId: "5",
				}
			]
		}]);

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.getActiveProfileId().then(
		(id) => {
			// Our active profile id of 9 was valid, make sure we returned it
			expect(id).toBe("9");
			expect(chrome.bookmarks.create.called).toBe(false);
		}
	)
});

/**
 * This should:
 * * Create the profile folder because it does not exist
 * * Make sure the new profile was created in the profile folder
 */
it('createProfile: should create the profile bookmarks folder if it does not exist and create the new profile in the profile bookmarks folder', () => {
	const localStorage = {
		getItem: () => sinon.fake.throws("should no be called")
	}
	const newProfileTitle = "My new profile";

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.onFirstCall().yields([]) // On first call, return empty
		.yields([{ // Once created, we should return it all the time
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	// Creating the profile folder should yield it
	chrome.bookmarks.create
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields({
			id: "5",
			title: PROFILE_FOLDER_NAME,
		});

	// Creating the default profile folder should yield it
	chrome.bookmarks.create
		.withArgs(sinon.match({ title: newProfileTitle }))
		.yields({
			id: "6",
			title: newProfileTitle,
			parentId: "5"
		});

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.createProfile(newProfileTitle).then(
		(profile) => {
			expect(profile.title).toBe(newProfileTitle);
			expect(profile.parentId).toBe("5");

			// We should create the profile folder if it did not exist
			expect(chrome.bookmarks.create.calledWithMatch(sinon.match({ title: PROFILE_FOLDER_NAME }))).toBe(true);

			// Make sure we called the create method on the new profile
			expect(chrome.bookmarks.create.calledWithMatch(sinon.match({ title: newProfileTitle, parentId: "5" }))).toBe(true);
		}
	)
});

/**
 * This should:
 * * Create the new profile in the profile bookmarks folder
 */
it('createProfile: should create the new profile in the profile bookmarks folder', () => {
	const localStorage = {
		getItem: () => sinon.fake.throws("should no be called")
	}
	const newProfileTitle = "My new profile";

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields([{ // Once created, we should return it all the time
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	// Creating the default profile folder should yield it
	chrome.bookmarks.create
		.withArgs(sinon.match({ title: newProfileTitle }))
		.yields({
			id: "6",
			title: newProfileTitle,
			parentId: "5"
		});

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.createProfile(newProfileTitle).then(
		(profile) => {
			expect(profile.title).toBe(newProfileTitle);
			expect(profile.parentId).toBe("5");

			// We should not be attempting to create the profile folder
			expect(chrome.bookmarks.create.calledWithMatch(sinon.match({ title: PROFILE_FOLDER_NAME }))).toBe(false);

			// Make sure we called the create method on the new profile
			expect(chrome.bookmarks.create.calledWithMatch(sinon.match({ title: newProfileTitle, parentId: "5" }))).toBe(true);
		}
	)
});

/**
 * This should:
 * * Set the active profile id
 * * Move bookmarks from the bookmarks bar to the old profile folder
 * * Move bookmarks from the new profile folder to the bookmarks bar
 */
it('setActiveProfileId: should move bookmarks from the bookmarks bar to the old profile folder and bookmarks from the new profile folder to the bookmarks bar', () => {
	const oldProfileId = "6";
	const newProfileId = "9";
	const localStorage = {
		getItem: () => oldProfileId,
		setItem: sinon.stub().returns(true)
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields([{
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	// This is the bookmarks bar bookmarks, these should be moved to the old profile id 
	chrome.bookmarks.getSubTree
		.withArgs(BOOKMARKS_BAR_FOLDER_ID)
		.yields([{children:[{
			id: "10",
			title: "A"
		}]}]);

	chrome.bookmarks.move.yields(true);

	// This is the new profile bookmarks, these should be moved to the bookmarks bar
	chrome.bookmarks.getSubTree
		.withArgs(newProfileId)
		.yields([{children:[{
			id: "11",
			title: "B"
		}]}]);

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.yields([{
			children: [
				{
					id: oldProfileId,
					title: DEFAULT_FOLDER_NAME,
					parentId: "5",
				},
			]
		}]);

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.setActiveProfileId(newProfileId).then(
		() => {
			// Check we updated the active profile
			expect(localStorage.setItem.withArgs('active_profile', newProfileId).calledOnce).toBe(true);

			// Check we actually moved the bookmarks
			expect(chrome.bookmarks.move.withArgs("10", sinon.match({ parentId: oldProfileId })).calledOnce).toBe(true);
			expect(chrome.bookmarks.move.withArgs("11", sinon.match({ parentId: BOOKMARKS_BAR_FOLDER_ID })).calledOnce).toBe(true);
		}
	)
});

/**
 * This should:
 * * Not move any bookmarks
 */
it('setActiveProfileId: should not move any bookmarks as the user is attempting to swap with the same profile', () => {
	const oldProfileId = "6";
	const newProfileId = "6";
	const localStorage = {
		getItem: () => oldProfileId,
		setItem: sinon.stub().returns(true)
	}

	chrome.bookmarks.search
		.withArgs(sinon.match({ title: PROFILE_FOLDER_NAME }))
		.yields([{
			id: "5",
			title: PROFILE_FOLDER_NAME,
		}]);

	// This is the bookmarks bar bookmarks, these should be moved to the old profile id 
	chrome.bookmarks.getSubTree
		.withArgs(BOOKMARKS_BAR_FOLDER_ID)
		.yields([{children:[{
			id: "10",
			title: "A"
		}]}]);

	chrome.bookmarks.move.yields(true);

	// This is the new profile bookmarks, these should be moved to the bookmarks bar
	chrome.bookmarks.getSubTree
		.withArgs(newProfileId)
		.yields([{children:[{
			id: "11",
			title: "B"
		}]}]);

	chrome.bookmarks.getSubTree
		.withArgs("5")
		.yields([{
			children: [
				{
					id: oldProfileId,
					title: DEFAULT_FOLDER_NAME,
					parentId: "5",
				},
			]
		}]);

	const service = new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	);

	return service.setActiveProfileId(newProfileId).then(
		() => {
			// Check we updated the active profile
			expect(localStorage.setItem.withArgs('active_profile', newProfileId).calledOnce).toBe(true);

			// Check we actually moved the bookmarks
			expect(chrome.bookmarks.move.called).toBe(false);
		}
	)
});