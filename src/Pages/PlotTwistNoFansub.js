const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')
const slug = require('slug')
const { findData, setData } = require('../DatabaseController')
const { isEmpty } = require('lodash')

puppeteer.use(stealth())

exports.getManga = async (url) => {

}