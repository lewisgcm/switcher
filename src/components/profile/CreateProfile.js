import React from 'react';
import Octicon, { Plus } from '@primer/octicons-react'

class CreateProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: ''
		};
	}

	onButtonClick() {
		this.props.onCreate(this.state.name);
		this.setState({
			name: '',
		});
		this.refs.inputBox.value = "";
	}

	render() {
		return (
			<div>
				<h5>Create Profile</h5>
				<div className="input-group mb-1">
					<input type="text"
						className="form-control"
						onKeyUp={(e) => { this.setState({ name: e.target.value }) }}
						placeholder="Profile name"
						ref="inputBox">
					</input>
					<div className="input-group-append">
						<button onClick={(e) => this.onButtonClick()} className="btn btn-primary">
							<Octicon icon={Plus} size='small' ariaLabel='GitHub' />
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default CreateProfile;
