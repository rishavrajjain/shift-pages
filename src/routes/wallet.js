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
const { Router } = require('express');
const User = require('../models/user');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);





router.post('/wallet/balance',auth,async(req,res)=>{

    try{
        const user = req.user;
        const body = ''
    
        var http_method = 'get';      
        var url_path = `/v1/user/${user.walletId}/accounts`;    
        var salt = CryptoJS.lib.WordArray.random(12); 
        var timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();

        // if (JSON.stringify(request.data) !== '{}' && request.data !== '') {
        //     body = JSON.stringify(JSON.parse(request.data));
        // }
    
    
    
        var to_sign = http_method + url_path + salt + timestamp + access_key + secret_key + body;
    
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
        
        axios.get(process.env.RAPYD_BASE_URL+`/v1/user/${user.walletId}/accounts`,config).then(async result=>{
            
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

router.post('/wallet/transactions',auth,async(req,res)=>{

    try{
        const user = req.user;
        const body = ''
    
        var http_method = 'get';      
        var url_path = `/v1/user/${user.walletId}/transactions`;    
        var salt = CryptoJS.lib.WordArray.random(12); 
        var timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();

        // if (JSON.stringify(request.data) !== '{}' && request.data !== '') {
        //     body = JSON.stringify(JSON.parse(request.data));
        // }
    
    
    
        var to_sign = http_method + url_path + salt + timestamp + access_key + secret_key + body;
    
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
        
        axios.get(process.env.RAPYD_BASE_URL+`/v1/user/${user.walletId}/transactions`,config).then(async result=>{
            
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

router.post('/transfer',auth,async(req,res)=>{
    const user = req.user;

    const email = req.body.email;
    const benUser = await User.findOne({email:email});
    if(!benUser || benUser.walletId === null){
        res.status(status.NOT_FOUND).json({
            data:{
                message:'User does not have a Rapyd Pages Wallet'
            }
        })
    }

    
    const body ={
        amount:req.body.amount,
        currency:"INR",
        destination_ewallet:benUser.walletId,
        source_ewallet:user.walletId
    }
    var http_method = 'post';      
    var url_path = '/v1/account/transfer';    
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
    
    axios.post(process.env.RAPYD_BASE_URL+'/v1/account/transfer',body,config).then(async result=>{
        
        const body ={
            id: result.data.data.id,
            metadata: {
                merchant_defined: "accepted"
            },
            status: "accept"
        }
        var http_method = 'post';      
        var url_path = '/v1/account/transfer/response';    
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
        axios.post(process.env.RAPYD_BASE_URL+'/v1/account/transfer/response',body,config).then(async result=>{
        
            res.send(result.data)
        }).catch(err=>{
            console.log(err);
            console.log(err.response.data)
            res.send(err);
        })
    }).catch(err=>{
        console.log(err);
        console.log(err.response.data)
        res.send(err);
    })
})


router.post('/settle',auth,async(req,res)=>{
    const body ={
        beneficiary: {
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            vpa:req.body.vpa
        },
        beneficiary_country: "IN",
        beneficiary_entity_type: "individual",
        payout_method_type: "in_upi_bank",
        ewallet: req.user.walletId,
        metadata: {
            merchant_defined: true
        },
        payout_amount: req.body.amount,
        payout_currency: "INR",
        sender: {
            first_name: "Rapyd",
            last_name: "Pages"
        },
        sender_country: "IN",
        sender_currency: "INR",
        sender_entity_type: "individual"
    }
    var http_method = 'post';      
    var url_path = '/v1/payouts';    
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
    
    axios.post(process.env.RAPYD_BASE_URL+'/v1/payouts',body,config).then(async result=>{
        
        res.send(result.data)
    }).catch(err=>{
        console.log(err);
        console.log(err.response.data)
        res.send(err);
    })
})








module.exports = router;