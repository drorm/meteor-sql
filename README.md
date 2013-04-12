Meteor SQL
==========

This is an initial implementation of Meteor SQL. It currently only supports MySQL.

# Features
* Full server side support of select, insert, update and delete on a table
* All changes get propagated to all subscribed clients as with MongoDb
* Changes to the db from other apps are detected immediately (100ms, configurable), and propagated to the client
* Support for reactive joins through views. Any changes in the underlying tables automatically shows up in the view.
* Light weight implementation
 * Changes are handled by triggers, no diffs to existing queries needed
 * Polling is done on a single indexed table, very little overhead.
* includes https://github.com/hiddentao/squel for cleaner query construction
* Partial support for general select statements. They work correctly, but are not reactive

# Limitations
* Client side the collection still use mongo syntax for find()
* All tables need to have a unique id 
* Insert, Update and Delete operations on the client don't update the data locally. Instead they run on the server and then the server refreshes the client's data. This could result in slower refresh times, but guarantees that the client always sees data that has been comited to the db. It also means that unlike minmongo, the full range of SQL options are available to the client.

#Installation

* Standard mysql set up
 * Install mysql
 * create database meteor;
 * grant all on meteor.\* to meteor@'localhost' IDENTIFIED BY 'xxxxx2344958889d'; #Change the password to something else
* Now install the mysql client for node.js
 * run meteor in the app's directory so that it builds the hierarchy in the .meteor directory
 * cd .meteor/local/build/server/
 * npm install mysql
* Change the database config params in server/dbconfig.js to match the password you entered above as well as anything else needed

# Implementation Approach
* insert into the audit trail table information about insert, update, delete
* poll the audit table
* When there is a change, publish it using Meteor's standard Meteor.publish
* Client operations, insert, update, delete use Meteor.call

# Future
* Make select statement reactive
* Support prepared statements
* Support any kind of views
* Provide a way to automatically generate forms
