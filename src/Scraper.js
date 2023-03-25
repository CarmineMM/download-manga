/**
 * Este archivo va obtener el listado de episodios
 */
// Importar las librerías necesarias
require('colors')
const { setData, findData, updateChapter, mangasFolder } = require('./DatabaseController')
const { has, isEmpty, isObject, replace, each, find, isString } = require('lodash')
const fs = require('fs')
const slug = require('slug')
const path = require('path')
const { saveMethods } = require('./Store')
const config = require('./DefaultConfig')
const { pause } = require('./inquirer')


/**
 * Obtiene la información de un manga
 */
exports.getManga = async (url) => {
    console.clear()
    url = url.trim().replace(/\/$/, '')

    console.log('Buscando el manga en la base de datos'.cyan)
    const findManga = findData(url)

    // Comprobar primero que ya no exista información en la base de datos sobre esta url
    if (findManga) {
        return findManga
    }

    console.clear()
    // Explorar para saber que controlador usar
    const page = find(
        config.pages,
        (page) => find(page.linksKnown, (link) => url.includes(link.toLowerCase()))
    )

    // Comprobar existencia y disponibilidad del controlador
    if (isEmpty(page) || !has(page, 'controller')) {
        console.log('No se encontró un controlador para este sitio web'.bgRed.white)
        await pause()
        return false
    }

    const mangaController = require(`./Pages/${page.controller}`)

    const manga = await mangaController.getManga(url)

    return manga
}

/**
 * Descargar las imágenes del capitulo
 * 
 * @param {object|string} chapter Capitulo o URL del capitulo para descargar
 * @param {object} manga Manga guardado en la base de datos, el cual se va usar para actualizarse
 * @returns void
 */
exports.getChapter = async (chapter = {}, manga = false) => {
    console.clear()
    console.log('Comprobando URL'.cyan)

    chapter = isString(chapter) ? { url: chapter.toLocaleLowerCase() } : chapter

    // Explorar para saber que controlador usar
    const page = find(
        config.pages,
        (page) => find(page.linksKnown, (link) => chapter.url.includes(link.toLowerCase()))
    )

    // Comprobar existencia y disponibilidad del controlador
    if (isEmpty(page) || !has(page, 'controller')) {
        console.log('No se encontró un controlador para este sitio web'.bgRed.white)
        await pause()
        return false
    }

    const mangaController = require(`./Pages/${page.controller}`)

    const gettingManga = await mangaController.getChapter(chapter, manga)

    await pause()
}

