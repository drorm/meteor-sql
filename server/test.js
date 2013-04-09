Devwik.SQL.runTests = function() {
        //Example of a select with a join
        var select = new Devwik.SQL.Select('empsPerCity', 'select count(*) empNumber,  offices.* from employees, offices where offices.officeCode = employees.officecode group by officeCode');
        //Devwik.SQL.Tests.transactions();
};

