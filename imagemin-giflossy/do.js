const imageminGiflossy = require('imagemin-giflossy')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-giflossy (lossy)', imageminGiflossy({
    optimizationLevel: 3,
    lossy: 120,
    optimize: 3,
}), '.gif')
