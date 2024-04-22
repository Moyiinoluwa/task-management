const asyncHandler = require('express-async-handler')
const  User = require('../Model/userModel')
const Otp = require('../Model/userOtpModel')
const Task = require('../Model/taskModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 }  = require('uuid')

const { verificationMail, resendOtpMail, passwordResetLinkMail } = require('../Shared/mailer')
const { registrationValidator, loginValidator, verifyOtpValidator,
     updateUserValidator,  resendOtpValidator,  resetPasswordLinkValidator, resetPasswordValidator, changePasswordValidator, createTaskValidator, updateaskValidator} = require('../Validator/userValidator')


//generate OTP code for verification
const verficationCode = () => {
    const min = 100000
    const max = 999999
    const otp = Math.floor(min + Math.random() * (max - min) + 1).toString()
    return otp
} 

//Register a new user
const createUser = asyncHandler(async(req, res) => {
    try {
        //validate the input 
        const { error, value } = await registrationValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { username, email, password } = req.body

        //Check if user has created an account before
        const user = await User.findOne({ email })
        if(user) {
            res.status(403).json({ message: 'User already exist' })
        }

        //hash user password
        const hashPassword = await bcrypt.hash(password, 10)

        //create new user
        const newUser = new User({
            username,
            email, 
            password: hashPassword
        })

        //save to database
        await newUser.save()

        //send user verfication code via mail
        const verfication = verficationCode()
        await verificationMail(email, verfication, username)

        //set expiry time for verification code
        const otpTime = new Date()
        otpTime.setMinutes(otpTime.getMinutes() + 5)

        //save Otp to database
        const newOtp = new Otp()
           newOtp.otp = verfication 
           newOtp.email = newUser.email
           newOtp.expirationTime = otpTime

        await newOtp.save()
    
        res.status(200).json(newUser)

    } catch (error) {
        throw error
    }
});

//User login
const userLogin = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await loginValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(200).json(error.message)
        }

        const { email, password } = req.body

        //check if user is registered
        const user = await User.findOne({ email })
        if(!user) {
            res.status(404).json({ message: 'User has not been registered'})
        }

        //compare the password and grant access
        if(password && await bcrypt.compare(password, user.password)) {

            accessToken = jwt.sign({
                user: {
                    email: user.email,
                    username: user.username,
                    id: user.id
                }
                //set the acces key
            }, process.env.ACCESS_KEY, 
            //expiration time
            { expiresIn: '1yr'})
            
            res.status(200).json(accessToken)
        } else {
            res.status(404).json({ message: 'email or password incorrect'})
        }

    } catch (error) {
        throw error
    }
});

//get all users
const getUsers = asyncHandler(async(req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (error) {
        throw error
    }
});

//get a user
const getUser = asyncHandler(async(req, res) => {
    try {
        //check if user exist
        const user = await User.findById(req.params.id) 
        if(!user) {
            res.status(404).json({ message: 'user not found'})
        } else {
            res.status(200).json(user)
        }

    } catch (error) {
        throw error
    }
});

//update user profile
const updateUser = asyncHandler(async(req, res) => {
    try {
        const { error, value } = await updateUserValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { email, username } = req.body

        const user = await User.findByIdAndUpdate(req.params.id) 
        if(!user) {
            res.status(404).json({ message: 'user error'})
        }
        //update
        user.email = email
        user.username = username

        res.status(200).json(user)

    } catch (error) {
        throw error
    }
});

//delete user 
const deleteUser = asyncHandler(async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user) {
            res.status(404).json({ message: 'cannot delete user'})
        } else {
            res.status(200).json({ message: 'user deleted'})
        }
    } catch (error) {
        throw error
    }
});


