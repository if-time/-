// pages/index/index.js
var ctx = wx.createCanvasContext('customCanvas')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempImagePath: '../../images/index.jpg',
    location: 0,
    items: [
      { name: 'true', value: '是否标记罂粟位置' },
    ],
    result: '',
    imgwidth: 0,
    imgheight: 0,
    windowWidth: 375,
    windowHeight: 603
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  camera: function () {
    var that = this
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var tempImagePath = res.tempFilePaths
        console.log('本地图片的路径:', res.tempFilePaths[0])
        that.setData({
          tempImagePath: res.tempFilePaths[0]
        })
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (res) {
            console.log('height :' + res.height + ' width: ' + res.width)
          },
          fail: function (res) { },
          complete: function (res) { },
        })
        console.log('windowWidth: ' + that.data.windowWidth + ' windowHeight : ' + that.data.windowHeight)
        ctx.drawImage(that.data.tempImagePath, 0, 0, that.data.windowWidth, that.data.windowHeight)
        if (that.data.location == 1) {      
          ctx.rect(10, 10, 100, 50)     
          ctx.stroke()
          ctx.draw()
        } else {
          ctx.draw()
        }
        that.upload(tempImagePath)
      },
      fail: function () { },
      complete: function () { }
    });
  },

  // 上传图片
  upload: function (path) {
    var that = this
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    }),
      wx.uploadFile({
        url: 'http://7fbutf.natappfree.cc/image_detect/poppy',
        filePath: path[0],
        name: 'imFile',
        header: { "Content-Type": "multipart/form-data" },
        formData: {
          'thresh': 0.1,
          'location': that.data.location
        },
        success: function (res) {
          //上传成功返回数据
          console.log('上传成功返回的数据', JSON.parse(res.data).data);
          that.setData({
            result: JSON.parse(res.data).data[0],
          })
          ctx.drawImage(that.data.tempImagePath, 0, 0, that.data.windowWidth, that.data.windowHeight)
          if (that.data.location == 1) {
            ctx.rect(10, 10, 100, 50)
            ctx.stroke()
            ctx.draw()
          } else {
            ctx.draw()
          }
          // 页面渲染完成  
          var that = this
          console.log('onReady')
          wx.getImageInfo({
            src: path[0],
            success: function (res) {
              console.log('onReady : height :' + res.height + ' width: ' + res.width)
              that.setData({
                imgwidth: res.width,
                imgheight: res.height,
              })
            },
            fail: function (res) { },
            complete: function (res) { },
          })
          if (res.statusCode != 200) {
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
            return;
          }
        },
        fail: function (e) {
          console.log(e);
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
        },
        complete: function () {
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})