const express = require("express");
const app = new express();


const userlist = ["z-廖川","z-郭昱林","z-刘佑萍","z-曾川","Z-黄珂","z-林川"];
app.get("/get_user_power", (req, res, next) => {
	// 获取用户权限
	console.log('4444')
	res.setHeader("Access-Control-Allow-Origin", "*");
	let { username } = req.query;
	console.log(username)
	let status = 0;
	if (userlist.includes(username)) {
		status = 1;
	}
	res.send({ status });
});
app.listen("1000", () => {
	console.log("1000");
	
});
