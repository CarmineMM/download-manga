const userConfig = require('../config')
const { defaults } = require('lodash')
const { constructPath } = require('./Helpers')

const config = defaults(userConfig, {
    dirname: './',
    databaseDirectory: 'db',
    databaseFile: 'database.json',
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
config.mangaFolder = constructPath(config.dirname, config.folderSaved)

module.exports = config