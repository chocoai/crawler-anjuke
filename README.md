# crawler-anjuke
http://mongoosejs.com/docs/index.html
http://www.nodeclass.com/api/mongoose.html#quick_start
https://github.com/winstonjs/winston#using-the-default-logger
https://github.com/bda-research/node-crawler
https://github.com/Automattic/mongoose
https://github.com/winstonjs/winston
https://github.com/kelektiv/node-cron
https://github.com/node-schedule/node-schedule
https://github.com/JacksonTian/eventproxy
https://github.com/cgiffard/node-simplecrawler

https://github.com/mitmproxy/mitmproxy
https://github.com/nodejitsu/node-http-proxy    supports websockets
https://github.com/h2non/toxy                   Full-featured
https://github.com/alibaba/anyproxy
http://anyproxy.io/cn/

https://github.com/haisapan/ProxyScanner.NodeJs
https://github.com/lzrski/node-simplecrawler-queue-mongo


-TODO-

--动态代理服务器

--发布为npm包 ??

--数据插入后的事件通知 ??

--限制爬取网页数量，达到后停止，间隔指定时间后继续

--持续集成

--文件队列
crawler.queue.freeze("mysavedqueue.json", function () {
    process.exit();
});
crawler.queue.defrost("mysavedqueue.json");
--文件缓存
var cacheFilePath = path.resolve("./");
crawler.cache = new Crawler.cache(cacheFilePath);


--更新2017.2.13--
1.爬虫目录名称和爬虫启动文件名称的规约

1).爬虫目录以"c_"开头

2).爬虫的启动文件名与爬虫目录同名

3).数据抽取器以"e_"开头

2.启动方式改为pm2启动

3.增加多个target支持（参见c_proxy/e_xicidaili.js）

4.数据抽取器支持返回一个数组，以支持一次提取多条数据（参见c_proxy/e_xicidaili.js）

5.增加自定义target函数（参见c_xingZhengQu/e_index.js）

6.logLevel为debug则不生成日志文件，只在控制台打印

7.数据库增加了__url,__created 字段

8.支持keys为空，当keys为空时，框架以__url字段为key.即只以url做为重复数据的判断条件

todo
no extractor 增加allowUpdate属性[是否强制更新，默认为false],控制是否强制更新数据。handler运行过程中可以动态改变。
no 增加___updated内置字段
仅访问指定的一个或多个页面
