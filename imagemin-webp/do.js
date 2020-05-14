const fs = require('fs').promises
const path = require('path')
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')
const {getImages, timePromise, getRunSummary, writeHtmlSummary} = require('../utils')

const convertFilenameToWebp = file => {
    const bits = path.basename(file).split('.')
    bits[bits.length - 1] = 'webp'
    return bits.join('.')
}

(async () => {
    const images = await getImages(['.webp', '.jpg', '.png'])

    Promise.all(images.map(async (file) => {
        const destPath = path.join('results', convertFilenameToWebp(file))

        const minResult = await timePromise(imagemin([file], {
            plugins: [imageminWebp({quality: 70})],
        }))

        await fs.writeFile(destPath, minResult.result[0].data)

        return {
            destPath,
            sourcePath: file,
            summary: await getRunSummary(file, destPath, minResult.time),
        }
    }))
        .then(async (xs) => {
            await writeHtmlSummary('results/index.html', xs, 'imagemin-webp (lossy)')

            return xs
        })
        .then(xs => xs.map(x => x.summary))
        .then(JSON.stringify)
        .then(console.log)
})()
