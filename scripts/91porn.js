const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');
const _ = require('lodash');

let options = {
    uri: "http://91porn.com/v.php?category=mf&viewtype=basic",
    transform: function (body) {
        return cheerio.load(body);
    }
};

request(options).then(function ($) {
    console.log($.fn.jquery);
}).catch(function (err) {
    console.log("获取网页数据出错！");
});