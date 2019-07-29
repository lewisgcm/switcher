import React from 'react';
import Octicon, { Zap } from '@primer/octicons-react'

class SwitchProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedProfileId: props.activeProfileId,
		};
	}

	componentWillReceiveProps(nextProps) {
		if( nextProps.activeProfileId != this.state.selectedProfileId ) {
			this.setState({
				selectedProfileId: this.props.activeProfileId,
			});
		}
	}

	render() {
		return (
			<div>
				<h5>Switch Profile</h5>
				<div className="input-group">
					<select
						onChange={(e) => this.setState({selectedProfileId: e.target.value})}
						value={this.state.selectedProfileId} 
						className="form-control" >
						{this.props.profiles.map(
							(i) => {
								return <option key={i.id} value={i.id}>
									{i.title} {this.props.activeProfileId === i.id ? "(active)" : ""}
								</option>;
							}
						)}
					</select>
					<div className="input-group-append">
						<button onClick={(e) => { this.props.onSwitch(this.state.selectedProfileId) }}
							disabled={this.props.profiles.length == 0}
							className="btn btn-secondary" >
							<Octicon icon={Zap} size='small' ariaLabel='Switch' />
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default SwitchProfile;
