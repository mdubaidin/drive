import { useCallback } from 'react';
import { useMessage } from '../providers/Provider';
import { isEmpty, isObject } from '../utils/function';
import useSignOut from 'react-auth-kit/hooks/useSignOut';

const useErrorHandler = () => {
    const { showError } = useMessage();
    const signOut = useSignOut();

    const getMessage = useCallback(function (error) {
        const field = Object.keys(error)[0];
        const fieldValue = error[field];

        if (!field) return 'Unable to encounter the error';

        if (typeof fieldValue === 'string') return fieldValue;

        if (Array.isArray(fieldValue)) {
            const innerField = fieldValue.shift();

            if (isObject(innerField) && !isEmpty(innerField)) {
                const firstField = Object.keys(innerField)[0];
                const firstFieldValue = innerField[firstField];

                if (typeof firstFieldValue === 'string') return firstFieldValue;
            }

            if (typeof innerField === 'string') return innerField;

            if (typeof innerField !== 'string') return getMessage(innerField);
        }
    }, []);

    const errorHandler = useCallback(
        error => {
            console.info(error);
            if (error.response) {
                const data = error.response.data;
                const status = error.response.status;
                const headers = error.response.headers;

                const message = data ? getMessage(data) : '';

                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(data);
                console.log(status);
                console.log(headers);

                // SERVER ERROR
                if (status === 500)
                    return showError(
                        'Internal Server Error. Oops! Something went wrong on our end.'
                    );

                if (status === 501)
                    return showError(
                        `Not Implemented. The server doesn't support this functionality. Check your request first`
                    );

                if (status === 502)
                    return showError(
                        'Bad Gateway. The server received an invalid response. Please try again later'
                    );

                if (status === 503)
                    return showError(
                        'Service Unavailable. The server is temporarily busy. Please try again later.'
                    );

                if (status === 504)
                    return showError(
                        `Gateway Timeout. Sorry, we're experiencing delays the server is taking too long to respond.`
                    );

                // CLIENT ERROR
                if (status === 400)
                    return showError(message || `Ensure you've entered valid information.`);

                if (status === 401) {
                    showError(
                        message ||
                            `Unauthorized: Access Denied. Verify your credentials and try again. `
                    );
                    signOut();

                    return window.location.replace('/');
                }

                if (status === 403) {
                    return showError(
                        `Access to this resource is denied. You may not have the necessary permissions.`
                    );
                }

                if (status === 404) return showError(`We can't find what you are looking for.`);

                if (status === 409)
                    return showError(
                        message ||
                            `It seems there's a conflict between your request and the current state of the resource.`
                    );

                if (data.errors) {
                    showError(
                        data.errors || 'Our server encountered an error, Please try again later'
                    );
                }
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
                return showError(error.message);
            }
        },
        [showError, getMessage] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return errorHandler;
};

export default useErrorHandler;
