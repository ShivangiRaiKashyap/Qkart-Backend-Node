const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const { http } = require("winston");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUser() function

/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - Return the whole user object fetched from Mongo

 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 *
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3
 * Response - 
 * {
 *     "walletMoney": 500,
 *     "address": "ADDRESS_NOT_SET",
 *     "_id": "6010008e6c3477697e8eaba3",
 *     "name": "crio-users",
 *     "email": "crio-user@gmail.com",
 *     "password": "criouser123",
 *     "createdAt": "2021-01-26T11:44:14.544Z",
 *     "updatedAt": "2021-01-26T11:44:14.544Z",
 *     "__v": 0
 * }
 * 
 * 
 * * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3?q=address
 * Response - 
 * {
 *   "address": "ADDRESS_NOT_SET"
 * }
 * 
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 */
const getUser = catchAsync(async (req, res) => {
    const id=req.params.id;
    const address=req.query.q
    if(address){
      const d=await userService.getUserAddressById(id)
      const add={
        "address":d.address
      }
      return res.status(200).json(add)
    }  
    let user
    if(id){
      try{
        user=await userService.getUserById(id)
      }catch(err){
        throw new ApiError(400,err.message)
      }
      if(user){

        const obj={
          _id:user._id.toString(),
          email:user.email,
          name:user.name,
          walletMoney:user.walletMoney
        }
        return res.status(200).json(obj)
      }else{
        throw new ApiError(httpStatus.NOT_FOUND,"User not found")
      }
    }else{
      const email=req.query.email
      try{
        user=await userService.getUserById(email)
      }catch(err){
        throw new ApiError(httpStatus.NOT_FOUND,err.message)
      }
      if(user){
        const obj={
          _id:user._id.toString(),
          email:user.email,
          name:user.name,
          walletMoney:user.walletMoney
        }
        return res.status(200).json(obj)
      }else{
        throw new ApiError(httpStatus.NOT_FOUND,"User not found")
      }
    }
   
});

const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  const address = await userService.setAddress(user, req.body.address);

  res.status(200).send({
    address: address,
  });
});





module.exports = {
  getUser,setAddress
};
