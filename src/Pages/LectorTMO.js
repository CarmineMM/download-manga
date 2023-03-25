const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')
const { setData, updateURLChapter: updateChapter } = require('../DatabaseController')
const { isEmpty } = require('lodash')
const config = require('../DefaultConfig')
const { constructPath, formatNumber, cleanString } = require('../Helpers')
const { replace, has } = require('lodash')
const fs = require('fs')
const { pause } = require('../inquirer')

puppeteer.use(stealth())

/**
 * Obtiene toda la información del manga junto con el listado de episodios
 * 
 * @param {string} url 
 * @returns {object} manga
 */
exports.getManga = async (url) => {
    // Objeto con el capitulo 
    const manga = {}

    // Abrir un navegador y una nueva pestaña
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(config.navigationTimeout)

    console.log(`Buscando el manga con la URL: ${url}`.bgBlue.white)
    // Navegar a la URL
    await page.goto(url)

    console.log('Procesando la información'.cyan)
    // Obtener el contenido HTML de la página
    const html = await page.content()
    // Cargar el HTML con Cheerio
    const $ = cheerio.load(html)

    // Obtener el titulo, subtitulo y descripción del manga
    manga.title = cleanString($('h1.element-title').text())
    manga.subtitle = cleanString($('h2.element-subtitle').text())
    manga.description = cleanString($('p.element-description').text())
    manga.genders = []
    manga.chapters = []

    console.log(`\nManga encontrado:`.green, manga.title.cyan)
    console.log('\nExtrayendo información...'.cyan)

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
            chapter: item.find('h4 a').text().trim(),
            url: options
        })
    })

    // SI los capítulos están vacíos buscar por otro lado
    if (isEmpty(manga.chapters)) {
        $('.upload-link').each((index, el) => {
            const option = $(el)
            manga.chapters.push({
                chapter: option.find('.col-4.col-md-6.text-truncate span').text().replace('\n', '').trim(),
                url: option.find('.btn.btn-default.btn-sm').attr('href'),
                downloadConfirm: false,
            })
        })
    }

    // Cerrar el navegador
    await browser.close()

    // Guardar en la base de datos la información recolectada
    setData(url, {
        from: 'tuMangaOnline',
        ...manga,
    })

    console.log('Fin de la ejecución'.bgGreen.black)
    // Retornar el arreglo de capítulos como resultado de la función
    return manga
}

/**
 * Descargar las imágenes del capitulo
 * 
 * @param {object|string} chapter Capitulo o URL del capitulo para descargar
 * @param {object} manga Manga guardado en la base de datos, el cual se va usar para actualizarse
 * @returns void
 */
exports.getChapter = async (chapter, manga = {}) => {
    let url = replace(chapter.url, 'paginated', 'cascade')
    let pathToSaveMangas = constructPath(config.mangasFolder, config.pages.tuMangaOnline.folderSaved)
    const method = config.pages.tuMangaOnline.saveMethod
    const testFile = [
        'test.txt',
        `DESCARGANDO DE URL: ${url}`
    ]

    // Preparar el guardado de imágenes
    if (has(manga, 'title')) {
        pathToSaveMangas += `/${cleanString(manga.title)}`
    }
    pathToSaveMangas += has(chapter, 'chapter') ? `/${cleanString(chapter.chapter)}` : '/new'

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

    page.setDefaultNavigationTimeout(config.navigationTimeout)
    const client = await page.target().createCDPSession();

    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: pathToSaveMangas,
    });

    // Navegar a la URL
    do {
        console.log(`Buscando el episodio con la URL: ${url}`.bgBlue.white)

        try {
            await page.goto(url)
        } catch (error) {
            console.log('Falla al ir al sitio web'.bgRed.white)
            console.log(error)
            await browser.close()
            await pause()
            return
        }

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