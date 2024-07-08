import React from 'react';

const Form = props => {
    const { children, onSubmit, ...rest } = props;

    const submit = e => {
        e.preventDefault();
        e.stopPropagation();
        if (onSubmit) onSubmit();
    };

    return (
        <form onSubmit={submit} {...rest}>
            {children}
        </form>
    );
};

export default Form;
