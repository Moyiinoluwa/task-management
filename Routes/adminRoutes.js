const express = require('express')
const router = express.Router()
const Controller = require('../Controller/adminController')
const validate = require('../Middleware/validateToken')
const isAdmin = require('../Middleware/validateToken')

//register
router.post('/register', Controller.registerAdmin )

 //login
 router.post('/login', Controller.loginAdmin)

 //get all admin
 router.get('/get', Controller.getAllAdmin)

 //get an admin
 router.get('/get/:id', Controller.getAdmin)

 //verify otp 
 router.post('/verify-otp', Controller.verifyAdminOtp)

 //resend otp
 router.post('/resend-otp', Controller.resendAdminOtp)

 //send reset password link
 router.post('/send-reset-password', Controller.resetAdminPasswordLink)

 //reset password
 router.post('/reset-password', Controller.resetAdminPassword)

 //change password
// router.patch('/change-password', validate, Controller.changeAdminPassword)

 //delete admin profile
 router.delete('/delete/:id',  Controller.deleteAdmin)

 //update admin profile
 router.put('/update/:id',  Controller.updateAdmin)

 //admin delete user
//  router.delete('/delete-user/:id',isAdmin, validate, Controller.deleteUserAccount)

//  //update user
//  router.put('/update-user/:id', isAdmin, validate, Controller.updateUserProfile)

 //send email to teacher
 //router.post('/send-email', validate, Controller.sendMailToTeachers)


 module.exports = router;