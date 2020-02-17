/**
 * Show the results of a poll, regardless of state.  If the poll is currently open then this shows real-time poll
 * results.  If the poll is closed then it shows historical data from the database.
 *
 * @param req    Request object.
 * @param resp   Response object.
 * @param params Query string parameters from request.
 */
function process(req, resp, params) {

  // Return a JSON representation of the poll specified by the provided ID.
  completeResponse(resp, JSON.stringify(polls["poll_" + params.id]));

} // End process().


// Make functions available outside of this module.
exports.process = process;
