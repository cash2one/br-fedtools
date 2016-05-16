# 百融金服-前端FED工具
# br-fedtools

- web开发工程化工具
- dev 启动本地服务器
- build 打包工程目录src/p中所有index.js文件 到 build目录中

## 安装及初始化工程

* step.1  确保本机已经正常安装了NodeJS，以及npm可以正常使用。
	* 检测方法：请在bash下，输入
			
			node -v && npm -v  // 返回两个版本号即为安装正常
			
			例：
			bogon:br-fedtools leo.yy$ node -v && npm -v
			v4.4.4
			2.15.1
			node环境正常
		
	* 安装方法请见：[NodeJS官网](http://nodejs.cn/)

* step.2  全局安装 **npm install br-bid -g** 
* step.3  创建新建工程目录并进入 **mkdir project1 && cd project1** 
* step.4  使用bid命令初始化工程 **bid init**
  *  如果安装依赖时出现问题，请使用 bid update命令重新安装。update命令具体使用方法请看下文。

## 开发调试
* 启动本地开发环境： **bid dev**

## 编译打包
* 本地编译打包： **bid build -l (默认)**

* 云编译打包： 后续开发...  **bid build (暂时不可用)**

* 注意：`使用打包功能前，请确认您已经全局安装了gulp模块： sudo npm install gulp -g `

## 配置文件config.js（打包编译、js引用）
* 示例说明：
	
				{
					"auto-entry": true,
					"bid-js-entry": {
						"src/p/index/index": "./src/p/index/index.js",
						"src/p/bb/index": "./src/p/bb/index.js"
					},
					"alias": {
						"zepto": "webpack-zepto",
						"myslider": "@br/common/myslider",
						"myslider": "../../c/common/myslider"
					}
				}
* "auto-entry" (boolean): 
	* true: 自动根据匹配规则（匹配所有src/p/**/index.js）寻找JS入口文件并打包
	* false: 只根据config.json中的`bid-js-entry`字段来打包js入口文件
* "bid-js-entry" (object): 
	*  前端JS入口映射map
	
		| -----| key[js build输出路径] | value[入口js源文件地址] |
		| -----| -----|:----:|
		| 示例| "src/p/index/index"|"./src/p/index/index.js"|

	* 若为空则将自动匹配src/p下面所有的index.js作为入口js，并在build时输出到/build/[key]位置。
* "alias" (object):
	*  别名,通过别名约定，可以使我们在业务代码中直接require([key])引用js模块。
	
		| | key[JS模块别名] | value[模块npm名称 或 模块在项目中的地址] |
		| -----| -----|:----:|
		| node模块别名|"zepto"|"webpack-zepto"|
		| 约定common模块别名（src/c/common）|"myslider"|"@br/common/myslider"|
		| 上例等同于：|"myslider"|"../../c/common/myslider"|

	*  通过别名的定义，我们可以在业务代码中直接使用``require([别名])``引用js模块
	
				var myslider = require("@br/common/myslider");
				// 等同于 var myslider = require("../../c/common/myslider");
				var $ = require("zepto");

## bid命令详解

| -----| 命令|参数|描述|
| -----| -----| -----|:----:|
|项目初始化|bid init|无|在当前目录下，生成初始工程目录文件 及 完成相关依赖安装|
|依赖更新|bid update|无|更新当前工程中相关依赖node_module(当build出现依赖问题时，可尝试对依赖进行更新后重试)|
||..|-q\|--quiet(可选)|（开启安静模式进行升级）|
||..|-f\|--force(可选)|（对全局bid工具的依赖模块进行强制更新安装，用以解决bid依赖版本过低或安装不全的问题）|
|开发调试|bid dev|无|启动本地开发环境（默认端口号3333）|
| |bid dev|-p [端口号] \| --port [端口号]|以指定[端口号]启动本地开发环境|
|项目打包|bid build|无|进行本地编译打包|
||..|-l\|--local(默认)|(默认)进行本地编译打包|
||..|-ol\|--online(暂不可用)|(暂不可用)进行云编译打包|
||..|-q\|--quiet(可选)|开启安静模式|

## 说明
* 全部nodejs依赖均通过本模块的node_module进行加载。
* 目前集成了zepto、underscore，可手动require进行加载：
	* var $ = require('zepto');
	* var _ = require('underscore');
* 目前入口JS文件命名规则及路径必须约定为：`/src/p/**/index.js`。

后续将支持React...敬请期待
