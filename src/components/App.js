/*global chrome*/

import React from 'react';
import CreateProfile from './profile/CreateProfile';
import SwitchProfile from './profile/SwitchProfile';
import Octicon, { Zap } from '@primer/octicons-react'

import { createProfile, getProfiles, getDefaultProfileId, getActiveProfileId, setActiveProfileId } from '../services/BookmarksService';
import { debug } from '../services/LogService';

import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profiles: [],
            selectedProfileId: getDefaultProfileId()
        };
    }

    componentDidMount() {
        this.setState({
            selectedProfileId: getActiveProfileId(),
        });

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

    onSwitch() {
        setActiveProfileId(this.state.selectedProfileId);
    }

    render() {
        return (
            <div>
                <CreateProfile onCreate={(e)=> {this.onCreateProfile(e)}}></CreateProfile>
                <SwitchProfile profiles={this.state.profiles}
                    selectedProfileId={this.state.selectedProfileId}
                    onProfileSelect={(e)=>{ this.setState({selectedProfileId: e}); }}>
                </SwitchProfile>
                <button onClick={(e) => {this.onSwitch()}} disabled={this.state.profiles.length == 0}>
                    Switch
                    <Octicon icon={Zap} size='small' ariaLabel='Switch' />
                </button>
            </div>
        );
    }
}

export default App;
