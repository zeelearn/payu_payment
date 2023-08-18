using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MVCIntegrationKit.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MVCIntegrationKit.Controllers
{
    public class WebApiController : ApiController
    {
        BussinessLogic bl = new BussinessLogic();

        [HttpPost]
        public string AddonlinePaymentHistory([FromBody] JObject objdata) {
            return bl.savejsonobject("pr_addonlinePaymentHistory", objdata.ToString(), "BPMSconnectionstring");
        }

        [HttpPost]
        public string GetPayments([FromBody] JObject objdata)
        {
            string data = objdata == null ? "" : objdata.ToString();
            return bl.getdatatablejsondata("pr_getPayments", data, "BPMSconnectionstring");
        }

    }
}
