const mongoose = require('mongoose');
const validator = require('validator');

const userSchema=mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        required:true,
        type:String,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },
    setup:{
        type:Boolean,
        default:false
    },
    verified:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true
    },
    tokens:[
        {
        token:{
            type:String
        }
    }],
    walletId:{
        type:String,
        default:null
    },
    customerId:{
        type:String
    },
    securityQuestions:[
        {
            question:{
                type:String
            },
            answer:{
                type:String
            }
        }
    ],
    pages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Pages'
    }],
    phoneNumber:{
        type:String
    },
    nationality:{
        type:String
    },
    country:{
        type:String
    }

    
},{
    timestamps:true
})


const User=mongoose.model('User',userSchema);
module.exports=User;