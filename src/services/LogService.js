export class LogService {
	chrome = undefined;

	constructor(chrome) {
		this.chrome = chrome;
	}

	debug(message) {
		chrome.extension.getBackgroundPage().console.log(message);
	}
}
