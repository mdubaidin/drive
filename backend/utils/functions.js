function validateFolder(key) {
    return /^[A-Za-z0-9_\s\.-]+$/gi.test(key);
}

Date.prototype.getWeek = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    var dayOfYear = (today - onejan + 86400000) / 86400000;
    return Math.ceil(dayOfYear / 7);
};

function getDateByFilter(date, query) {
    const today = new Date();

    switch (date) {
        case 'today':
            return {
                $eq: [{ $dayOfMonth: '$updatedAt' }, { $dayOfMonth: today }],
            };

        case 'week':
            return {
                $eq: [{ $week: '$updatedAt' }, new Date().getWeek()],
            };

        case 'month':
            return {
                $eq: [{ $month: '$updatedAt' }, new Date().getMonth() + 1],
            };

        case 'year':
            return { $eq: [{ $year: '$updatedAt' }, new Date().getFullYear()] };

        case 'custom':
            const { from, to } = query;
            return {
                $and: [
                    { $gte: ['$updatedAt', new Date(from)] },
                    { $lte: ['$updatedAt', new Date(to)] },
                ],
            };

        default:
            return {};
    }
}

function joinPaths(...paths) {
    return paths
        .filter(path => path && typeof path === 'string')
        .map(path => {
            if (path.charAt(0) === '/') path = path.slice(1);
            if (path.charAt(path.length - 1) === '/') path = path.slice(0, path.length - 1);
            return path;
        })
        .join('/');
}

function sanitizeParent(path) {
    if (path.charAt(path.length - 1) === '/') path = path.slice(0, path.length - 1);
    return path;
}

function removeSlashFromStart(path) {
    if (path.charAt(0) === '/') path = path.slice(1, path.length);
    return path;
}

const getAWSKey = (ROOT, key, id) => ROOT + (key ? key + '/' : '') + (id ? id.toString() : '');

const getParentId = key => {
    if (!key) return '';
    const index = key.lastIndexOf('/');
    if (index === -1) return '';
    return key.slice(index + 1);
};

const parseBytesToKB = bytes => Math.ceil(bytes / 1024);

export {
    validateFolder,
    joinPaths,
    sanitizeParent,
    getAWSKey,
    removeSlashFromStart,
    getDateByFilter,
    getParentId,
    parseBytesToKB,
};
