const axios = require("axios");
const { ads } = require("../controllers/order");

const ax = axios.create({
  baseURL: `https://graph.facebook.com/v12.0/`,
  timeout: 1000 * 10,
});

// 发送前拦截 request-请求
ax.interceptors.request.use((config) => {
  // 添加请求头
  // console.dir("config");
  // console.log(JSON.stringify(config));
  // config.params = {}; // 增加默认的参数
  // config.params["access_token"] = VarConfig.facebookAPPToken;
  return config;
});

// 数据返回后的拦截 response-响应
ax.interceptors.response.use(
  function (res) {
    console.dir("返回");
    console.log(res.data);
    return res.data;
  },
  function (error) {
    console.dir("出错");
    console.log(error);
  }
);


const adsfields = `name,status,conversion_domain,insights{spend,clicks,cpc,cpm,cpp,reach,date_start,date_stop,impressions},preview_shareable_link,adcreatives{link_url,name,title,object_url,link_destination_display_url,status,url_tags,object_story_spec}}`
const token = `EAANTZCILthtMBAO68xmBOzsRP1mcHfPS0HTze45iPv22iDuZCYuJFM3dGfhvNiOcNJJ6h3Qc1jWg9CsIbedHKRCTMz5DBj3eEQRrTP50KO1y3HVY8X1ofxGlSaWn07Nj3EEh4eNrhC98PAGfP4LZA6BBHbynYySgr4V7ir8TuGGhNaluFO6`;
module.exports = {
  async allMyAds(ctx) {
    let path = `me?fields=adaccounts{name,balance}`;
    let r = await ax.get(`${path}&access_token=${token}`);

    let accountList = r.adaccounts.data;

    return accountList;
  },

  async adsdetail(adAccountId){

    let path = `${adAccountId}?fields=name,balance,ads{name,status,conversion_domain,insights{spend,clicks,cpc,cpm,cpp,reach,date_start,date_stop,impressions},preview_shareable_link,adcreatives{link_url,name,title,object_url,link_destination_display_url,status,url_tags,object_story_spec}}`;

    let r = await ax.get(`${path}&access_token=${token}`);

    console.dir('r')
    console.log(JSON.stringify(r))


    return r;

  }
};
