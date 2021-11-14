const express = require('express');
const sgMail = require('@sendgrid/mail');
const Pages = require('../models/pages');
const router = express.Router();
const auth = require('../middleware/auth');


const httpsresponses = require('../utils/httpsresponses');
const { message,status } = require('../utils/httpsresponses');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/page/:id',async(req,res)=>{
    try{
        const page = await Pages.findOne({_id:req.params.id});
        if(!page){
            res.status(status.NOT_FOUND).json({
                data:{
                    message:message.NOT_FOUND
                }
            })
        }else{
            res.status(status.OK).json({
                data:page
            })
        }
    }catch(err){
        res.status(status.SERVER_ERROR).json({
            data:{
                message:message.SERVER_ERROR
            }
        })
    }
})

router.post('/pages',auth,async(req,res)=>{
    try{
        const user = req.user;
        const pages = await Pages.find({owner:user._id},'title createdAt updatedAt');
        res.status(status.OK).json({
            data:pages
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



router.post('/createPage',auth,async(req,res)=>{

    try{
        const user = req.user;


        const page = new Pages({
            title:req.body.title,
            content:req.body.content,
            walletId:user.walletId,
            customerId:user.customerId,
            owner:user._id,
            price:req.body.price,
            quantity:req.body.quantity

        })

        await page.save();
        res.status(status.OK).json({
            data:page
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


router.patch('/page/:id',auth,async(req,res)=>{
    try{
        const user = req.user;
        const page = await Pages.findOne({_id:req.params.id});


        page.content = req.body.content;
        page.title = req.body.title;
        page.images = req.body.images;
        page.price = req.body.price;
        page.quantity = req.body.quantity;

        await page.save();
        res.status(status.OK).json({
            data:page,
            message:message.CONTENT_UPDATED
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