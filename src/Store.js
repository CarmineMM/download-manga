/**
 * Métodos para intentar obtener las imágenes
 * 
 * @param {*} param0 
 * @returns 
 */
exports.saveMethods = async ({ url, img, method = 'link', saveIn }) => {
    // Método de link
    if (method === 'fetch') {
        try {
            const response = await fetch(url)
            const buffer = await response.arrayBuffer()
            return Buffer.from(buffer).toString('base64')
        } catch (error) {
            console.log('Un error al obtener la imagen', error)
            await new Promise((resolve) => setTimeout(resolve, 5000))
            return ''
        }
    }

    // Descarga por link
    if (method === 'link') {
        const link = document.createElement('a')
        link.href = url
        link.download = url
        // link.target = '_blank'
        document.body.appendChild(link)
        console.log('link', link)
        link.click()
        return link.remove()
    }

    // Descarga por link version 2
    if (method === 'link-v2') {
        const canvas = document.createElement('canvas')
        const image = document.querySelector(`[data-src="${url}"]`)
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        const dataURL = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = url
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        return link.remove()
    }
}