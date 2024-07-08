const GeneralFiles = [
    {
        extension: ['MP3', 'MPEG', 'WAV', 'OOG', 'OPUS'],
        icon: 'extension/general/music.png',
    },
    {
        extension: ['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'JPG', 'WEBP'],
        icon: 'extension/general/image.png',
    },
    {
        extension: [
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
        icon: 'extension/general/video.png',
    },
    {
        extension: ['ZIP', 'RAR', '7Z', 'GZIP', 'ARj', 'DEB', 'PKG', 'RPM', 'Z'],
        icon: 'extension/general/archive.png',
    },
    {
        extension: ['CSV', 'DAT', 'DB', 'DBF', 'LOG', 'MDB', 'SAV', 'SQL', 'TAR', 'XML'],
        icon: 'extension/general/file.png',
    },
    {
        extension: ['BIN', 'DMG', 'ISO', 'TOAST', 'VCD'],
        icon: 'extension/general/cd.png',
    },
    {
        extension: ['APK', 'BAT', 'EXE', 'JAR', 'MSI', 'WSF'],
        icon: 'extension/general/executable.png',
    },
];

const CodeFiles = [
    {
        extension: 'CSS',
        icon: 'extension/code/css.png',
    },
    {
        extension: 'HTML',
        icon: 'extension/code/html.png',
    },
    {
        extension: 'JS',
        icon: 'extension/code/js.png',
    },
    {
        extension: 'C',
        icon: 'extension/code/c.png',
    },
    {
        extension: 'CPP',
        icon: 'extension/code/cpp.png',
    },
    {
        extension: 'JAVA',
        icon: 'extension/code/java.png',
    },
    {
        extension: 'PY',
        icon: 'extension/code/py.png',
    },
    {
        extension: 'PHP',
        icon: 'extension/code/php.png',
    },
];

const MicrosoftFiles = [
    {
        extension: ['XLS', 'XLSX', 'XLSM'],
        icon: 'extension/microsoft/excel.png',
    },
    {
        extension: ['DOC', 'DOCX', 'DOCS', 'TXT', 'WPD'],
        icon: 'extension/microsoft/word.png',
    },
    {
        extension: ['PPT', 'PPTX', 'PPS'],
        icon: 'extension/microsoft/powerpoint.png',
    },
];

const AdobeFiles = [
    {
        extension: 'DXF',
        icon: 'extension/adobe/dfx.png',
    },
    { extension: 'AI', icon: 'extension/adobe/ai.png' },
    { extension: 'PSD', icon: 'extension/adobe/psd.png' },
    { extension: 'PDF', icon: 'extension/adobe/pdf.png' },
    { extension: 'SVG', icon: 'extension/adobe/svg.png' },
];

export { GeneralFiles, CodeFiles, MicrosoftFiles, AdobeFiles };
