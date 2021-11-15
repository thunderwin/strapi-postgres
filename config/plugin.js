module.exports = ({ env }) => ({
  //  https://www.npmjs.com/package/strapi-provider-email-mailgun
  // ...
  sentry: {
    // https://github.com/strapi/strapi/tree/master/packages/strapi-plugin-sentry
    dsn: env("SENTRY_DSN"),
    sendMetadata: false,
  },
  email: {
    provider: "sendgrid",
    providerOptions: {
      apiKey: env("SENDGRID_API_KEY"),
    },
    settings: {
      defaultFrom: "info@wudizu.com",
      defaultReplyTo: "info@wudizu.com",
    },
  },

  // ...
});
