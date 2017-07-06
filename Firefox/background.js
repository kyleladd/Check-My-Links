browser.runtime.onMessage.addListener(onRequest);
var beginLinkCheck = function beginLinkCheck(tab) {
    browser.tabs.executeScript(tab.id, {file:'functions.js'});
    browser.tabs.executeScript(tab.id, {file:'check.js'}, function () {
        browser.tabs.sendMessage(tab.id, {options:getOptions(), action:"initial"});
    });
};
browser.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
    browser.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
     var activeTab = arrayOfTabs[0];
     //If the active tab was updated
     if(activeTab.id == tab.id){
        var url = tab.url;
        if (url !== undefined && changeinfo.status == "complete" && getItem("autoCheck")=="true") {
          beginLinkCheck(tab);
        }
     }
  });
});

browser.browserAction.onClicked.addListener(beginLinkCheck);
browser.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        browser.tabs.create({url: "options.html?newinstall=yes"});
    }
    else if(details.reason == "update"){
        var thisVersion = browser.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});