const express = require('express');
const sgMail = require('@sendgrid/mail');
const Invoice = require('../models/invoice');
const router = express.Router();
const auth = require('../middleware/auth');
var CryptoJS=require('crypto-js');
const axios = require('axios');

var access_key = `${process.env.RAPYD_ACCESS_KEY}`
var secret_key = `${process.env.RAPYD_SECRET_KEY}`;


const httpsresponses = require('../utils/httpsresponses');
const { message,status } = require('../utils/httpsresponses');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);







router.post('/createInvoice',auth,async(req,res)=>{

    try{

        const invoice = new Invoice(req.body);
        invoice.owner = req.user._id;
        await invoice.save();




      

        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + 15);
        var unix = Math.round(date/1000);

        const body = {
            amount: req.body.amount,
            complete_payment_url: `${process.env.UI_BASE_URL}/${invoice._id}/invoice/complete`,
            country: "IN",
            currency: "INR",
            ewallet:req.user.walletId,
            error_payment_url: `${process.env.UI_BASE_URL}/${invoice._id}/invoice/error`,
            complete_checkout_url:`${process.env.UI_BASE_URL}/${invoice._id}/invoice/complete`,
            error_checkout_url:`${process.env.UI_BASE_URL}/${invoice._id}/invoice/error`,
            cardholder_preferred_currency: true,
            language: "en",
            metadata: {
                merchant_defined: true
            },
            payment_method_types_include: [
                "in_visa_credit_card",
                "in_credit_mastercard_card",
                "in_googlepay_upi_bank",
                "in_upi_bank"
            ],
            expiration: unix,
            payment_method_types_exclude: []
        }
    
        var http_method = 'post';      
        var url_path = '/v1/checkout';    
        var salt = CryptoJS.lib.WordArray.random(12); 
        var timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();
    
    
    
        var to_sign = http_method + url_path + salt + timestamp + access_key + secret_key + JSON.stringify(body);
    
        var signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(to_sign, secret_key));
    
        signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(signature));
    
        const config = {
            headers:{
                access_key:access_key,
                timestamp:timestamp,
                salt:salt,
                signature:signature
            }
        }
        
        axios.post(process.env.RAPYD_BASE_URL+'/v1/checkout',body,config).then(async result=>{
            
            const msg = {
                to: req.body.email,
                from: 'abhayrpatel10@gmail.com', 
                subject: 'Invoice from '+req.user.name,
                html:`<head>
                <link href="https://fonts.googleapis.com/css?family=Tomorrow:300,400,700&display=swap" rel="stylesheet"> 
        </head>
        <body style="color: black ;font-family: 'Tomorrow', sans-serif;">
            <div style="margin-top:15vh">
            <center>
               
                <h1 style="font-size:xx-large; font-optical-sizing: 10;">Rapyd Pages</h1>
                <h3>Invoice
                    <br><br>
                    <p>You have an Invoice for INR ${req.body.amount} from ${req.user.name}</p>
                    .This link is valid for 15 days.<a href= "${result.data.data.redirect_url}" style="color:rgb(83, 157, 221)">Click this link to pay</a> 
                    <br><br><br>
                    ${req.body.details}
                    
                    
                
        
            </center>
        </div>
        </body>`
                
                
              }
              sgMail
                .send(msg)
                .then(() => {
                  console.log('Email sent')
                  res.status(status.OK).json({
                    data:{
                        message:'Invoice Created successfully'
                    }
                })
                })
                .catch((error) => {
                  console.error(error)
                  console.log(error.response.body)
                })
        }).catch(err=>{
            console.log(err);
            console.log(err.response.data)
            res.send(err);
        })
    }catch(err){
        console.log(err);
        res.status(status.SERVER_ERROR).json({
            data:{
                message:message.SERVER_ERROR
            }
        })
    }
})

router.get('/:id/invoice/complete',async(req,res)=>{
    const id = req.params.id;

    try{
        const invoice = await Invoice.findOne({_id:id});
        console.log('test')
        console.log(invoice)
        invoice.paymentStatus = 'COMPLETED'
        await invoice.save();
        const msg = {
            to: invoice.email,
            from: 'abhayrpatel10@gmail.com', 
            subject: 'Your Payment has been Recieved',
            text: 'Your Payment for INR '+invoice.amount+' has been confirmed.',
            html:`<head>
                <link href="https://fonts.googleapis.com/css?family=Tomorrow:300,400,700&display=swap" rel="stylesheet"> 
        </head>
        <body style="color: black ;font-family: 'Tomorrow', sans-serif;">
            <div style="margin-top:15vh">
            <center>
               
                <h1 style="font-size:xx-large; font-optical-sizing: 10;">Rapyd Pages</h1>
                <h3>
                    <br><br>

                    
                    <br>
                    <p>Your Payment for INR ${invoice.amount} has been confirmed.</p>

                    
                    
                    
                
        
            </center>
        </div>
        </body>`
            
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')
              res.status(status.OK).json({
                data:{
                    message:'Successfull'
                }
            })
            })
            .catch((error) => {
              console.error(error)
              console.log(error.response.body)
            })
        
    }catch(err){
        console.log(err);
        res.status(status.SERVER_ERROR).json({
            data:{
                message:message.SERVER_ERROR
            }
        })
    }
})


router.post('/user/invoices',auth,async(req,res)=>{
    try{
        const id = req.user._id;
        const invoices = await Invoice.find({owner:id});
        res.status(status.OK).json({
            data:invoices
        })
    }catch(err){
        console.log(err);
        res.status(status.SERVER_ERROR).json({
            data:{
                message:message.SERVER_ERROR
            }
        })
    }
})






module.exports = router;