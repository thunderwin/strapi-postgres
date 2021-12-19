var dayjs = require("dayjs");

function whichStage(order, now) {
  // 检查是不是在召回邮件的时间
  // 最长检查一周的时间
  let duration = dayjs(now).diff(dayjs(order.created_at), "hour");

  if (process.env.NODE_ENV === "development") {
    // 测试情况下，随机取时间
    duration = Math.floor(Math.random() * 100 + 1);
  }

  console.dir("间隔时间");
  console.log(JSON.stringify(duration));

  if (duration < 1) {
    return "firstEmail";
  } else if (duration >= 1 && duration < 24) {
    return "secondEmail";
  } else if (duration >= 24 && duration < 48) {
    return "thirdEmail";
  } else if (duration >= 48) {
    return "fourthEmail";
  } else {
    return false; // 不在召回邮件的时间
  }
}

module.exports = {
  async findAbandonOrder(ctx) {
    let now = new Date();
    let daysAgo = now.getTime() - 24 * 60 * 60 * 1000 * 7; // 7 days ago we dont care about

    let r = await strapi.query("order").find({
      created_at_gt: daysAgo,
      active: true,
      // _limit: 1000,
      _sort: "id:desc",
      abandon_null: false, // 只关心进入召回状态的订单
    });

    console.dir("找到的匹配订单");
    console.log(JSON.stringify(r.map((x) => x.id)));

    r = r.filter((x) => {
      let stage = whichStage(x, now);
      console.dir('stage')
      console.log(JSON.stringify(stage))

      if (!stage) return false; // 不在发送时间内
      if (x.abandon.includes(stage)) return false; // 已经发过邮件了
      return true;
    });

    console.dir("筛选后的订单");
    console.log(JSON.stringify(r.map((x) => x.id)));

    r = r.map((x) => {
      //接下来应该发送那个阶段的邮件
      x.abandon.push(whichStage(x, now));

      return x;
    });

    return r;
  },

  async updateOrderAbandonStage(orderList) {
    // 更新订单的 abandonStage
    orderList.map((x) => {
      try {
        strapi.query("order").update({ id: x.id }, { abandon: x.abandon });
      } catch (error) {
        console.dir(error);
      }
    });
  },
};
