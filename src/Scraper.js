/**
 * Este archivo va obtener el listado de episodios
 */
// Importar las librerías necesarias
require('colors')
const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')
const { setData, findData, updateChapter, mangasFolder } = require('./DatabaseController')
const { has, isEmpty, isObject, replace } = require('lodash')
const fs = require('fs')
const slug = require('slug')
const https = require('https')
const path = require('path')
const { saveMethods } = require('./Store')

puppeteer.use(stealth())

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

    console.log('No se encontró el manga en la base de datos'.cyan)
    // Objeto con el capitulo 
    const manga = {}

    // Abrir un navegador y una nueva pestaña
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(1000 * 60 * 10)

    console.log(`Buscando el manga con la URL: ${url}`.bgBlue.white)
    // Navegar a la URL
    await page.goto(url)

    console.log('Procesando la información'.cyan)
    // Obtener el contenido HTML de la página
    const html = await page.content()
    // Cargar el HTML con Cheerio
    const $ = cheerio.load(html)

    // Obtener el titulo, subtitulo y descripción del manga
    manga.title = $('h1.element-title').text().trim().replace('\n', ' ')
    manga.subtitle = $('h2.element-subtitle').text().trim().replace('\n', ' ')
    manga.description = $('p.element-description').text().trim().replace('\n', ' ')
    manga.genders = []
    manga.chapters = []

    console.log(`\nManga encontrado:`.green, manga.title.bgMagenta.black, '\n')
    console.log('Extrayendo información...'.cyan)

    // Obtener los géneros
    $('.element-header-content h6').each((index, el) => {
        const gender = $(el).find('a')
        manga.genders.push({
            title: gender.text().trim(),
            href: gender.attr('href')
        })
    })

    $('#chapters .upload-link').each((index, el) => {
        const item = $(el)
        const options = item.find('.chapter-list-element .list-group-item').map((index, el) => {
            const opt = $(el)

            return {
                scan: opt.find('.col-4.col-md-6.text-truncate > span > a').text().trim() || 'Sin scan asociado',
                url: opt.find('.btn.btn-default.btn-sm').attr('href')
            }
        }).toArray()

        manga.chapters.push({
            chapter: item.find('h4 a').text().replace('Capítulo', '').trim(),
            options
        })
    })

    // Cerrar el navegador
    await browser.close()

    // Guardar en la base de datos la información recolectada
    setData(url, manga)

    console.log('Fin de la ejecución'.bgGreen.black)
    // Retornar el arreglo de capítulos como resultado de la función
    return manga
}

exports.getChapter = async (url, manga = '', chapter = {}) => {
    console.clear()
    console.log('Comprobando URL'.cyan)
    url = replace(url, 'paginated', 'cascade')
    let pathToSaveMangas = mangasFolder
    const method = 'screenshot'
    const testFile = [
        'test.txt',
        `DESCARGANDO DE URL: ${url}`
    ]

    // Preparar el guardado de imágenes
    if (isObject(manga)) {
        pathToSaveMangas += `/${slug(manga.title)}`
    }
    pathToSaveMangas += has(chapter, 'chapter') ? `/${chapter.chapter}` : '/new'

    fs.mkdirSync(pathToSaveMangas, { recursive: true })

    // Crear archivo de prueba
    fs.writeFileSync(`${pathToSaveMangas}/${testFile[0]}`, testFile[1], { encoding: 'utf8' })

    const listImages = []

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--no-sandbox`,
            `--disable-setuid-sandbox`,
        ],
    })
    const page = await browser.newPage()

    page.setDefaultNavigationTimeout(1000 * 60 * 20)
    const client = await page.target().createCDPSession();
    const pathResolve = path.resolve(pathToSaveMangas)

    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: pathResolve,
    });

    // Navegar a la URL
    do {
        console.log(`Buscando el episodio con la URL: ${url}`.bgBlue.white)
        await page.goto(url)

        // Actualizar la URL en caso de ser de re-direcciones
        if (!isEmpty(chapter) && !isEmpty(manga) && !url.includes('cascade')) {
            updateChapter(manga.id, chapter.chapter, url, page.url())
        }

        // Comprobar si la URL de la pagina cargada esta paginada o completa
        if (page.url().includes('paginated')) {
            console.log('\nCambiando a modo Cascada'.yellow)
            url = replace(page.url(), 'paginated', 'cascade')
        }
    } while (page.url().includes('paginated'))

    const html = await page.content()
    const $ = cheerio.load(html)

    console.log('Obteniendo imágenes'.cyan)

    $('#main-container img').each(async (i, el) => {
        listImages.push($(el).attr('data-src'))
    })

    for (let i = 0; i < listImages.length; i++) {
        const img = `img-${formatNumber(i + 1)}.jpg`
        const saveIn = pathToSaveMangas + '/' + img
        const url = listImages[i]

        console.log(`Obteniendo la imagen ${url}`)
        if (method === 'screenshot') {
            const element = await page.$(`img[data-src="${url}"]`)
            await element.screenshot({ path: saveIn })
        }
        else {
            const data = await page.evaluate(saveMethods, { url, img, method, saveIn })
            if (method === 'fetch') {
                data
                    ? fs.writeFileSync(saveIn, data, 'base64')
                    : console.log('No se pudo cargar la imagen'.bgRed.cyan)
            }
        }

        console.log(`Descargando en ${(saveIn).cyan}\n`)

        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Cerrar el navegador
    await browser.close()

    // Eliminar archivo de prueba
    fs.rmSync(`${pathToSaveMangas}/${testFile[0]}`)

    console.log('Capítulo descargado!'.cyan)
}

const formatNumber = (number) => number < 10 ? `0${number}` : number