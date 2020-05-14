const imageminJpegtran = require('imagemin-jpegtran')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-jpegtran (lossless)', imageminJpegtran(), '.jpg')
