const imageminMozjpeg = require('imagemin-mozjpeg')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-mozjpeg (lossy)', imageminMozjpeg({quality: 70}), '.jpg')
