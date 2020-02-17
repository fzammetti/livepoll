// Imports.
const http = require("http");
const url = require("url");
const serveFile = require("./serveFile");
const stackTrace = require("./stackTrace");
const cmdHandlers = {
  closePoll : require("./cmd/closePoll"),
  createPoll : require("./cmd/createPoll"),
  listPolls : require("./cmd/listPolls"),
  openPoll : require("./cmd/openPoll"),
  respondToPoll : require("./cmd/respondToPoll"),
  viewPoll : require("./cmd/viewPoll")
};


// In-memory poll data cache.  The attributes of this object are poll IDs prefixed with "poll_" to make them
// alphanumeric, and the value of each attribute is an object representing a poll with the following attributes:
// id ........... Unique ID of the poll.
// status ....... One of the following statuses: "Open" or "Closed".
// title ........ The title of the poll.
// question ..... The question the poll is asking.
// responses .... An array where each element is an object with two attributes:
//                text, which is the text of the response, and count, which is
//                the number of times this response has been selected.
// respondents .. An object where each attribute is a clientID (the value is always true).
global.polls = { };


// Turn logging on or off.  Note that errors are ALWAYS logged.
global.loggingEnabled = true;


// Turn file caching on or off.  Should be true except during development.
global.cacheFiles = false;


// Key that must be passed to the server to perform admin functions.
global.adminKey = "admin";


/**
 * Called to complete a response.
 *
 * @param resp    The response object.
 * @param content The content to return.
 * @param cType   Content type of the response.  Defaults to text/plain if not present.
 * @param sCode   The HTTP status code to set.  Defaults to 200 if not present.
 */
global.completeResponse = function(resp, content, cType, sCode) {

  // Set defaults.
  if (typeof cType === "undefined" || cType == null) {
    cType = "text/plain";
  }
  if (typeof sCode === "undefined" || sCode == null) {
    sCode = 200;
  }

  // Log info for debugging.
  if (loggingEnabled) {
    console.log("main.js: completeResponse(): sCode: " + sCode + ", " + "cType: " + cType);
  }

  // Access-Control-Allow-Origin header is needed to allow cross-domain
  // requests.
  resp.writeHead(sCode, { "Content-Type" : cType, "Access-Control-Allow-Origin" : "*" } );

  // Note logic based on whether the content type contains "text".  Any type
  // that doesn't will be returned as a binary file.
  resp.end(content, cType.indexOf("text") == -1 ? "binary" : null);

}; // End completeResponse().


// Define and start the server.
http.createServer(function(req, resp) {

  try {

    if (loggingEnabled) {
      console.log("\nmain.js: " + req.url);
    }

    // Get query string parameters, if any.
    let params = url.parse(req.url, true).query;
    if (params == null) {
      params = { };
    }
    if (loggingEnabled) {
      console.log("main.js: params = " + JSON.stringify(params));
    }

    // Processing a command.
    if (params.cmd) {
      if (loggingEnabled) {
        console.log("main.js: Processing command: " + params.cmd);
      }
      cmdHandlers[params.cmd].process(req, resp, params);
    // Serving a file.
    } else {
      if (loggingEnabled) {
        console.log("main.js: Serving a file");
      }
      serveFile.process(req, resp);
    }

  } catch (e) {
    console.log("!!!!! EXCEPTION !!!!!");
    console.log(stackTrace.printStackTrace({ e : e }));
    completeResponse(resp, e, null, 500);
  }

}).listen(80);

console.log("\nLivePoll started");
