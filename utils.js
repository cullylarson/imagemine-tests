const fs = require('fs').promises
const path = require('path')
const FileType = require('file-type')
const sharp = require('sharp')
const prettyBytes = require('pretty-bytes')
const imagemin = require('imagemin')

const nowStamp = () => new Date().getTime()

const getCompressionRatio = (a, b) => {
    return ((b / a) * 100).toFixed(2) + '%'
}

const timePromise = p => {
    const startS = nowStamp()

    return p.then(x => {
        const endS = nowStamp()

        return {
            start: startS,
            end: endS,
            time: endS - startS,
            result: x,
        }
    })
}

const hasExtension = (extensions, fileName) => {
    return extensions.some(x => fileName.endsWith(x))
}

const getImages = async (extensions = []) => {
    extensions = Array.isArray(extensions) ? extensions : [extensions]

    const folder = path.join(__dirname, 'images')
    return fs.readdir(folder)
        .then(files => {
            return extensions.length
                ? files.filter(x => hasExtension(extensions, x))
                : files
        })
        .then(xs => xs.map(x => path.join(folder, x)))
}

const getRunSummary = async (originalFile, resultFile, time) => {
    const [mimeInfo, metadata, originalStats, destStats] = await Promise.all([
        FileType.fromFile(originalFile),
        sharp(originalFile).metadata(),
        fs.stat(originalFile),
        fs.stat(resultFile),
    ])

    // file-type doesn't handle SVGs
    const mime = metadata.format === 'svg'
        ? 'image/svg+xml'
        : mimeInfo.mime

    return {
        original: {
            fileName: path.basename(originalFile),
            mime,
            size: originalStats.size,
            sizeHuman: prettyBytes(originalStats.size),
            width: metadata.width,
            height: metadata.height,
        },
        result: {
            size: destStats.size,
            sizeHuman: prettyBytes(destStats.size),
            compression: getCompressionRatio(originalStats.size, destStats.size),
        },
        time,
    }
}

// imagesBasePath -- the path to images, relative to the resultant html file
const writeHtmlSummary = (htmlPath, infos, title = '', imagesBasePath = '') => {
    const renderSummary = summary => {
        return `
<div class='summary'>
    <div class='set'>
        <div class='item'>
            <h3>Original</h3>

            <table>
                <tr>
                    <th>mime:</th>
                    <td>${summary.original.mime}</td>
                </tr>
                <tr>
                    <th>size:</th>
                    <td>${summary.original.sizeHuman} (${summary.original.size})</td>
                </tr>
                <tr>
                    <th>dimensions:</th>
                    <td>${summary.original.width} x ${summary.original.height}</td>
                </tr>
            </table>
        </div>
        <div class='item'>
            <h3>Result</h3>

            <table>
                <tr>
                    <th>time:</th>
                    <td>${summary.time}</td>
                </tr>
                <tr>
                    <th>size:</th>
                    <td>${summary.result.sizeHuman} (${summary.result.size})</td>
                </tr>
                <tr>
                    <th>compression:</th>
                    <td>${summary.result.compression}</td>
                </tr>
            </table>
        </div>
    </div>
</div>
`
    }

    const renderOne = info => {
        return `
${renderSummary(info.summary)}

<div class='set'>
    <div class='item'>
        <h3>${path.basename(info.sourcePath)}</h3>
        <img src='${info.sourcePath}' />
    </div>
    <div class='item'>
        <h3>${path.basename(info.destPath)}</h3>
        <img src='${info.base64Data || path.join(imagesBasePath, path.basename(info.destPath))}' />
    </div>
</div>
`
    }

    const html = `
<html>
    <head>
        <style>
            body {
                background: #efefef;
            }
            .set {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-auto-rows: 1fr;
                grid-gap: 20px;
                margin-bottom: 30px;
                padding-bottom: 30px;
                border-bottom: 10px solid #ddd;
            }

            .summary .set {
                border: 0;
                padding-bottom: 0;
            }

            h1 {
                margin: 0 0 30px 0;
            }

            h3 {
                margin-top: 0;
            }

            img {
                display: block;
                width: 100%;
            }
        </style>
    </head>
    <body>
        ${title ? `<h1>${title}</h1>` : ''}
        ${infos.map(renderOne).join('\n\n')}
    </body>
</html>
`
    return fs.writeFile(htmlPath, html)
}

const doImageMinAction = async (title, plugin, extensions = [], resultsFolder = 'results') => {
    const images = await getImages(extensions)

    Promise.all(images.map(async (file) => {
        const destPath = path.join(resultsFolder, path.basename(file))

        const minResult = await timePromise(imagemin([file], {
            plugins: [plugin],
        }))

        await fs.writeFile(destPath, minResult.result[0].data)

        return {
            destPath,
            sourcePath: file,
            summary: await getRunSummary(file, destPath, minResult.time),
        }
    }))
        .then(async (xs) => {
            await writeHtmlSummary(path.join(resultsFolder, 'index.html'), xs, title)

            return xs
        })
        .then(xs => xs.map(x => x.summary))
        .then(JSON.stringify)
        .then(console.log)
}

module.exports = {
    getImages,
    timePromise,
    getRunSummary,
    writeHtmlSummary,
    doImageMinAction,
}
