var util = require("../../utils/util.js");

// 更改数组 第三个参数是对象
function editArr(arr, i, editCnt) {
  let newArr = arr, editingObj = newArr[i];
  for (var x in editCnt) {
    editingObj[x] = editCnt[x];
  }
  return newArr;
}
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
// 获取应用实例
var app = getApp();
Page({
  data: {
    userInfo: {},
    curIpt: '',
    showAll: true,
    lists: [],
    curRange: [],
    curBegin: '00:00',
    curFinish: '00:00',
    isReminder: false
  },
  // 事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    });
  },
  onLoad: function () {
    var that = this;
    // 获取之前保留在缓存里的数据
    wx.getStorage({
      key: 'todolist',
      success: function (res) {
        if (res.data) {
          that.setData({
            lists: res.data
          });
          that.sortTasksByStartTime();
        }
      }
    });
    // 获取用户信息
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      });
    });
    const curBegin = that.getCurrentTime();
    const curFinish = that.getNextMinuteTime();
    that.setData({
      curBegin: curBegin,
      curFinish: curFinish
    });
  },
  iptChange: function (e) {
    let timeArr = util.setTimeHalf();
    this.setData({
      curIpt: e.detail.value,
      curRange: timeArr
    });
  },
  getCurrentTime: function () {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 获取下一分钟时间的函数
  getNextMinuteTime: function () {
    const now = new Date();
    const nextMinute = new Date(now.getTime() + 60000); // 60000 milliseconds = 1 minute
    const hours = String(nextMinute.getHours()).padStart(2, '0');
    const minutes = String(nextMinute.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  finishChange: function (e) {
    this.setData({
      curFinish: e.detail.value
    });
  },
  formReset: function () {
    this.setData({
      curIpt: '',
      curRange: []
    });
  },
  formSubmit: function () {
    let cnt = this.data.curIpt, newLists = this.data.lists, i = newLists.length;
    let begin = this.data.curBegin; // 直接使用选择的开始时间
    let finish = this.data.curFinish; // 直接使用选择的结束时间
    let isReminder = this.data.isReminder; // 直接使用提醒状态
    let currentDate = getCurrentDate(); // 获取当前日期
    if (cnt) {
      newLists.push({ id: i, content: cnt, done: false, beginTime: begin, finishTime: finish, isReminder: isReminder, editing: false, date: currentDate });
      this.setData({
        lists: newLists,
        curIpt: ''
      });
      this.sortTasksByStartTime();
      this.saveData(); // 保存数据
    }
  },

  beginChange: function (e) {
    this.setData({
      curBegin: e.detail.value
    });
  },
  finishChange: function (e) {
    this.setData({
      curFinish: e.detail.value
    });
  },
  switch1Change: function (e) {
    this.setData({
      isReminder: e.detail.value
    });
  },
  // 修改备忘录
  toChange: function (e) {
    let i = e.target.dataset.id;
    let newLists = this.data.lists;
    // 设置 curVal 为 content，确保编辑框显示文本
    newLists[i].curVal = newLists[i].content;
    newLists[i].editing = true;  // 进入编辑模式
    this.setData({
      lists: newLists
    });
  },
  iptEdit: function (e) {
    let i = e.target.dataset.id;
    let newLists = this.data.lists;
    newLists[i].curVal = e.detail.value;  // 更新 curVal
    this.setData({
      lists: newLists
    });
  },
  saveEdit: function (e) {
    let i = e.target.dataset.id;
    let newLists = this.data.lists;
    newLists[i].content = newLists[i].curVal;  // 将 curVal 保存到 content
    newLists[i].editing = false;  // 结束编辑模式
    this.setData({
      lists: newLists
    });
    this.saveData(); // 保存数据
  },
  setDone: function (e) {
    let i = e.target.dataset.id, originalDone = this.data.lists[i].done;
    this.setData({
      lists: editArr(this.data.lists, i, { done: !originalDone })
    });
    this.saveData(); // 保存数据
  },
  toDelete: function (e) {
    let i = e.target.dataset.id, newLists = this.data.lists;
    newLists.splice(i, 1);
    this.setData({
      lists: newLists
    });
    this.sortTasksByStartTime();
    this.saveData(); // 保存数据
  },
  doneAll: function () {
    let newLists = this.data.lists.map(l => ({ ...l, done: true }));
    this.setData({
      lists: newLists
    });
    this.sortTasksByStartTime();
    this.saveData(); // 保存数据
  },
  deleteAll: function () {
    this.setData({
      lists: [],
      remind: []
    });
    this.saveData(); // 保存数据
  },
  showUnfinished: function () {
    this.setData({
      showAll: false
    });
  },
  showAll: function () {
    // 显示全部事项
    this.setData({
      showAll: true
    });
  },
  saveData: function () {
    let listsArr = this.data.lists;
    wx.setStorage({
      key: 'todolist',
      data: listsArr
    });
  },
  sortTasksByStartTime: function () {
    const sortedLists = this.data.lists.sort((a, b) => {
      if (a.beginTime > b.beginTime) {
        return 1;
      } else if (a.beginTime < b.beginTime) {
        return -1;
      }
      if (a.finishTime !== null && b.finishTime !== null) {
        return 1;
      } else if (a.finishTime < b.finishTime) {
        return -1;
      }
      return 0;
    });
    this.setData({ lists: sortedLists });
  },
  // 编辑模式中开始时间变化
  editBeginChange: function (e) {
    let i = e.target.dataset.id;
    let newLists = this.data.lists;
    if (newLists[i]) {
      newLists[i].beginTime = e.detail.value;  // 更新开始时间
      this.setData({
        lists: newLists
      });
      this.saveData(); // 保存数据
    }
  },
  // 编辑模式中结束时间变化
  editFinishChange: function (e) {
    let i = e.target.dataset.id;
    let newLists = this.data.lists;
    if (newLists[i]) {
      newLists[i].finishTime = e.detail.value;  // 更新结束时间
      this.setData({
        lists: newLists
      });
      this.saveData(); // 保存数据
    }
  },
  // 编辑模式中提醒开关变化
  editSwitch1Change: function (e) {
    let i = e.target.dataset.id;
    let newLists = this.data.lists;
    if (newLists[i]) {
      newLists[i].isReminder = e.detail.value;  // 更新提醒状态
      this.setData({
        lists: newLists
      });
      this.saveData(); // 保存数据
    }
  }
});