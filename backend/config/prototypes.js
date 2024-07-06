import express from 'express';

express.response.success = function (res) {
    if (typeof res === 'string')
        return this.json({
            success: true,
            message: res,
        });

    return this.json({
        success: true,
        ...res,
    });
};

express.response.error = function (res) {
    if (typeof res === 'string' || Array.isArray(res))
        return this.json({
            success: false,
            errors: Array.isArray(res) ? res : [res],
        });

    return this.json({
        success: false,
        ...res,
    });
};

Error.throw = function (msg, code = 400) {
    const error = new Error(msg);
    error.code = code;
    error.name = 'CustomError';
    throw error;
};
