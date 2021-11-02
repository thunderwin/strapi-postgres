const config = require("./website");

module.exports = (strapi) => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        let body = ctx.request.body;

        console.dir('bidy')
        console.log(JSON.stringify(body))


        if (body && body.domain) {
          let websiteConfig = config(body.domain);
          ctx.websiteConfig = websiteConfig;
        }

        await next();
      });
    },
  };
};
