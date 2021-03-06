/**
 * Created by yneos on 2017/1/1.
 * 大众点评_商户
 *
 */

var extractor = {
    name: '大众点评_商户',
    //target: /^http:\/\/www\.dianping\.com\/search\/category\/(\d+)\/(\d+)(\/?)/g,//全国
    //target: /^http:\/\/www\.dianping\.com\/search\/category\/1\/(\d+)(\/?)/g,//上海
    //target: /^http:\/\/www\.dianping\.com\/search\/category\/1\/25\/g136(p?)/g,//上海 电影院
    target: [
        {
            test: function (url) {
                //http://www.dianping.com/search/category/1/55/g6844
                //剔除多余网址，含：m n o # 符号的不爬
                var t = url.split('/');
                var str = t[t.length - 1];
                var r = /(m+|n+|o+|#+|q+|d+)/g
                if (r.test(str)) {
                    return false;
                }
                str = t[t.length - 2];
                //以下分类页面样式不同
                if (str === "55" || str === "70" || str === "90" || str === "40") {
                    return false;
                }

                //var city = 1;//上海
                var city = 6;//苏州
                var bigCode = "";//频道
                var smallCoce = "";//分类

                var regString = "^http:\/\/www\.dianping\.com\/search\/category\/"+city+"\/";//上海
                bigCode = bigCode ? bigCode : "(\\d+)";
                smallCoce = smallCoce ? "\/" + smallCoce : "\/g";
                regString = regString + bigCode + smallCoce;
                var regObj = new RegExp(regString);
                //var regString = /^http:\/\/www\.dianping\.com\/search\/category\/(\d+)\/(\d+)(\/?)/;//全国

                //var regString = /^http:\/\/www\.dianping\.com\/search\/category\/1\/15\/g135(p?)/;//
                //var regString = /^http:\/\/www\.dianping\.com\/search\/category\/1\/15(\/?)/;//
                return regObj.test(url);
            }
        },
        /^http:\/\/www\.dianping\.com\/shop\/(\d+)$/g,
    ],
    schema: {
        id: Number,//大众点评id
        name: String,//商户名称
        address: String,//文字地址
        reviewNum: Number,//点评数量
        meanPrice: Number,//人均消费

        city: String,//城市名称
        cityCode: String,//大众点评的城市代码

        channel: String,// 一级分类【逗号表达式】行业/频道（channel）
        channelCode: String,

        category: String,//二级分类【逗号表达式】行业细分（type）
        categoryCode:String,
        branch: String, //三级分类【逗号表达式】品牌（branch）
        branchCode:String,

        bussiArea: String,//商区 对应分类的地标
        bussiAreaCode:String,
        landmark: String,//地标  对应分类的地标
        landmarkCode:String,

        district: String,//行政区 对应分类的商区
        districtCode:String,
        subDistrict: String,//子行政区 对应分类的商区
        subDistrictCode:String,

        metroLine: String,//地铁线
        metroLineCode:String,
        metroStation: String,//地铁站
        metroStationCode:String,

        lng: Number,//精度
        lat: Number,//维度
        lbsType: String//地图类型【qq|baidu】
    },
    keys: ['id'],
    times: 0,
    //允许更新
    allowUpdate: true,
    //指定需要合并更新的字段(其它字段不更新)，字段类型必需为String，新数据与数据库老数据不同则合并，合并后使用“｜”分割
    //allowUpdate为true时生效
    mergeFields: [
        'channel',
        'channelCode',
        'category',
        'categoryCode',
        'branch',
        'branchCode',
        'bussiArea',
        'bussiAreaCode',
        'landmark',
        'landmarkCode',
        'district',
        'districtCode',
        'subDistrict',
        'subDistrictCode',
        'metroLine',
        'metroLineCode',
        'metroStation',
        'metroStationCode',
    ],
    //返回一个数据对象或数组
    handler: function ($, queueItem, responseBuffer, response) {
        var shopReg = /^http:\/\/www\.dianping\.com\/shop\/(\d+)$/g;
        if (shopReg.test(queueItem.url)) {
            return this.getShopLocation($, queueItem);
        }

        var city, cityCode, channel, channelCode, category, categoryCode, branch, branchCode, bussiArea, bussiAreaCode,
            landmark, landmarkCode, district, districtCode, subDistrict, subDistrictCode,
            metroLine, metroLineCode, metroStation, metroStationCode;

        //http://www.dianping.com/search/category/1/10/g24645r875
        var t = queueItem.url.split('http://www.dianping.com/search/category/')[1];
        t = t.split('/');// 1/10/g24645r875
        cityCode = t[0];
        channelCode = t[1];
        channelCode = channelCode == 0 ? null : channelCode;
        if (channelCode) {
            channel = $('a.current-category.J-current-category').text();
        }
        city = $("a.city.J-city").text();


        //分类
        if (channelCode) {
            var el = this.getNavigationEl($, "分类:");
            if (el) {
                var curr = el.find('#classfy>a.cur');
                category = curr.text().trim();
                category = category === '不限' ? null : category;
                if (category) {
                    categoryCode = this.getTypeCode(curr.attr('href'));
                    //品牌
                    var subCurr = el.find('#classfy-sub>a.cur');
                    branch = subCurr.text().trim();
                    branch = branch === '不限' ? null : branch;
                    if (branch) {
                        branchCode = this.getTypeCode(subCurr.attr('href'));
                    }
                }
            }
        }

        var currTypeCode = branchCode || categoryCode;

        //商区
        var el = $('#bussi-nav>a.cur');
        bussiArea = el.text().trim();
        bussiArea = bussiArea === '不限' ? null : bussiArea;
        if (bussiArea) {
            bussiAreaCode = this.getLocationCode(currTypeCode, el.attr('href'));
        }

        //地标
        var el = $('#bussi-nav-sub>a.cur');
        landmark = el.text().trim();
        landmark = landmark === '不限' ? null : landmark;
        if (landmark) {
            landmarkCode = this.getLocationCode(currTypeCode, el.attr('href'));
        }

        //行政区
        var el = $('#region-nav>a.cur');
        district = el.text().trim();
        district = district === '不限' ? null : district;
        if (district) {
            districtCode = this.getLocationCode(currTypeCode, el.attr('href'));
        }

        //子行政区
        var el = $('#region-nav-sub>a.cur');
        subDistrict = el.text().trim();
        subDistrict = subDistrict === '不限' ? null : subDistrict;
        if (subDistrict) {
            subDistrictCode = this.getLocationCode(currTypeCode, el.attr('href'));
        }

        //地铁线路
        var el = $('#metro-nav>a.cur');
        metroLine = el.text().trim();
        metroLine = metroLine === '不限' ? null : metroLine;
        if (metroLine) {
            metroLineCode = this.getLocationCode(currTypeCode, el.attr('href'));
        }

        //地铁站
        var el = $('#metro-nav-sub>a.cur');
        metroStation = el.text().trim();
        metroStation = metroStation === '不限' ? null : metroStation;
        if (metroStation && metroLineCode) {
            metroStationCode = this.getLocationCode(currTypeCode, el.attr('href'));
            //r和u需要变换一下
            var sp = metroLineCode.replace('r','');
            sp = 'u'+sp;
            var tmp = metroStationCode.split(sp);
            metroStationCode = tmp[0];
        }


        //测试用例
        //http://www.dianping.com/search/category/1/0/  无
        //http://www.dianping.com/search/category/1/10/ 美食
        //http://www.dianping.com/search/category/1/10/g132 咖啡厅
        //http://www.dianping.com/search/category/1/10/g24645   星巴克
        //http://www.dianping.com/search/category/1/10/g24645r865 徐家汇 徐家汇
        //http://www.dianping.com/search/category/1/10/g24645r1022 美罗城 徐汇区
        //http://www.dianping.com/search/category/1/10/g24645r5 浦东新区
        //http://www.dianping.com/search/category/1/10/g24645r801 陆家嘴
        //http://www.dianping.com/search/category/1/10/g24645r1325 1号线
        //http://www.dianping.com/search/category/1/10/g24645r1161u1325 1号线 徐家汇站

        var obj = {
            city: city,
            cityCode: cityCode,
            channel: channel,
            channelCode: channelCode,
            category: category,
            categoryCode: categoryCode,
            branch: branch,
            branchCode: branchCode,
            bussiArea: bussiArea,
            bussiAreaCode: bussiAreaCode,
            landmark: landmark,
            landmarkCode: landmarkCode,
            district: district,
            districtCode: districtCode,
            subDistrict: subDistrict,
            subDistrictCode: subDistrictCode,
            metroLine: metroLine,
            metroLineCode: metroLineCode,
            metroStation: metroStation,
            metroStationCode: metroStationCode,
        }

        //商铺
        var shopList = [];
        $('#shop-all-list>ul>li').each(function () {
            var id, name, address, reviewNum, meanPrice;
            var a = $($(this).find('.tit>a')[0]);
            name = a.attr("title");
            var tmp = a.attr("href").split('/');///shop/5207084
            id = tmp[tmp.length - 1];
            address = $(this).find('span.addr').text();
            reviewNum = $(this).find('a.review-num>b').text();
            meanPrice = $(this).find('a.mean-price>b').text();
            meanPrice = meanPrice.replace('￥', '')

            var shop = {
                id: id,
                name: name,
                address: address,
                reviewNum: reviewNum,
                meanPrice: meanPrice
            }
            shopList.push(shop)
        });

        function copy(o1, o2) {
            for (var key in o2) {
                o1[key] = o2[key];
            }
        }

        for (var i = 0; i < shopList.length; i++) {
            var shop = shopList[i];
            copy(shop, obj);
        }


        //this.crawler.stop();
         //console.log(shopList);

        return shopList;
    },
    //根据name获取搜素条件的外层Div
    getNavigationEl: function ($, name) {
        var ret = null;
        var el = $('div.nav-category');
        for (var i = 0; i < el.length; i++) {
            var div = $(el[i]);
            var str = div.find('h4').text();
            if (name === str) {
                ret = div;
                break;
            }
        }
        return ret;
    },
    getShopLocation: function ($, queueItem) {
        var id, lng, lat, lbsType = "qq";
        var html = $.html();
        var str = html.split('shopGlat:')[1];
        str = str.split(',')[0];
        str = str.replace(/\s/g, '').replace(/\"/g, '');
        lat = str;

        str = html.split('shopGlng:')[1];
        str = str.split(',')[0];
        str = str.replace(/\s/g, '').replace(/\"/g, '');
        lng = str;


        str = queueItem.url.split('/');
        id = str[str.length - 1];

        var obj = {
            id: id,
            lng: lng,
            lat: lat,
            lbsType: lbsType
        }
        return obj;
    },
    getTypeCode: function (url) {
        var str = url.split('/');
        str = str[str.length - 1];
        //由于分类是g开头，位置是r(区)或c(县)开头，所以要去掉r或c后的字串
        str = str.split('r')[0];
        str = str.split('c')[0];
        str = str.split('u')[0];
        return str;
    },
    getLocationCode: function (currTypeCode, url) {
        var str = url.split('/');
        str = str[str.length - 1];
        if (currTypeCode) {
            var tmp = str.split(currTypeCode);
            str = tmp[tmp.length - 1];
        }
        return str;
    }

}

module.exports = extractor;
