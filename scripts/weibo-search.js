const cheerio = require('cheerio');
const request = require('superagent');
const fs = require('fs');
const _ = require('lodash');

const KEYWORD = "NBA 2K19";

let URL = "http://weixin.sogou.com/weixin?oq=&query=" + KEYWORD + "&_sug_type_=&sut=1214&lkt=1%2C1528277393806%2C1528277393806&s_from=input&ri=0&_sug_=n&type=2&sst0=1528277393908&ie=utf8&w=01015002&dr=1";

const cookie = 'SUV=007753971B7356625A6C4C626831A654; IPLOC=CN3100; SUID=6256731B1E20910A000000005B174FA9; ABTEST=0|1528257476|v1; pgv_pvi=4612070400; weixinIndexVisited=1; JSESSIONID=aaaGXDbGzjiEafE7e-knw; ppinf=5|1528277709|1529487309|dHJ1c3Q6MToxfGNsaWVudGlkOjQ6MjAxN3x1bmlxbmFtZToyNzolRTUlQkUlOTAlRTclQjQlQUIlRTUlQkUlQUV8Y3J0OjEwOjE1MjgyNzc3MDl8cmVmbmljazoyNzolRTUlQkUlOTAlRTclQjQlQUIlRTUlQkUlQUV8dXNlcmlkOjQ0Om85dDJsdVBROVprZFU3Z2lxb2oyTVZXNnJ1dzBAd2VpeGluLnNvaHUuY29tfA; pprdig=SUYz6CaJyLJMaOrCYUK0lxvgaef871sUVmCmbwfrL7p-Mb1fWzmvXWK99msqJj_fV0pLoLFtqhuChsROjkjH0AtqC_u_km9DxMT8Bxfz9jrgZ-EtktngAHvPDncXhVNHqMYxAfq_zARpT023VyzQ4-Cz4rCXGppwAt-s0Cp9vyY; sgid=31-32334183-AVsXqs2ca6BgpWkpuy2k8PE; PHPSESSID=23hvpr0tonjc2kqvfjt94aj5d5; SUIR=A194B1D9C3C6AF32B0938334C3A28C7A; sct=9; ld=gZllllllll2bV1MIlllllV7gfgDlllllpT2QYkllllUlllllxklll5@@@@@@@@@@; LSTMV=233%2C63; LCLKINT=1847; ppmdig=1528296821000000440311d7b9c61cf9fbb143fcc89885bf; SNUID=84B395FEE5E38B1F690D874BE62BA6DE';

// 获取单个页面的数据
var getOnePage = (url) => request.get(url).set('Cookie', cookie);

const writeFile = (data, cb) => {
    fs.writeFile("./nba2k19_news.json", data ,cb);
};

const sleep = (delay) => new Promise(function(resolve,reject) {
    setTimeout(function() {
        resolve();
    }, delay);
});


// 开始爬虫
var startScrapy = async () => {
    let newsArray = [];
    let pages = 0;
    const regexp = /[0-9]+/g;
    try {
        // 获得首页的数据
        let response = await getOnePage(`${URL}&page=1`);
        let $ = cheerio.load(response.text, {
            decodeEntities: false
        });
        pages = Math.ceil($(".mun").text().match(regexp) / 10);
        // console.log(pages);
        if (pages == 0) {
            console.log("没有爬取到数据");
        } else {
            // 每一页数据爬取
            for (let i = 0; i < pages; i++) {
                let response = await getOnePage(`${URL}&page=${i + 1}`);
                let $ = cheerio.load(response.text, {
                    decodeEntities: false
                });

                $('.news-list li').map(function () {
                    let title = $(this).find(".txt-box h3").text().replace(/[\r\n]/g,"");
                    let mp = $(this).find(".s-p a").text();
                    let dateTime = $(this).find(".s2 script").html().match(regexp)[0];
                    let link = $(this).find(".txt-box h3 a").attr("href");
                    let news = new Object({title, mp, dateTime, link});
                    console.log(news);
                    newsArray.push(news);
                });
                console.log("已经爬取第" + (i + 1) + "页" + ", 延时3秒继续！");
                await sleep(3000);
            }
            console.log(newsArray.length);
            await writeFile(JSON.stringify(newsArray), function (err) {
                if (!err) {
                    console.log("文件写入成功！");
                } else {
                    console.log("文件写入失败！");
                }
            });
        }

    } catch (e) {
        console.log(e);
    }
}

startScrapy();