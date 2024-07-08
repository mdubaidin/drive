import { useState } from 'react';

const useModal = (config = {}) => {
    const { openModal = null, closeModal = null } = config;
    const [state, setState] = useState(false);

    const getCloseModal = () => {
        if (typeof closeModal === 'function') {
            return closeModal(setState);
        }
        return setState(false);
    };

    const getOpenModal = () => {
        if (typeof openModal === 'function') {
            return openModal(setState);
        }
        return setState(true);
    };

    return { modalState: state, closeModal: getCloseModal, openModal: getOpenModal };
};

export default useModal;
