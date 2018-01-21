const cheerio = require('cheerio');
const axios = require('axios');

// 获取单个页面的数据
var getOnePage = (url) => axios.get(url);

// 解析数据
var parserData = (data) => {
    let $ = cheerio.load(data);
    console.log($('dd').length);
}

// 开始爬虫
var startScrapy = async() => {
    let movies = [];
    for (let offset = 0; offset < 10; offset++) {
        let response = await getOnePage(`http://maoyan.com/board/4?offset=${offset*10}`);
        let $ = cheerio.load(response.data, {
            decodeEntities: false
        });
        // console.log($('dd').html());
        $('dd').map(function() {
            // console.log($(this).html());
            // console.log($(this).find('.board-img').attr('alt'));
            movies.push({
                'index': $(this).find('.board-index').text(),
                'image': $(this).find('.board-img').attr('data-src'),
                'title': $(this).find('.name a').text(),
                'actor': $(this).find('.star').text().trim(),
                'time': $(this).find('.releasetime').text(),
                'score': $(this).find('.integer').text() + $(this).find('.fraction').text()
            });
        });
    }
    console.log(movies);
}

startScrapy();