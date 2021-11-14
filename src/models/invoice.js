const mongoose = require('mongoose');
const validator = require('validator');

const invoiceSchema=mongoose.Schema({
    name:{
        type:String,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
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
    paymentStatus:{
        type:String,
        default:'INITIATED'
    },
    phoneNumber:{
        type:String
    },
    address:{
        type:String
    },
    amount:{
        type:Number
    },
    details:{
        type:String
    },
    title:{
        type:String
    }

    
},{
    timestamps:true
})


const Invoice=mongoose.model('Invoice',invoiceSchema);
module.exports=Invoice;