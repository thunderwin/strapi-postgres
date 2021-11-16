const bizSdk = require("facebook-nodejs-business-sdk");
const { websites } = require("../../../config/website");

const accessToken =
  "EAANTZCILthtMBAPMUQyUj4a6xrP34CnEJvY4qGZBte6SqAnTZBrypZCQ4XAuQlRyA0TgzbX1WC5lYCxMFR0OudU4GcmQb15JT5n8hu3tdrgoAGVRpZBUs6LBfGjN4Rnz7RFhlkI5REwv9NZBOmpJ0pTpLnO4EFeNUPuESxYUip4XsgClv9uGn0h6phUIY44u4ZD";
const accountId = "act_293869622614910"; // 广告账户id

const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;

const account = new AdAccount(accountId);
var campaigns;

account
  .read([AdAccount.Fields.name])
  .then((account) => {
    return account.getCampaigns([Campaign.Fields.name], { limit: 10 }); // fields array and params
  })
  .then((result) => {
    campaigns = result;
    campaigns.forEach((campaign) => console.log(campaign.name));
  })
  .catch(console.error);
