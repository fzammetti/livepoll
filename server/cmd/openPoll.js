/**
 * Start a poll, opening it for interaction.
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

  // Flip the flag on the poll specified by the supplied ID.
  polls["poll_" + params.id].status = "Open";
  completeResponse(resp, "");

} // End process().


// Make functions available outside of this module.
exports.process = process;
