const setCookie = (res, name, value, options) => {
    res.cookie(name, value, { secure: true, httpOnly: true, sameSite: 'strict', ...options });
};

const clearCookie = (res, name, options) => {
    res.clearCookie(name, { secure: true, httpOnly: true, sameSite: 'strict', ...options });
};

export { setCookie, clearCookie };
