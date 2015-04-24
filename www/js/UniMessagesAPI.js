var app = angular.module('UniMessagesAPI', ['ionic','myAuth']);

app.constant("API_CONFIG",{
   "HOST_URL":"http://192.168.0.4:8082/"
});


app.controller('MessageBoardCtrl', function($scope,API_CONFIG,$http,$ionicLoading,AuthService,$state,$ionicPopup) {

    var token=AuthService.getLoginToken();


    $scope.msg_list = [];

    var loadMessages=function(){
        $scope.msg_list = [];
        $ionicLoading.show({
            template: 'Loading messages...'
        });

        $http.get(API_CONFIG.HOST_URL + "messages/"+token+"/board?nocache="+Math.random()).success(function(data,status,headers,config) {
            if (status==200&&typeof data.msg_list!="undefined") {
                $scope.msg_list = data.msg_list;

            }
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        }).error(function(){

            $ionicLoading.hide();

            var confirmPopup = $ionicPopup.confirm({
                title: 'Load Failure',
                template: "Would you like to attempt to load messages again?"
            });
            confirmPopup.then(function(res) {

                if (res) loadMessages();

            });

            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.syncMailbox=function() {
        $ionicLoading.show({
            template: 'Syncing Mailbox...'
        });

        $http.get(API_CONFIG.HOST_URL + "sync/"+token+"?nocache="+Math.random()).success(function(data,status,headers,config) {
            loadMessages();
        }).error(function(){
            $ionicLoading.hide();

            var confirmPopup = $ionicPopup.confirm({
                title: 'Sync Failure',
                template: "Would you like to attempt to sync mailbox again?"
            });
            confirmPopup.then(function(res) {

                if (res) syncMailbox();

            });
        });


    };


    $scope.syncMailbox();




    $scope.doRefresh=function(){
        $scope.syncMailbox();

    };

    $scope.sendMessage = function() {

        var d = new Date();
        d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
        $scope.messages.push({
            userId: ($scope.data.alternate ? '12345' : '54321'),
            text: "call tetx",
            time: d
        });
        $ionicScrollDelegate.scrollBottom(true);

    };

});
app.controller('ProfileCtrl', function($scope,$state,AuthService) {

    $scope.logout=function() {
        $scope.msg_list=[];

        AuthService.deleteLoginToken();



        $state.go('login');


    };

});
app.controller('HelpCtrl', function($scope,$ionicHistory) {

    $scope.goBack=function() {



        $ionicHistory.goBack();



    };

});

