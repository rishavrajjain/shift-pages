const mongoose = require('mongoose');
const validator = require('validator');

const buyerSchema=mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },
    purchasePage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Pages'
    },
    paymentStatus:{
        type:String,
        default:'INITIATED'
    },
    phoneNumber:{
        type:String
    },
    address:{
        type:String
    },pincode:{
        type:String
    },
    amount:{
        type:Number
    },
    quantity:{
        type:Number
    },
    delivered:{
        type:String,
        default:'NOT DELIVERED'
    }

    
},{
    timestamps:true
})


const Buyer=mongoose.model('Buyer',buyerSchema);
module.exports=Buyer;