## Check My Links

A Chrome Extension which checks links on webpages and shows their HTTP response codes. This allows web content editors to quickly see which links are broken (for whatever reason) and which resolve correctly. Check My Links is an extension developed primarily for web designers, developers, and content editors that crawls through your webpages looking for broken links and identifying them for you.

### Installation
This extension can be found in the Chrome Web Store [https://chrome.google.com/webstore/detail/check-my-links-redux/pmklcclkpjcfmfnmjocmocmgkmkamddk](https://chrome.google.com/webstore/detail/check-my-links-redux/pmklcclkpjcfmfnmjocmocmgkmkamddk)

### Instructions

To use the extension:

1. Browse to the page you want to check
2. Click on the 'Check My Links' button in the Chrome toolbar
3. The extension will then find all of the links on a web page, and check each one for you. Broken links will be shown on the page highlighted in red with the server response code next to the link (404, 500 etc).

### Options
#### Blacklisting
To prevent this extension from checking a link, please enter all or part of the URL in the blacklist below
#### Request Type
HEAD is quicker, but sometimes doesn't reflect the true HTTP status of a page, switch to GET if you're getting weird results.
#### Caching
With caching enabled, valid responses will be stored within the browser's IndexedDB.  In future requests to that same link, Check My Links Redux will get the status from the database opposed to making another request.  
#### NoFollow
With this enabled, links with rel="nofollow" attribute will be checked.
#### Auto Check
With this enabled, the link checker will automatically start when the user browses to a new page or refreshes.

### Issues 

If you want to report an issue, bug or make a suggestion, please do so here:

[https://github.com/kyleladd/Check-My-Links/issues](https://github.com/kyleladd/Check-My-Links/issues) 

### The Original Check My Links

The original Check My Links can be found here:

[https://github.com/ocodia/Check-My-Links/](https://github.com/ocodia/Check-My-Links/)

You can install a packaged version of the original extension here:

[https://chrome.google.com/webstore/detail/check-my-links/ojkcdipcgfaekbeaelaapakgnjflfglf](https://chrome.google.com/webstore/detail/check-my-links/ojkcdipcgfaekbeaelaapakgnjflfglf)

### License

Check My Links is released under the MIT license. 

[www.opensource.org/licenses/MIT](www.opensource.org/licenses/MIT)

Thanks

