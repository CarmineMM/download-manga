module.exports = {
    dirname: __dirname,
    folderSaved: 'Manga',
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
}