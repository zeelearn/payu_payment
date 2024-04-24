var app = angular.module('PaymentLinkApp', []);

function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1];
        }
    }
};

app.controller('PaymentLinkController', function ($scope, $http) {

    $scope.disableCopy = true;
    $scope.copyToClipboard = function (name) {        
        var copyElement = document.createElement("textarea");
        copyElement.style.position = 'fixed';
        copyElement.style.opacity = '0';
        copyElement.textContent = decodeURI(name);
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(copyElement);
        copyElement.select();
        document.execCommand('copy');
        body.removeChild(copyElement);
    }

    $scope.uid = GetParameterValues('uid');
    $scope.txnsuffix = GetParameterValues('suffix');

    //$scope.PaymentLinkObj = {
    //    'customer_name': '', 'customer_mobile': '', 'customer_email': '', 'indent_amount': '', 'remarks': '', 'payment_link': '', 'agreement_no': '',
    //    'user_id': $scope.uid, 'suffix': $scope.txnsuffix
    //};

    $scope.PaymentLinkObj = {
        'customer_name': '', 'customer_mobile': '', 'customer_email': '', 'indent_amount': '', 'remarks': '',
        'user_id': $scope.uid, 'suffix': $scope.txnsuffix, 'state': '', 'location': '','paymentType':''
    };

    $scope.CreatedPaymentLink = [];
    $scope.StateList = [];
    $scope.PaymentNature = [];


    

    $scope.AddonlinePaymentHistory = function () {
        //const isEmpty = Object.values($scope.PaymentLinkObj).every(value => !!value);;        
        $http({
            url: '/api/WebApi/AddonlinePaymentHistory',
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            data: $scope.PaymentLinkObj
        }).then(function (response) {
            var resp = JSON.parse(response.data);
            $scope.paymentLink = resp[0].link;
            $scope.disableCopy = false;
            swal({
                title: "Success",
                text: resp[0].Msg,
                icon: "success",
            });
        });
        
    }


    $scope.paramGetPayments = { 'uid': $scope.uid, 'suffix': $scope.txnsuffix };
    $scope.GetPayments = function () {
        $http({
            url: '/api/WebApi/GetPayments',
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            data: $scope.paramGetPayments
        }).then(function (response) {
            $scope.CreatedPaymentLink = JSON.parse(response.data);
        });
    }
    $scope.GetStateList = function () {
        $http({
            url: '/api/WebApi/GetStateList',
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function (response) {
            $scope.StateList = JSON.parse(response.data);
        });
    }
    $scope.GetPaymentNature = function () {
        $http({
            url: '/api/WebApi/GetPaymentNature',
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function (response) {
            $scope.PaymentNature = JSON.parse(response.data);
        });
    }

    $scope.GetPayments();
    $scope.GetStateList();
    $scope.GetPaymentNature();

});