async function fn1() {
  const content = document.querySelector(".main_content");
  let btn1 = document.createElement("button");
  btn1.innerText = "开始抢单";
  let btn2 = document.createElement("button");
  btn2.innerText = "停止抢单";
  let isPause = false;
  let span = document.createElement("span");
  span.innerText = `正在抢单中...已抢0单`;
  span.style.color = "#fff";
  span.style.display = "none";
  let div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = "20px";
  div.style.right = "150px";
  div.appendChild(span);
  div.appendChild(btn1);
  div.appendChild(btn2);
  content.appendChild(div);
  let count = 0;
  let time = 500;
  let api = "https://mpkf.weixin.qq.com/cgi-bin/kfunaccepted";
  let token = location.search.split("=")[1];
  let pid = "";
  let sum = 1;
  let seconds = 10;
  async function getList() {
    if (isPause) {
      alert("暂停抢单！");
      span.style.display = "none";
      isPause = false
      return ;
    }
    let action = "getmsglist";
    let t = Date.now().valueOf();
    let params = { count: 10, direct: 1, dayoption: 1, f: "json" };
    params = { ...params, pid, action, t, token };
    span.style.display = "inline";
    let res = await sendHttp(api, params);
    let dateNow = Math.ceil(Date.now().valueOf()/1000)
    let msglist = []
    let filters = ['取消','撤销','不要了','骗子']
    const regex = /\d{11}/; // 匹配连续11位数字的正则表达式
    if (res.msglist && res.msglist.length) {
      msglist = res.msglist.filter(item=>{
        // 新号并且10秒之内的用户才接
        if (!item.kfsession&&item.msg.createtime+seconds>=dateNow&&!filters.some(key=>item.msg.content.includes(key))) {
          if(regex.test(item.msg.content)){
            return item;
          }
        }
      })
      console.log(msglist,'msglist')
      if(!msglist.length){
        setTimeout(() => {
          getList();
        }, time);
        return
      }
      for(let i = 0;i<msglist.length;i++){
        let params = { action: "kfbatchcreatesession", token, pid };
        let formdata = new FormData();
        formdata.append("fansuinlist", msglist[i].msg.useruin);
        formdata.append("isselectall", 0);
        formdata.append("isauto", 0);
        formdata.append("f", "json");
        formdata.append("r", Date.now().valueOf());
        // 一条i条抢
        let res = await sendHttp(api, params, formdata, "post")
        if (
          res.kfcreatesession_resp &&
          +res.kfcreatesession_resp[0].base_resp.ret === 0
        ) {
          count++;
          span.innerText = `正在抢单中...已抢${count}单`;
        }
        if (count >= sum) {
          alert("抢单结束！");
          span.style.display = "none";
          return ;
        }
        setTimeout(() => {
          getList();
        }, time);
      }
    } else {
      setTimeout(() => {
        getList();
      }, time);
    }
  }
  // 判断是否有权使用插件
  // function validate() {
  //   let expire_time = 30 * 86400 * 1000;
  //   let time_now = Date.now().valueOf();
  //   let ispower = localStorage.getItem("ispower");
  //   let isuseable =
  //     time_now - localStorage.getItem("power_time") <= expire_time;
  //   return ispower && isuseable;
  // }
  async function ispowerful(){
    let api = "https://qiangd.loca.lt/get_user_power";
    let username = document.querySelector(".state_description").innerText;
    try {
      let res = await sendHttp(api, { username,t:Date.now().valueOf() });
      return res
    } catch (err) {
      alert("网络错误，请联系插件管理员!!!");
      return;
    }
  }
  let res = await ispowerful()
  let status = res.status
  if(+status===2){
    craeteadminBtn() 
  }
  btn1.addEventListener("click", async function (e) {
    if(+status===0) {
        return alert('您无权使用此插件，请联系管理员')
    }
    pid = pid || prompt("请输入pid");
    if (!pid) return;
    getList();
  });
  btn2.addEventListener("click", function (e) {
    isPause = true;
  });
  function sendHttp(api, params={}, data = {}, method = "get") {
    return new Promise((resolve, reject) => {
      params = setquery(params);
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status !== 200) {
            alert("服务器错误，请将问题反馈给插件管理员！");
            return reject();
          }
          let res = JSON.parse(xhr.responseText);
          resolve(res);
        }
      };
      xhr.open(method, api + params);
      xhr.send(data);
    });
  }
  function setquery(obj) {
    let str = "?";
    Object.entries(obj).forEach(([key, value]) => {
      str += `${key}=${value}&`;
    });
    str.slice(0, -1);
    return str;
  }
  function craeteadminBtn(){
    let powerBtn = document.createElement('button')
    powerBtn.innerText  = '添加权限人'
    div.appendChild(powerBtn)
    powerBtn.addEventListener('click',async function(e){
      let username = prompt("请输入名称")
      if(!username) return
      try{
        await sendHttp('https://qiangd.loca.lt/set_user_power',{username})
        alert('添加成功')
      }catch(err){
        alert('添加失败，请重试！')
      }
    })
    // 添加过滤词
    let addKeyBtn = document.createElement('button')
    addKeyBtn.innerText  = '添加过滤关键词'
    div.appendChild(addKeyBtn)
    addKeyBtn.addEventListener('click',async function(e){
      let keyword = prompt("请输入过滤词")
      if(!keyword) return
      try{
        await sendHttp('https://qiangd.loca.lt/set_keys',{keyword})
        alert('添加成功')
      }catch(err){
        alert('添加失败，请重试！')
      }
    })
    // 查看权限人
    let getPowerBtn = document.createElement('button')
    getPowerBtn.innerText  = '查看权限人'
    div.appendChild(getPowerBtn)
    getPowerBtn.addEventListener('click',async function(e){
      try{
        let res=await sendHttp('https://qiangd.loca.lt/get_users')
        console.log(res)
        alert(res.data.join(','))
      }catch(err){
        alert('获取失败，请重试！')
      }
    })
    // 查看过滤关键字
    let getKeyBtn = document.createElement('button')
    getKeyBtn.innerText  = '查看过滤关键词'
    div.appendChild(getKeyBtn)
    getKeyBtn.addEventListener('click',async function(e){
      try{
        let res = await sendHttp('https://qiangd.loca.lt/get_keys')
        console.log(res)
        alert(res.data.join(','))
      }catch(err){
        alert('获取失败，请重试！')
      }
    })
  }
}
function fn2(){
	document.querySelector('.form-control').value = '35.194.176.93'
	document.querySelector('button[type=submit]').click();
}
if(location.href.includes('//qiangd.loca.lt')){
	fn2()
}else{
	fn1()
}