//verify OTP
const verifyOtp = asyncHandler(async (req, res) => {
    try {
        // Validate the input (you might still want to validate the OTP)
        const { error, value } = await verifyOtpValidator(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json(error.message);
        }

        const { otp } = req.body;

        // check if the otp is correct
        const userOtp = await Otp.findOne({ otp });
        if (!userOtp) {
            res.status(404).json({ message: 'The OTP is incorrect or has expired' });
        }

        // Check if the OTP has expired
        if (userOtp.expirationTime <= new Date()) {
            res.status(403).json({ message: 'OTP has expired, request for a new one' });
        }

        //find the user whose email matches the email associated with the provided OTP. 
        const user = await User.findOne({ email: userOtp.email });
        if (!user) {
            res.status(404).json({ message: 'No user found for the provided OTP' });
        }

        // Verify the OTP
        userOtp.verified = true;

        // Save changes to the OTP
        await userOtp.save();

        res.status(200).json({ message: 'OTP verified' });
    } catch (error) {
        throw error;
    }
});


//resend otp
const resendUserOtp = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await resendOtpValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { email } = req.body
        
        //check if email is registered
        const user = await User.findOne({ email }) 
        if(!user) {
            res.status(404).json({ message: 'user email not registered'})
        }

        //Generate otp 
        const otpCode = verficationCode()

        //send otp to user via mail
        await resendOtpMail(email, otpCode, user.username)

        //set expiry time for otp
        const otpTime = new Date()
        otpTime.setMinutes(otpTime.getMinutes() + 5)

        //send otp
        const otpTwo = new Otp()
        otpTwo.email = email
        otpTwo.otp = otpCode
        otpTwo.expirationTime = otpTime

        //save to database
        await otpTwo.save()

        res.status(200).json({ message: 'New otp sent'})

    } catch (error) {
        throw error
    }
});

//send reset password link
const resetUserPasswordLink = asyncHandler(async(req, res) => {
    try {
        const { error, value } = await resetPasswordLinkValidator(req.body, { abortEarly: false})
        if(error) {
            res.status(400).json(error.message)
        }

        const { email } = req.body

        //find user by email 
        const user = await User.findOne({ email })
        if(!user) {
            res.status(404).json({ message: 'user cannot reset password link'})
        }

        //generate reset token
        const resetToken = uuidv4()

        //set exipration time for token
        const tokenExpiration = new Date()
        tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 5)

        //craft the reset password link
        const resetLink = `http://localhost:6000/api/user/reset-password?token=${resetToken}&email=${email}`

        //save to database
        user.resetLink = resetLink
        user.resetLinkExpirationTime = tokenExpiration
        user.isResetPasswordLinkSent = true

        await user.save()

        //send the link to the user via mail
        await passwordResetLinkMail(email, resetLink, user.username)

        res.status(200).json({ message: 'reset link sent'})

    } catch (error) {
        throw error
    }
});

//reset password
const resetPassword = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await resetPasswordValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { email, resetLink, password } = req.body
        //check if user is registered
        const user = await User.findOne({ email })
        if(!user) {
            res.status(404).json({ message: 'user cannot change password'})
        }

        //check if the reset link is valid
        if(user.resetLink !== resetLink) {
            res.status(403).json({ message: 'invalid reset link'})
        }

        //set expiration time for resetlink
        const resetExpirationTime = new Date()
        resetExpirationTime.setMinutes(resetExpirationTime.getMinutes() + 5)

        //hash password 
        const hash = await bcrypt.hash(password, 10)

        //set new password
        user.password = hash
        user.expirationTime = resetExpirationTime

        //save to database
        await user.save()

    } catch (error) {
        throw error
    }
});

//change password
const changePassword = asyncHandler(async(req, res) => {
    try {
        const { error, value } = await changePasswordValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { id } = req.params

        const { oldPassword, newPassword } = req.body;

        //identify the user
        const user = await User.findById(id)
        if(!user) {
            res.status(404).json({ message: 'user cannot change password'})
        }

        //compare the old password with the password the user entered
        if(oldPassword && await bcrypt.compare(oldPassword, user.password)) {

            //hash new password
            const hash = await bcrypt.hash(newPassword, 10)

            //update the new password
            user.password = hash

            //save new password to database
            await user.save()

            res.status(200).json({ message: 'password changed successfully'})
        } else {
            res.status(404).json({ message: 'incorrect password'})
        }

    } catch (error) {
        throw error
    }
});


