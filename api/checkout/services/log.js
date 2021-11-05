module.exports = {
  logError: function (reason, error) {
    strapi.query("log-checkout").create({ reason, error });
  },

  cookieHandler: function () {
    let cookies = [
      "smidV2=2020090214473281ec91bee543a2c07f67021b142e5a020061933cc354e5570",
      " scarab.visitor=%224F5408189EB385E%22",
      " optimizelyEndUserId=oeu1626707402051r0.33837203131214144",
      " scarab.profile=%222478778%7C1626707521%22",
      " _fbp=fb.1.1628148312508.698105675",
      " _uetvid=cb8156a0c5b211eb8617e7265fd05338",
      " cto_bundle=nLc33V9mVjdhckJ2ZVRyMGRVazFDVFZIa0lpUH…JCa1IwZzFBMnVOdWQ0SWJ3aXJWTCUyQjJJNkt2R0ElM0QlM0Q",
      " scarab.mayAdd=%5B%7B%22i%22%3A%222659866%22%7D%2C…22846422%22%7D%2C%7B%22i%22%3A%222659602%22%7D%5D",
      " default_currency=USD",
      " language=en",
      " cookieId=C2D83796_6E30_BB34_F25B_D3303AFCBC8C",
      " cdn_key=uslang%3Dus",
      " cate_channel_type=2",
      " _gid=GA1.2.1833615739.1636081572",
      " _gcl_au=1.1.1627967749.1636081572",
      " sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A…61e028ae29c-34647600-1764000-17abf503184c13%22%7D",
      " bi_session_id=bi_1636081573851_5383",
      " _ga_SC3MXK8VH1=GS1.1.1636081596.50.0.1636081596.0",
      " _ga=GA1.1.178273898.1626707342",
      " OptanonAlertBoxClosed=2021-11-05T03:06:43.900Z",
      " OptanonConsent=hosts=&datestamp=Fri+Nov+05+2021+1…4%3A1&geolocation=CN%3BSH&AwaitingReconsent=false",
    ];

    cookies.map((x) => {
      let z = x.split("=");
    })[
      ("_c_id=1636082003926630096",
      " client_id=1636082004882236",
      " fbclid=fb.1.1636082004887.IwAR14JEgFfxYpGqUBQALseEOm_mbpviIUPyKtkFvQ51Ef_3bggDtwS-fGkCo",
      " session_id=1636082004912388",
      " shoplazza_source=%7B%22%24first_visit_url%22%3A%2…A%22Facebook%22%2C%22expire%22%3A1636686804912%7D",
      " sajssdk_2015_cross_new_user=1",
      " sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A…%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%7D%7D",
      " soundestID=20211105031326-uIi4ATSiVKnnKSClRS1ptrG61BBVGboF4gPZV8gnYRz9y4d3N",
      " omnisendAnonymousID=ThpcuRTxTzuhTr-20211105031326",
      " omnisendSessionID=AsCaHNWi1p4ZTb-20211105031326",
      " _fbc=fb.1.1636082007631.IwAR14JEgFfxYpGqUBQALseEOm_mbpviIUPyKtkFvQ51Ef_3bggDtwS-fGkCo",
      " _fbp=fb.1.1636082007633.1127370939")
    ];

    let suzhouHomepageCookie = [
      "_y=53c04156-665D-4512-04EE-C9B0CCCCC86F",
      " _shopify_y=53c04156-665D-4512-04EE-C9B0CCCCC86F",
      " _ga=GA1.2.1415930123.1633492677",
      " _fbp=fb.1.1633492677333.951709088",
      " _g1554196598=Q05Z",
      " _pin_unauth=dWlkPU5UbGtaRE16TTJNdE1qZzNaQzAwWldFMkxUa3paall0WWpZM1pqZG1OakprTURjMQ",
      " _shopify_ga=_ga=2.67166421.59420686.1633764120-1415930123.1633492677",
      " _derived_epik=dj0yJnU9RDMwUEU3TVIwbHB3ODNuc0Jld0x…09ZiZ0PUFBQUFBR0ZzMWU0JnJtPWYmcnQ9QUFBQUFHRnMxZTQ",
      " is_ajax_cart=yes",
      " _s=eec20524-E7E8-456F-4AE5-4C5EAB78708E",
      " _shopify_s=eec20524-E7E8-456F-4AE5-4C5EAB78708E",
      " _shopify_sa_p=",
      " _gid=GA1.2.1572901928.1636093263",
      " _gat=1",
      " lsContextID=4C8B6NOGP0yAT-82MXr99A",
      " _shopify_sa_t=2021-11-05T06%3A21%3A05.614Z",
      " lsSema-=",
    ];
  },
};
