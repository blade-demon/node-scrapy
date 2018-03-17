const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');

let gamesList = [];

// 游戏名称
// 公司
// 发行日期
// copyright
/*

  "gameName": "",
  "productID": "",
  "price": ""
}
*/

// 所有游戏页面： https://store.playstation.com/zh-hans-cn/grid/PN.CH.CN-PN.CH.MIXED.CN-PS4TITLES/4?direction=asc&sort=release_date

// 获取单页的所有游戏列表
var getGameListPage = (page) => axios.get("https://store.playstation.com/zh-hans-cn/grid/PN.CH.CN-PN.CH.MIXED.CN-PS4TITLES/" + page + "?direction=asc&sort=release_date");

// 获取单页数据信息
var getGameDetailPage = (url) => axios.get(url);

// 解析当前页所有游戏信息
var parseGamesData = (data) => {
    const $ = cheerio.load(data);
    $(".grid-cell__body").map(function() {
        var price = $(this).find(".price-display__price").text();
        var name = $(this).find(".grid-cell__title").text();
        var link = "https://store.playstation.com" + $(this).find(".grid-cell__bottom a").attr("href");
        gamesList.push({ name, link, price });
    });
};

// 解析单页游戏信息
var parseGameData = (i, data) => {
    const $ = cheerio.load(data);
    $(".grid-cell__body").map(function() {
        var company = $(".provider-info__text").eq(0).text();
        var type = $(".provider-info__text span").eq(0).text();
        var pub_date = $(".provider-info__text span").eq(1).text();
        var desc = $(".pdp__description").text();

        gamesList[i].company = typeof(company) === undefined ? "" : company;
        gamesList[i].type = type;
        gamesList[i].pub_date = typeof(pub_date) === undefined ? "" : pub_date;
        gamesList[i].desc = typeof(desc) === undefined ? "" : desc;
    });
};


var startScrapy = async() => {
    // 获取所有游戏信息
    for (let page = 1; page <= 4; page++) {
        console.log("正在爬取网站第 " + page + " 页的数据...");
        let response = await getGameListPage(page);
        parseGamesData(response.data);
    }

    // 获取单页游戏信息
    for (let i = 0; i < gamesList.length; i++) {
        console.log("正在爬取第" + i + "个：" + gamesList[i].name + "的数据...");
        let response = await getGameDetailPage(gamesList[i].link);
        await parseGameData(i, response.data);
    }

    fs.writeFile('games.json', JSON.stringify(gamesList), 'utf-8', () => {
        console.log("文件写入完毕！");
    });

};

startScrapy();