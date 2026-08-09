// Genera una miniatura cuadrada en el navegador antes de subir la foto de
// perfil. El backend (contenedor Docker de Sail) no tiene GD ni Imagick
// instalados, así que redimensionar en servidor no es una opción sin tocar
// la imagen Docker: se hace aquí con <canvas> y se sube ya en su tamaño final.
export const generarMiniatura = (archivo, ladoPx = 150, calidad = 0.85) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(archivo)

        img.onload = () => {
            const lado = Math.min(img.width, img.height)
            const origenX = (img.width - lado) / 2
            const origenY = (img.height - lado) / 2

            const canvas = document.createElement('canvas')
            canvas.width = ladoPx
            canvas.height = ladoPx
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, origenX, origenY, lado, lado, 0, 0, ladoPx, ladoPx)

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url)
                if (!blob) {
                    reject(new Error('No se pudo generar la miniatura'))
                    return
                }
                resolve(new File([blob], 'miniatura.jpg', { type: 'image/jpeg' }))
            }, 'image/jpeg', calidad)
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('No se pudo leer la imagen'))
        }

        img.src = url
    })
}
