const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')
const slug = require('slug')
const { findData, setData } = require('../DatabaseController')
const { isEmpty } = require('lodash')
const { pause } = require('../inquirer')
const config = require('../DefaultConfig')
const { constructPath } = require('../Helpers')

puppeteer.use(stealth())

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
        ...manga,
        from: 'plotTwistNoFansub'
    })

    console.log('Fin de la ejecución'.bgGreen.black)
    // Retornar el arreglo de capítulos como resultado de la función
    return manga
}

const insertCodeInPlotTwistPage = async (page) => {
    document.addEventListener('DOMContentLoaded', () => {
        page.chapters = window.obj.chapters.map(chapter => ({
            downloadLink: chapter.chapter_downloadlink,
            chapter: `Capítulo ${chapter.chapter_number}: ${chapter.chapter_name}`.trim(),
            options: `${window.obj.site_url}/${window.obj.read}/${window.obj.title}/chapter-${chapter.chapter_number}`,
        }))
    })
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return page
}