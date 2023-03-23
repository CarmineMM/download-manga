require('colors')
const { getManga, getChapter } = require('./src/Scraper')
const { menu } = require('./src/inquirer')
const { inputUrlToManga, listMangas, showManga, inputUrlToChapter } = require('./src/Manga')
const inquirer = require('inquirer')
const { getData } = require('./src/DatabaseController')
const { map } = require('lodash')

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

            const { reOpt, chapter } = await showManga(mangaInfo)
            chapterUrl = chapter
            answer = reOpt
        }

        if (answer === '3') {
            if (chapterUrl === '') {
                const url = await inputUrlToChapter()
                chapterUrl = url
            }

            await getChapter(chapterUrl, manga, chapterInfo)

            await prompt([
                {
                    type: 'input',
                    message: 'En pausa',
                    name: 'enter',
                },
            ]);
        }

        if (answer === '4') {
            console.log('Sincronizar manga')
        }

    } while (answer !== '0')

    console.log('\nAdios!!'.yellow)
}

main()