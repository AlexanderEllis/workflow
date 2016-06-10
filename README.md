# Workflow

### This is a basic workflow app created with React, Node, Express, SCSS, and MongoDB.  

This is an example version in which all of the data is stored locally.  You can check it out at http://alexanderellis.github.io/workflow/.

### Development

This version is a standalone static page version that saves nothing on refresh.  The full version of this app relies storing tasks in a collection and querying the database based on status type (potential, in-progress, or finished).  I have left the AJAX code in but commented out.  

This static page is the page displayed to the user in the full app.  A large problem I faced in this app was determining a way to ensure the app felt crisp and immediate for the user while maintaining a regular connection to the database so the app could be updated by another user at the same time.  The full version checks for updates every 2 seconds to ensure that two users on the same app can add tasks together.

React allowed me to have the local JavaScript take care of updating the user's view while requests are being sent to the server.  A simple (in retrospect) fix for any difference between returning database information and local changes was to have a boolean variable (canUpdate) that allowed the local view to always take priority over information coming to the server while changes were being made.

Another problem I faced was having unrelated React components communicate with each other without relying on parent-child relationships.  I worked through this using custom events, in which I would send the appropriate information.  This is most visible when changing a task from **To Do** to **In Progress**.  Since a database refresh from the **In Progress** component following a database update from **To Do** would delay making the changes visible, I instead have the components dispatch events with the task's information so that the receiving component can immediately add the task to its list.

Styling done with SASS/SCSS.
