#v0.21
* Make it work with Meteor 0.6+ new package system.

#v0.2
* Support for reactive joins through views. Any changes in the underlying tables automatically shows up in the view.
* Migrated to use squel() syntax where appropriate. Cleaner.
* Use Devwik.SQL.escape() to sanitize data on user input.
* Added API documentation.

#v0.1
* Full server side support of select, insert, update and delete on a table
* All changes get propagated to all subscribed clients as with MongoDb
* Changes to the db from other apps are detected immediately (100ms, configurable), and propagated to the client
* Light weight implementation
 * Changes are handled by triggers, no diffs to existing queries needed
 * Polling is done on a single indexed table, very little overhead.
* includes https://github.com/hiddentao/squel for cleaner query construction
* Partial support for general select statements. They work correctly, but are not reactive
