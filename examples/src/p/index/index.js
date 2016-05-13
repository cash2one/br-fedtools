var $ = require('zepto');
var Index = require('../../c/index/index');
new Index({
	el: $('h2')
});
console.log($('h2'));
