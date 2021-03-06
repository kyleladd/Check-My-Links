var logging = false;
var blacklistDefaults = 
        "googleleads.g.doubleclick.net\n" +
        "doubleclick.net\n" +
        "googleadservices.com\n" +
        "www.googleadservices.com\n" +
        "googlesyndication.com\n" +
        "adservices.google.com\n" +
        "appliedsemantics.com";

var checkTypeDefault = "GET";
var cacheDefault = "false";
var autoCheckDefault = "false";
var noFollowDefault = "false";
chrome.extension.onMessage.addListener(onRequest);

var beginLinkCheck = function beginLinkCheck(tab) {
    chrome.tabs.executeScript(tab.id, {file:'check.js'}, function () {
        // Set up the defaults if no values are present in LocalStorage
        if (getItem("blacklist") === null) {
            setItem("blacklist", blacklistDefaults);
        }

        if(getItem("checkType") == null){
          setItem("checkType", checkTypeDefault);
        }
       
        if(getItem("cache") == null){
          setItem("cache", cacheDefault);
        }
        var blacklist = getItem("blacklist");
        var nofollow = getItem("noFollow");
        
        chrome.tabs.sendMessage(tab.id, {bl:blacklist,nf:nofollow});
    });
}
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
    var url = tab.url;

    if (url !== undefined && changeinfo.status == "complete" && getItem("autoCheck")=="true") {
      beginLinkCheck(tab);
    }
});

chrome.browserAction.onClicked.addListener(beginLinkCheck);

function onRequest(request, sender, callback) {
    if (request.action == "check") {
        if (request.url) {
            if (getItem("cache")=='true'){
                indexedDBHelper.getLink(request.url).then(function(link){
                    if(typeof(link) != "undefined" && (200 <= link.status && link.status < 400)){
                        log("found");
                        log(link);
                        return callback(link.status);
                    }
                    else{
                        check(request.url, callback);
                        log("not in db");
                        log(request.url);
                        log("added");
                    }
                }, function(err){
                    log(err);
                });
            }
            else{
                // do not use cache
                check(request.url, callback);
            }
        }
    }
    return true;
}

// Timeout for each link is 60+1 seconds
var timeout = 30000;

function check(url, callback) {
    var XMLHttpTimeout = null;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            log(xhr);
            clearTimeout(XMLHttpTimeout);
            if (200 <= xhr.status && xhr.status < 400){
                if(url.indexOf("#")!=-1){
                    var parser      = new DOMParser ();
                    var responseDoc = parser.parseFromString (xhr.responseText, "text/html");
                    log (responseDoc.getElementById(url.substring(url.indexOf("#")+1,url.length)));
                    if(responseDoc.getElementById(url.substring(url.indexOf("#")+1,url.length))){
                        // Element with id that matches hashtag was found
                        if(getItem("cache")=='true'){
                            indexedDBHelper.addLink(url, xhr.status);
                        }
                        return callback(xhr.status);
                    }
                    else{
                        // Page resolved, but element with id that matches hashtag was not found
                        return callback(404);
                    }
                }
                else{
                    // No hashtag
                    if (getItem("cache")=='true'){
                        indexedDBHelper.addLink(url, xhr.status);
                    }
                }
            }
            return callback(xhr.status);
        }
    };

    try {
      xhr.open(getItem("checkType"), url, true);
      xhr.send();
    }
    catch(e){
      console.log(e);
    }
    
    XMLHttpTimeout=setTimeout(function (){return callback(408); xhr.abort();}, timeout += 1000);  
}

// OPTIONS: Management

// OPTIONS: Set items in localstore
function setItem(key, value) {
    try {
      log("Inside setItem:" + key + ":" + value);
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    }catch(e) {
      log("Error inside setItem");
      log(e);
    }
    log("Return from setItem" + key + ":" +  value);
}

// OPTIONS: Get items from localstore
function getItem(key) {
    var value;
    log('Get Item:' + key);
    try {
      value = window.localStorage.getItem(key);
    }catch(e) {
      log("Error inside getItem() for key:" + key);
      log(e);
      value = "null";
    }
    log("Returning value: " + value);
    return value;
}

// OPTIONS: Zap all items in localstore
function clearStrg() {
    log('about to clear local storage');
    window.localStorage.clear();
    log('cleared');
}

function log(txt) {
    if(logging) {
      console.log(txt);
    }
}

