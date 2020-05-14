const imageminPngquant = require('imagemin-pngquant')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-pngquant (lossy)', imageminPngquant({
    quality: [0.7, 0.9],
    speed: 1,
    dithering: 1,
}), '.png')
