'use strict';

function onGoogleReady() {
    angular.bootstrap(document.getElementById("map"), ['onsApp']);
}

//var surnameServiceDecorator = function($delegate) {
//
//    var addSurname = function() {
//        var result = $delegate.addSurname();
//        console.log('log add surnames');
//        return result;
//    };
//
//    $delegate.addSurname = addSurname;
//    return $delegate;
//};

var onsApp = angular.module('onsApp', ['ngRoute', 'onsControllers', 'onsServices', 'ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'angularMoment', 'ui.map'])
    // allow DI for use in controllers, unit tests
    .constant('_', window._)
    .constant('baseUrl', 'http://localhost:8000/app/')
    .constant('baseRestUrl', 'http://localhost:8080/')
    // use in views, ng-repeat="x in _.range(3)"
    .config(function($provide){

        var surnameDecorator = function($delegate, logService) {
            var addSurname = function(fn) {
                return function () {
                    var args = [].slice.call(arguments);
                    console.log('add surnamearguments', args);
                    logService.log('here is my message');
                    return fn.apply(null, args);
                };
            };
            var getSurnames = function(fn) {
                return function () {
                    var args = [].slice.call(arguments);
                    console.log('getsurnamearguments', args);
                    logService.log('here is my messagefrom getsuranes');
                    return fn.apply(null, args);
                };
            };
            var originalFn = $delegate.addSurname;
            $delegate.addSurname = addSurname(originalFn);
            var originalFn1 = $delegate.surnames;
            $delegate.surnames = getSurnames(originalFn1);
            return $delegate;
        };

        $provide.decorator('surnameService', surnameDecorator);

//        $provide.decorator('surnameService', function($delegate) {
//            var swap = function(originalFn) {
//                return function() {
//                    var args = [].slice.call(arguments);
//                    console.log('add surnamearguments', args);
//                    return originalFn.apply(null, args);
//                };
//            };
//            $delegate.addSurname = swap($delegate.addSurname);
//            return $delegate;
//        });

    });
//    .run(function ($rootScope) {
//        $rootScope._ = window._;
//
//
//
//
//    });




onsApp.directive('personList', function() {
        return {
            controller: function($scope) {

                $scope.delete = function(person) {
                    $scope.personsForm.persons.splice($scope.persons.indexOf(person), 1);
                }
            },
            restrict: 'E',
            replace: true,
            scope: {
                persons: '=',
                orderProp: '='
            },
            templateUrl: 'personList.html'
            //  template: "hello {{orderProp}}"
        };
    }
);




onsApp.directive('formHelper', function() {
    return {
        restrict : 'A',
        require: 'form',
        link: function (scope, element, attrs, form) {
            scope[attrs.formHelper] = {
                isFormValid: function() {
                    return form.$valid;
                },
                checkFormValid: function() {
                    var checkAllRequired = function (){
                        // set the form to dirty to enable invalid indicators
                        if(angular.isDefined(form)) {
                            angular.forEach(form.$error.required, function (required) {
                                required.$setTouched();
                            });
                        }
                    };
                    checkAllRequired(form);
                    return angular.isDefined(form) && !form.$invalid;
                },
                showValidationMessageFor: function(fieldName) {
                    // only show message if the field is invalid and has been changed
                    // (otherwise you'll get the message as soon as you see the form)
                    return form[fieldName].$invalid && form[fieldName].$touched;
                }
            };
        }
    };
});


onsApp.directive('surnameList', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                surnames: '='
            },
            templateUrl: 'surnameList.html'
        };
    }
);

onsApp.directive('locationList', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                locations: '='
            },
            templateUrl: 'locationList.html'
        };
    }
);

onsApp.directive('showPersonDetails', function($location) {
    return function link(scope, element, attrs) {
        element.on('click', function() {
            $location.url('/persons/' + attrs.showPersonDetails);
        });
    }
});


onsApp.directive('sortName', function() {
    return {
        link: function(scope, elm, attrs) {
            elm.on('click', function() {
                if (attrs.sortName != scope.orderProp) {
                    scope.orderProp = attrs.sortName
                }
                scope.$safeApply();
            });
        }
    }
});

function uppercase(str) {
    if(angular.isString(str)) {
        return str.toUpperCase();
    }
    else {
        return str;
    }
}

