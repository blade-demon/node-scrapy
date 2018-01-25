/**
 * 爬取网站PSN的所有游戏: http://www.psnine.com/psngame?page=1
 * 
 * @param  page     {Number}     1
 */

const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');

const gameListBaseurl = 'http://www.psnine.com/psngame?page=';
const gameDetailBaseurl = 'http://www.psnine.com/psngame/';

// 获取单页的所有游戏列表
var getGameListPage = (page) => axios.get(gameListBaseurl + page);
// 获取单个游戏的奖杯信息
var getGameDetailPage = (id) => axios.get(gameDetailBaseurl + id);

// 分割文字
var splitWords = (data) => {
    let length = data.length;
    let array = [];
    for (let i = 0; i < length / 3; i++) {
        array.push(data.slice((0 + i) * 3, 3 * (i + 1)));
    }
    return array;
};

// 解析游戏列表数据
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
        const gameId = $(this).find('.title a').attr("href").match(/\d+/g)[0];
        games.push({
            "gameName": gameName,
            "id": gameId,
            "platforms": platforms,
            "imgSrc": imgSrc,
            "bages": bages,
            "playedTimes": playedTimes
        });
    });
    return games;
}

// 解析详细单个游戏奖杯数据
var parserGameDetailData = (data, id) => {
    let $ = cheerio.load(data, {
        decodeEntities: false
    });
    let trophyList = [];
    console.log($('.list tr').length);
    // $('.list tr:not(:first)').map(function () {
    //     trophyList.push({
    //         "gameId": id,
    //         // "trophyImage": $(this).find("img:first").attr("src"),
    //         "trophyName":  $(this).find("td:second a").text(),
    //         "trophyDesc": $(this).find("td:second .text-strong").text(),
    //         // "trophyLevel": $(this).find("td:third").attr("class"),
    //     });
    //     console.log(trophyList);
    // });
};


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
    let gamesID = [];
    for (let page = 1; page <= 1; page++) {
        console.log("正在爬取网站第 " + page + " 页的数据...");
        let response = await getGameListPage(page);
        gamesList.push(parserGameData(response.data));
    }
    gamesList = _.flattenDepth(gamesList, 1);
    // writeDataInfoFile(gamesList);

    gamesID = gamesList.map((game) => game.id);
    let gameDetail = "";
    for (let i = 0; i < gamesID.length; i++) {
        console.log("正在爬取游戏ID为" + gamesID[i] + "的数据...");
        let response = await getGameDetailPage(i);
        parserGameDetailData(response.data, i);
    }
}

startScrapy();