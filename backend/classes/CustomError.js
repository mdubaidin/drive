class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'CustomError';
        this.message = message;
        this.statusCode = statusCode || 400;
    }
}

export default CustomError;
