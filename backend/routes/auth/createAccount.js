import User from '../../schema/User.js';
import { generateOTP, generateTemplate } from '../../utils/utils.js';
import OTP from '../../schema/OTP.js';
import CustomError from '../../classes/CustomError.js';
import fs from 'fs';
import transporter from '../../libs/nodemailer.js';

const createAccount = async function (req, res, next) {
    try {
        const { name, email, password, otp } = req.body;

        if (!otp) throw new CustomError('OTP must be provided');

        const isVerified = await OTP.countDocuments({ email, otp });

        if (!isVerified) throw new CustomError('Your entered code is Invalid', 200);

        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();

        const user = newUser.removeSensitiveInfo();

        res.success({
            message: 'user created',
            user,
        });
    } catch (e) {
        next(e);
    }
};

const initiateEmail = async function (req, res, next) {
    try {
        const { email } = req.body;
        const otp = generateOTP(6);

        const isEmailExists = await User.countDocuments({ email });

        if (isEmailExists) throw new CustomError('Email address already taken by someone');

        await OTP.deleteMany({ email, type: 'email-confirmation' });

        await OTP.create({ email, otp, type: 'email-confirmation' });

        const html = fs.readFileSync('templates/email/emailConfirmation.html', {
            encoding: 'utf-8',
        });

        const template = generateTemplate(html, { email, code: otp });

        transporter.sendMail({
            from: 'Drive <onboarding@resend.dev>',
            to: email, // list of receivers
            subject: 'Drive: Email verification',
            html: template, // html body
        });

        res.success('');
    } catch (e) {
        next(e);
    }
};

export { createAccount, initiateEmail };
