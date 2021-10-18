module.exports = ({ env }) => ({
  //  https://www.npmjs.com/package/strapi-provider-email-mailgun
  // ...
  email: {
    provider: "mailgun",
    providerOptions: {
      apiKey: env("MAILGUN_API_KEY"),
      domain: env("MAILGUN_DOMAIN"), //Required if you have an account with multiple domains
      host: env("MAILGUN_HOST", "api.mailgun.net"), //Optional. If domain region is Europe use 'api.eu.mailgun.net'
    },
    settings: {
      defaultFrom: "woooms@qq.com", // set an gmail here
      defaultReplyTo: "woooms@qq.com", // set an gmail heres
    },
  },
  // ...
});
