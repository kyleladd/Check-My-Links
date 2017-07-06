var queued = 0;
var checked = 0;
var invalid = 0;
var warning = 0;
var redirected = 0;
var passed = 0;
console.log("browser",browser);
browser.runtime.onMessage.addListener(

  function doStuff(request, sender,callback) {

  if(request.action == "initial"){
    var rpBox;
    var blacklist = request.options.blacklist;
    blacklist = blacklist.split("\n");
    var cacheType = request.options.cache;
    var checkType = request.options.checkType;
    var optURL = request.options.optionsURL;

    // Inject Styles and Elements for feedback report
    createDisplay(optURL,cacheType,checkType);
      // Gather links
    var pageLinks = document.getElementsByTagName('a');
        
    log(pageLinks);
    var totalvalid = pageLinks.length;
    
    for (var i = 0; i < pageLinks.length; i++){
      var link = pageLinks[i];
      var isValidLink = false;
      isValidLink = isLinkValid(link,request,blacklist);
      if(isValidLink === true){
        queued += 1;
        link.classList.add("CMY_Link");
        checkURL(link, request.options);
      }
      else{
        totalvalid -= 1;
      }
    }
    rbAmt.innerHTML = "Links: " + totalvalid;
    // When close element is clicked, hide UI
    document.getElementById("CMY_RB_Close").onclick = function(){removeDOMElement("CMY_ReportBox");};
    document.getElementById("CMY_RB_Export").onclick = function(){
    var output = "";
    var badLinks = document.getElementsByClassName("CMY_Invalid");
    // Export csv string so it is accessible via excel
    if(badLinks.length > 0){
      output += "URL,OuterHTML\n";
      for (i = 0; i < badLinks.length; i++) {
        var outerHTML;
        output += "\"";
        output += badLinks[i].href;
        output += "\",";
        output += "\"";
        outerHTML = badLinks[i].outerHTML.replace(/"/g, '""');
        output += outerHTML;
        output += "\"";
        output += "\n";
      }
      output = output.rtrim(',');
    }
    else{
      output = "No links to export";
    }
    console.log(output);
    };
    // Remove the event listener in the event this is run again without reloading
    browser.runtime.onMessage.removeListener(doStuff);
    }
    else if (request.action == "check"){
        if (request.url) {  
            var options = getOptions();
            var promise;
            var response = {status:null,document:null};
            if(XHRisNecessary(options,request.url) === true){
                check(request.url)
                .then(function(response){
                    if (options.cache == 'true' && (200 <= response.status && response.status < 400)){
                        // Add link to database
                        indexedDBHelper.addLink(request.url, response.status);
                    }
                    return new Promise(function(resolve, reject){resolve(response);});
                })
                .then(function(response){
                    callback(response);
                });
            }
            else{
                // Caching is true
                indexedDBHelper.getLink(request.url).then(function(link){
                    if(typeof(link) != "undefined" && (200 <= link.status && link.status < 400)){
                        log("found");
                        log(link);
                        response.status = link.status;
                    }
                    else{
                        response = check(request.url);
                    }
                    return new Promise(function(resolve, reject){resolve(response);});
                })
                .then(function(response){
                    if ((response.source == "xhr") && (200 <= response.status && response.status < 400)){
                        // Add link to database
                        indexedDBHelper.addLink(request.url, response.status);
                    }
                    return new Promise(function(resolve, reject){resolve(response);});
                })
                .then(function(response){
                    callback(response);
                });
            }
        }
        return false;
    }
    return true;

  });
  // Send links to get checked via XHR
  function checkURL(link,options) {
    // For empty href or no attribute href elements
    var checkElement = create("a", {
      href: link.href
    });
    browser.runtime.sendMessage({"action": "check", "url": checkElement.href},
    function (response) {
      // Assess Warnings
      var warnings = [];
      warnings = getTrailingHashWarning(options,link,warnings);
      warnings = getParseDOMWarning(options,link.href,response,warnings);
      // Pass in the outerHTML, the href attributes defaults to the current page if left empty
      warnings = getEmptyLinkWarning(options,link.outerHTML,warnings);
      warnings = getNoHrefLinkWarning(options,link,warnings);      
      updateDisplay(link,warnings,response.status);
    });
  }