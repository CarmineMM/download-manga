const fs = require('fs')
const { pause, question } = require('./inquirer')
require('colors')
const { databaseFile } = require('./DatabaseController')

/**
 * Elimina el archivo que se usa de base de datos
 */
exports.removeDatabase = async () => {
    const response = await question('¿Seguro desea eliminar los datos almacenados?'.bgRed.white)

    if (response === 'yes') {
        try {
            fs.rmSync(databaseFile)
            await pause('Base de datos eliminada.\nPresione Enter para continuar.'.yellow)
        } catch (error) {
            console.log('No hay datos que eliminar.'.cyan)
            await pause()
        }
    }
}

/**
 * Elimina la carpeta donde están los mangas
 */
exports.removeMangaFolder = async () => {
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