onsApp.filter('bla', function() {
    return function(arr) {
        var result = [];
        if (angular.isDefined(arr)) {
            for (var i = 0; i < arr.length; ++i) {
                var personDetails = arr[i];
                var newPersonFirstName =  uppercase(personDetails.person.firstName);
                personDetails.person.firstName = newPersonFirstName;
                result.push(personDetails);
            }
        }
        return result;
    };
});

onsApp.filter('locationsForCensusCountry', function() {
        return function(arr, censusId) {
        var result = [];
        if (angular.isDefined(arr)) {
            for (var i = 0; i < arr.length; ++i) {
                var personDetails = arr[i];
                var newPersonFirstName =  uppercase(personDetails.person.firstName);
                personDetails.person.firstName = newPersonFirstName;
                result.push(personDetails);
            }
        }
        return result;
    };
});

onsApp.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

onsApp.filter('males', function() {
    return function(arr, isMale) {
        var result = [];
        if (angular.isDefined(arr)) {
            for (var i = 0; i < arr.length; ++i) {
                var personDetails = arr[i];
                if (isMale) {
                    if (personDetails.person.gender == 1) {
                        result.push(personDetails);
                    }
                } else {
                    if (personDetails.person.gender == 0) {
                        result.push(personDetails);
                    }
                }
            }
        }
        return result;
    };
});


onsApp.directive('personForm', function() {
    return {
        controller: function($scope, $attrs) {
            $scope.person = {};
            $scope.clickStatus = false;
            if($attrs.controller) {
                $scope.$parent[$attrs.controller] = this;
            }

            $scope.submit = function() {
                if ($scope.addPersonForm.$valid) {
                    $scope.addPerson({person: $scope.person});
                } else {
                    alert("please fill in all details");
                }
            };

            this.clear = function() {
                $scope.person = {};
                $scope.addPersonForm.$setPristine();
            }

            $scope.today = function() {
                $scope.person.birthDate = new Date();
            };
            $scope.today();

            $scope.clear = function () {
                $scope.person.birthDate = null;
            };

            // Disable weekend selection
            $scope.disabled = function(date, mode) {
                return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
            };

//            $scope.toggleMin = function() {
//                $scope.minDate = $scope.minDate ? null : new Date();
//            };
//            $scope.toggleMin();

            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];





        },
        restrict: 'E',
        replace: true,
        scope: {
            addPerson: '&',
            fathers: '=',
            surnames: '=',
            mothers: '='

        },
        templateUrl: 'personForm.html'
    };
});


onsApp.directive('locationForm', function() {
    return {
        controller: function($scope, $attrs) {
            $scope.location = {};
            $scope.clickStatus = false;
            if($attrs.controller) {
                $scope.$parent[$attrs.controller] = this;
            }

            $scope.submit = function() {
                if ($scope.addLocationForm.$valid) {
                    $scope.addLocation({location: $scope.location});
                } else {
                    alert("please fill in all details");
                }
            };

            this.clear = function() {
                $scope.location = {};
                $scope.addLocationForm.$setPristine();
            }
        },
        restrict: 'E',
        replace: true,
        scope: {
            addLocation: '&',
            countries: '='
        },
        templateUrl: 'locationForm.html'
    };
});

onsApp.directive('focusMe', function($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function(scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                console.log('value=',value);
                if(value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function() {
                console.log('blur');
                scope.$apply(model.assign(scope, false));
            });
        }
    };
});

onsApp.directive('focusMeExpression', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.focusMeExpression, function(value) {
                if(value === true) {
                    console.log('value=',value);
                    //$timeout(function() {
                    element[0].focus();
                    scope[attrs.focusMeExpression] = false;
                    //});
                }
            });
        }
    };
});

