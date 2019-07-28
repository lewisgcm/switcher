import { ActionTypes } from '../actions';

export default (state = { activeProfileId: -1, profiles: [] }, action) => {
	switch (action.type) {
		case ActionTypes.SET_ACTIVE_PROFILE_ID:
			return {
				activeProfileId: action.payload.activeProfileId,
				profiles: state.profiles
			};
		case ActionTypes.SET_PROFILES:
			return {
				profiles: action.payload.profiles,
				activeProfileId: state.activeProfileId
			};
		default:
			return state
	}
};