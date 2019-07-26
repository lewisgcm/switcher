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
                <button onClick={(e) => this.onButtonClick()}>
                    <Octicon icon={Plus} size='small' ariaLabel='GitHub' />
                </button>
                <input type="text"
                    onKeyUp={(e) => {this.setState({name: e.target.value})}}
                    ref="inputBox">
                </input>
            </div>
        );
    }
}

export default CreateProfile;
