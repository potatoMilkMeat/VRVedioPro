var tool={
  /* 保留两位小数，参数必须是数字 */
  numDot2(num){
    if(typeof num !== 'number' || num.toString() === 'NaN'){
      console.error('tool.numDot2 函数参数类型错误 ', num, typeof num)
    }else return Number(num.toFixed(2))
  }
};
var VD={
  var: {}, // 存放href设定的初始化值
  cur: {}, // 存放当前的时间和旋转角度
  data: [], // 存放时间对应坐标 时间对应index  VD.data[time]
  activeArr: {}, // 存放当前播放 时间，坐标
  baseInt: 0, // 拍摄 角度补偿，正东方向为0 可以通过 VD.baseInt=180来重新设置
  name: '', // 视频的名称
  contentState: false, // 小地图默认状态 false 或者 true
  WW: null , // 浏览器窗口宽度
  initState: false, // 地图是否初始化
  play: false, // 播放状态
  autoPlayState: null, // 能否自动播放
  follow: true,
  // userIsControlTime: null,
  log: function(){console.log(arguments);},
  setVar:function(){
    // 存放href设定的初始化值
    var VarArray= ['time', 'int'];
    if(arguments.length===0){
      // 获取query中的内容，分成二维数组(?)?(file)?
      VD.var.url=location.href;
      if(!location.search){ return;}
      VD.var.query= location.search.substr(1);
      VD.var.queryArr=VD.var.query.split('&');
      VD.var.queryArray=[];
      for(let i=0;i<VD.var.queryArr.length;i++){ VD.var.queryArray[i]=VD.var.queryArr[i].split('='); }
      // 二维数组格式[,["laber", "PIC_20190905_095201_19_10_23_16_39_17_output_261"],["int", "1"]]
      if(!temp){var temp={};}
      temp.o={};
      for(let i=0;i<VD.var.queryArray.length;i++){ temp.a=VD.var.queryArray[i];temp.o[temp.a[0]]=temp.a[1]; }
      VD.setVarArr(VarArray, temp.o)
    } else if(arguments.length===2){ VD.setVarArr(VarArray, arguments); }

    VD.setCur(VD.var.time,VD.var.int)
  },
  setVarArr: function(arr, value){
    for(let i=0; i<arr.length; i++){
      let item = arr[i];
      let val= value.length ? value[i] : value[item] ;

      if(typeof val==='string' || typeof val==='number'){ VD.var[item]=val; }
      else {VD.var[item]=false;}
    }
  },
  // 设置VD.cur 的time和int值
  // 带自检功能,时间取整floor，int保留两位小数
  setCur: function(time,int){
    // 将时间和方向设置给 当前的时间和旋转角度
    if((typeof time ==='number' || typeof time ==='string') && time.toString()!=='NaN' && Number(time).toString()!=='NaN' && time!==''){
      VD.cur.time = Math.floor(Number(time))
    }else if(time === null){
      // do Nothing
    }else{ console.error('VD.setCur 参数 time 的类型不符', time, typeof time) }
    if((typeof int ==='number' || typeof int ==='string') && int.toString()!=='NaN' && Number(int).toString()!=='NaN' && int!==''){
      VD.cur.int = tool.numDot2(Number(int))
    }else if(int === null){
      // do Nothing
    }else{ console.error('VD.setCur 参数 int 的类型不符', int, typeof int) }
    return VD.cur
  },
  // 获取视频播放时间 VD.cur.time，并设置当前激活数组VD.activeArr 存储默认坐标和方向
  // 根据 用户是否操作 VD.follow，执行设定视频播放视角 VD.cur.int; VD.setInt(VD.cur.int);
  // 设置小地图坐标和视角方向
  getVideoCurTime: function(playerObj){
    VD.cur.time=Math.floor(playerObj.api_getVideoCurTime());
    VD.activeArr=VD.data[VD.cur.time];

    if(VD.follow) {
      VD.cur.int=VD.activeArr.pan // 正东方向的真实标准
      VD.setInt(VD.cur.int-VD.baseInt); // 视频的视角标准
      // console.log("getVideoCurTime: setInt ",VD.cur.int-VD.baseInt)
      VD.setLngLatInt(VD.activeArr.lng,VD.activeArr.lat,VD.cur.int);
    }else{
      VD.setLngLatInt(VD.activeArr.lng,VD.activeArr.lat,VD.PTF.pan+ VD.baseInt);
    }

  },
  // 设置当前时间
  setVideoCurTime: function(time){
    // if(!playerObj){ var playerObj=window.playerObj;}
    // console.log(playerObj)
    var timeNum= Number(time);
    if(timeNum!==NaN){ playerObj.api_setVideoCurTime(timeNum); }
    else console.log('setVideoCurTime- time不是数字，也不是Number(time): \t'+time+'\t'+typeof time);
  },
  // 获取视频播放视角
  getInt: function(playerObj){
    if(playerObj.api_getCurScenePTF){
      VD.PTF=playerObj.api_getCurScenePTF();
      if(VD.follow){VD.cur.int=VD.PTF.pan + VD.baseInt;}
    }
  },
  // 设置视频播放视角
  setInt: function(int, tilt, fov){
    var intNum= Number(int)

    if(intNum!==NaN){ 
      playerObj.api_setPanTiltFov(intNum);
      // console.log('设置视频播放视角 setInt: ', (intNum));
    } else console.error('setInt- int不是数字，也不是Number(int): \t'+int+'\t'+typeof int);
  },
  // 设置坐标和旋转角度 给地图用的 正东为0的真实角度
  setLngLatInt: function(lng,lat,int){
    // console.log('setLngLatInt设置坐标和旋转角度',lng,lat,int, typeof int);
    if(typeof window.move==='function' && map !== undefined){ window.move(lng,lat,int); }
  },
  // 视频初始化后的运行
  init: function(){
    VD.getWW();
    VD.setVar();
    VD.nameSetOther(VD.name);
    // console.log('VD.init : setVar', VD.cur.int +' \n '+ VD.var.int)
    if(VD.cur.time && VD.cur.time!==''){ VD.setVideoCurTime(VD.cur.time); }

    if(VD.autoPlayState){VD.autoPlay();} // 能自动播放，就自动播放
    else {/* 添加辅助点击事件 */
      document.body.addEventListener('keydown', VD.autoPlay);
      document.body.addEventListener('click', VD.autoPlay);
      try { playerObj.api_setVideoPlay(); // 强制播放
      } catch (error) { console.warn(error) }
    }
    
    VD.setDivState();
    VD.addClick();

    // 初始化地图
    window.init();
    // console.log('地图: init', VD.cur.int +' \n '+ VD.var.int)
  },
  // 视频自动播放
  autoPlay(){
    // console.log(VD.play, VD.autoPlayState);
    if(playerObj && typeof playerObj.api_getVideoPlayStatus ==='function'){VD.play=playerObj.api_getVideoPlayStatus();}

    if(playerObj && typeof playerObj.api_setVideoPlay ==='function'){
      playerObj.api_setVideoPlay();
      VD.removeEL();
    }
  },
  // 删除自动播放的点击事件
  removeEL(){
    if(playerObj && typeof playerObj.api_getVideoPlayStatus ==='function'){VD.play=playerObj.api_getVideoPlayStatus();}
    // console.log(VD.play, VD.autoPlayState);
    if(VD.play){
      document.body.removeEventListener('keydown', VD.autoPlay);
      document.body.removeEventListener('click', VD.autoPlay);
    }
  },
  // 测试能否自动播放，
  // 能,VD.autoPlayState 设为true,给VD.init使用
  testAutoPlay () {
    let audio = document.createElement('audio');
    audio.src = './empty-audio.mp3';
    document.body.appendChild(audio);
    let autoplay = true;
    // play返回的是一个promise
    audio.play().then(() => {
        // 支持自动播放
        autoplay = true;
    }).catch(err => {
        // 不支持自动播放
        autoplay = false;
    }).finally(() => {
        audio.remove();
        VD.autoPlayState=autoplay; // 返回一个promise以告诉调用者检测结果
    });
  },
  // 根据河道名称修改html页面的title属性
  nameSetOther(name){
    if(name && typeof name==='string' && name !== ''){
      document.title = name;
    }
  },
  // 获取页面宽度，给地图窗口使用
  getWW(){
    if(!VD.div){ VD.div=document.getElementById('container'); }
    VD.WW = window.innerWidth;
    if(typeof VD.WW !="number"){ VD.WW = (document.compatMode =='CSS1Compat') ? document.documentElement.clientWidth : document.body.clientWidth; }
  },
  // 设置地图区域大小
  setDivState(){
    var lng= VD.activeArr.lng,lat= VD.activeArr.lat
    if(!VD.contentState){
      VD.div.style.width= VD.WW/4 +'px';
      VD.div.style.height= VD.WW/16*3 +'px';
      VD.div.style.top= 'auto';
    }else {
      VD.div.style.width= VD.WW/3 +'px';
      VD.div.style.height= 'auto';
      VD.div.style.top= '0';
    }
    
    if(VD.cur.int && VD.initState){
      // console.log('setDivState开始',VD.cur.int)
      if(VD.activeArr.pan){VD.cur.int=VD.activeArr.pan }/*  + VD.baseInt */
      
      if(lng!==undefined && lat!==undefined){VD.setLngLatInt(lng,lat,VD.cur.int);}
      else {VD.setLngLatInt(null,null,VD.cur.int);}
      // console.log('setDivState开始',VD.cur.int)
    }
  },
  // 切换地图大小和设置坐标和方向
  addClick(){
    document.getElementById('btn').addEventListener('click', function(){
      var name=document.getElementById('btn').className;
      if(name==="btn open"){document.getElementById('btn').className="btn close";}
      else {document.getElementById('btn').className="btn open";}
      
      document.getElementById('btn').classList
      VD.contentState=!VD.contentState;
      // 清除点击事件
      var parent=vectorLayer.div.childNodes[0].childNodes[0];
      if(parent){window.pointsRemoveClick(parent,window.toTime);}

      window.map.unloadDestroy();
      window.init();
      setTimeout(() => { VD.setDivState(); }, 100);
    })
    document.getElementById('btn_userIsControl').addEventListener('click', function(event){
      var className = document.getElementById('btn_userIsControl').className
      if(className === 'btn userIsControl'){
        document.getElementById('btn_userIsControl').className='btn userIsControl no';
        VD.follow=false;
      }else {
        document.getElementById('btn_userIsControl').className='btn userIsControl'
        VD.follow=true;
      }
    })
  }
}
