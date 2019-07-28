/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import './index.scss';
import reducer from './reducers'
import App from './components/App';

import { BookmarkService } from './services/BookmarkService'; 
import { LogService } from './services/LogService';

const services = {
	bookmarkService: new BookmarkService(
		chrome,
		localStorage,
		new LogService(chrome)
	),
}

const store = createStore(
	reducer,
	applyMiddleware(
		thunk.withExtraArgument(services)
	)
);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
);