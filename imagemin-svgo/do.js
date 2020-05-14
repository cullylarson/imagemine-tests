const imageminSvgo = require('imagemin-svgo')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-svgo', imageminSvgo(), '.svg')
