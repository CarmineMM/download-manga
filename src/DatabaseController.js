// Va a controlar el almacenamiento de información en la base de datos
const fs = require('fs')
const { find } = require('lodash')
const crypto = require('crypto')
const { dirname } = require('path')

const directory = `./db`
const file = `${directory}/database.json`

/**
 * Obtiene la data de la base de datos
 * 
 * @returns {Object}
 */
exports.getData = () => {
    console.log('\nDatabase Read\n'.yellow)
    if (!fs.existsSync(file)) {
        fs.mkdirSync(directory, { recursive: true })
        return {};
    }
    return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
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
    fs.writeFileSync(file, JSON.stringify(database))
}