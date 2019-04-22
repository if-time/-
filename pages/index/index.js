// pages/index/index.js
var imageUtil = require('../../utils/imageUtil.js');
var ctx = wx.createCanvasContext('customCanvas')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempImagePath: '../../images/index.jpg',
    location: 0,
    items: [{
      name: 'true',
      value: '是否标记罂粟位置'
    }, ],
    result: '',
    imgwidth: 0,
    imgheight: 0,
    windowWidth: 375,
    windowHeight: 603,
    imageWidth: 0,
    imageHeight: 0,
    heightScale: 0,
    widthScale: 0,
    resultlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    var windowWidth = 375
    var windowHeight = 603
    try {
      var res = wx.getSystemInfoSync()
      windowWidth = res.windowWidth
      windowHeight = res.windowHeight * 0.6
      console.log('windowWidth: ' + windowWidth + ' windowHeight : ' + windowHeight)
      that.setData({
        windowWidth,
        windowHeight
      })
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
  },

  camera: function(e) {
    var that = this
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        var tempImagePath = res.tempFilePaths
        console.log('本地图片的路径:', res.tempFilePaths[0])
        that.setData({
          tempImagePath: res.tempFilePaths[0]
        })
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function(res) {
            console.log('camera ：height :' + res.height + ' width: ' + res.width)
            var originalScale = res.height / res.width
            var imageSize = imageUtil.imageUtil(res.height, res.width)
            console.log('1缩放后的宽: ' + imageSize.imageWidth)
            console.log('1缩放后的高: ' + imageSize.imageHeight)
            var heightScale = imageSize.imageHeight / res.height
            var widthScale = imageSize.imageWidth / res.width
            console.log('1缩放后的宽比: ' + heightScale)
            console.log('1缩放后的高比: ' + widthScale)
            that.setData({
              imageWidth: imageSize.imageWidth,
              imageHeight: imageSize.imageHeight,
              heightScale,
              widthScale
            })
          },
          fail: function(res) {},
          complete: function(res) {},
        })
        console.log('windowWidth: ' + that.data.windowWidth + ' windowHeight : ' + that.data.windowHeight)

        // ctx.drawImage(that.data.tempImagePath, 0, 0, that.data.windowWidth, that.data.windowHeight)
        // ctx.draw()
        that.upload(tempImagePath)
      },
      fail: function() {},
      complete: function() {}
    });
  },

  // 上传图片
  upload: function(path) {
    var that = this
    ctx.drawImage(that.data.tempImagePath, 0, 0, that.data.imageWidth, that.data.imageHeight)
    ctx.draw()
    wx.showToast({
        icon: "loading",
        title: "正在上传"
      }),
      wx.uploadFile({
        url: 'http://3ghch6.natappfree.cc/image_detect/poppy',
        filePath: path[0],
        name: 'imFile',
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          'thresh': 0.1,
          'location': that.data.location
        },
        success: function(res) {
          console.log('上传成功返回的数据', JSON.parse(res.data).code)
          if (JSON.parse(res.data).code == 501) {
            wx.showModal({
              title: '提示',
              content: '上传失败！图像格式，请检查图像是否为三通道格式图像！',
              showCancel: false
            })
            return;
          }
          //上传成功返回数据
          console.log('上传成功返回的数据', JSON.parse(res.data).data)
          if (JSON.parse(res.data).data.length == 0) {
            that.setData({
              result: '没有罂粟花'
            })
          } else {
            var poppy = JSON.parse(res.data).data
          }
          var resultlist = that.data.resultlist 
          that.setData({
            resultlist :[]
          })
          console.log(poppy.length)
          ctx.drawImage(that.data.tempImagePath, 0, 0, that.data.imageWidth, that.data.imageHeight)
          var resultlist = []
          console.log(resultlist.length)
          for (var i = 0; i < poppy.length; i++) {
            console.log(JSON.parse(res.data).data[i])
            if (that.data.location == 1) {
              console.log(JSON.parse(res.data).data[i][2][0])
              console.log(JSON.parse(res.data).data[i][2][1])
              var x = that.data.heightScale * JSON.parse(res.data).data[i][2][0]
              var y = that.data.widthScale * JSON.parse(res.data).data[i][2][1]
              var h = (JSON.parse(res.data).data[i][2][2] - JSON.parse(res.data).data[i][2][0]) * that.data.heightScale
              var w = (JSON.parse(res.data).data[i][2][3] - JSON.parse(res.data).data[i][2][1]) * that.data.heightScale
              ctx.setFillStyle('#5F6FEE')//文字颜色：默认黑色
              ctx.setFontSize(20)//设置字体大小，默认10
              ctx.fillText(1+ i, x, y)//绘制文本
              ctx.rect(x, y, h, w)
              ctx.stroke()
              that.setData({
                result: JSON.parse(res.data).data[0][0] + ' 数目：' + JSON.parse(res.data).data.length,
              })
              var list = {
                name: JSON.parse(res.data).data[i][0],
                pos: JSON.parse(res.data).data[i][1]
              }
              resultlist.push(list)
              that.setData({
                resultlist
              })
            } else {
              that.setData({
                result: JSON.parse(res.data).data[0][0] + ' 可能性：' + JSON.parse(res.data).data[0][1],
              })
            }
          }

          ctx.draw()

          if (res.statusCode != 200) {
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
            return;
          }
        },
        fail: function(e) {
          console.log(e);
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
        },
        complete: function() {
          wx.hideToast(); //隐藏Toast
        }
      })
  },

  checkboxChange(e) {
    var that = this
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value == "true")
      that.setData({
        location: 1
      })
    else {
      that.setData({
        location: 0
      })
    }
    console.log(that.data.location)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})