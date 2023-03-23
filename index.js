require('colors')
const { getManga, getChapter } = require('./src/Scraper')
const { menu, pause, question } = require('./src/inquirer')
const { inputUrlToManga, listMangas, showManga, inputUrlToChapter } = require('./src/Manga')
const inquirer = require('inquirer')
const { getData, databasePath, mangasFolder } = require('./src/DatabaseController')
const { map } = require('lodash')
const fs = require('fs')

const main = async () => {
    let answer = '0'
    const prompt = inquirer.createPromptModule()

    do {
        answer = await menu()
        let chapterUrl = ''
        let manga = ''
        let chapterInfo = {}

        // Listado de mangas
        if (answer === '1') {
            manga = await listMangas()

            if (manga !== '0') {
                let { reOpt, chapterUrl: getUrl, chapter } = await showManga(manga)

                chapterUrl = getUrl
                answer = reOpt
                chapterInfo = chapter
            }
        }

        // Obtener un manga de una URL
        if (answer === '2') {
            const url = await inputUrlToManga()
            const mangaInfo = await getManga(url)

            const { reOpt, chapterUrl: getUrl, chapter } = await showManga(mangaInfo)
            chapterUrl = getUrl
            answer = reOpt
        }

        // Obtener un capitulo
        if (answer === '3') {
            if (chapterUrl === '') {
                const url = await inputUrlToChapter()
                chapterUrl = url
            }

            await getChapter(chapterUrl, manga, chapterInfo)

            await pause()
        }

        if (answer === '4') {
            console.log('Sincronizar manga')
        }

        // Eliminar base de datos
        if (answer === '5') {
            const response = await question('¿Seguro desea eliminar los datos almacenados?'.bgRed.white)

            if (response === 'yes') {
                try {
                    fs.rmSync(databasePath)
                    await pause('Base de datos eliminada.\nPresione Enter para continuar.'.yellow)
                } catch (error) {
                    console.log('No hay datos que eliminar.'.cyan)
                    await pause()
                }
            }
        }

        // Eliminar Mangas descargados
        if (answer === '6') {
            const response = await question('¿Seguro desea eliminar la carpeta de Mangas descargados?'.bgRed.white)

            if (response === 'yes') {
                try {
                    fs.rmSync(mangasFolder, { recursive: true })
                    await pause('Archivos eliminados.\nPresione Enter para continuar.'.yellow)
                } catch (error) {
                    console.log('No hay datos que eliminar.'.cyan)
                    await pause()
                }
            }
        }

    } while (answer !== '0')

    console.log('\nAdios!!'.yellow)
}

main()