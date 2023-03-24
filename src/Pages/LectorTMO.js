const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')
const slug = require('slug')
const { findData, setData } = require('../DatabaseController')
const { isEmpty } = require('lodash')

puppeteer.use(stealth())

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

    console.log(`\nManga encontrado:`.green, manga.title.cyan, '\n')
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

    // SI los capítulos están vacíos buscar por otro lado
    if (isEmpty(manga.chapters)) {
        $('.upload-link').each((index, el) => {
            const option = $(el)
            manga.chapters.push({
                chapter: option.find('.col-4.col-md-6.text-truncate span').text().replace('\n', '').trim(),
                options: option.find('.btn.btn-default.btn-sm').attr('href')
            })
        })
    }

    // Cerrar el navegador
    await browser.close()

    // Guardar en la base de datos la información recolectada
    setData(url, {
        ...manga,
        from: 'tuMangaOnline'
    })

    console.log('Fin de la ejecución'.bgGreen.black)
    // Retornar el arreglo de capítulos como resultado de la función
    return manga
}
