import { model, Schema, Types } from 'mongoose';
const required = true;

const Platform = new Schema({
    logo: {
        type: String,
        trim: true,
    },
    textLogo: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        enum: [
            'cmail',
            'ads',
            'campaigns',
            'projects',
            'host',
            'pitch',
            'e-sign',
            'files',
            'launch',
            'hr',
        ],
        required: true,
    },
});

const sharedWith = new Schema({
    userId: { type: Types.ObjectId, required, unique: true },
    email: { type: String, required, unique: true },
    access: {
        type: String,
        default: 'viewer',
        enum: ['viewer', 'commenter', 'editor', 'remove'],
    },
});

const fileSchema = new Schema(
    {
        name: { type: String, required },
        key: { type: String, default: '' },
        file: { type: Boolean, required, default: true },
        mimetype: {
            type: String,
            required: function () {
                return this.file;
            },
        },
        size: {
            type: Number,
            required: function () {
                return this.file;
            },
        },
        userId: { type: Types.ObjectId, required },
        available: { type: Boolean, default: true },
        platform: {
            type: Platform,
            required: function () {
                return !this.available;
            },
        },
        favorite: { type: Boolean, default: false },
        trash: { type: Boolean, default: false },
        showInTrash: { type: Boolean, default: false },
        showInShare: { type: Boolean, default: false },
        access: {
            type: { type: String, default: 'private', enum: ['public', 'private', 'protected'] },
            access: {
                type: String,
                default: 'viewer',
                enum: ['viewer', 'commenter', 'editor'],
                required: function () {
                    return this.type === 'public';
                },
            },
            password: {
                type: String,
                required: function () {
                    return this.type === 'protected';
                },
            },
        },
        sharedWith: [sharedWith],
    },
    {
        timestamps: true,
    }
);

fileSchema.methods = {
    getTextLogo: function (platform) {
        this.platform.textLogo = `${process.env.CDN_SERVER}/images/${platform}/logo/2023/${platform}-text.png `;
    },
    getLogo: function (platform) {
        this.platform.logo = `${process.env.CDN_SERVER}/images/${platform}/logo/2023/${platform}.png `;
    },
};

export default model('file', fileSchema);