onsApp.config(function($routeProvider, $provide, $httpProvider) {
    $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
//    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'navigation'});
    $routeProvider.when('/trees', {templateUrl: 'partials/treeList.html', controller: 'TreeListCtrl'});
    $routeProvider.when('/trees/:treeId', {templateUrl: 'partials/treeDetails.html', controller: 'TreeDetailsCtrl'});
    $routeProvider.when('/persons', {templateUrl: 'partials/personList.html', controller: 'PersonListCtrl'});
    $routeProvider.when('/persons/:personId', {templateUrl: 'partials/personDetails.html', controller: 'PersonDetailsCtrl'});
    $routeProvider.when('/censuses', {templateUrl: 'partials/censusList.html', controller: 'CensusListCtrl'});
    $routeProvider.when('/censuses  /:censusId', {templateUrl: 'partials/censusDetails.html', controller: 'CensusDetailsCtrl'});
    $routeProvider.when('/surnames', {templateUrl: 'partials/surnameList.html', controller: 'SurnameListCtrl'});
    $routeProvider.when('/surnames/:surnameId', {templateUrl: 'partials/surnameDetails.html', controller: 'SurnameDetailsCtrl'});
    $routeProvider.when('/locations', {templateUrl: 'partials/locationList.html', controller: 'LocationListCtrl'});
    $routeProvider.when('/locations/:locationId', {templateUrl: 'partials/locationDetails.html', controller: 'LocationDetailsCtrl'});
    $routeProvider.otherwise({redirectTo: '/home'});


//    $httpProvider.defaults.withCredentials = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//    $httpProvider.defaults.headers.get = {
//    //    'Origin' : 'http://localhost:8000',
//        'Access-Control-Allow-Credentials': true,
//        'Access-Control-Allow-Origin': 'http://localhost:8000'
//    };
//
//    $httpProvider.defaults.headers.options = {
//        'Access-Control-Request-Headers': 'Access-Control-Allow-Credentials , Access-Control-Allow-Origin',
//        'Access-Control-Allow-Origin': 'http://localhost:8000'
//    };

//    $provide.factory('myHttpInterceptor', function($q, $location) {
//        return {
//            // optional method
//            'response': function(response) {
//                // do something on success
//                console.log(response);
//                if (response.status === 401 || response.status === 302) {
//
//                    $location.path('index.html#/login')
//                }
//                return response;
//            },
//
//            // optional method
//            'responseError': function(rejection) {
//                console.log(rejection);
//                // do something on error
////                if (canRecover(rejection)) {
////                    return responseOrNewPromise
////                }
////                if (rejection.status === 302 ) {
////                    console.log('302 found');
////                }
////
////                if (rejection.status === 0) {
////                    $location.path("/login");
////                }
//
//                if (rejection.status === 401 || rejection.status === 302) {
//                    $location.path('index.html#/login')
//                }
//
//                return $q.reject(rejection);
//            }
//        };
//    });
//
//    $httpProvider.interceptors.push('myHttpInterceptor');


});



onsApp.filter('personUrl', function() {
    return function(person) {
        return '#/persons/' + person.id;
    }
});


onsApp.filter('capitalize', function() {
    return function(surname) {
        var surnameMap = [];
        surnameMap['etherton'] = 'ETHERTON';
        surnameMap['wilkinson'] = 'WILKINSON';
        return surnameMap[surname];
    }
});

var onsAppDev = angular.module('onsAppDev', ['onsApp', 'ngMockE2E']);
onsAppDev.run(function($httpBackend, $rootScope) {

    $rootScope._ = window._;

    var personDetails =  {
        personDetails: [
            {person:
                {
                    gender:1,
                entityId:1,
                firstName: 'samuel',
                surname: {entityId:1,surname: 'Etherton'},
                location:{entityId:1,city:'london',postCode: 'e1',
                    addressLine1: 'brick lane',
                    addressLine2 : 'bethnal green',
                    country:{entityId:1,code: 'uk', name: 'united kingdom'}
                },
                birthDate:-5206899600000,
                motherId:3,
                fatherId:4
            }, marriages:[],
                birthDate: '01-01-1805',
                personSummary: 'samuel Etherton 01-01-1805',
                fatherDetails: 'Unknown father',
                motherDetails: 'Unknown mother'
            },
            {person:
            {
                gender:1,
                entityId:1,
                firstName: 'george',
                surname: {entityId:1,surname: 'Etherton'},
                location:{entityId:1,city:'london',postCode: 'e1',
                    addressLine1: 'brick lane',
                    addressLine2 : 'bethnal green',
                    country:{entityId:1,code: 'uk', name: 'united kingdom'}
                },
                birthDate:-5206899600000,
                motherId:3,
                fatherId:4
            }, marriages:[],
                birthDate: '01-01-1805',
                personSummary: 'samuel Etherton 01-01-1805',
                fatherDetails: 'Unknown father',
                motherDetails: 'Unknown mother'
            }

        ]
    };

    $httpBackend.whenGET('/ons-command/rest/persons').respond(personDetails);
    $httpBackend.whenGET('/persons').respond(personDetails);

    $httpBackend.whenGET(/.*/).respond(personDetails);

    $httpBackend.whenGET('http://localhost:8080/ons-command/rest/persons').respond(personDetails);
    $httpBackend.whenGET('http://localhost:8080/ons-command/rest/persons/').respond(personDetails);

    console.log('in onsappdev');

});