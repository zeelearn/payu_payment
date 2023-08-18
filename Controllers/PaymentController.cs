﻿using MVCIntegrationKit.Models;
using System;
using System.Configuration;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using System.Web.Mvc;

namespace MVCIntegrationKit.Controllers
{
    public class PaymentController : Controller
    {
        private const string V = "Indent_Id";
        BussinessLogic obj = new BussinessLogic();


        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Payment(string id)
        {

            ViewBag.indent = id;
            return View();
        }

        [HttpPost]
        public void Payment(FormCollection form)
        {
            try
            {
                var identa = form["indent"].ToString();
                var data = "{Indent_Id :" + identa + "}";
                DataTable dt = obj.GetDataSet("pr_CreateOnlinePaymentHistory_BPMS", data, "connectionstring").Tables[0];
                string firstName = dt.Rows[0]["Franchisee_Name"].ToString();
                string amount = dt.Rows[0]["Indent_Amount"].ToString();
                string productInfo = dt.Rows[0]["Indent_Type"].ToString();
                string email = dt.Rows[0]["Email_Id"].ToString();
                string phone = dt.Rows[0]["Mobile_No"].ToString();
                string surl = ConfigurationManager.AppSettings["PAYU_return_URL"].ToString();
                string furl = ConfigurationManager.AppSettings["PAYU_return_URL"].ToString();
                //RemotePost myremotepost = new RemotePost();
                string key = ConfigurationManager.AppSettings["MERCHANT_KEY"].ToString();
                string salt = ConfigurationManager.AppSettings["SALT"].ToString();
                ////posting all the parameters required for integration.
                //myremotepost.Url = ConfigurationManager.AppSettings["PAYU_BASE_URL"].ToString();
                //myremotepost.Add("key", key);
                string txnid = dt.Rows[0]["TXN_ID"].ToString();// Generatetxnid();
                //myremotepost.Add("txnid", txnid);
                //myremotepost.Add("amount", amount);
                //myremotepost.Add("productinfo", productInfo);
                //myremotepost.Add("firstname", firstName);
                //myremotepost.Add("phone", phone);
                //myremotepost.Add("email", email);
                //myremotepost.Add("surl", surl);//Change the success url here depending upon the port number of your local system.
                //myremotepost.Add("furl", furl);//Change the failure url here depending upon the port number of your local system.
                //myremotepost.Add("service_provider", "payu_paisa");
                //myremotepost.Add("udf1", identa);

                //string hashString = key + "|" + txnid + "|" + amount + "|" + productInfo + "|" + firstName + "|" + email + "|" + identa + "||||||||||" + salt;
                //// string hashString = key + "|" + txnid + "|" + amount + "|" + productInfo + "|" + firstName + "|" + email + "|" + txnid + "|" + txnid + "|" + txnid + "|" + txnid + "|" + txnid + " ||||||" + salt;
                //string hash = Generatehash512(hashString);
                //myremotepost.Add("hash", hash);
                //myremotepost.Post();
                RemotePost myremotepost = new RemotePost();

                myremotepost.Url = ConfigurationManager.AppSettings["PAYU_BASE_URL"];
                myremotepost.Add("key", key);
                myremotepost.Add("txnid", txnid);
                myremotepost.Add("amount", amount);
                myremotepost.Add("productinfo", productInfo);
                myremotepost.Add("firstname", firstName);
                myremotepost.Add("phone", phone);
                myremotepost.Add("email", email);
                myremotepost.Add("surl", ConfigurationManager.AppSettings["PAYU_return_URL"]);//Change the success url here depending upon the port number of your local system.  
                myremotepost.Add("furl", ConfigurationManager.AppSettings["PAYU_return_URL"]);//Change the failure url here depending upon the port number of your local system.  
                myremotepost.Add("service_provider", "payu_paisa");
                myremotepost.Add("udf1", identa);
                //ConfigurationManager.AppSettings["hashSequence"];//
                string hashString = key + "|" + txnid + "|" + amount + "|" + productInfo + "|" + firstName + "|" + email + "|" + identa + "||||||||||" + salt;
                string hash = Generatehash512(hashString);
                myremotepost.Add("hash", hash);
                myremotepost.Post();
            }
            catch (Exception ex)
            {




            }

        }

        public class RemotePost
        {
            private System.Collections.Specialized.NameValueCollection Inputs = new System.Collections.Specialized.NameValueCollection();


            public string Url = "";
            public string Method = "post";
            public string FormName = "form1";

            public void Add(string name, string value)
            {
                Inputs.Add(name, value);
            }

            public void Post()
            {
                System.Web.HttpContext.Current.Response.Clear();

                System.Web.HttpContext.Current.Response.Write("<html><head>");

                System.Web.HttpContext.Current.Response.Write(string.Format("</head><body onload=\"document.{0}.submit()\">", FormName));
                System.Web.HttpContext.Current.Response.Write(string.Format("<form name=\"{0}\" method=\"{1}\" action=\"{2}\" >", FormName, Method, Url));
                for (int i = 0; i < Inputs.Keys.Count; i++)
                {
                    System.Web.HttpContext.Current.Response.Write(string.Format("<input name=\"{0}\" type=\"hidden\" value=\"{1}\">", Inputs.Keys[i], Inputs[Inputs.Keys[i]]));
                }
                System.Web.HttpContext.Current.Response.Write("</form>");
                System.Web.HttpContext.Current.Response.Write("</body></html>");

                System.Web.HttpContext.Current.Response.End();
            }
        }

        //Hash generation Algorithm

        public string Generatehash512(string text)
        {

            byte[] message = Encoding.UTF8.GetBytes(text);

            UnicodeEncoding UE = new UnicodeEncoding();
            byte[] hashValue;
            SHA512Managed hashString = new SHA512Managed();
            string hex = "";
            hashValue = hashString.ComputeHash(message);
            foreach (byte x in hashValue)
            {
                hex += String.Format("{0:x2}", x);
            }
            return hex;

        }


        public string Generatetxnid()
        {

            Random rnd = new Random();
            string strHash = Generatehash512(rnd.ToString() + DateTime.Now);
            string txnid1 = strHash.ToString().Substring(0, 20);

            return txnid1;
        }

        public ActionResult PaymentLink() {
            return View();
        }


    }
}
