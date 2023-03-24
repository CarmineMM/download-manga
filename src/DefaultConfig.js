const userConfig = require('../config')
const { defaults, has } = require('lodash')
const { constructPath } = require('./Helpers')

const config = defaults(userConfig, {
    dirname: './',
    databaseDirectory: 'db',
    databaseFile: 'database.json',
    folderSaved: 'Mangas',
    navigationTimeout: 1000 * 60 * 5, // Min
    pages: {
        tuMangaOnline: {
            title: 'TU MANGA ONLINE',
            saveMethod: 'screenshot',
            folderSaved: 'tmo',
            linksKnown: [
                'https://lectortmo.com',
                'https://animalslegacy.com',
            ],
        },

        plotTwistNoFansub: {
            title: 'Plot Twist No Fansub',
            saveMethod: false,
            folderSaved: 'plot',
            linksKnown: [
                'https://www.plot-twistnf-scans.com',
            ],
        },
    }
})

// Path hacia la base de datos
config.databasePath = constructPath(
    config.dirname, config.databaseDirectory, config.databaseFile
)

// Carpeta para guardar los mangas
config.mangasFolder = constructPath(config.dirname, config.folderSaved)

// Asociar controladores para LectorTMO
if (!has(config, 'pages.tuMangaOnline.controller')) {
    config.pages.tuMangaOnline.controller = 'LectorTMO'
}


module.exports = config