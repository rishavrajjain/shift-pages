const status = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    CONFLICT: 409,
    UNPROCESSABLE_REQUEST: 422,
    UNAUTHORIZED:401
  }
  
const message = {

    SERVER_ERROR: 'Server Error. Something went wrong on our system.We are looking into it.Sorry for the incovienience.',
    CONTENT_DELETED: 'Content has been Successfully Deleted',
    USER_EXISTS: 'User already exists.Please check your email or try with an another email',
    CONTENT_UNAUTHORIZED: 'You do not have acced to edit/delete the content',
    OWNER_ALLOCATED: 'Owner Allocated',
    OWNER_CONFLICT: 'Owner Already Allocated',

    
    
  }
  
module.exports= { 
    status:status, 
    message:message 
};