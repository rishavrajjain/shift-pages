const express = require('express');
const sgMail = require('@sendgrid/mail');
const Buyer = require('../models/buyer');
const router = express.Router();
const auth = require('../middleware/auth');
const Pages = require('../models/pages');
var CryptoJS=require('crypto-js');
const axios = require('axios');

var access_key = `${process.env.RAPYD_ACCESS_KEY}`
var secret_key = `${process.env.RAPYD_SECRET_KEY}`;


const httpsresponses = require('../utils/httpsresponses');
const { message,status } = require('../utils/httpsresponses');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);





router.post('/createBuyer/:id',async(req,res)=>{

    try{
        const id = req.params.id

        const page = await Pages.findOne({_id:id});

        if(page.quantity < req.body.quantity){
            res.status(status.CONFLICT).json({
                data:{
                    message:'Stock not available'
                }
            })
        }

        page.quantity = page.quantity-req.body.quantity;
        await page.save();



        const buyer = new Buyer({
            name:req.body.name,
            email:req.body.email,
            address:req.body.address,
            pincode:req.body.pincode,
            quantity:req.body.quantity,
            amount:req.body.amount,
            purchasePage:page._id

        })

        await buyer.save();
        

        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + 1);
        var unix = Math.round(date/1000);

        const body = {
            amount: req.body.amount,
            complete_payment_url: `${process.env.UI_BASE_URL}/${buyer._id}/payment/complete`,
            country: "IN",
            currency: "INR",
            ewallet:page.walletId,
            error_payment_url: `${process.env.UI_BASE_URL}/${buyer._id}/payment/error`,
            complete_checkout_url:`${process.env.UI_BASE_URL}/${buyer._id}/payment/complete`,
            error_checkout_url:`${process.env.UI_BASE_URL}/${buyer._id}/payment/error`,
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
            
            res.send(result.data)
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

router.get('/:id/payment/complete',async(req,res)=>{
    const id = req.params.id;

    try{
        const buyer = await Buyer.findOne({_id:id});
        buyer.paymentStatus = 'COMPLETED'
        await buyer.save();
        const msg = {
            to: buyer.email,
            from: 'abhayrpatel10@gmail.com', 
            subject: 'Your order has been Confirmed',
            text: 'Your order for INR '+buyer.amount+' has been confirmed and your product will arrive shortly',
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
                <p>Your Payment for INR ${buyer.amount} has been confirmed.</p>

                
                
                
            
    
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


router.post('/buyers/:pageId',auth,async(req,res)=>{
    try{
        const id = req.params.pageId;
        const buyers = await Buyer.find({purchasePage:id});
        res.status(status.OK).json({
            data:buyers
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

router.post('/order/complete/:ids',auth,async(req,res)=>{
    const id = req.params.ids;
    try{
        const buyer = await Buyer.findOne({_id:id});
        buyer.delivered = 'DELIVERED'
        await buyer.save();

        res.status(status.OK).json({
            data:{
                message:'Order Completed'
            }
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