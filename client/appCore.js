/**
 * Core app logic namespace.
 */
const appCore = {


  /**
   * Address all AJAX calls go to.
   */
  serverURL : "http://127.0.0.1",


  /**
   * True with the app first starts.
   */
  initialStart : true,


  /**
   * An object describing the currently selected poll, or, a string that is the ID of the selected poll (when a new
   * poll is selected).
   */
  selectedPoll : null,


  /**
   * Reference to the interval that updates the view poll page.
   */
  updateInterval : null,


  /**
   * Unique ID of this client.  Used to avoid double-responding.
   */
  clientID : null,


  /**
   * Perform some initialization tasks.
   */
  initialize : function() {

    // Set JQM defaults.
    $.mobile.defaultPageTransition = "fade";
    $.mobile.defaultDialogTransition = "fade";
    $.mobile.loader.prototype.options.text = "...Contacting Server...";
    $.mobile.loader.prototype.options.textVisible = true;

    // Generate a GUID for this client.  While there doesn't seem to be a way
    // to generate a GUARANTEED unique value client-side, this should come close
    // enough for our purposes here.
    if (!window.localStorage.getItem("clientID")) {
      window.localStorage.setItem("clientID",
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            const r = Math.random()*16|0, v = c == "x" ? r : (r&0x3|0x8);
            return v.toString(16);
        })
      );
    }
    appCore.clientID = window.localStorage.getItem("clientID");

    // Hook ready event handler for initialization that requires full DOM.
    $(document).on("ready", function() {
      // Event handler for response confirmation dialog.
      $("#confirmResponseYes").on("click", function() {
        appCore.respondToPoll(true);
      });
    });

  }, /* End initialize(). */


  /**
   * Event handler for home page showpage event.
   */
  homePageShow : function() {

    clearInterval(appCore.updateInterval);
    appCore.updateInterval = null;

    // If the app has just started, show a welcome dialog only.
    if (appCore.initialStart) {
      appCore.initialStart = false;
      $("#infoDialogHeader").html("Welcome");
      $("#infoDialogContent").html(
        "Thank you for using the LivePoll app.  Please select a poll to view its results and to respond to it."
      );
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    } else {
      appCore.updatePollList();
    }

  }, /* End homePageShow(). */


  /**
   * Event handler for respond to poll page showpage event.
   */
  respondToPollPageShow : function() {

    // Stop updating poll on poll view page.
    clearInterval(appCore.updateInterval);
    appCore.updateInterval = null;

    // Populate the page's fields.
    $("#respondToPollQuestion").html(appCore.selectedPoll.question);
    for (let i = 0; i < 4; i++) {
      $("#respondResponse" + (i + 1) + "Label .ui-btn-text").text(
        appCore.selectedPoll.responses[i].text
      );
    }

  }, /* End respondToPollPageShow(). */


  /**
   * Event handler for view poll page showpage event.
   */
  viewPollPageShow : function() {

    appCore.updatePoll();

  }, /* End viewPollPageShow(). */


  /**
   * Update the list of polls on the home page.
   */
  updatePollList : function() {

    $.mobile.loading("show");

    $.ajax({ url : appCore.serverURL, data : "cmd=listPolls" })

    .done(function(inResponse) {

      // Clear the listview.
      const ul = $("#pollListUL");
      ul.children().remove();

      // Now populate it from the retrieved data.
      const polls = JSON.parse(inResponse);
      const len = polls.length;
      for (let i = 0; i < len; i++) {
        const poll = polls[i];
        ul.append(
          "<li style=\"padding-bottom:30px;\" " +
          "onClick=\"appCore.selectPoll('" + poll.id + "');\">" +
          "<img src=\"img/poll.png\" class=\"cssPollIcon\" alt=\"Poll\"><br>" +
          poll.title + " (" + poll.status + "" +
          (poll.timeLeft == null ? "" : (" - Time Left: " + poll.timeLeft)) +
          ")</li>"
        );
      }

      // Now we have to refresh the listview or else the screen won't reflect the changes.  Then, make UI available to
      // user again.
      ul.listview("refresh");
      $.mobile.loading("hide");

    })

    .fail(function(inXHR) {
      $.mobile.loading("hide");
      $("#infoDialogHeader").html("Server Error: " + inXHR.status);
      $("#infoDialogContent").html(inXHR.statusText);
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    });

  }, /* End updatePollList(). */


  /**
   * Select a poll from the listview on the home page and jump to the poll view page.
   *
   * @param inID The ID of the poll.
   */
  selectPoll : function(inID) {

    appCore.selectedPoll = inID;
    $.mobile.changePage($("#viewPollPage"));

  }, /* End selectPoll(). */


  /**
   * Update a poll on the View Poll page.
   */
  updatePoll : function() {

    // Clear old bars.
    $("#viewPollResponse1Bar").css("width", "0");
    $("#viewPollResponse2Bar").css("width", "0");
    $("#viewPollResponse3Bar").css("width", "0");
    $("#viewPollResponse4Bar").css("width", "0");

    // Get ID of poll to update.
    let id;
    if (typeof appCore.selectedPoll == "string") {
      id = appCore.selectedPoll;
    } else {
      id = appCore.selectedPoll.id;
    }

    // Call server.
    $.ajax({ url : appCore.serverURL, data : "cmd=viewPoll&id=" + id })

    .done(function(inResponse) {

      // Store the poll.
      appCore.selectedPoll = JSON.parse(inResponse);
      const response1Count = appCore.selectedPoll.responses[0].count;
      const response2Count = appCore.selectedPoll.responses[1].count;
      const response3Count = appCore.selectedPoll.responses[2].count;
      const response4Count = appCore.selectedPoll.responses[3].count;

      // Display question, status, responses and response counts.
      $("#viewPollQuestion").html(appCore.selectedPoll.question);
      $("#viewPollStatus").html(appCore.selectedPoll.status);
      $("#viewPollResponse1").html(appCore.selectedPoll.responses[0].text);
      $("#viewPollResponse2").html(appCore.selectedPoll.responses[1].text);
      $("#viewPollResponse3").html(appCore.selectedPoll.responses[2].text);
      $("#viewPollResponse4").html(appCore.selectedPoll.responses[3].text);
      const viewPollResponse1Bar = $("#viewPollResponse1Bar");
      const viewPollResponse2Bar = $("#viewPollResponse2Bar");
      const viewPollResponse3Bar = $("#viewPollResponse3Bar");
      const viewPollResponse4Bar = $("#viewPollResponse4Bar");
      viewPollResponse1Bar.html(response1Count);
      viewPollResponse2Bar.html(response2Count);
      viewPollResponse3Bar.html(response3Count);
      viewPollResponse4Bar.html(response4Count);

      // Figure out the bar widths.  First step is to determine the largest response count by putting them in an array,
      // then sorting them.  The first element is the one we want.
      const counts = [ response1Count, response2Count, response3Count, response4Count ];
      counts.sort(function(a,b) { return b-a; });

      // Now get the width of the document, minus a little to ensure no bar gets too close to the right edge.
      const docWidth = $(document).width() - 50;

      // Figure out the bar multiplier, that is, how much each "point" for any response is worth in pixels.
      const barMult = (docWidth / counts[0]) - 1;

      // Finally, calculate the width of each bar using the multipler and the
      // actual response count.
      const bar1Width = response1Count * barMult;
      const bar2Width = response2Count * barMult;
      const bar3Width = response3Count * barMult;
      const bar4Width = response4Count * barMult;

      // Animate bars to their new sizes.
      viewPollResponse1Bar.animate({ width : bar1Width }, 1500);
      viewPollResponse2Bar.animate({ width : bar2Width }, 1500);
      viewPollResponse3Bar.animate({ width : bar3Width }, 1500);
      viewPollResponse4Bar.animate({ width : bar4Width }, 1500);

      // Start interval, if not already running, to auto-refresh this page, but only if the poll is open.
      if (!appCore.updateInterval && appCore.selectedPoll.status == "Open") {
        appCore.updateInterval = setInterval(appCore.updatePoll, 5000);
      }

    })

    .fail(function(inXHR) {
      $("#infoDialogHeader").html("Server Error: " + inXHR.status);
      $("#infoDialogContent").html(inXHR.statusText);
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    });

  }, /* End updatePoll(). */


  /**
   * Create a new poll.
   */
  createPoll : function() {

    $("#createPollPanel").panel("close");
    $.mobile.loading("show");

    const createPollForm = $("#createPollForm");

    $.ajax({ url : appCore.serverURL, data : "cmd=createPoll&" + createPollForm.serialize() })

    .done(function(inResponse) {
      $.mobile.loading("hide");
      if (inResponse == "not_admin") {
        $("#infoDialogHeader").html("Nice Try");
        $("#infoDialogContent").html("You are not an admin and cannot perform this function");
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      } else {
        appCore.updatePollList();
      }
    })

    .fail(function(inXHR) {
      $.mobile.loading("hide");
      $("#infoDialogHeader").html("Server Error: " + inXHR.status);
      $("#infoDialogContent").html(inXHR.statusText);
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    });

    // Also, clear the form to avoid double-creations by mistake.
    createPollForm[0].reset();

  }, /* End createPoll(). */


  /**
   * Open the current poll.
   */
  openPoll : function() {

    $.mobile.loading("show");

    // Call server.
    $.ajax({ url : appCore.serverURL,
      data : "cmd=openPoll" + "&id=" + appCore.selectedPoll.id + "&adminKey=" + $("#pollControlAdminKey").val()
    })

    .done(function(inResponse) {
      $.mobile.loading("hide");
      if (inResponse == "not_admin") {
        $("#infoDialogHeader").html("Nice Try");
        $("#infoDialogContent").html(
          "You are not an admin and cannot perform this function"
        );
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      } else {
        $("#infoDialogHeader").html("Success");
        $("#infoDialogContent").html("The poll is now open.  People can now respond to it.");
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      }

      if (inResponse == "not_admin") {
        $("#infoDialogHeader").html("Nice Try");
        $("#infoDialogContent").html(
          "You are not an admin and cannot perform this function"
        );
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      } else {
        $.mobile.loading("hide");
        $("#infoDialogHeader").html("Success");
        $("#infoDialogContent").html("The poll is now open for responses");
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      }

    })

    .fail(function(inXHR) {
      $.mobile.loading("hide");
      $("#infoDialogHeader").html("Server Error: " + inXHR.status);
      $("#infoDialogContent").html(inXHR.statusText);
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    });

  }, /* End openPoll(). */


  /**
   * Close the current poll.
   */
  closePoll : function() {

    clearInterval(appCore.updateInterval);
    appCore.updateInterval = null;

    $.mobile.loading("show");

    // Call server.
    $.ajax({ url : appCore.serverURL,
      data : "cmd=closePoll" + "&id=" + appCore.selectedPoll.id + "&adminKey=" + $("#pollControlAdminKey").val()
    })

    .done(function(inResponse) {
      $.mobile.loading("hide");
      if (inResponse == "not_admin") {
        $("#infoDialogHeader").html("Nice Try");
        $("#infoDialogContent").html("You are not an admin and cannot perform this function");
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      } else {
        $("#infoDialogHeader").html("Success");
        $("#infoDialogContent").html("The poll is now closed.  You can re-open it if you wish.");
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      }
    })

    .fail(function(inXHR) {
      $.mobile.loading("hide");
      $("#infoDialogHeader").html("Server Error: " + inXHR.status);
      $("#infoDialogContent").html(inXHR.statusText);
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    });

  }, /* End closePoll(). */


  /**
   * Called when the user tries to navigate to the "respond to poll" page.  It stops that navigation if the poll
   * isn't open.
   */
  respondToPollClicked : function() {

    if (appCore.selectedPoll.status == "Open") {
      $.mobile.changePage($("#respondToPollPage"));
    } else {
      $("#infoDialogHeader").html("Poll Closed");
      $("#infoDialogContent").html("This poll is not currently open for responses");
      $.mobile.changePage($("#infoDialog"), { role : "dialog" });
    }

  }, /* End respondToPollClicked(). */


  /**
   * Respond to the current poll.
   *
   * @param inContinuation True when this method is called as a result of the Yes button on the confirmation
   *                       dialog being tapped.
   */
  respondToPoll : function(inContinuation) {

    if (inContinuation) {

      $.mobile.loading("show");

      $.ajax({ url : appCore.serverURL,
        data : "cmd=respondToPoll" +
          "&id=" + appCore.selectedPoll.id +
          "&clientID=" + appCore.clientID + "&" +
          $("#respondToPollForm").serialize()
      })
      .done(function(inResponse) {
        // Need to switch to the poll view page, but only AFTER this dialog is dismissed.  Have to do this because
        // otherwise, the animation of the bars causes the dialog to be shown numerous times.
        $.mobile.loading("hide");
        if (inResponse == "already_responded") {
          $("#infoDialogHeader").html("Too Enthusiastic!");
          $("#infoDialogContent").html("You have already responded to this poll");
          $.mobile.changePage($("#infoDialog"), { role : "dialog" });
        }
      })
      .fail(function(inXHR) {
        $.mobile.loading("hide");
        $("#infoDialogHeader").html("Server Error: " + inXHR.status);
        $("#infoDialogContent").html(inXHR.statusText);
        $.mobile.changePage($("#infoDialog"), { role : "dialog" });
      });

    } else {
      $.mobile.changePage("#confirmResponse");
    }

  } /* End respondToPoll(). */


}; /* End core application logic namespace. */


// Perform initialization tasks on app startup.
$(document).on("mobileinit", appCore.initialize);
