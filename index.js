require('colors')
const { getManga, getChapter } = require('./src/Scraper')
const { menu, pause, getAllChapters } = require('./src/inquirer')
const { inputUrlToManga, listMangas, showManga, inputUrlToChapter } = require('./src/Manga')
const inquirer = require('inquirer')
const { map, isEmpty } = require('lodash')
const fs = require('fs')
const { removeDatabase, removeMangaFolder } = require('./src/FilesController')
const config = require('./src/DefaultConfig')
const helpers = require('./src/Helpers')

const main = async () => {
    let answer = '0'
    const prompt = inquirer.createPromptModule()

    do {
        answer = await menu()
        let manga = ''
        let chapterInfo = {}

        // Listado de mangas
        if (answer === '1') {
            manga = await listMangas()

            if (manga !== '0') {
                let { reOpt, chapter } = await showManga(manga)
                answer = reOpt
                chapterInfo = chapter
            }
        }

        // Obtener un manga de una URL
        if (answer === '2') {
            const url = await inputUrlToManga()
            manga = await getManga(url)

            if (manga) {
                const { reOpt, chapter } = await showManga(manga)
                answer = reOpt
                chapterInfo = chapter
            }
        }

        // Obtener un capitulo
        if (answer === '3' && chapterInfo !== 'all') {
            if (isEmpty(chapterInfo)) {
                chapterInfo = await inputUrlToChapter()
            }

            await getChapter(chapterInfo, manga)
        }

        if (answer === '4') {
            console.log('Sincronizar manga')
        }

        // Eliminar base de datos
        if (answer === '5') {
            await removeDatabase()
        }

        // Eliminar Mangas descargados
        if (answer === '6') {
            await removeMangaFolder()
        }

        // Obtener todos los capítulos de un manga
        if (chapterInfo === 'all') {
            await getAllChapters(manga)
        }

    } while (answer !== '0')

    console.log('\nAdios!!'.yellow)
}

main()