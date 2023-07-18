const express = require("express");
const app = new express();
const fs = require('fs')
app.get("/get_user_power", (req, res, next) => {
	// 获取用户权限
	const admins = ["z-廖川","z-郭昱林",'z-zj']
	const userlist = require("./users.json")
	res.setHeader("Access-Control-Allow-Origin", "*");
	let { username } = req.query;
	console.log(username)
	let status = 0;
	if (userlist.includes(username)) {
		status = 1;
	}
	if(admins.includes(username)){
		status = 2;
	}
	res.send({ status });
});
app.get("/set_user_power", (req, res, next) => {
	// 新增用户权限
	const userlist = require("./users.json")
	res.setHeader("Access-Control-Allow-Origin", "*");
	let { username } = req.query;
	if(!userlist.includes(username)){
		userlist.push(username)
		fs.writeFileSync('./users.json',JSON.stringify(userlist))
	}
	res.send({errmsg:'操作成功',errcode:0});
});
// 新增关键字
app.get("/set_keys", (req, res, next) => {
	// 新增用户权限
	const keywords = require("./keywords.json")
	console.log(keywords,'122')
	res.setHeader("Access-Control-Allow-Origin", "*");
	let { keyword } = req.query;
	if(!keywords.includes(keyword)){
		keywords.push(keyword)
		fs.writeFileSync('./keywords.json',JSON.stringify(keywords))
	}
	res.send({errmsg:'操作成功',errcode:0});
});
// 查看关键字
app.get("/get_keys", (req, res, next) => {
	// 新增用户权限
	const keywords = require("./keywords.json")
	res.send({data:keywords,errcode:0});
});
// 查看权限人
app.get("/get_users", (req, res, next) => {
	// 新增用户权限
	const userlist = require("./users.json")
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.send({data:userlist,errcode:0});
});
app.listen("1000", () => {
	console.log("1000");
	
});
