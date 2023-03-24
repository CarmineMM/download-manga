// Va a controlar el almacenamiento de información en la base de datos
const fs = require('fs')
const { find, each } = require('lodash')
const crypto = require('crypto')
const { map, defaults } = require('lodash')
const config = require('./DefaultConfig')

/**
 * Obtiene la data de la base de datos
 * 
 * @returns {Object}
 */
exports.getData = () => {
    console.log('\nDatabase Read\n'.yellow)
    if (!fs.existsSync(config.databasePath)) {
        fs.mkdirSync(directory, { recursive: true })
        return {};
    }
    return JSON.parse(fs.readFileSync(config.databasePath, { encoding: 'utf-8' }))
}

exports.findData = (url) => {
    const data = this.getData()
    return find(data, ['url', url], false)
}

exports.setData = (url, data) => {
    const database = this.getData()
    const id = crypto.randomUUID()

    database[id] = {
        id,
        url,
        ...data,
    }
    console.log('\nDatabase SetData'.yellow,)
    fs.writeFileSync(config.databasePath, JSON.stringify(database))
}

exports.updateChapter = (mangaId, chapter, previousUrl, newUrl) => {
    console.log('\nDatabase Updating\n'.yellow)

    const database = this.getData()
    let newData = {}

    each(database, (manga) => {
        newData[manga.id] = {
            ...manga,
            chapters: map(manga.chapters, (chp) => {
                if (chp.chapter === chapter && mangaId === manga.id) {
                    chp.options = map(chp.options, (opt) => {
                        if (opt.url === previousUrl) {
                            opt.url = newUrl
                        }
                        return opt
                    })
                }

                return chp
            })
        }
    })


    fs.writeFileSync(config.databasePath, JSON.stringify(database))
}