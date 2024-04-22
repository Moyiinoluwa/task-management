const joi = require('joi')

const validator = (schema) => (payload) =>
schema.validate(payload, { abortEarly: false})


//create user
const registrationValidator = joi.object({
    username: joi.string().lowercase().required(),
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).max(16).required()
});


//login
const loginValidator = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).max(16).required()
});

//update user 
const updateUserVaildator = joi.object({
    username: joi.string().lowercase().required(),
    email: joi.string().email().lowercase().required()
});

//verify otp code
const verifyOtpValidator = joi.object({
    otp: joi.string().min(6).max(6).required()
});


//resend otp
const resendOtpValidator = joi.object({
    email: joi.string().email().lowercase().required()
});

//reset password link
const resetlinkValidator = joi.object({
    email: joi.string().email().lowercase().required(),
});

//change password
const changePasswordValidator = joi.object({
    oldPassword: joi.string().min(8).max(16).required(),
    newPassword: joi.string().min(8).max(16).required()
});


//reset password
const resetPasswordValidator = joi.object({
    resetLink: joi.string().required(),
    email: joi.string().email().lowercase().required()
});

//create task
const createTaskValidator = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    deadline:joi.string().required()
});

const updateaskValidator = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    deadline:joi.string().required()
});

exports.registrationValidator = validator(registrationValidator)
exports.loginValidator = validator(loginValidator)
exports.updateUserVaildator = validator(updateUserVaildator)
exports.verifyOtpValidator = validator(verifyOtpValidator)
exports.resendOtpValidator = validator(resendOtpValidator)
exports.resetlinkValidator = validator(resetlinkValidator)
exports.changePasswordValidator = validator(changePasswordValidator)
exports.resetPasswordValidator = validator(resetPasswordValidator)
exports.createTaskValidator = validator(createTaskValidator)
exports.updateaskValidator = validator(updateaskValidator)