var app = angular.module('PaymentLinkApp', []);

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION — Change when moving to production
// ═══════════════════════════════════════════════════════════════════════════════
var CONFIG = {
    EASEBUZZ_API_URL: 'https://commonapi.zeelearn.com/easebuzz/api/payment/CreatePaymentLink',
    EASEBUZZ_TOKEN: 'PGK-a7B9x2Qm8dR4sW1n'
};

function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1];
        }
    }
}

function getDateString(daysFromNow) {
    var d = new Date();
    d.setDate(d.getDate() + (daysFromNow || 0));
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '-' + mm + '-' + d.getFullYear();
}


// ═══════════════════════════════════════════════════════════════════════════════
//  CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════
app.controller('PaymentLinkController', function ($scope, $http) {

    $scope.disableCopy = true;
    $scope.isSubmitting = false;
    $scope.paymentLink = '';

    // ── Gateway: Easebuzz only (PayU commented out) ──────────────────────
    $scope.paymentGateway = 'easebuzz';
    // PAYU_TOGGLE: To enable PayU again, change above to 'payu' and
    //              uncomment the gateway toggle UI in PaymentLink.cshtml

    $scope.uid = GetParameterValues('uid');
    $scope.txnsuffix = GetParameterValues('suffix');

    $scope.CreatedPaymentLink = [];
    $scope.StateList = [];
    $scope.PaymentNature = [];

    // ── Easebuzz-only fields ─────────────────────────────────────────────
    $scope.ebExpiryDate = getDateString(30);
    $scope.ebMessage = 'Payment Link';

    // ── Notification channels — hardcoded, UI is commented out for now ───
    // When UI is enabled, these will be driven by checkboxes
    // $scope.notifyChannels = { sms: true, email: true, whatsapp: true };


    // ═══════════════════════════════════════════════════════════════════════
    //  FORM INIT & RESET
    // ═══════════════════════════════════════════════════════════════════════
    function getCleanFormObj() {
        return {
            customer_name: '', customer_mobile: '', customer_email: '',
            indent_amount: '', remarks: '',
            user_id: $scope.uid, suffix: $scope.txnsuffix,
            state: '', location: '', paymentType: ''
        };
    }

    $scope.PaymentLinkObj = getCleanFormObj();

    $scope.resetForm = function () {
        $scope.PaymentLinkObj = getCleanFormObj();
        $scope.ebExpiryDate = getDateString(30);
        $scope.ebMessage = 'Payment Link';
        $scope.paymentGateway = 'easebuzz';
        $scope.disableCopy = true;
        $scope.paymentLink = '';
        $scope.isSubmitting = false;
        if ($scope.myForm) {
            $scope.myForm.$setPristine();
            $scope.myForm.$setUntouched();
        }
    };


    // ═══════════════════════════════════════════════════════════════════════
    //  COPY TO CLIPBOARD — modern API with fallback
    // ═══════════════════════════════════════════════════════════════════════
    $scope.copyToClipboard = function (name) {
        var textToCopy = decodeURI(name || '');
        if (!textToCopy) {
            swal({ title: 'Error', text: 'No link to copy', icon: 'warning', timer: 1500, buttons: false });
            return;
        }

        // Modern clipboard API (works in modals)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(function () {
                swal({ title: 'Copied!', text: 'Payment link copied to clipboard', icon: 'success', timer: 1500, buttons: false });
            }, function () {
                fallbackCopy(textToCopy);
            });
        } else {
            fallbackCopy(textToCopy);
        }
    };

    function fallbackCopy(text) {
        try {
            var copyElement = document.createElement("textarea");
            copyElement.value = text;
            copyElement.style.position = 'fixed';
            copyElement.style.left = '-9999px';
            copyElement.style.opacity = '0';
            document.body.appendChild(copyElement);
            copyElement.focus();
            copyElement.select();
            document.execCommand('copy');
            document.body.removeChild(copyElement);
            swal({ title: 'Copied!', text: 'Payment link copied to clipboard', icon: 'success', timer: 1500, buttons: false });
        } catch (e) {
            swal({ title: 'Copy Failed', text: 'Please copy manually: ' + text, icon: 'info' });
        }
    }


    // ═══════════════════════════════════════════════════════════════════════
    //  SUBMIT — Easebuzz only
    //  PAYU_TOGGLE: To re-enable PayU, uncomment the dispatcher and
    //               AddonlinePaymentHistory function below
    // ═══════════════════════════════════════════════════════════════════════
    $scope.submitPayment = function () {
        if ($scope.isSubmitting) return;
        $scope.submitEasebuzz();
    };

    /* ═══════════════════════════════════════════════════════════════════════
     *  PAYU SUBMIT — COMMENTED OUT (Easebuzz only mode)
     *  PAYU_TOGGLE: Uncomment this entire block AND the dispatcher above
     *               to re-enable PayU gateway
     * ═══════════════════════════════════════════════════════════════════════
     *
     *  // ── Submit Dispatcher (supports both gateways) ───────────────────
     *  // Replace the submitPayment above with this:
     *  // $scope.submitPayment = function () {
     *  //     if ($scope.isSubmitting) return;
     *  //     if ($scope.paymentGateway === 'easebuzz') {
     *  //         $scope.submitEasebuzz();
     *  //     } else {
     *  //         $scope.AddonlinePaymentHistory();
     *  //     }
     *  // };
     *
     *  // ── PayU Direct Submit ───────────────────────────────────────────
     *  // $scope.AddonlinePaymentHistory = function () {
     *  //     $http({
     *  //         url: '/api/WebApi/AddonlinePaymentHistory',
     *  //         method: 'post',
     *  //         headers: {
     *  //             'Content-type': 'application/json'
     *  //         },
     *  //         data: $scope.PaymentLinkObj
     *  //     }).then(function (response) {
     *  //         var resp = JSON.parse(response.data);
     *  //         $scope.paymentLink = resp[0].link;
     *  //         $scope.disableCopy = false;
     *  //         swal({
     *  //             title: "Success",
     *  //             text: resp[0].Msg,
     *  //             icon: "success",
     *  //         });
     *  //         $scope.GetPayments();
     *  //     });
     *  // };
     *
     * ═══════════════════════════════════════════════════════════════════════ */


    // ═══════════════════════════════════════════════════════════════════════
    //  EASEBUZZ SUBMIT
    //
    //  Step 1 → AddonlinePaymentHistory → t_OnlinePaymentHistory → TXN_ID
    //  Step 2 → CreatePaymentLink API → Easebuzz link created
    //  Step 3 → UpdatePaymentLink → updates payment_link in DB with Easebuzz URL
    // ═══════════════════════════════════════════════════════════════════════
    $scope.submitEasebuzz = function () {
        $scope.isSubmitting = true;

        // Notifications — hardcoded, all three always sent
        // When UI is enabled, build this from $scope.notifyChannels
        var operations = [
            { type: 'sms', template: 'Default sms template' },
            { type: 'email', template: 'Default email template' },
            { type: 'whatsapp', template: 'Default whatsapp template' }
        ];

        // ════════════════════════════════════════════════════════════════
        //  STEP 1: Save to t_OnlinePaymentHistory → Get TXN_ID
        // ════════════════════════════════════════════════════════════════
        $http({
            url: '/api/WebApi/AddonlinePaymentHistory',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            data: $scope.PaymentLinkObj
        }).then(function (response) {

            var resp = null;
            try {
                resp = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            } catch (e) {
                $scope.isSubmitting = false;
                swal({ title: 'Error', text: 'Invalid response while generating TXN ID', icon: 'error' });
                return;
            }

            if (!resp || !resp[0] || !resp[0].link) {
                $scope.isSubmitting = false;
                swal({ title: 'Error', text: 'Failed to generate TXN ID', icon: 'error' });
                return;
            }

            // Extract TXN_ID from link
            var linkParts = resp[0].link.split('/');
            var txnId = linkParts[linkParts.length - 1];

            // ════════════════════════════════════════════════════════════
            //  STEP 2: Call Easebuzz CreatePaymentLink
            // ════════════════════════════════════════════════════════════
            var payload = {
                token: CONFIG.EASEBUZZ_TOKEN,
                merchant_txn: txnId,
                amount: parseFloat($scope.PaymentLinkObj.indent_amount),
                name: $scope.PaymentLinkObj.customer_name,
                email: $scope.PaymentLinkObj.customer_email,
                phone: $scope.PaymentLinkObj.customer_mobile,
                message: $scope.ebMessage || 'Payment Link',
                expiry_date: $scope.ebExpiryDate || getDateString(30),
                udf1: $scope.PaymentLinkObj.paymentType || '',
                udf2: String($scope.PaymentLinkObj.user_id || ''),
                udf3: $scope.PaymentLinkObj.location || '',
                udf4: $scope.PaymentLinkObj.state || '',
                udf5: $scope.PaymentLinkObj.remarks || '',
                operation: operations
            };

            $http({
                url: CONFIG.EASEBUZZ_API_URL,
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                data: payload
            }).then(function (ebResponse) {
                var ebResp = ebResponse.data;

                if (ebResp.success) {
                    var ebData = ebResp.data.easebuzz_response || {};
                    var ebLink = ebResp.data.payment_link || ebData.payment_url || ebData.short_url || '';

                    $scope.paymentLink = ebLink;
                    $scope.disableCopy = false;

                    // ════════════════════════════════════════════════════
                    //  STEP 3: Update payment_link in DB with Easebuzz URL
                    //
                    //  TESTING:  Using .ashx handler (bypasses DLL issue)
                    //  RELEASE:  Change URL to '/api/WebApi/UpdateEasebuzzLink'
                    //            and remove UpdateEasebuzzLink.ashx from server
                    $http({
                        url: '/api/WebApi/UpdateEasebuzzLink',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        data: { TXN_ID: txnId, payment_link: ebLink }
                    }).then(function () {
                        $scope.GetPayments();
                    }, function () {
                        $scope.GetPayments();
                    });

                    $scope.isSubmitting = false;
                    swal({
                        title: 'Success',
                        text: 'Payment link created & sent via SMS, Email, WhatsApp!\n\n' + ebLink,
                        icon: 'success'
                    });
                } else {
                    $scope.isSubmitting = false;
                    var errMsg = ebResp.message || 'Something went wrong';
                    if (ebResp.errors && ebResp.errors.length > 0) {
                        errMsg = ebResp.errors.map(function (e) { return e.field + ': ' + e.message; }).join('\n');
                    }
                    swal({ title: 'Error', text: errMsg, icon: 'error' });
                }

            }, function (ebError) {
                $scope.isSubmitting = false;
                var errMsg = 'Failed to create Easebuzz payment link';
                if (ebError.data && ebError.data.message) errMsg = ebError.data.message;
                swal({ title: 'Error', text: errMsg, icon: 'error' });
            });

        }, function (error) {
            $scope.isSubmitting = false;
            swal({ title: 'Error', text: 'Failed to save payment record', icon: 'error' });
        });
    };


    // ═══════════════════════════════════════════════════════════════════════
    //  DATA LOADERS — gateway detection kept for old PayU records in list
    // ═══════════════════════════════════════════════════════════════════════

    $scope.paramGetPayments = { 'uid': $scope.uid, 'suffix': $scope.txnsuffix };

    $scope.GetPayments = function () {
        $http({
            url: '/api/WebApi/GetPayments',
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            data: $scope.paramGetPayments
        }).then(function (response) {
            try {
                var list = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                if (Array.isArray(list)) {
                    // Detect gateway from payment link URL
                    for (var i = 0; i < list.length; i++) {
                        var link = (list[i].link || list[i].payment_link || '').toLowerCase();
                        if (link.indexOf('easebuzz') > -1 || link.indexOf('easy_collect') > -1 || link.indexOf('easycollect') > -1) {
                            list[i].gateway = 'Easebuzz';
                        } else {
                            list[i].gateway = 'PayU';
                        }
                    }
                    $scope.CreatedPaymentLink = list;
                } else {
                    $scope.CreatedPaymentLink = [];
                }
            } catch (e) {
                $scope.CreatedPaymentLink = [];
            }
        }, function () {
            $scope.CreatedPaymentLink = [];
        });
    };

    $scope.GetStateList = function () {
        $http({
            url: '/api/WebApi/GetStateList',
            method: 'post',
            headers: { 'Content-type': 'application/json' }
        }).then(function (response) {
            try {
                $scope.StateList = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            } catch (e) {
                $scope.StateList = [];
            }
        }, function () {
            $scope.StateList = [];
        });
    };

    $scope.GetPaymentNature = function () {
        $http({
            url: '/api/WebApi/GetPaymentNature',
            method: 'post',
            headers: { 'Content-type': 'application/json' }
        }).then(function (response) {
            try {
                $scope.PaymentNature = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            } catch (e) {
                $scope.PaymentNature = [];
            }
        }, function () {
            $scope.PaymentNature = [];
        });
    };

    // ── Init ──────────────────────────────────────────────────────────────
    $scope.GetPayments();
    $scope.GetStateList();
    $scope.GetPaymentNature();
});