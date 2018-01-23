/**
 * 爬取网站psnine的psnid用户信息：
 * 
 * @param ob        {String}      totalgame,point,datadate,rarity
 * @param region    {String}      区域：cn,hk,jp,us,tw,gb,ca
 * @param page      {String}      页面页数
 * 
 * 等级排行：http://www.psnine.com/psnid?ob=point&region=hk&page=1
 * 游戏最多：http://www.psnine.com/psnid?ob=totalgame&region=hk&page=1
 * 完美率：http://www.psnine.com/psnid?ob=rarity&region=hk&page=1
 * 最后更新：http://www.psnine.com/psnid?ob=datadate&region=hk&page=1
 */


const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');

// 获取单个页面的数据
var getOnePage = (url) => axios.get(url);

// 解析数据
var parserData = (data) => {
    let $ = cheerio.load(data);
    console.log($('dd').length);
}

// 开始爬虫
var startScrapy = async(region, ob) => {
    let psners = [];
    for (let offset = 1; offset <= 1; offset++) {
        let response = await getOnePage(`http://www.psnine.com/psnid?ob=${ob}&region=${region}&page=${offset}`);
        let $ = cheerio.load(response.data, {
            decodeEntities: false
        });
        console.log("正在爬取网站第 " + offset + " 页的数据，数据条数是：", $('tr').length);

        $('tr').map(function () {
            const $images = $(this).find('td:nth-child(3) img');
            let bages = [];
            $images.map(function () {
                if ($(this).attr("src") === 'http://www.psnine.com/View/aimage/0.png') {
                    bages.push('normal');
                }
                if ($(this).attr("src") === 'http://www.psnine.com/View/aimage/1.png') {
                    bages.push('vip1');
                }
                if ($(this).attr("src") === 'http://www.psnine.com/View/aimage/plus.png') {
                    bages.push('plus');
                }
                if ($(this).attr("src") === 'http://www.psnine.com/View/aimage/4.png') {
                    bages.push('vip4');
                }
                if ($(this).attr("src") === 'http://www.psnine.com/View/aimage/3.png') {
                    bages.push('vip3');
                }
                if ($(this).attr("src") === 'http://www.psnine.com/View/aimage/2.png') {
                    bages.push('vip2');
                }
            });
            psners.push({
                'username': $(this).find('.pd10 p a').text(),
                'bages': bages,
                'region': region,
                'level': _.split($(this).find('td:nth-child(4)').text().replace(/[^\d]/ig, ' ').trim(), '  ', 2)[0],
                'experience': _.split($(this).find('td:nth-child(4)').text().replace(/[^\d]/ig, ' ').trim(), '  ', 2)[1] + '%',
                'totalGames': $(this).find('td:nth-child(5)').text().replace(/[^0-9]/ig, ""),
                'perfectRate': $(this).find('td:nth-child(6)').text().replace(/[^0-9]/ig, "") + "%",
                'platinum': $(this).find('td:nth-child(7)').text().replace(/[^0-9]/ig, ""),
                'gold': $(this).find('td:nth-child(8)').text().replace(/[^0-9]/ig, ""),
                'sliver': $(this).find('td:nth-child(9)').text().replace(/[^0-9]/ig, ""),
                'bronze': $(this).find('td:nth-child(10)').text().replace(/[^0-9]/ig, "")
            });
        });
    }
    // console.log(psners);

    fs.writeFile('psnid-' + region + '.json', JSON.stringify(psners), (err) => {
        if (err) {
            console.log('写入失败！');
        } else {
            console.log('写入成功！');
        }
    });
}

startScrapy('cn', '');