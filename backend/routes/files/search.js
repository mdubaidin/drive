import File from '../../schema/File.js';
import { getDateByFilter } from '../../utils/functions.js';

const filters = {
    documents: ['DOC', 'DOCX', 'DOCS', 'TXT', 'WPD'],
    spreadsheets: ['XLS', 'XLSX', 'XLSM'],
    presentations: ['PPT', 'PPTX', 'PPS'],
    images: ['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'JPG', 'WEBP'],
    pdf: ['PDF'],
    videos: [
        'WebM',
        'MP4',
        '3GP',
        'MOV',
        'AVI',
        'MPEG',
        'MPG',
        'WMV',
        'FLV',
        'OGG',
        'H264',
        '3G2',
        'M4V',
        'MKV',
        'VOB',
        'SWF',
        'RM',
    ],
    audio: ['MP3', 'MPEG', 'WAV', 'OOG', 'OPUS'],
    archive: ['ZIP', 'RAR', '7Z', 'GZIP', 'ARj', 'DEB', 'PKG', 'RPM', 'Z'],
};

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const { type, search, modified } = req.query;

        const toFilter = [];

        filters[type]?.forEach(ext => toFilter.push(new RegExp(`\.${ext}$`, 'i')));

        const query = [
            {
                $match: {
                    userId,
                    name: { $regex: search, $options: 'i' },
                    trash: false,
                    available: true,
                    $expr: getDateByFilter(modified, req.query),
                },
            },
        ];

        if (toFilter.length)
            query.push({
                $match: {
                    name: { $in: toFilter },
                },
            });

        if (type === 'folders') {
            query.push({
                $match: {
                    file: false,
                },
            });
        }

        const results = await File.aggregate(query);

        res.success({ results });
    } catch (e) {
        next(e);
    }
}
