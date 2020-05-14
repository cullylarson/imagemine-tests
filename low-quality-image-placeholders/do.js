const fs = require('fs').promises
const path = require('path')
const lqip = require('lqip')
const {getImages, timePromise, getRunSummary, writeHtmlSummary} = require('../utils')

const getFileName = x => path.basename(x).split('.')[0]

getImages(['.png', '.jpg'])
    .then(images => Promise.all(images.map(async (file) => {
        const name = getFileName(file)
        const destPath = path.join('results', name + '.txt')

        const lqipResult = await timePromise(lqip.base64(file))

        await fs.writeFile(destPath, lqipResult.result)

        return {
            destPath,
            sourcePath: file,
            summary: await getRunSummary(file, destPath, lqipResult.time),
            base64Data: lqipResult.result,
        }
    })))
    .then(async (xs) => {
        await writeHtmlSummary('results/index.html', xs, 'low-quality-image-placeholders')

        return xs
    })
    .then(xs => xs.map(x => x.summary))
    .then(JSON.stringify)
    .then(console.log)
