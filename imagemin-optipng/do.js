const imageminOptipng = require('imagemin-optipng')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-optipng (lossless)', imageminOptipng({}), '.png')
