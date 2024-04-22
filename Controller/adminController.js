const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4:uuidv4 } = require('uuid')
const Admin = require('../Model/adminModel')
const Adminotp = require('../Model/adminOtp')
const User  = require('../Model/userModel')
const { loginAdminValidator, registerAdminValidator, verifyAdminOtpValidator, 
    changeAdminPasswordValidator, resendAdminOtpValidator, resetAdminPasswordLinkValidator, 
    sendAdminPasswordValidator, updateAdminValidator, adminUpdateUserValidator} = require('../Validator/adminValidator')
const { verificationMail, passwordResetLinkMail, resendOtpMail, } = require('../Shared/mailer')



//generate OTP
const generateOtp = () => {
    const min = 100000;
    const max = 999999;
    const otp = Math.floor(min + Math.random() * (max - min) + 1).toString()
    return otp
} 


const registerAdmin = asyncHandler(async(req, res) => {
    try {
        
        const { error, value } = await registerAdminValidator(req.body, { abortEarly: false }) 
        if(error) {
            res.status(400).json(error.message)
        }

        const { username, email, password } = req.body;

        //check if admin has been registered
        const admin = await Admin.findOne({ email})
        if(admin) {
            res.status(403).json({ message: 'Admin has been registered'})
        }

        //hash the password
        const hashPassword = await bcrypt.hash(password, 10)

        //create new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashPassword
        })

        //save new admin to database
        await newAdmin.save()
        
        //send verification OTP via mail
        const verificationCode = generateOtp()
        await verificationMail(email, verificationCode, username)

        //set expiration time for the verification code
        const expire = new Date()
        expire.setMinutes(expire.getMinutes() + 5)

        //save new Otp to database
        const newOtp = new Adminotp()
        newOtp.otp = verificationCode
        newOtp.email = newAdmin.email
        newOtp.expirationTime = expire

        await newOtp.save()

        res.status(200).json(newAdmin)

    } catch (error) {
        throw error
    }
});

//admin login
const loginAdmin = asyncHandler(async(req, res) => {
    try {

        const {error, value } = await loginAdminValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const {email, password} = req.body

        //check if admin is registered
        const admin = await Admin.findOne({ email })
        if(!admin) {
            res.status(404).json({ message: 'Admin not registered, please regsiter'})
        }

        //compare the password and grant access 
        if(admin && await bcrypt.compare(password, admin.password)) {
            const accessToken = jwt.sign({
                admiin: {
                    username: admin.username,
                    email: admin.email,
                    id: admin.id
                }
            }, process.env.ACCESS_KEY,
                {expiresIn: '1yr'}
            )
            res.status(200).json(accessToken)
        } else {
            res.status(404).json({ message: 'email or password incorrect'})
        }
        
    } catch (error) {
        throw error
    }
});

//get all registered admin
const getAllAdmin = asyncHandler(async(req, res) => {
    const admin = await Admin.find()
    res.status(200).json(admin)
});

//get a particular admin
const getAdmin = asyncHandler(async(req, res) => {
    try {
        const admin = await Admin.findById(req.params.id)
    if(!admin) {
        res.status(404).json({ message: 'Admin not found'})
    } else {
        res.status(200).json(admin)
    }
    } catch (error) {
        throw error
    }
});

//verify otp
const verifyAdminOtp = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await verifyAdminOtpValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }
        
        const {  otp }  = req.body;

        //if the otp is correct
        const otpSent = await Adminotp.findOne({otp })
        if(!otpSent) {
            res.status(404).json({ message: 'the otp is not corect'})
        }

        //if the otp has expired
        if(otpSent.expirationTime <= new Date()) {
            res.status(403).json({ message: 'the otp has expired'})
        }

        //find the admin associated with the email
        const admin = await Admin.findOne({ email: otpSent.email})
        if(!admin) {
            res.status(404).json({ message: 'user and email does not match'})
        }

        //verify otp
        otpSent.verified = true

        //save to databse
        await otpSent.save()

        res.status(200).json({ message: 'otp verified'})
    } catch (error) {
        throw error
    }
});

//resend otp
const resendAdminOtp = asyncHandler(async(req, res) => {
    try {
        
        //Validate the input
        const { error, value } = await resendAdminOtpValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { email } = req.body

        //if the email is registered
        const admin = await Admin.findOne({ email })
        if(!admin) {
            res.status(404).json({ message: 'admin not registered'})
        }

        //send otp via mail
        const verificationCode = generateOtp()
        await resendOtpMail(email, verificationCode, admin.username)

        //set expiration time
        const expiration = new Date()
        expiration.setMinutes(expiration.getMinutes() + 5)

        //save new otp to database
        const sendOtp = new Adminotp()
        sendOtp.otp = verificationCode
        sendOtp.expirationTime = expiration
        sendOtp.email = admin.email

        await sendOtp.save()

        res.status(200).json({ message: 'new otp sent'})

    } catch (error) {
        throw error
    }
});

