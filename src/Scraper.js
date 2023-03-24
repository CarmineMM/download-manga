/**
 * Este archivo va obtener el listado de episodios
 */
// Importar las librerías necesarias
require('colors')
const { setData, findData, updateChapter, mangasFolder } = require('./DatabaseController')
const { has, isEmpty, isObject, replace, each, find } = require('lodash')
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
    // Explorar para saber que controlador usar
    const page = find(
        config.pages,
        (page) => find(page.linksKnown, (link) => url.includes(link.toLowerCase()))
    )

    // Comprobar existencia y disponibilidad del controlador
    if (isEmpty(page) && !has(page.controller)) {
        console.log('No se encontró un controlador para este sitio web'.bgRed.white)
        await pause()
    }

    const mangaController = require(`./Pages/${page.controller}`)

    await mangaController.getManga(url)
}

/**
 * Obtener/Descargar un capitulo de manga
 * 
 * @param {string} url 
 * @param {string} manga 
 * @param {object} chapter 
 */
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