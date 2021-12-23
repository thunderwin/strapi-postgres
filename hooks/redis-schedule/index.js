const { schedule } = require("./lib/saver");
const subscriber = require("./lib/subscriber");
module.exports = (strapi) => {
  const hook = {
    /**
     * Default options
     */
    defaults: {
      // config object
    },
    /**
     * Initialize the hook
     */
    async initialize() {
      console.log("hooks loaded");
      strapi.services["redis-schedule"] = schedule;
      subscriber(null, async ({ orderId, templateId }) => {
        const order = await strapi.query("order").findOne({ id: orderId });
        if (!order) return;
        const { active = false, email = "" } = order;
        if (!active && email) {
          //...发送邮件
          strapi.services["email-template"].sendEmail({ orderid, templateId });
        }
      });
    },
  };

  return hook;
};
