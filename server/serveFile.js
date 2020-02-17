// Imports.
const fs = require("fs");
const utils = require("./utils");


// Our cache of files that have been served at least once.
const cachedStaticFiles = { };


/**
 * Serve a static file.
 *
 * @param req  Request object.
 * @param resp Response object.
 */
function process(req, resp) {

  // Figure out the filename.  This starts with the requested URL, stripping off any query string that might be present.
  let filename = req.url;
  const idxOfParams = req.url.indexOf("?");
  if (idxOfParams != -1) {
    filename = req.url.substring(1, req.url.indexOf("?"));
  }

  // Remove leading and trailing spaces.
  filename = utils.fullTrim(filename);

  // If it's just a forward-slash then make it blank instead, so we get the default doc later.
  if (filename == "/") {
    filename = "";
  }

  // Strip out any "dangerous" characters and make sure there's no double-periods in it.  This ensures a caller can't
  // access any file outside the app/client directory.
  filename = utils.stripBadChars(filename, "abcdefghijklmnopqrstuvwxyxzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._/");
  filename = utils.replaceSubstring(filename, "..", ".");

  // If it starts with a forward-slash at this point, remove it now.
  if (filename.charAt(0) == "/") {
    filename = filename.slice(1);
  }

  // If filename is blank at this point then use the default doc.
  if (filename == "") {
    filename = "index.html";
  }

  // Log the filename after all that.
  if (loggingEnabled) {
    console.log("serveFile.js: filename: " + filename);
  }

  // Figure out the content type header to set.  It will either be the default set in contentType, or a type for a
  // specific file from fileTypes, or a type based on extension from extensionTypes.
  let contentType = "text/plain";
  const fileTypes = { "someFilename" : "someContentType" };
  const extensionTypes = {
    ".html" : "text/html", ".css" : "text/css", ".js" : "text/javascript",
    ".json" : "text/json", ".txt" : "text/plain", ".gif" : "image/gif",
    ".png" : "image/png", ".jpg" : "image/jpg"
  };
  if (fileTypes[filename]) {
    contentType = fileTypes[filename].contentType;
    if (loggingEnabled) {
      console.log("serveFile.js: file-based content type");
    }
  } else {
    const extension = filename.substring(filename.indexOf("."));
    if (extension && extensionTypes[extension]) {
      contentType = extensionTypes[extension];
      if (loggingEnabled) {
        console.log("serveFile.js: extension-based content type");
      }
    } else {
      if (loggingEnabled) {
        console.log("serveFile.js: default content type");
      }
    }
  }

  // If the file has already been served then it's cached, and we can serve it from memory.
  if (cachedStaticFiles[filename]) {

    if (loggingEnabled) {
      console.log("serveFile.js: Serving from cache");
    }
    completeResponse(resp, cachedStaticFiles[filename], contentType);

  } else {

    // Not cached, so read the file from the file system instead.  The read type is based on the previously
    // determined contentType.
    let readType = "binary";
    if (contentType.indexOf("text") != -1) {
      readType = "ascii";
    }

    if (loggingEnabled) {
      console.log("serveFile.js: Reading from storage: readType: " + readType);
    }

    fs.readFile("../client/" + filename, readType,
      function(error, data) {
        if (error) {
          // Return error to client.
          console.log("serveFile.js: Could not read file: " + JSON.stringify(error));
          completeResponse(resp, error, null, 500);
        } else {
          // File read, cache it in memory first, if caching is enabled.
          if (cacheFiles) {
            cachedStaticFiles[filename] = data;
          }
          // Then, complete the response.
          completeResponse(resp, readType == "ascii" ? data : data, contentType);
        }
      }
    );

  }

} // End process().


// Make functions available outside of this module.
exports.process = process;
