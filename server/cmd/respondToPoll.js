/**
 * Send a response to a poll.
 *
 * @param req    Request object.
 * @param resp   Response object.
 * @param params Query string parameters from request.
 */
function process(req, resp, params) {

  // First, make sure the caller hasn't already responded to this poll and abort if they have.
  const poll = polls["poll_" + params.id];
  if (poll.respondents[params.clientID]) {
    completeResponse(resp, "already_responded");
  } else {
    // Update the count for the selected response.
    const idx = parseInt(params.response);
    poll.responses[idx].count = poll.responses[idx].count + 1;
    // Then, record the fact that this client has responded.
    poll.respondents[params.clientID] = true;
    completeResponse(resp, "");
  }

} // End process().


// Make functions available outside of this module.
exports.process = process;
