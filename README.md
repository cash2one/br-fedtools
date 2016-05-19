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

* `注意：一定要在项目工程目录下启动开发调试命令，否则将不能正确解析提取资源文件`

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

* "version" (string 版本号):
	* 说明:
	
		* 前端工程推荐采用git分支开发，开发分支命名规则为：daily/x.y.z
		
		* 约定 `version` 值为当前开发分支的分支号x.y.z
		
		* 约定HTML页面js入口资源引入方式：	
		
				<script type="text/javascript" src="./@version/index.js"></script>
		
		* `@version`将会在进行`bid build`后,被替换为`version`字段；js打包路径`/build/src/p/js入口文件名/@version/index.js`的@version也同时会被替换为版本号。
		
		* 根据分支号设置路径，主要目的是便于发布后对代码进行管理、引用、回滚等操作。
		
	* 注意：每次启动`bid dev`时，如果当前处于daily/x.y.z分支，且config.json的version字段与当前分支号不一致，config.json的version字段将被自动替换为当前分支号。		
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
				
* "extract-common-to-path"(string，相对通用js打包输出路径)
  * 字段说明：是否需要提取全部的公共js模块
  
	| 示例 | 说明 |
	| -----|:----:|
	| "extract-common-to-path":false|不对通用的js模块进行提取及单独打包|
	| "extract-common-to-path":"./src/p/library.min.js"|将通用的js模块提取并打包至/build/src/p/library.min.js文件|

## bid命令详解

| -----| 命令|参数|描述|
| -----| -----| -----|:----:|
|项目初始化|bid init|无|在当前目录下，生成初始`普通`工程目录文件 及 完成相关依赖安装|
||..|-r\|--react|在当前目录下，生成初始`react+redux`工程目录文件 及 完成相关依赖安装|
|依赖更新|bid update|无|更新当前工程中相关依赖node_module(当build出现依赖问题时，可尝试对依赖进行更新后重试)|
||..|-q\|--quiet(可选)|（开启安静模式进行升级）|
||..|-f\|--force(可选)|（对全局bid工具的依赖模块进行强制更新安装，用以解决bid依赖版本过低或安装不全的问题）|
|开发调试|bid dev|无|启动本地开发环境（默认端口号3333）|
| |bid dev|-p [端口号] \| --port [端口号]|以指定[端口号]启动本地开发环境|
|项目打包|bid build|无|进行本地编译打包|
||..|-l\|--local(默认)|(默认)进行本地编译打包|
||..|-ol\|--online(暂不可用)|(暂不可用)进行云编译打包|
||..|-q\|--quiet(可选)|开启安静模式|
||..|-lint\|--lint(可选)|开启js编写规范检测|

## 说明

* 全部nodejs依赖均通过本模块的node_module进行加载。

* 目前集成了zepto、underscore，可手动require进行加载：
	* var $ = require('zepto');
	* var _ = require('underscore');

* 目前入口JS文件命名规则及路径必须约定为：`/src/p/**/index.js`。

已经支持React，推荐使用React+Redux进行开发。
