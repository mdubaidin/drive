class CustomError extends Error {
    statusCode;

    constructor(message, statusCode) {
        super(message);
        this.name = 'CustomError';
        this.message = message;
        this.statusCode = statusCode || 400;
    }
}

export default CustomError;
