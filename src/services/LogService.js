/*global chrome*/

export const debug = (log) => {
    chrome.extension.getBackgroundPage().console.log(log);
}