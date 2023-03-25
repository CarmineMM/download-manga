const { trim, trimEnd, each, map, find } = require('lodash')

/**
 * Construye un path
 * 
 * @param  {...string} items 
 * @returns 
 */
exports.constructPath = (...items) => {
    let path = ''
    items.forEach(item => path += trim(item, '/') + '/')
    return trimEnd(path, '/')
}

/**
 * Obtiene la lista de URL conocidas
 * 
 * @param {object} pages 
 * @return {array}
 */
exports.getLinksKnown = (pages) => {
    const links = []
    each(pages, (page) => each(page.linksKnown, (link) => links.push(link)))
    return links
}

/**
 * Determina si es un sitio que se puede descargar
 * 
 * @param {string} url 
 */
exports.checkUrl = (url, pages) => {
    return !!find(
        this.getLinksKnown(pages),
        (page) => url.toLowerCase().includes(page.toLowerCase())
    )
}


exports.formatNumber = (number) => number < 10 ? `0${number}` : number