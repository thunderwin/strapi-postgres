const requestIp = require("request-ip");

module.exports = (strapi) => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {

        const clientIp = requestIp.getClientIp(ctx);

        console.dir('IP')
        console.log(clientIp)


        ctx.realIp = clientIp;
        await next();

      });
    },
  };
};
