const inquirer = require('inquirer')
const { getData } = require('./DatabaseController')
const { map, find } = require('lodash')
require('colors')

exports.listMangas = async () => {
    const prompt = inquirer.createPromptModule()
    const mangas = getData()
    console.clear()

    const list = map(mangas, (manga, id) => ({
        value: id,
        name: manga.title
    }))

    list.push({
        value: '0',
        name: '>>Volver al menu principal'.yellow
    })

    const { mangaId } = await prompt([
        {
            type: 'list',
            name: 'mangaId',
            loop: false,
            message: 'Listado de mangas guardados en la Base de datos',
            choices: list
        }
    ])

    return mangaId === '0' ? '0' : mangas[mangaId]
}

/**
 * Mostrar un manga
 * 
 * @param {manga} manga 
 */
exports.showManga = async (manga) => {
    const prompt = inquirer.createPromptModule()
    let reOpt = '---'
    let chapterUrl = ''

    console.log(`\n${'Titulo:'.cyan}\n${manga.title}\n`)
    console.log(`${'También buscado como:'.cyan}\n${manga.subtitle}\n`)
    console.log(`${'Descripción:'.cyan}\n${manga.description}\n`)

    const choices = [
        {
            value: '0',
            name: '>>Volver al menu principal'.yellow
        },
        {
            value: 'all',
            name: 'Descargar todos los episodios'.bgBlue.yellow
        }
    ]

    map(manga.chapters, (chapter) => {
        choices.push({
            value: chapter,
            name: chapter.chapter,
        })
    })

    const { chapter } = await prompt([
        {
            type: 'list',
            message: '¿Desea descargar algún episodio?',
            name: 'chapter',
            choices
        },
    ])

    if (chapter !== '0' && chapter !== 'all') {
        const { scan } = await prompt([
            {
                type: 'list',
                message: `Seleccione uno de los scan para descargar el episodio: ${chapter.chapter.cyan}`,
                name: 'scan',
                choices: map(chapter.options, (opt) => ({
                    value: opt.url,
                    name: opt.scan
                }))
            }
        ])

        chapterUrl = scan
        reOpt = '3'
    }

    return {
        reOpt,
        chapterUrl,
        chapter
    }
}

exports.inputUrlToManga = async () => {
    const prompt = inquirer.createPromptModule()

    const { answer } = await prompt([
        {
            type: 'input',
            name: 'answer',
            message: 'Ingrese la URL del manga: ',
            validate(value) {
                const done = this.async()

                if (value.length < 1 || !value.includes('https://lectortmo.com') || !value.startsWith('https')) {
                    return done('Por favor ingrese una URL valida hacia LectorTMO')
                }

                return done(null, true)
            }
        }
    ])

    return answer
}

exports.inputUrlToChapter = async () => {
    const prompt = inquirer.createPromptModule()

    const { url } = await prompt([
        {
            type: 'input',
            name: 'url',
            message: 'Ingrese la URL del capitulo: ',
            validate(value) {
                const done = this.async()

                if (value.length < 1 || !value.startsWith('https')) {
                    return done('Por favor ingrese una URL valida')
                }

                return done(null, true)
            }
        }
    ])

    return url
}