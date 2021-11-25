
    // <script src="https://zcdigitals.mynatapp.cc/js/test.js"></script>
    //注入在layout , theme.liquid，全局就能跑


function loadSetting(){
	console.log('enter')
	const settingUrl = 'https://zcdigitals.mynatapp.cc/checkout'; //setting request url
	let params = {}
	params.siteUrl = siteUrl
	return new Promise(function(resolve,reject){
	const xhr = new XMLHttpRequest();
	const METHOD = "GET" // get or post , or auth
	xhr.open(METHOD,settingUrl);
	//xhr.setRequestHeader('Authorization', 'Bearer ' + access_token); if need access tokeen
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify(params));
		xhr.onreadystatechange=(e)=>{
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					// resolve(e)
				resolve({
					'coupon':'abc',
					'shipping' :'btc'
				})
		}
		}
	})
}
// get current url 
let currentURL = window.location.href;
currentURL = currentURL.replace('https://','')
let urlIndex = currentURL.indexOf('/')
let siteUrl = currentURL.slice(0,urlIndex)
if (currentURL.indexOf('contact') != -1){  // any url need to be used
	//每个page也可以load不同配置
 	console.log('eee')
 	loadSetting().then(result=>{
 		console.log(result,'result return')
 		let setting = {
 			'shipping' : '123',
 			"coupon" : "15%"
 		}

 		let shippingID = 'test' // 改成需要改的shipping的那个div/label或其他的id
 		let element = document.getElementById(shippingID)
 		element.innerHTML = 'shipping:' + setting.shipping
 		///// 其他需要模块就这么改
 	})
}

if (currentURL.indexOf("checkout") != -1){
	// 其他页面配置文件
}


