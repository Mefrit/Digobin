module.exports = {
    port: 8080,
    rootPath: 'src',
    path: [
        'assets'
    ],
    files: {
        '/react.js': './node_modules/react-lite/dist/react-lite.min.js',
        '/react-dom.js': './node_modules/react-lite/dist/react-lite.min.js'
    },
    mount: {
        'node_modules': './node_modules'
    }
};