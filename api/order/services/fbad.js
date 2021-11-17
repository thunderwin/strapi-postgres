const bizSdk = require("facebook-nodejs-business-sdk");
const { websites } = require("../../../config/website");

const accessToken = "936768923600595|yJrXD_laEG9IixUg_zd3kPUXJ_s";
const accountId = "act_687321151405224"; // 广告账户id

const findAdAccounts = async () => {
  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
  const AdAccount = bizSdk.AdAccount;
  const Campaign = bizSdk.Campaign;

  const account = new AdAccount(accountId);
  var campaigns;

 let acc = await account.read([AdAccount.Fields.name])

  // let r = await acc.getCampaigns([Campaign.Fields.name], { limit: 10 })

  return acc
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
};

module.exports = { findAdAccounts };
