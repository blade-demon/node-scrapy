const cheerio = require('cheerio');
const axios = require('axios');

// 获取单个页面的数据
var getOnePage = (url) => axios.get(url);

// 解析数据
var parserData = (data) => {
    let $ = cheerio.load(data, { decodeEntities: false });
    $('dd').map(function() {
        games.push({
            'index': $(this).find('.board-index').text(),
            'image': $(this).find('.board-img').attr('data-src'),
            'title': $(this).find('.name a').text(),
            'actor': $(this).find('.star').text().trim(),
            'time': $(this).find('.releasetime').text(),
            'score': $(this).find('.integer').text() + $(this).find('.fraction').text()
        });
    });
}

// 开始爬虫
var startScrapy = async() => {
    for (let offset = 0; offset < 40; offset++) {
        let response = await getOnePage(`https://store.playstation.com/en-hk/grid/STORE-MSF86012-PS4TITLES/${offset*10}?gameContentType=games&smcid=hk-en_ps%3Acom_ps4-games`);
        let games = parserData(response.data);
    }
}

startScrapy();