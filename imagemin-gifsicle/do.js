const imageminGifsicle = require('imagemin-gifsicle')
const {doImageMinAction} = require('../utils')

doImageMinAction('imagemin-gifsicle (lossless)', imageminGifsicle(), '.gif')
