/**
 * 爬取网站PSN的所有游戏: http://www.psnine.com/psngame?page=1
 * 
 * @param  page     {Number}     1
 */

const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

const gameListBaseurl = 'http://www.psnine.com/psngame?page=';

// 获取单页的所有游戏列表
var getGameListPage = (page) => axios.get(gameListBaseurl + page);

// 分割文字
var splitWords = (data) => {
    let length = data.length;
    let array = [];
    for (let i = 0; i < length / 3; i++) {
        array.push(data.slice((0 + i) * 3, 3 * (i + 1)));
    }
    return array;
};

// 解析数据
var parserGameData = (data) => {
    let $ = cheerio.load(data, {
        decodeEntities: false
    });
    let games = [];
    $('tr').map(function () {
        const imgSrc = $(this).find('.pdd15 img').attr("src");
        const gameName = $(this).find(".title a").text();
        const bages = $(this).find('em span').text();
        const platforms = splitWords($(this).find('.title>span').text());
        const playedTimes = parseInt($(this).find('td:last-child').text());
        games.push({
            "gameName": gameName,
            "platforms": platforms,
            "imgSrc": imgSrc,
            "bages": bages,
            "playedTimes": playedTimes
        });
    });
    return games;
}

// 将结果写入文件
var writeDataInfoFile = (data) => {
    fs.writeFile('psngames.json', JSON.stringify(data), (err) => {
        if (err) {
            console.log('写入失败！');
        } else {
            console.log('写入成功！');
        }
    });
};

// 开始爬虫
var startScrapy = async() => {
    let gamesList = [];
    for (let page = 1; page <= 203; page++) {
        console.log("正在爬取网站第 " + page + " 页的数据...");
        let response = await getGameListPage(page);
        gamesList.push(parserGameData(response.data));
    }
    writeDataInfoFile(gamesList);
}

startScrapy();