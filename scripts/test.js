var fs = require('fs');
function TransferDate(timeStamp) {
    return new Date(timeStamp*1000).toLocaleString();
}


var data = fs.readFileSync('../nba2k19_news.json', 'utf-8');

var newsArray = JSON.parse(data);
newsArray = newsArray.map(function(news) {
    
    news.dateTime = TransferDate(Number(news.dateTime));
    return news;
});

const writeFile = (data, cb) => {
    fs.writeFile("./nba2k19_news_formatted.json", data ,cb);
};

writeFile(JSON.stringify(newsArray), function (err) {
    if (!err) {
        console.log("文件写入成功！");
    } else {
        console.log("文件写入失败！");
    }
});




