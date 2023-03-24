const fs = require('fs')
const { pause, question } = require('./inquirer')
require('colors')
const config = require('./DefaultConfig')

/**
 * Elimina el archivo que se usa de base de datos
 */
exports.removeDatabase = async () => {
    const response = await question('¿Seguro desea eliminar los datos almacenados?'.bgRed.white)

    if (response === 'yes') {
        try {
            fs.rmSync(config.databasePath)
            console.clear()
            console.log('\nBase de datos eliminada.\n'.yellow)
            await pause('Presione Enter para continuar.')
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
            fs.rmSync(config.mangasFolder, { recursive: true })
            await pause('Archivos eliminados.\nPresione Enter para continuar.'.yellow)
        } catch (error) {
            console.log('No hay datos que eliminar.'.cyan)
            await pause()
        }
    }
}