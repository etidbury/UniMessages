angular.module('myAuth', ['ngCordova', 'ionic'])

    .service('AuthService', ['$http','$state','$ionicPopup', 'API_CONFIG', function ($http,$state,$ionicPopup, API_CONFIG) {



        var login = function (email, device_uuid) {
            var postParams = {
                email: email,
                device_uuid: device_uuid
            };

            return $http.post(API_CONFIG.HOST_URL + "login", postParams);

        };

        var validateDevice = function (email, device_uuid) {

            var postParams = {
                email:email,
                device_uuid: device_uuid
            };



            return $http.post(API_CONFIG.HOST_URL + "validate?nocache="+Math.random(), postParams);

        };

        var deleteLoginToken=function() {
            delete window.localStorage.token;
        };
        var setLoginToken=function(token) {
            window.localStorage.token=token;
        };
        var getLoginToken=function() {


            if (!window.localStorage.token||window.localStorage.length<0) {


                $ionicPopup.alert({
                    title: 'Authentication Error',
                    template: 'You are not signed in'
                });
                $state.go('login');

                return false;

            }

            return window.localStorage.token;

        };

        return {
            login: login,
            validateDevice: validateDevice,
            setLoginToken:setLoginToken,
            getLoginToken:getLoginToken,
            deleteLoginToken:deleteLoginToken
        }
    }])
    .controller('LoginController', function ($scope, $ionicLoading, $state, $cordovaDevice, AuthService, $ionicPopup) {
        $scope.login_response = "Please fill in your username and password";



        try {
            $scope.uuid = $cordovaDevice.getUUID();
        } catch (err) {

            $scope.erruuid="caught:"+err;

            $scope.uuid = "jfhdjkghsdgjkhdfkgjhf75983758947598";

            /*console.log("Error " + err.message);

             $ionicLoading.show({
             template: 'Required phone'
             });*/
            //alert("error " + err.$$failure.message);
        }

        var handleLoginSuccess=function() {

            $state.go('tab.messages');
            console.log('login success');

        };

        $scope.authorize = function (input_email) {
            $ionicLoading.show({
                template: 'Connecting...'
            });

            AuthService.login(input_email, $scope.uuid).success(function (response) {
                    $ionicLoading.hide();

                if (response.data.token){
                    AuthService.setLoginToken(response.data.token);//store token login

                }
                   handleLoginSuccess();




                }).error(function (data) {
                    var error_response=data;
                    $ionicLoading.hide();
                    console.log(error_response);



                    error_response=error_response?error_response:{code:500,message:"No server response"};

                    if (error_response.code==401) {


                            var confirmPopup = $ionicPopup.confirm({
                                title: 'Login Failure',
                                template: error_response.message+"\n\nWould you like to send a verification email to authorize this device?"
                            });
                            confirmPopup.then(function(res) {
                                if(res) {
                                    $ionicLoading.show({
                                        template: 'Sending verification email...'
                                    });

                                    console.log('input_email:'+input_email+" uuid:"+$scope.uuid);


                                    AuthService.validateDevice(input_email,$scope.uuid).success(function(success_response){
                                        $ionicLoading.hide();
                                        $ionicPopup.alert({
                                            title: 'Success',
                                            template: success_response.message
                                        });
                                    }).error(function(data) {

                                        var response=data.message?data.message:"Unknown error";



                                        $ionicLoading.hide();
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: response
                                        });
                                    });



                                } else {
                                    console.log('You are not sure');
                                }
                            });

                    }else {
                        $ionicPopup.alert({
                            title: 'Login Failed',
                            template: error_response.message
                        });

                    }
                }

            );




            // window.location.href=("https://login.live.com/oauth20_authorize.srf?client_id=0000000040147440&scope=wl.emails,wl.offline_access&response_type=token&redirect_uri=http://unibutler.com/umsg");


        }


    });