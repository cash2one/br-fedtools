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

* step.2  全局安装
	*  **sudo npm install br-bid -g**
	*  **sudo npm install gulp** 
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
					"appName": "",
					"publish": {
						"daily": {
							"host": "192.168.180.10",
							"path": "/opt/www/build/"
						},
						"pre": {
							"host": "123.57.42.161",
							"path": "/opt/www/build/"
						},
						"online": [{
							"host": "101.201.199.232",
							"path": "/opt/www/build/"
						},{
							"host": "123.57.74.74",
							"path": "/opt/www/build/"
						}]
					},
					"version": "0.0.1",
					"auto-entry": true,
					"bid-js-entry": {
						"src/p/index/index": "./src/p/index/index.js",
						"src/p/bb/index": "./src/p/bb/index.js",
						"src/p/react-index/@version/index": "./src/p/react-index/@version/index.js",
						"src/p/index/@version/index": "./src/p/index/@version/index.js"
					},
					"alias": {
						"zepto": "webpack-zepto",
						"myslider": "@br/common/myslider",
						"myslider": "../../c/common/myslider"
					},
					"extract-common-to-path": "./src/p/library.min.js",
					"noParse": ['./src/p/index/index.js']
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
	
		| -----| key[JS模块别名] | value[模块npm名称 或 模块在项目中的地址] |
		| -----| -----|:----:|
		| node模块别名|"zepto"|"webpack-zepto"|
		| 约定common模块别名（src/c/common）|"myslider"|"@br/common/myslider"|
		| 上例等同于：|"myslider"|"../../c/common/myslider"|

	*  通过别名的定义，我们可以在业务代码中直接使用``require([别名])``引用js模块
	
				var myslider = require("@br/common/myslider");
				// 等同于 var myslider = require("../../c/common/myslider");
				var $ = require("zepto");
				
* "extract-common-to-path"(String，相对通用js打包输出路径)
  * 字段说明：是否需要提取全部的公共js模块
  
	| 示例 | 说明 |
	| -----|:----:|
	| "extract-common-to-path":false|不对通用的js模块进行提取及单独打包|
	| "extract-common-to-path":"./src/p/library.min.js"|将通用的js模块提取并打包至/build/src/p/library.min.js文件|

* "noParse"(String或Array，不检查配置路径所指向js的依赖)
  * 字段说明：如果你确定一个模块中没有其它新的依赖就可以配置这项，webpack 将不再扫描这个文件中的依赖
  
	| 示例 | 说明 |
	| -----|:----:|
	| "noParse":"./src/p/library.min.js"|不检查配置路径所指向js的依赖|
	| "extract-common-to-path":["./src/p/library.min.js","./src/p/lib.min.js"]|忽略检查"./src/p/library.min.js"和"./src/p/lib.min.js"的依赖|

* "appName" (string 工程名称):
	* 说明:
		* 项目名称将决定日常、预发及线上部署时的部署路径；
			* 日常地址：http://dym.100credit.com/工程名称/src/p/demo/index.html
			* 预发地址：http://pre.100credit.com/工程名称/src/p/demo/index.html
			* 线上地址：http://m.100credit.com/工程名称/src/p/demo/index.html
		* 进行日常发布时，请配置正确appName

* "publish" (object 发布相关配置项)
	* "daily" (array 数组，其中每个元素为对象)
		* "host" (string 日常服务器Host（域名或IP地址）):
			* 说明:
				* 进行日常发布时，请配置正确信息
				* 错误的daily.host将导致日常发布失败

		* "path" (string 日常服务器发布路径):
			* 说明:
				* 默认为'/opt/www/build/',一般情况下无需修改此配置
				* 进行日常发布时，请配置正确path

	* "pre" (array 数组，其中每个元素为对象)
		* "host" (string 预发服务器Host（域名或IP地址）):
			* 说明:
				* 进行日常发布时，请配置正确信息
				* 错误的daily.host将导致日常发布失败

		* "path" (string 日常服务器发布路径):
			* 说明:
				* 默认为'/opt/www/build/',一般情况下无需修改此配置
				* 进行日常发布时，请配置正确path

	* "online" (array 数组，其中每个元素为对象）
		* "host" (string 线上服务器Host（域名或IP地址）):
			* 说明:
				* 进行线上发布时，请配置正确的信息
				* 错误的online.host将导致线上发布失败

		* "path" (string 日常服务器发布路径):
			* 说明:
				* 默认为'/opt/www/build/',一般情况下无需修改此配置
				* 进行线上发布时，请配置正确的online.path

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
||..|-q\|--quiet(可选)|（开启安静模式进行本地开发，只会显示webpack警告和错误）|
|项目打包|bid build|无|进行本地编译打包|
||..|-l\|--local(默认)|(默认)进行本地编译打包|
||..|-d\|--publishdaily|(可选)进行编译打包并上传至【日常】服务器|
||..|-p\|--publishpre|(可选)进行编译打包并上传至【预发】阿里云服务器|
||..|-o\|--publishonline|(可选)进行编译打包并上传至【线上】阿里云服务器|
||..|-q\|--quiet(可选)|开启安静模式|
||..|-l\|--lint(可选)|开启js编写规范检测（-d发布日常时自动开启）|
|iconfont ttf base64|bid iconfont|-i\|--input <filePath>|对指定文件中的iconfont ttf进行base64转换|
||..|-o\|--output <filePath> (可选)|将转换后的内容输出值output文件（若没有指定output则替换原有input文件）|
||..|相关示例|bid iconfont -i src/c/less/iconfont.less -o src/c/less/iconfont.less|

* 进行日常构建发布时，会自动在项目根目录生成build.json文件

## 说明

* 全部nodejs依赖均通过本模块的node_module进行加载。

* 目前集成了zepto、underscore，可手动require进行加载：
	* var $ = require('zepto');
	* var _ = require('underscore');

* 目前入口JS文件命名规则及路径必须约定为：`/src/p/**/index.js`。

* 为了确保线上多台机器同时发布，请预先将本机的密钥复制并命名为线上服务器相应用户的 ~/.ssh/authorized_keys文件

		# 【本地本地】运行：
			ssh-keygen -t rsa
		
		# 结果如下
			Generating public/private rsa key pair.
			Enter file in which to save the key (/home/.username/ssh/id_rsa):#回车
			Enter passphrase (empty for no passphrase):#回车
			Enter same passphrase again:#回车
			Your identification has been saved in /home/.username /.ssh/id_rsa.
			Your public key has been saved in /home/.username /.ssh/id_rsa.pub.
			The key fingerprint is:
			38:25:c1:4d:5d:d3:89:bb:46:67:bf:52:af:c3:17:0c username@localhost
			Generating RSA keys:
			Key generation complete.

		# 会在用户目录~/.ssh/产生两个文件，id_rsa，id_rsa.pub

		# 把【主机本地】上的id_rsa.pub文件拷贝到【线上主机】的该用户主目录下的.ssh目录下,并且改名为authorized_keys

		# 使用命令：
			scp 文件名 用户名@服务器:远端路径 进行拷贝

已经支持React，推荐使用React+Redux进行开发。
