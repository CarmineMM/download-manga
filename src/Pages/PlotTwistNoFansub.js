const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')
const slug = require('slug')
const { findData, setData } = require('../DatabaseController')
const { isEmpty, has, last, size } = require('lodash')
const { pause } = require('../inquirer')
const config = require('../DefaultConfig')
const { constructPath } = require('../Helpers')
const request = require('request')
const fs = require('fs')
const { formatNumber } = require('../Helpers')

puppeteer.use(stealth())

/**
 * Obtiene la información del manga junto con el listado de capítulos
 * 
 * @param {string} url 
 * @returns 
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

    manga.title = $('h1.entry-title .htilestiloso').text().replace('\n', ' ').trim()
    manga.subtitle = manga.title
    manga.description = $('.td-post-content > p').first().text().replace('\n', ' ').trim()

    console.log(`\nManga encontrado:`.green, manga.title.cyan, '\n')
    console.log('Extrayendo información...'.cyan)

    const refLastChapter = $('.listcap').first().attr('data-ref')
    const insertInPage = {}

    await page.goto(refLastChapter)
    const { chapters } = await page.evaluate(insertCodeInPlotTwistPage, { insertInPage })
    manga.chapters = chapters

    // Cerrar el navegador
    await browser.close()

    // Guardar en la base de datos la información recolectada
    setData(url, {
        from: 'plotTwistNoFansub',
        ...manga,
    })

    console.log('Fin de la ejecución'.bgGreen.black)
    // Retornar el arreglo de capítulos como resultado de la función
    return manga
}

/**
 * Ejecuta un script dentro de la pagina para obtener el listado de episodios
 * 
 * @param {object} page 
 * @returns page
 */
const insertCodeInPlotTwistPage = async (page) => {
    document.addEventListener('DOMContentLoaded', () => {
        page.chapters = window.obj.chapters.map(chapter => ({
            downloadLink: chapter.chapter_downloadlink,
            chapter: `Capítulo ${chapter.chapter_number}: ${chapter.chapter_name}`.trim(),
            options: `${window.obj.site_url}/${window.obj.read}/${window.obj.title}/chapter-${chapter.chapter_number}`,
            downloadConfirm: false,
        }))
    })
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return page
}


/**
 * Descargar las imágenes del capitulo
 * 
 * @param {object|string} chapter Capitulo o URL del capitulo para descargar
 * @param {object} manga Manga guardado en la base de datos, el cual se va usar para actualizarse
 * @returns void
 */
exports.getChapter = async (chapter, manga = {}) => {
    const url = chapter.url.trim()

    let pathToSaveMangas = constructPath(config.mangasFolder, config.pages.plotTwistNoFansub.folderSaved)

    const testFile = [
        'test.txt',
        `DESCARGANDO DE URL: ${url}`
    ]

    // Preparar el guardado de imágenes
    if (has(manga, 'title')) {
        pathToSaveMangas += `/${slug(manga.title)}`
    }
    pathToSaveMangas += has(chapter, 'chapter') ? `/${chapter.chapter}` : '/new'

    console.log(`Buscando el episodio con la URL: ${url}`.bgBlue.white)

    fs.mkdirSync(pathToSaveMangas, { recursive: true })

    // Crear archivo de prueba
    fs.writeFileSync(`${pathToSaveMangas}/${testFile[0]}`, testFile[1], { encoding: 'utf8' })

    if (!url.includes('chapter-')) {
        await pause('No se puede descargar desde la url proporcionada'.bgRed.white)
        return
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    console.log('Obteniendo el listado de imágenes del episodio')

    let insertCode = {}

    const obj = await page.evaluate(async (getObj) => {
        document.addEventListener('DOMContentLoaded', () => getObj = window.obj)
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return getObj
    }, { insertCode })

    let baseUrlToImages = `${obj.site_url}/${obj.all_manga_dir}/${obj.title}_:manga_id/ch_${obj.actual}/:img_name`

    for (let i = 0; i < size(obj.images); i++) {
        let { image_name, manga_id } = obj.images[i]

        const getImageUrl = baseUrlToImages.replace(':manga_id', manga_id).replace(':img_name', image_name)
        let format = last(image_name.split('.'))
        let imgSaveTo = `${pathToSaveMangas}/img-${formatNumber(i + 1)}.${format}`


        console.log(`Descargando imagen de: ${getImageUrl.cyan}`)
        request(getImageUrl).pipe(
            fs.createWriteStream(imgSaveTo)
        )
        console.log(`Imagen guardada en: ${imgSaveTo.yellow}\n`)
        await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Cerrar el navegador
    await browser.close()

    // Eliminar archivo de prueba
    fs.rmSync(`${pathToSaveMangas}/${testFile[0]}`)

    console.log('Capítulo descargado!'.cyan)
}