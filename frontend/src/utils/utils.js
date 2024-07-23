const isDefined = v => typeof v !== 'undefined' && v !== null;

const isEmpty = obj => Object.keys(obj).length === 0;

const isObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

const isString = value => typeof value === 'string';

const isImage = file => file['type'].split('/')[0] === 'image';

const isVideo = file => file['type'].split('/')[0] === 'video';

const parseLinks = text => {
    const urlRegex =
        /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/;
    return text.replace(urlRegex, url => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
};

export { isDefined, isImage, parseLinks, isVideo, isEmpty, isObject, isString };