//create task
const createTask = asyncHandler(async(req, res) => {
    try {
        const { error, value } = await createTaskValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        //required fields from request body
        const { title, description, deadline } = req.body;
        const { user_id } = req.user;
        //create a new task
        const newTask = new Task({
            title,
            description,
            deadline,
            user: user_id
        });

        //save to database
        await newTask.save()

        res.status(200).json(newTask)

    } catch (error) {
        throw error
    }
});

//update task
const updateTask = asyncHandler(async(req, res) => {
    try {
        const { error, value } = await updateaskValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        //request id from the parameter
        const { id } = req.params

        //required fields from request body
        const { title, description, deadline } = req.body;

        //find task
        const task = await Task.findByIdAndUpdate(id)
        if(!task) {
            res.status(404).json({ message: 'User cannot update task'})
        }
        
        //update task
        task.title = title
        task.description = description
        task.deadline = deadline

        //save updated task to databse
        await task.save()

        res.status(200).json(task)
    
    } catch (error) {
        throw error
    }
});

//delete task
const deleteTask = asyncHandler(async(req, res) => {
    try {
        //required id from request parameter
        const { id } = req.params

        //find task by ID
        const task = await Task.findByIdAndDelete(id)
        if(!task) {
            res.status().json({ message: 'cant delete task'})
        } else {
            res.status(200).json({ message: 'task deleted'})
        }
    } catch (error) {
        throw error
    }
});

//get a task 
const getTask = asyncHandler(async(req, res) => {
    try {
        //id from request parameter
        const { id } = req.params

        // find the task by id
        const task = await Task.findById(id)
        if(!task) {
            res.status(404).json({ message: 'cannot find task'})
        } else {
            res.status(200).json(task)
        }
    } catch (error) {
        throw error
    }
});

//get all task 
const getTasks = asyncHandler(async(req, res) => {
    try {
        const task = await Task.find()

        res.status(200).json(task)

    } catch (error) {
        throw error
    }
});

//get reminder for tasks
const taskReminder = asyncHandler(async(req, res) => {
    try {
        const { id } = req.params

        //locate the task
        const task = await Task.findById(id) 
        if(!task) {
            res.status(404).json({ message: 'invalid task' })
        }

        //set reminder
        const reminder = new Date(task.deadline)
        reminder.setDate(reminder.getDate() - 2)

        if(new Date() <  reminder) {
            res.status(200).json({ message: 'Task is due in 2 days' })
        }
        
    } catch (error) {
        throw error
    }
});

//user set reminder for task
const setReminder = asyncHandler(async(req, res) => {
    try {
        const { id } = req.params

        const { setReminder } = req.body

        //get the task
        const task = await Task.findById(id)
        if(!task) {
            res.status(404).json({ message: 'Cannot set reminder'})
        }

        //Set reminder fo task
        task.setReminder = setReminder

        res.status(200).json({ message: 'Task reminder set'})
    } catch (error) {
        throw error
    }
});

//check status of the task
// const taskStatus = asyncHandler(async(req, res) => {
//     try {
//         const { id } = req.params
//         //find the task
//         const task = await Task.findById(id)
//         if(!task) {
//             res.status(404).json({ message: 'cannot locate task'})
//         }

//         if(task)
//     } catch (error) {
//         throw error
//     }
// });


module.exports = {
    createUser,
    userLogin,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    resendUserOtp,
    verifyOtp,
    resetUserPasswordLink,
    resetPassword,
    changePassword,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    getTasks,
    taskReminder
}