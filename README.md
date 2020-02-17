# livepoll
A simple app using jQuery Mobile, Node and MongoDB for running live polls at events

This is an app I threw together for someone in a couple of hours when they needed a way to have a poll during a live
event some years back.  It needed to be mobile-accessible, and at the time I was playing with jQM for a book I was
writing, so it was a natural choice.

The app is simply a Node-based server app that serves the client, which then makes typical AJAX calls to the server,
which stores data in MongoDB.

So use it, simply fire up MongoDB on its default port, then fire up the server with 'node main.js' and then access
the client at 'http://<machine_ip>'.

An admin user can create, open and close a poll at any time.  This function is "protected" (such as it is!) with an
admin key, which you'll need to update in main.js.  The default value is 'admin' (so, uhh, you know, you MIGHT want
to chaneg that!).  Also, the IP address of MongoDB may need to be changed in DAO.js.  By default, it assumes it's
running on the same machine, so 127.0.0.1 it is by default.

Otherwise, it should be pretty self-explanatory.

It's not a complicated app by any stretch, but it gets the job done for the purpose it was created.
