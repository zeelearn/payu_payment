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
    $scope.uid = GetParameterValues('uid');
    $scope.txnsuffix = GetParameterValues('suffix');

    //$scope.PaymentLinkObj = {
    //    'customer_name': '', 'customer_mobile': '', 'customer_email': '', 'indent_amount': '', 'remarks': '', 'payment_link': '', 'agreement_no': '',
    //    'user_id': $scope.uid, 'suffix': $scope.txnsuffix
    //};

    $scope.PaymentLinkObj = {
        'customer_name': '', 'customer_mobile': '', 'customer_email': '', 'indent_amount': '', 'remarks': '',
        'user_id': $scope.uid, 'suffix': $scope.txnsuffix
    };

    $scope.CreatedPaymentLink = [];


    

    $scope.AddonlinePaymentHistory = function () {
        const isEmpty = Object.values($scope.PaymentLinkObj).every(value => !!value);;
        
        
        if (isEmpty == true) {
            $http({
                url: 'http://localhost:3271/api/WebApi/AddonlinePaymentHistory',
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                data: $scope.PaymentLinkObj
            }).then(function (response) {
                var resp = JSON.parse(response.data);
                swal({
                    title: "Success",
                    text: resp[0].Msg,
                    icon: "success",
                }).then(okay => {
                    if (okay) {
                        location.reload();
                    }
                });
            });
        }
        else {
            swal({
                title: "Error",
                text: "Please fill all required data!",
                icon: "error",
            })
        }
        
    }

    $scope.GetPayments = function () {
        $http({
            url: 'http://localhost:3271/api/WebApi/GetPayments',
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function (response) {
            $scope.CreatedPaymentLink = JSON.parse(response.data);
        });
    }
    $scope.GetPayments();

});