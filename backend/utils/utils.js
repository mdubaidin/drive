import CustomError from '../classes/CustomError.js';

function filterObject(obj, values) {
    const k = {};
    values.forEach(key => {
        if (obj.hasOwnProperty(key)) k[key] = obj[key];
    });
    return k;
}

function generateOTP(length, options) {
    var chars = '';

    if (options) {
        const keys = Object.keys(options);
        keys.forEach(key => {
            if (options[key] === true) {
                switch (key) {
                    case 'digits':
                        chars += '0123456789';
                        break;
                    case 'alphabets':
                        chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                        break;
                    case 'upperCase':
                        chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                        break;
                    case 'specialChars':
                        chars += '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
                        break;
                    default:
                        chars += '0123456789';
                        break;
                }
            }
        });
    } else {
        chars = '0123456789';
    }

    var otp = '';

    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
    }

    return otp;
}

function generateTemplate(template, data) {
    if (!template) throw new CustomError('Template must be provided');

    data.server = process.env.SERVER_URL;

    const keys = Object.keys(data);
    keys.forEach(key => {
        const regex = new RegExp(`{{${[key]}}}`, 'gi');
        template = template.replace(regex, data[key]);
    });

    return template;
}

const isDefined = a => typeof a !== 'undefined';

export { generateTemplate, generateOTP, filterObject, isDefined };
