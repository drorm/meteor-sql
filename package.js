Package.describe({                                                                                
    summary: 'SQL ORM for Meteor'
});

Package.on_use(function (api) {
    api.add_files('common/lib/vendor/squel.js', ['client', 'server']);
    api.add_files('common/lib/devwik.js', ['client', 'server']);

    api.add_files('client/lib/sql/select.js', 'client');
    api.add_files('client/lib/sql/table.js', 'client');
    api.add_files('client/lib/autils.js', 'client');

    api.add_files('server/lib/lib.js', 'server');
    api.add_files('server/client.js', 'server');
    api.add_files('server/dbconfig.js', 'server');
    api.add_files('server/dbinit.js', 'server');
    api.add_files('server/dblib.js', 'server');
    api.add_files('server/poll.js', 'server');
    api.add_files('server/select.js', 'server');
    api.add_files('server/table.js', 'server');
    api.add_files('server/tests.js', 'server');
    api.add_files('server/view.js', 'server');
});

Npm.depends({ 'mysql': '2.1.0' });
