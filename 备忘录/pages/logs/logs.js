Page({
  data: {
    logs: []
  },
  onLoad: function () {
    var that = this;
    // 获取之前保留在缓存里的数据
    wx.getStorage({
      key: 'todolist',
      success: function (res) {
        if (res.data) {
          that.setData({
            logs: res.data
          });
        }
      }
    });
  }
});