// send reset password link
const resetAdminPasswordLink = asyncHandler(async(req, res) => {
    try {
        
        //validate the input
        const { error, value } = await resetAdminPasswordLinkValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { email } = req.body;

        //if email is registered
        const admin = await Admin.findOne({ email })
        if(!admin) {
            res.status(404).json({ message: 'email not correct'})
        }

        //generate the token
        const adminToken = uuidv4()

        //craft the reset password link
        const resetLink =   `http://localhost:8000/api/admin/reset-link?token=${adminToken}email=${email}`
        //save link to database
        admin.resetLink = resetLink
        admin.isResetPasswordLinkSent = true

        await admin.save()

        //send it to the admin via mail
        await passwordResetLinkMail(email, resetLink, admin.username)

        res.status(200).json({ message: 'reset password link sent'})
        
    } catch (error) {
        throw error
    }
});

//reset password
const resetAdminPassword = asyncHandler(async(req, res) => {
    try {
        //validate the input
       const { error, value }  = await sendAdminPasswordValidator(req.body, { abortEarly: false })
       if(error) {
        res.status(400).json(error.message)
       }

       const { email, resetLink, password } = req.body;

       //check if the email is registered
       const admin = await Admin.findOne({ email })
       if(!admin) {
        res.status(404).json({ message: 'this is not the email the link was sent to'})
       }

       //valiadte the link that was sent
       if(admin.resetLink !== resetLink) {
        res.status(404).json({ message: 'wrong reset link'})
       }

       //set expiration time for link
       const expiryLink = new Date()
       expiryLink.setMinutes(expiryLink.getMinutes() + 5)

       //hash the new  password
       const hashResetPassword = await bcrypt.hash(password, 10)

       //save to database
       admin.password = hashResetPassword
       admin.expirationTime = expiryLink
       admin.isResetPasswordLinkSent = false
       
       res.status(200).json({ message: 'password reset successfully'})

    } catch (error) {
        throw error
    }
});

//change password
const changeAdminPassword = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await changeAdminPasswordValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }
         
        const { email, oldPassword, newPassword } = req.body;

        //check if admin is registered
        const admin = await Admin.findOne({ email })
        if(!admin) {
            res.status(404).json({ message: 'wrong email'})
        }

        //if the  password entered matches the exixting password
        if(admin && bcrypt.compare(oldPassword, admin.password)) {
    
        //hash password
        const hashpass = await bcrypt.hash(newPassword, 10)

        //save new password to database
        admin.password = hashpass

        await admin.save()

        } else {
            res.status(404).json({ message: 'incorrect password'})
        }
        
        res.status(200).json({ message: 'password changed'})

    } catch (error) {
        throw error
    }
});


//update admin profile
const updateAdmin = asyncHandler(async(req, res) => {
    try {
        
        const { error, value } = await updateAdminValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { id } = req.params

        const { username, email, password } = req.body;

        const admin = await Admin.findById(id)
        if(!admin) {
            res.status.apply(404).json({ message: 'cant find admin'})
        }

        //update changes
        admin.username = username
        admin.email = email
        admin.password = password

        //save to database
        await admin.save()

        res.status(200).json({ message: 'admin updated' })

    } catch (error) {
        throw error
    }
});

//delete admin 
const deleteAdmin = asyncHandler(async(req, res) => {
    try {
        const { id } = req.params
        const admin = await Admin.findById(id)
        if(!admin) {
            res.status(400).json({ message: 'not admin'})
        }

        const removeAdmin = await Admin.deleteOne({ _id: req.params.id })
        res.status(200).json({ message: 'Admin delete'})

    } catch (error) {
        throw error
    }
});


//delete user account
const deleteUserAccount = asyncHandler(async(req, res) => {
    try {

        const {id} = req.params

        //check if teacher is registered
        const user = await User.findById(id)
        if (!user) {
            res.status(404).json({ message: 'admin cannot find user'})
        }

         const userAccount = await Teacher.deleteOne({_id: id})
         res.status(200).json({ message: 'user profile deleted'})

    } catch (error) {
        throw error
    }
});

 

//update teacher user account
const updateUserProfile = asyncHandler(async(req, res) => {
    try {
        
        const { error, value } = await adminUpdateUserValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { id } = req.params

        const {email, username} = req.body;

        //if teacher is regsiterd
        const user = await User.findById(id)
        if(!user) {
            res.status(404).json({ message: 'not user'})
        }

        //update the user profile
        user.email = email
        user.username = username

        //save changes to database
        await user.save()

        res.status(200).json({ message: 'user profile updated'})

    } catch (error) {
        throw error
    }
});


 
 
module.exports = {
    registerAdmin,
    loginAdmin,
    getAllAdmin,
    updateUserProfile,
    deleteUserAccount,
    deleteAdmin,
    updateAdmin,
    verifyAdminOtp,
    resendAdminOtp,
    resetAdminPassword,
    getAdmin,
    resetAdminPasswordLink,
    changeAdminPassword
}