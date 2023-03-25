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

/**
 * Formatea números para agregarle un 0 al principio
 * 
 * @param {number} number 
 * @returns {number}
 */
exports.formatNumber = (number) => number < 10 ? `0${number}` : number

/**
 * Limpia un string para no tener caracteres no permitidos
 * 
 * @param {string} str 
 * @returns {string}
 */
exports.cleanString = (str) => str.replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s]/g, ' ').trim()