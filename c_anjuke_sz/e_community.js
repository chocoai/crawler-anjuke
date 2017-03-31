/**
 * Created by yneos on 2017/1/1.
 */

var extractor = {
  //表名
  name: '安居客_苏州_小区均价',
  //  http://suzhou.anjuke.com/community/view/1670
  //  http://suzhou.anjuke.com/community/view/
  target: /^http:\/\/suzhou\.anjuke\.com\/community\/view(\/?)\/+[0-9]+$/i,
  //正则，加入爬取队列，只为寻找target
  //http://suzhou.anjuke.com/community/p2/
  //helpUrl:/^http:\/\/suzhou\.anjuke\.com\/community(\/?)/i,
  schema: {
    url: String,
    anjukeId:String,
    name: String,
    area: String,
    district: String,
    city: String,
    year: String,
    month: String,
    price: Number,
    mom: Number,
    momUpDown: String,
    point: Object,
  },
  //数据唯一标识(字段值连接后md5存放于__k)，若数据已存在不做更新
  keys: ["name", "year", "month"],
  //model: null,//数据模型对象，运行时注入
  //crawler: null,//爬虫对象，运行时注入
  //mongoose: null,//数据库对象，运行时注入
  times: 0,
  //无返回值框架不会保存，可使用new this.model(data)自行操作
  handler: function ($, queueItem, responseBuffer, response) {


    //交集选择： $(".a.b")--选择同时包含a和b的元素。
    //并集选择：$(".a, .b")--选择包含a或者包含b的元素。
    //首页 > 上海小区 > 浦东小区 > 三林小区 > 浦发绿城
    var str = $(".p_1180.p_crumbs").text().replace(/\s/g, '').split(">");
    str.shift();
    var city = str[0].replace(/小区/g, '');
    var district = str[1].replace(/小区/g, '');
    var area = str[2].replace(/小区/g, '');
    var name = str[3];
    //console.log(city,district,area,name);

    //http://suzhou.anjuke.com/map/sale/?from=commtitle#l1=31.110616364328&l2=121.35934431231&l3=18&commid=1670&commname=xxx
    var locationUrl = $(".comm-title.clearfix").find("a").attr("href");
    var lat = null,lng = null;
    if(locationUrl){
      locationUrl = locationUrl.split("#")[1].split("&");
      lat = parseFloat(locationUrl[0].replace("l1=", ""));
      lng = parseFloat(locationUrl[1].replace("l2=", ""));
    }

    //var anjukeId = locationUrl[3].replace("commid=", "");
    var str = queueItem.url.split('\/');
    var anjukeId = str[str.length-1];

    //console.log(anjukeId,lat,lng);

    var price = $("em.comm-avg-price").text();
    if(price.indexOf("暂无")>0){
      price = -1;
    }
    var mom=null,momUpDown=null;
    if(price!=-1){
      //上涨0.52%
       mom = $(".price-tip>strong").eq(0).text().replace(/[^0-9.]/ig, "");
       momUpDown = $(".price-tip>strong").eq(0).hasClass("up") ? "up" : "down";
    }

    //console.log(price,momUpDown,mom);

    var date = new Date();

    var result = {
      url: queueItem.url,
      anjukeId:anjukeId,
      name: name,
      area: area,
      district: district,
      city: city,
      year: date.getFullYear(),
      month: date.getMonth() + 1,//getMonth 0~11
      price: price,
      mom: mom,
      momUpDown: momUpDown,
      point: {lat:lat,lng:lng},
    }

    this.times++
    if (this.times > 0) {
      //this.crawler.stop();
    }
    //console.log(regenTarget);
    //console.log(this.times, queueItem.url);
    return result;
  }
}

module.exports = extractor;