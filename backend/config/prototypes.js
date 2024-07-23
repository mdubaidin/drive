import express from 'express';

express.response.success = function (res) {
    if (typeof res === 'string')
        return this.json({
            message: res,
            success: true,
        });

    return this.json({
        ...res,
        success: true,
    });
};

express.response.error = function (res) {
    if (typeof res === 'string' || Array.isArray(res))
        return this.json({
            errors: Array.isArray(res) ? res : [res],
            success: false,
        });

    return this.json({
        ...res,
        success: false,
    });
};

Error.throw = function (msg, code = 400) {
    const error = new Error(msg);
    error.code = code;
    error.name = 'CustomError';
    throw error;
};
