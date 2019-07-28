
export const ActionTypes = {
	SET_ACTIVE_PROFILE_ID: '@SET_ACTIVE_PROFILE_ID',
	SET_PROFILES: '@SET_PROFILES'
};

const setActiveProfileId = (activeProfileId) => {
	return {
		type: ActionTypes.SET_ACTIVE_PROFILE_ID,
		payload: {
			activeProfileId,
		}
	};
}

const setProfiles = (profiles) => {
	return {
		type: ActionTypes.SET_PROFILES,
		payload: {
			profiles,
		}
	};
}

export const getActiveProfileIdAndProfiles = () => {
	return (dispatch, getState, services) => {
		services.bookmarkService.getActiveProfileId().then(
			(id) => {
				dispatch(setActiveProfileId(id))
				return services.bookmarkService.getProfiles();
			}
		).then(
			(profiles) => {
				dispatch(setProfiles(profiles));
			}
		)
	}
}

export const createProfile = (name) => {
	return (dispatch, getState, services) => {
		services.bookmarkService.createProfile(name).then(
			(profile) => {
				return services.bookmarkService.getProfiles();
			}
		).then(
			(profiles) => {
				dispatch(setProfiles(profiles));
			}
		)
	}
}

export const switchToProfile = (id) => {
	return (dispatch, getState, services) => {
		services.bookmarkService.setActiveProfileId(id).then(
			() => {
				dispatch(setActiveProfileId(id));
			}
		)
	};
}