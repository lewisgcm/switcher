import React from 'react';

import { getDefaultProfileId } from '../../services/BookmarksService';

class SwitchProfile extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <select onChange={(e) => this.props.onProfileSelect(e.target.value)} value={this.props.selectedProfileId}>
                    <option value={getDefaultProfileId()}>Default</option>
                    {this.props.profiles.map(
                        (i) => {
                            return <option key={i.id} value={i.id}>{i.title}</option>
                        }
                    )}
                </select>
            </div>
        );
    }
}

export default SwitchProfile;
