/**
 * Created by yneos on 2017/1/1.
 * 省、代码
 *
 */

var extractor = {
    name: '省',
    target: /^http:\/\/www\.stats\.gov\.cn\/tjsj\/tjbz\/tjyqhdmhcxhfdm\/2015\/index.html$/i,
    schema: {
        url: String,
        city:String,
        code:String,
        year:String
    },
    keys: ["url"],
    //返回一个数据对象或数组
    handler: function ($, queueItem, responseBuffer, response) {

        var rows = $('tr');
        var hosts = [];
        for(var i=0,len=rows.length;i<len;i++){
            var cells = $(rows[i]).find('td');
            var obj = {
                url: queueItem.url,
                ip: $(cells[1]).text(),
                port: $(cells[2]).text(),
                匿名度: $(cells[4]).text(),
                协议: $(cells[5]).text(),
                国家: '中国',
                位置: null,
                速度: null,
                收录时间: new Date(),
                存活时间: null,
                最后验证时间: null
            }
            if(obj.ip && obj.port){
                hosts.push(obj)
            }
        }

        return hosts;
    }
}

module.exports = extractor;