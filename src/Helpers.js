const { trim, trimEnd } = require('lodash')

exports.constructPath = (...items) => {
    let path = ''
    items.forEach(item => path += trim(item, '/') + '/')
    return trimEnd(path, '/')
}