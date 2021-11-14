const express = require('express');
const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
var CryptoJS=require('crypto-js')

var access_key = `${process.env.RAPYD_ACCESS_KEY}`
var secret_key = `${process.env.RAPYD_SECRET_KEY}`;  


const httpsresponses = require('../utils/httpsresponses');
const { message,status } = require('../utils/httpsresponses');
var bcrypt = require('bcryptjs');
var saltPassword = bcrypt.genSaltSync(10);



sgMail.setApiKey(process.env.SENDGRID_API_KEY)




router.post('/signup',async(req,res)=>{
    const {name,email} = req.body

    try{
        const userExists = await User.findOne({email:email});
        if(userExists){
            res.status(httpsresponses.status.CONFLICT).json({
                data:{
                    message:httpsresponses.message.USER_EXISTS
                }
            })
        }else{
            var hash = bcrypt.hashSync(req.body.password, saltPassword);
            const user = new User({
                name:req.body.name,
                email:req.body.email,
                nationality:req.body.nationality,
                password:hash,
                country:req.body.country,
                address:req.body.address,
                phoneNumber:req.body.phoneNumber,
                identificationNumber:req.body.identificationNumber,
                identificationType:req.body.identificationType,

            });
            await user.save();
            const verification_url=`${process.env.UI_BASE_URL}/user/verify/`+user._id;
            const msg = {
                to: user.email,
                from: 'abhayrpatel10@gmail.com', 
                subject: 'Verify Your Account Rapyd Pages',
                html:`<head>
                <link href="https://fonts.googleapis.com/css?family=Tomorrow:300,400,700&display=swap" rel="stylesheet"> 
        </head>
        <body style="color: black ;font-family: 'Tomorrow', sans-serif;">
            <div style="margin-top:15vh">
            <center>
               
                <h1 style="font-size:xx-large; font-optical-sizing: 10;">Rapyd Pages</h1>
                <h3>
                    <br><br>

                    
                    
                    <a href="${verification_url}" style="color:rgb(83, 157, 221)">Click this link to Verify your account</a> 
                    <br><br><br>

                    <p>If the above link does not work.Please paste this URL in your browser</p>
                    <br>
                    <p>${verification_url}</p>

                    
                    
                    
                
        
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
                        message:'User Created successfully'
                    }
                })
                })
                .catch((error) => {
                  console.error(error)
                  console.log(error.response.body)
                })
        }

        

    }catch(err){
        res.status(httpsresponses.status.SERVER_ERROR).json({
            data:{
                message:httpsresponses.message.SERVER_ERROR
            }
        })
    }

})


router.get('/verify/:id',async(req,res)=>{
    const id = req.params.id;

    try{
        const user = await User.findOne({_id:id});
        user.verified = true;
        await user.save();
        res.status(status.OK).json({
            data:{
                message:'User Verified'
            }
        })
    }catch(err){
        res.status(status.SERVER_ERROR).json({
            data:{
                message:message.SERVER_ERROR
            }
        })
    }
})

router.post('/resendVerificationEmail',async(req,res)=>{
    const email = req.body.email;

    try{
        const user = await User.findOne({email:email});
        const verification_url=`${process.env.UI_BASE_URL}/user/verify/`+user._id;
        console.log(verification_url)
            const msg = {
                to: user.email,
                from: 'abhayrpatel10@gmail.com', 
                subject: 'Verify Your Account Rapyd Pages',
                html:`<head>
                <link href="https://fonts.googleapis.com/css?family=Tomorrow:300,400,700&display=swap" rel="stylesheet"> 
        </head>
        <body style="color: black ;font-family: 'Tomorrow', sans-serif;">
            <div style="margin-top:15vh">
            <center>
               
                <h1 style="font-size:xx-large; font-optical-sizing: 10;">Rapyd Pages</h1>
                <h3>
                    <br><br>

                    
                    
                    <a href="${verification_url}" style="color:rgb(83, 157, 221)">Click this link to Verify your account</a> 
                    <br><br><br>

                    <p>If the above link does not work.Please paste this URL in your browser</p>
                    <br>
                    <p>${verification_url}</p>

                    
                    
                    
                
        
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
                        message:'User Created successfully'
                    }
                })
                })
                .catch((error) => {
                  console.error(error)
                  console.log(error.response.body)
                })

    }catch(err){
        res.status(status.SERVER_ERROR).json({
            data:{
                message:message.SERVER_ERROR
            }
        })
    }
})


router.post('/login',async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    try{
        const user= await User.findOne({email});
        if(!user){
            res.status(404).json({
                data:{
                    message:'User Not found.Please register first.'
                }
            })
        }
        if(!user.verified){
            res.status(403).send('Email verification pending.')
        }
        console.log(user);
        if(bcrypt.compareSync(password, user.password)){
            const token = await jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
            user.tokens=user.tokens.concat({token})
            await user.save();

            
            const userData = {
                name:user.name,
                email:user.email,
                wallet:user.walletId,
                customer:user.customerId,
                pages:user.pages,
                token:token,
                setup:user.setup
            }
            console.log(user);
            
            res.status(status.OK).json({
                data:userData
            })
            
            

        }else{
            res.status(401).json({
                data:{
                    message:'Invalid Credentials'
                }
            })
        }
    }catch(err){
        console.log(err);
        res.status(500).json({
            data:err
        })
    }


})

router.post('/createWallet',auth,async(req,res)=>{

    const user = req.user;

    if(user.walletId != null){
        res.status(status.CONFLICT).json({
            data:{
                message:'Wallet for this user already exists'
            }
        })
    }

    const body = {
        first_name: user.name,
        ewallet_reference_id: user._id,
        metadata: {
            merchant_defined: true
        },
        type: "person",
        contact: {
            contact_type: "personal",
            country: user.country,
            nationality: user.nationality,
            "metadata": {
                "merchant_defined": true
            }
        }
    }

    var http_method = 'post';      
    var url_path = '/v1/user';    
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
    
    axios.post(process.env.RAPYD_BASE_URL+'/v1/user',body,config).then(async result=>{
        
        user.walletId = result.data.data.id;
        console.log(result.data.data.id);
        await user.save();
        res.send(result.data)
    }).catch(err=>{
        console.log(err);
        console.log(err.response.data)
        res.send(err);
    })
})

router.post('/createCustomer',auth,async(req,res)=>{
    const user = req.user;

    if(user.customerId != null){
        res.status(status.CONFLICT).json({
            data:{
                message:'Wallet for this user already exists'
            }
        })
    }

    const body = {
        name: user.name,
        ewallet: user.walletId,
        metadata: {
            merchant_defined: true
        }
    }

    var http_method = 'post';      
    var url_path = '/v1/customers';    
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
    
    axios.post(process.env.RAPYD_BASE_URL+'/v1/customers',body,config).then(async result=>{
        
        user.customerId = result.data.data.id;
        console.log(result.data.data.id);
        await user.save();
        res.send(result.data)
    }).catch(err=>{
        console.log(err);
        console.log(err.response.data)
        res.send(err);
    })
})


router.post('/complete/setup',auth,async(req,res)=>{
    try{
        const user = req.user;
        user.setup = true;
        await user.save();
        res.status(status.OK).json({
            message:'Setup Complete'
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

router.post('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send('Logged out successfully')
    }catch(e){
        res.status(500).send('Logout Error!')
    }
})







module.exports = router;