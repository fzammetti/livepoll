// Imports.
const mongoose = require("mongoose");


// Define database schemas for all entities.
const schemas = { response : mongoose.Schema({ text : "string", count : "number" }) };
schemas.poll = mongoose.Schema({
  id : "string", status : "string", title : "string", question : "string", responses : [schemas.response]
});


// Define database models for all entities.
const models = { poll : mongoose.model("poll", schemas.poll) };


// Connect to database.
mongoose.connect("localhost", "poll");


/**
 * Save a poll to the database.
 *
 * @param inPoll     The poll data object to save.
 * @param inCallback Function to call when operation completes.
 */
function savePoll(inPoll, inCallback) {

  const obj = new models.poll(inPoll);
  obj.save(function (inError) {
    if (inError) {
      throw "DAO Error: " + JSON.stringify(inError);
    } else {
      inCallback();
    }
  });

} // End savePoll().


/**
 * Get a poll from the database.
 *
 * @param inID       The ID of the poll.  Note that this is the MongoDB ID.
 * @param inCallback Function to call when operation completes.
 */
function getPoll(inID, inCallback) {

  models.poll.findById(inID,
    function (inError, inObj) {
      if (inError) {
        throw "DAO Error: " + JSON.stringify(inError);
      } else {
        if (inObj == null) {
          inCallback(null);
        } else {
          inCallback(inObj);
        }
      }
    }
  );

} // End getPoll().


/**
 * Get all polls from the database.
 */
function getAllPolls(inCallback) {

  models.poll.find(null, null, null, function (inError, inObjs) {
    if (inError) {
      throw "Error: " + JSON.stringify(inError);
    } else {
      inCallback(JSON.stringify(inObjs));
    }
  });

} // End getAllPolls().


// Make functions available outside of this module.
exports.savePoll = savePoll;
exports.getPoll = getPoll;
exports.getAllPolls = getAllPolls;
