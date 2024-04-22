const express = require('express')
const router = express.Router()
const Controller = require('../Controller/userController')



//create user
router.post('/register', Controller.createUser)

//user login
router.post('/login', Controller.userLogin)

//get all users
router.get('/get', Controller.getUsers)

//get a user
router.get('/get/:id', Controller.getUser)

//verify otp
router.post('/verify-otp', Controller.verifyOtp)

//update user
router.put('/update/:id', Controller.updateUser)

//delete user
router.delete('/delete/:id',Controller.deleteUser)

//resend otp
router.post('/resend-otp', Controller.resendUserOtp)

//reset password link
router.post('/reset-password-link', Controller.resetUserPasswordLink)

//reset password
router.post('/reset-password', Controller.resetPassword)

//change password
router.patch('/change-password', Controller.changePassword)

//create new task
router.post('/create-task', Controller.createTask)

//update task
router.put('/update-task/:id', Controller.updateTask)

//delete task 
router.delete('/delete-task/:id', Controller.deleteTask)

//get task 
router.get('/get-task/:id', Controller.getTask)

//get all task
router.get('/get-task', Controller.getTasks)

//reminder
router.get('/reminder/:id', Controller.taskReminder)



module.exports = router;