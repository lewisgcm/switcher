import { connect } from 'react-redux';
import { createProfile } from '../actions';
import CreateProfileComponent from '../components/profile/CreateProfile';

export default connect(
	null,
	(dispatch) => ({
		onCreate: (name) => dispatch(createProfile(name))
	})
)(CreateProfileComponent)