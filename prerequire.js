// require('./DomainClass/Domain.txt');
// require('./DomainClass/Domain.yml');

var path = './domainclass/'

require("fs").readdirSync(path).forEach(function(file) {
    return require(path + file);
});
