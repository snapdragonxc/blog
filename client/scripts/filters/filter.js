angular.module('custom-filters', [])
.filter('startFrom', function() { 
    return function(input, start) {
        start = +start; 
        return input.slice(start);
    }
})
.filter('roundup', function () {
    return function (value) {
        if(value == 0){
            value = 1;
        }       
        return Math.ceil(value);
    };
})
.filter('extractMonth', function() {
    return function(x) { 
        return '' + /[a-zA-Z]+/.exec(x);
    };
})
.filter('extractYear', function() {
    return function(x) {
        return '' + /^[0-9]+/.exec(x);
    };
})
.filter('filterByMonth', function() {
    return function(x, filter) {
        if(filter == 'posts/all'){
            return x;
        } else {
            return x.filter(function(abstract) { 
                    return abstract.filter === filter;
                });
        }
    }
});

