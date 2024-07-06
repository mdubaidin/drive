const generateAccessToken = user => {
    return user.signAccessToken();
};

const generateRefreshToken = async user => {
    const refreshToken = user.signRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    console.log('refresh token saved');
    return refreshToken;
};

const generateJwtPair = async user => {
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return { accessToken, refreshToken };
};

export { generateJwtPair, generateAccessToken, generateRefreshToken };
