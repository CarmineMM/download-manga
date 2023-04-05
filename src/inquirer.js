const inquirer = require('inquirer');

/**
 * Preguntas iniciales del sistema
 */
const questions = [
    {
        type: 'list',
        name: 'answer',
        message: 'El scraper puede buscar y descargar Mangas o capítulos de sitios como LectorTMO (https://lectortmo.com/) y Plot Twist No Fansub (https://www.plot-twistnf-scans.com/)',
        loop: false,
        choices: [
            {
                value: '1',
                name: `${'1.'.green} Listar mangas guardados`,
            },
            {
                value: '2',
                name: `${'2.'.green} Obtener un manga a partir de una URL`,
            },
            {
                value: '3',
                name: `${'3.'.green} Descargar un capitulo a partir de una URL`,
            },
            {
                value: '4',
                name: `${'4.'.green} Sincronizar manga`,
            },
            {
                value: '5',
                name: `${'5.'.green} Eliminar datos`,
            },
            {
                value: '6',
                name: `${'6.'.green} Vaciar la carpeta de Mangas descargados`,
            },
            {
                value: '0',
                name: `${'0.'.green} Salir\n`,
            },
        ],
    },
];

/**
 * Menu principal del sistema
 * 
 * @returns {string} answer
 */
exports.menu = async () => {
    console.clear()
    console.log('====================================='.green)
    console.log('        Seleccione una opción'.green)
    console.log('=====================================\n'.green)

    const prompt = inquirer.createPromptModule()

    const { answer } = await prompt(questions)

    return answer
}

/**
 * Función simple para pausar la ejecución
 * 
 * @param {string} message 
 */
exports.pause = async (message = 'Presione enter para continuar.') => {
    const prompt = inquirer.createPromptModule()

    await prompt([
        {
            type: 'input',
            message,
            name: 'enter',
        },
    ]);
}

/**
 * Pregunta rápida para el usuario, seleccionable entre si o no
 * 
 * @param {string} message 
 * @returns {string} answer
 */
exports.question = async (message) => {
    const prompt = inquirer.createPromptModule()

    const { answer } = await prompt([
        {
            type: 'list',
            name: 'answer',
            message,
            choices: [
                {
                    value: 'yes',
                    name: 'Si, estoy seguro/a'
                },
                {
                    value: 'no',
                    name: 'No, cancelar'
                },
            ]
        },
    ]);

    return answer
}

/**
 * Obtiene todos los capítulos de un manga, pero pregunta al usuario la priorización de scans
 * TODO: En construcción
 * @param {object} manga 
 */
exports.getAllChapters = async (manga) => {
    const prompt = inquirer.createPromptModule()
    console.log('Obteniendo la lista de scan'.cyan)

    const { scan } = await prompt([
        {

        }
    ])
}