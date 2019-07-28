export class LogService {
	chrome = undefined;

	constructor(chrome) {
		this.chrome = chrome;
	}

	debug(message) {
		this.chrome.extension.getBackgroundPage().console.log(message);
	}
}
