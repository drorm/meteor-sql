
#v0.1
# Features
* Full server side support of select, insert, update and delete on a table
* All changes get propagated to all subscribed clients as with MongoDb
* Changes to the db from other apps are detected immediately (100ms, configurable), and propagated to the client
* Light weight implementation
 * Changes are handled by triggers, no diffs to existing queries needed
 * Polling is done on a single indexed table, very little overhead.
* includes https://github.com/hiddentao/squel for cleaner query construction
* Partial support for general select statements. They work correctly, but are not reactive

# Limitations
* Client side the collection still use mongo syntax for find()
* All tables need to have a unique id 
* Insert, Update and Delete operations on the client don't update the data locally. Instead they run on the server and then the server refreshes the client's data. This could result in slower refresh times, but guarantees that the client always sees data that has been comited to the db. It also means that unlike minmongo, the full range of SQL options are available to the client.

