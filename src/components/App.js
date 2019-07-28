import React from 'react';
import { connect } from 'react-redux';

import { getActiveProfileIdAndProfiles } from '../actions/index';
import CreateProfile from '../containers/CreateProfile';
import SwitchProfile from '../containers/SwitchProfile';

import './App.css';

class App extends React.Component {
	componentDidMount() {
		this.props.didMount();
	}

	render() {
		return (
			<div>
				<CreateProfile></CreateProfile>
				<SwitchProfile></SwitchProfile>
			</div>
		);
	}
}

export default connect(
	null,
	(dispatch) => ({
		didMount: () => dispatch(getActiveProfileIdAndProfiles())
	})
)(App);
