/**
 * List all polls on the system, regardless of current status.  This displays
 * polls in memory and in the database.
 *
 * @param req    Request object.
 * @param resp   Response object.
 * @param params Query string parameters from request.
 */
function process(req, resp, params) {

  // Create an array of objects based on the current polls in memory.
  // These are trimmed-down objects since while passing back the poll objects themselves would work, it's more than
  // the UI needs at this point.
  const pollsOut = [ ];
  for (let pollID in polls) {
    const poll = polls[pollID];
    pollsOut.push({
      id : poll.id,
      title : poll.title,
      status : poll.status
    });
  }
  completeResponse(resp, JSON.stringify(pollsOut));

} // End process().


// Make functions available outside of this module.
exports.process = process;
