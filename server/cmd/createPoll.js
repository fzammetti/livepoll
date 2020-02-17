/**
 * Create a new poll.  This just creates it in memory but does not open it.
 *
 * @param req    Request object.
 * @param resp   Response object.
 * @param params Query string parameters from request.
 */
function process(req, resp, params) {

  // Abort if admin key isn't right.
  if (params.adminKey != adminKey) {
    completeResponse(resp, "not_admin");
    return;
  }

  // Create a new poll object and store it.  There's nothing to return to the UI at this point.  The list of polls will
  // be refresh after this.
  const id = new Date().getTime();
  polls["poll_" + id] = {
    id : id, status : "Closed", title : params.title, question : params.question,
    responses : [
      { text : params.response1, count : 0 },
      { text : params.response2, count : 0 },
      { text : params.response3, count : 0 },
      { text : params.response4, count : 0 }
    ],
    respondents : { }
  };
  completeResponse(resp, "");

} // End process().


// Make functions available outside of this module.
exports.process = process;
