import { connect } from 'react-redux';
import { switchToProfile } from '../actions';
import SwitchProfileComponent from '../components/profile/SwitchProfile';

export default connect(
	(state) => ({
		activeProfileId: state.activeProfileId,
		profiles: state.profiles,
	}),
	(dispatch) => ({
		onSwitch: (id) => dispatch(switchToProfile(id))
	})
)(SwitchProfileComponent)