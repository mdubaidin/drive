import { AdobeFiles, CodeFiles, GeneralFiles, MicrosoftFiles } from '../services/extension';

const link = path => process.env.REACT_APP_MAIN_SITE + path;

function env(name) {
    const nodeENV = process.env.NODE_ENV.toUpperCase();

    return process.env[`REACT_APP_${nodeENV}_${name}`] || process.env[`REACT_APP_${name}`];
}

function parseKB(KB) {
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    if (KB === 0) return '0 KB';
    const i = Math.floor(Math.log2(KB) / 10);
    return `${parseFloat((KB / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

function getFolderName(key) {
    const startIndex = key.search(/\/[a-zA-Z0-9-_ ]+\/$/gi);
    return key.slice(startIndex + 1, -1);
}

function getFileName(key) {
    const startIndex = key.lastIndexOf('/');
    return key.slice(startIndex + 1);
}

const getFileIcon = name => {
    const extension = [...CodeFiles, ...AdobeFiles];
    const extensions = [...GeneralFiles, ...MicrosoftFiles];

    const matched = extension.find(ext => new RegExp(`(\\.${ext.extension})$`, 'gi').test(name));
    if (matched) return matched.icon;

    for (let i = 0; i < extensions.length; i++) {
        const matchedExtension = extensions[i].extension.find(ext =>
            new RegExp(`(\\.${ext})$`, 'gi').test(name)
        );
        if (matchedExtension) return extensions[i].icon;
    }

    return 'general.png';
};

const handleAxiosError = (e, showError) => {
    console.log(e);
    const errors = e?.response?.data?.errors;
    const status = e?.response?.status;

    if (status === 500) return showError('Something went wrong');

    if (status === 400) return showError(errors || `Ensure you've entered valid information.`);

    if (status === 404) return showError(errors || `We can't find what you are looking for.`);

    if (e?.response?.data) {
        if (typeof errors === 'object' && errors !== null) showError(errors.pop().message);
        showError(errors || 'Our server encountered an error, Please try again later');
    } else {
        showError('Something went wrong');
    }
};

const getParentId = key => {
    const index = key?.lastIndexOf('/');
    if (index) return key.slice(index + 1);
    return key;
};

const getAWSKey = (key, id) => (key ? encodeURIComponent(key + '/' + id) : id);

const isDefined = v => typeof v !== 'undefined';

function truncate(str) {
    return str.length > 10 ? str.substring(0, 7) + '...' : str;
}

const getItemIds = selected => {
    const itemIds = [];
    if (selected?.folders) itemIds.push(...selected.folders);
    if (selected?.files) itemIds.push(...selected.files);
    return itemIds;
};

const getSessionData = name => sessionStorage[name];
const setSessionData = (name, value) => (sessionStorage[name] = value);

const getLocalStorage = key => window.localStorage.getItem(key);
const setLocalStorage = (key, value) => window.localStorage.setItem(key, value);
const removeLocalStorage = key => window.localStorage.removeItem(key);

const isEmpty = obj => Object.keys(obj).length === 0;
const isObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

export {
    link,
    env,
    parseKB,
    getFileIcon,
    getFileName,
    getFolderName,
    getSessionData,
    setSessionData,
    handleAxiosError,
    getParentId,
    isDefined,
    getAWSKey,
    truncate,
    getItemIds,
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
    isEmpty,
    isObject,
};
