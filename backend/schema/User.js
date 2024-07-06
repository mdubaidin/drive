import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { emailValidator } from '../utils/validators.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const PRIVATE_KEY = fs.readFileSync('./certs/private.pem', 'utf8');

const providers = ['google', 'facebook'];

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: emailValidator,
                message: props => `${props.value} is not a valid email address!`,
            },
        },
        name: {
            type: String,
            trim: true,
            minlength: 3,
            maxlength: 40,
            required: true,
        },
        password: {
            type: String,
            minlength: 8,
            required: true,
        },
        provider: {
            type: String,
            enum: providers,
        },
        providerId: {
            type: String,
            sparse: true,
            required: function () {
                return providers.includes(this.provider);
            },
        },
        picture: String,
        refreshToken: String,
        storage: { type: String, default: '5242880' },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        dob: {
            type: Date,
        },
        otp: {
            email: {
                type: String,
            },
        },
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

const encryptPassword = async function (next) {
    if (this.isModified('password')) {
        this.password = await this.convertPasswordToHash(this.password);
    }
    next();
};

userSchema.pre(['save'], encryptPassword);

userSchema.methods = {
    isAuthorized: async function (password) {
        return bcrypt.compare(password, this.password);
    },
    isUnauthorized: async function (password) {
        const authorized = await this.isAuthorized(password);
        return Boolean(!authorized);
    },
    convertPasswordToHash: async function (password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    },

    removeSensitiveInfo: function () {
        var obj = this.toObject();
        delete obj.password;
        return obj;
    },

    signAccessToken: function () {
        return jwt.sign({ id: this._id }, PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: process.env.EXPIRE_JWT_ACCESS_TOKEN,
        });
    },

    signRefreshToken: function () {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error('JWT_SECRET is undefined');

        return jwt.sign({ id: this._id }, JWT_SECRET, {
            expiresIn: process.env.EXPIRE_JWT_REFRESH_TOKEN,
        });
    },
};

export default model('User', userSchema);
