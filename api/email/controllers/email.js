"use strict";

module.exports = {
  async setAsAbandoned(ctx) {
    // 每20分钟运行一次，把没没支付的订单改为 abandonStage === 0 , 进入召回流程
    let now = new Date();
    let duration = now.getTime() - 20 * 60 * 60 * 1000; // 只看20分钟内的订单

    let r = await strapi.query("order").find({
      created_at_gt: duration,
      active: true,
    });

    r.map(x => {
      try {
        strapi.query("order").update({ id: x.id }, { abandonStage: 0 });
      } catch (error) {
        console.dir(error);
      }
    })



    return ctx.send('ok')
  },

  async abandonedEmail(ctx) {
    // 每20分钟运行一次，开始发送邮件
    let r = await strapi.services.abandonorder.order();

    return ctx.send(r);
  },
};
