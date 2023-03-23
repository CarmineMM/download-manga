const inquirer = require('inquirer');


const questions = [
    {
        type: 'list',
        name: 'answer',
        message: 'El scraper puede buscar y descargar Mangas o capítulos de LectorTMO (https://lectortmo.com/)',
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

exports.menu = async () => {
    console.clear()
    console.log('====================================='.green)
    console.log('        Seleccione una opción'.green)
    console.log('=====================================\n'.green)

    const prompt = inquirer.createPromptModule()

    const { answer } = await prompt(questions)

    return answer
}

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

exports.getAllChapters = async (manga) => {
    const prompt = inquirer.createPromptModule()
    console.log('Obteniendo la lista de scan'.cyan)

    const { scan } = await prompt([
        {

        }
    ])
}