# 0.0.2
百融金服-前端FED工具
# br-fedtools

- web开发工程化工具
- dev 启动本地服务器
- build 打包工程目录src/p中所有index.js文件 到 build目录中

## 安装及初始化工程
* step.1  全局安装 **npm install br-bid -g** 
* step.2  创建新建工程目录并进入 **mkdir project1 && cd project1** 
* step.3  使用bid命令初始化工程 **bid init**

## 开发调试
* 启动本地开发环境： **bid dev**

## 构建打包
* 本地构建： **bid build -l (当前可用)**
* 云构建： 后续开发...  **bid build (暂时不可用)**

## 说明
* 全部nodejs依赖均通过本模块的node_module进行加载。
* 目前集成了zepto、underscore，可手动require进行加载：
	* var $ = require('zepto');
	* var _ = require('underscore');