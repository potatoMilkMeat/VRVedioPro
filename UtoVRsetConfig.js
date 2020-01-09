/*播放器参数配置*/
function UtoVRsetConfig(){
  window.playerObj = null;
  window.timer = null;
  window.params = {
    container: document.getElementById("panoDesk"),
    name: "SceneViewer",
    scenesArr: [
      // todo:注意修改视频路径，需要保证播放页面与视频属于同一域名下
      { sceneId: "v1", sceneName: "VR河道视频", sceneFilePath: VD.sceneFilePath, sceneType: "Video", initFov: 150 }
    ],
    //播放器不支持全景播放回调
    // errorCallBack: function (e) {
    //     // console.log("错误状态：" + e);
    // },
    // //浏览器不支持全屏回调
    // fsCallBack: function (status, playObj) {
    //     // alert("浏览器不支持全屏！");
    // },
    initOverCallBack: function () {
      playerObj = this;/*将播放器对象赋值给playerObj*/
    },
    loadedStartCallBack: function () {
      window.VD.init();/*播放器开始实例化 只运行一次*/
    },
    // loadedCallBack: function(){
    //     /*场景加载完成回调  没次儿切换清晰度，重新开始*/
    // },
    videoPlayerCallBack: function () {
      // console.log( '播放CallBack',...arguments);
      if (playerObj && typeof playerObj.api_getVideoPlayStatus === 'function') { VD.play = playerObj.api_getVideoPlayStatus(); }
      if (timer) { clearInterval(timer) }
      timer = setInterval(() => { VD.getVideoCurTime(window.playerObj) }, 1000);
    },
    videoTogglePlayCallBack: function () {
      // console.log( '停CallBack',...arguments);
      if (playerObj && typeof playerObj.api_getVideoPlayStatus === 'function') { VD.play = playerObj.api_getVideoPlayStatus(); }
      clearInterval(timer);
      timer = null;
    },
    // setVideoCurTimeCallBack: function(){
    //     // console.log('设置播放时间后回调',...arguments);
    // },
    scenePanTiltFovChangerCallBack: function () {
      if (playerObj) {
        VD.getInt(playerObj);
        // console.log('场景角度改变回调',VD.cur.int,VD.initState);
      }
      if (VD.cur.int && VD.initState) {
        VD.setLngLatInt(null, null, VD.PTF.pan + VD.baseInt);
        // console.log('场景角度改变回调',VD.PTF.pan,VD.PTF.pan+ VD.baseInt)
      }
    }
  };
  // 码率配置
  window.TBConfig = {
    videoQuality: 1,
    videoList: [
      {
        "Text": "标清",
        "Quality": 1,
        "Resolution": "1920x960",
        "MP4": VD.sceneFilePath,
        "RTMP": null
      },
      {
        "Text": "高清",
        "Quality": 2,
        "Resolution": "3840x1920",
        "MP4": VD.sceneFilePath4K,
        "RTMP": null
      }]
  };
}

