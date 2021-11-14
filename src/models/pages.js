const mongoose = require('mongoose');
const validator = require('validator');

const pagesSchema=mongoose.Schema({
    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    customerId:{
        type:String,
        required:true
    },
    images:[],
    title:{
        type:String
    },
    content:{
        type:String
    },
    walletId:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        default:0
    }
    
},{
    timestamps:true
})


const Pages=mongoose.model('Pages',pagesSchema);
module.exports=Pages;