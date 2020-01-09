//声明全局变量 map、layer、url
var map, layer, vectorLayer, markerLayer, url = "http://47.103.120.129:8090/iserver/services/map-ugcv5-shanghai2/rest/maps/shanghai", dpoints = [], cmarker, parent, circles,icon;
function init() {
  //1.在指定DOM元素上初始化地图对象。
  map = new SuperMap.Map("container", { controls: [new SuperMap.Control.Navigation()] });
  layer = new SuperMap.Layer.TiledDynamicRESTLayer("shanghai", url, { transparent: true, cacheEanbled: true }, { maxResolution: "auto" });
  vectorLayer = new SuperMap.Layer.Vector("line_points");
  getPoints();
  markerLayer = new SuperMap.Layer.Markers("Markers");
  // 监听图层信息加载完成事件，异步加载图层。
  layer.events.on({ "layerInitialized": addLayer });
  VD.initState = true;
  // 设置点和线的time属性，方便点击事件
  pointsAddClick(parent, toTime);
  setTimeout(() => { setPointsTime() }, 2000);
}
//将Layer图层加载到Map对象上。
function addLayer() {
  var lat = VD.data[0].lat || 31.16, lng = VD.data[0].lng || 121.42;
  if (VD.cur.time) { lat = VD.data[Number(VD.cur.time)].lat; lng = VD.data[Number(VD.cur.time)].lng; }
  map.addLayers([layer, vectorLayer, markerLayer]);
  map.setCenter(new SuperMap.LonLat(lng, lat), 8);
}
// init();
// 设置点和线的time属性，方便点击事件
function setPointsTime() {
  parent = vectorLayer.div.childNodes[0].childNodes[0]
  if (parent) {
    if (!circles || !circles.length) { circles = parent.getElementsByTagName('circle') }
    // polylines = parent.getElementsByTagName('polyline') // 线段只有177个，与点不匹配
    setEleAttribute(circles)
    // console.log('setPointsTime() -circles/polyline', circles.length,polyline.length)
  }
}
// circles 是 HTMLCollection，通过getElementsByTagName('circle')
function setEleAttribute(circles) {
  // console.log('setEleAttribute() ',circles.length)
  if (circles && circles.length && circles[0].getAttribute('time') === null) {
    for (let i = 0, len = circles.length; i < len; i++) {
      if (typeof circles[i].setAttribute === "function") {
        circles[i].setAttribute('time', i);
        // console.log('添加的属性： ', circles[i].getAttribute('time'))
      }
      else { console.error('点坐标添加time属性错误: i/本身/父级', i, circles[i], circles[i].parentNode) }
    }
  }
}
function toTime(event) {
  if (event.target.tagName.toLowerCase() !== 'circle') { return; }
  var target = event.target, time = target.getAttribute('time') || null;
  // console.log('toTime: ',time,target.tagName)
  if (time !== null) { /* 跳转操作 // console.log( 'toTime(event)',time) */ VD.setVideoCurTime(Number(time)) }
  else { /*console.warn('获取time属性错误: ', target);*/  setPointsTime(); /*没获取属性，那就重新设置一次*/ }
}
function showMouseover(event){
  if (event.target.tagName.toLowerCase() !== 'circle') { return; }
  var target = event.target, time = target.getAttribute('time') || null;
  if (time !== null){
    var imgSrc = './video/VID_20190905_145607/thumb/' + (Number(time)+1) + '.jpg',
        left = event.clientX < 100 ? 100+'px' : event.clientX+'px',
        top = event.clientY < 100 ? 100+'px' : event.clientY+'px';
    if(showImg){showImg = document.getElementById('showImg');}
    if(showImg_img){showImg_img = document.getElementById('showImg_img');}
    showImg.style.display="block"
    showImg.style.left= left
    showImg.style.top= top
    showImg_img.setAttribute('src',imgSrc)
  }
}
function showMouseout(event){
  if (event.target.tagName.toLowerCase() !== 'circle') { return; }
  if(showImg){showImg = document.getElementById('showImg');}
  if(showImg_img){showImg_img = document.getElementById('showImg_img');}
  if(showImg.style.display==="block"){showImg.style.display="none";}
}
// 设置点和线的父级，添加点击事件
function pointsAddClick(ele, func) {
  ele.addEventListener('click', func)
  ele.addEventListener("mouseover", showMouseover)
  ele.addEventListener("mouseout", showMouseout)
}
// 设置点和线的父级，移除点击事件
function pointsRemoveClick(ele, func) {
  ele.removeEventListener('click', func)
  ele.removeEventListener("mouseover", showMouseover)
  ele.removeEventListener("mouseout", showMouseout)
}
function getPoints() {
  var result = VD.data;
  dpoints = []; // 重复刷新时，window.init() 重复，导致  dpoints数据重复
  if (result && result.length) {
    result.forEach(item => {
      if (!item.lng || !item.lat || typeof item.lng !== "number" || typeof item.lat !== "number") { console.error('类型错误，数据中的lng，和lat不是浮点，', item); return; }
      dpoints.push(new SuperMap.Geometry.Point(item.lng, item.lat));
    })
  }
  //  console.log('dpoints: ',dpoints)
  addLine(dpoints);
  addPoint(dpoints);
}

function addLine(points) {
  var style = { strokeColor: "#243f78",strokeWidth: 12,pointerEvent: "visiblePainted",fillColor: "#679cd2",fillOpacity: 0.4 };
  var line = new SuperMap.Geometry.LineString(points);
  var lineVector = new SuperMap.Feature.Vector(line, null, style);
  vectorLayer.removeAllFeatures()
  vectorLayer.addFeatures(lineVector);
}

function addPoint(points) {
  var style = { fillColor: "#00f6ff", strokeColor: "#00f6ff", pointRadius: 5 };
  var multiPoint = new SuperMap.Geometry.MultiPoint(points);
  var pointVector = new SuperMap.Feature.Vector(multiPoint, null, style);
  vectorLayer.addFeatures(pointVector);
}

function curPosition(x, y, dir) {
  if (x != null && x != "null") {
    //  console.log( 'curPosition',x,y,dir)
    if (cmarker) markerLayer.removeMarker(cmarker);
    if(!icon){
      var size = new SuperMap.Size(110, 110),
      offset = new SuperMap.Pixel(-(size.w / 2), -(size.h / 2));
      icon = new SuperMap.Icon("./skin/dir.png", size, offset);
    }
    var marker = new SuperMap.Marker(new SuperMap.LonLat(x, y), icon);
    cmarker = marker;
    markerLayer.addMarker(marker);
  }
  var d = parseInt(dir) + 90;
  var img=document.getElementById("container").getElementsByTagName("img") //  console.log(img);
  if (img.length) { img[0].style.transform = "rotate(" + d + "deg)"; }
}
var num = 0;
function move(x, y, dir) {
  if (map == null){init();}
  curPosition(x, y, dir);
  try {
    num += 1;
    if (num > 60) { map.setCenter(new SuperMap.LonLat(x, y));/*map.panTo(new SuperMap.LonLat(x,y));*/num = -1; }
  } catch (error) { console.log('map.setCenter(new SuperMap.LonLat(lng,lat));', error); }
}
