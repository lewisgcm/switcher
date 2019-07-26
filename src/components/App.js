/*global chrome*/

import React from 'react';
import CreateProfile from './profile/CreateProfile';
import SwitchProfile from './profile/SwitchProfile';

import { createProfile, getProfiles } from '../services/BookmarksService';
import { debug } from '../services/LogService';

import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profiles: [],
        };
    }

    componentDidMount() {
        getProfiles().then(
            (folders) => {
                debug(folders);

                this.setState({
                    profiles: folders,
                });
            }
        ).catch((e) => {
            debug(e);
        });
    }

    onCreateProfile(name) {
        createProfile(name).then(
            () => {
                getProfiles().then(
                    (folders) => {
                        this.setState({
                            profiles: folders,
                        });
                    }
                ).catch((e) => {
                    debug(e);
                })
            }
        ).catch((e) => {
            debug(e);
        });
    }

    render() {
        return (
            <div>
                <CreateProfile onCreate={(e)=> {this.onCreateProfile(e)}}></CreateProfile>
                <SwitchProfile profiles={this.state.profiles} onProfileSelect={(e)=> {/**/}}></SwitchProfile>
            </div>
        );
    }
}

export default App;
