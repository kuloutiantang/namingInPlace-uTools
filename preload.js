/** @format */

// 全局变量
let input_key = "";
let input_value = "";

// 字符处理
let codeName = (text, type) => {
	if (type == "UpperCamelCase") {
		// 大驼峰：常用于类名
		const words = text
			.replace(/[^a-zA-Z0-9]/g, " ")
			.toLowerCase()
			.split(" "); // 去除字符串中的非字母数字字符
		let result = "";
		for (let i = 0; i < words.length; i++) {
			result += words[i].charAt(0).toUpperCase() + words[i].slice(1); // 遍历所有单词，将每个单词首字母大写并拼接至结果字符串
		}
		return result;
	} else if (type == "snake_case") {
		// 蛇形：常用于文件系统
		const words = text
			.replace(/[^a-zA-Z0-9]/g, " ")
			.toLowerCase()
			.split(" "); // 去除字符串中的非字母数字字符
		let result = words[0]; // 保留第一个转为小写的单词
		for (let i = 1; i < words.length; i++) {
			result += "_" + words[i]; // 遍历剩余的单词，在每个单词前添加“_”并拼接至结果字符串
		}
		return result;
	} else if (type == "UPPER_SNAKE_CASE") {
		// 大写蛇形：常用于常量
		const words = text
			.replace(/[^a-zA-Z0-9]/g, " ")
			.toUpperCase()
			.split(" "); // 去除字符串中的非字母数字字符
		let result = words[0]; // 保留第一个转为大写的单词
		for (let i = 1; i < words.length; i++) {
			result += "_" + words[i]; // 遍历剩余的单词，在每个单词前添加“_”并拼接至结果字符串
		}
		return result;
	} else if (type == "kebab-case") {
		// 烤肉串式：常用于LISP
		const words = text
			.replace(/[^a-zA-Z0-9]/g, " ")
			.toLowerCase()
			.split(" "); // 去除字符串中的非字母数字字符
		let result = words[0]; // 保留第一个转为小写的单词
		for (let i = 1; i < words.length; i++) {
			result += "-" + words[i]; // 遍历剩余的单词，在每个单词前添加“-”并拼接至结果字符串
		}
		return result;
	} else {
		// 默认：小驼峰
		const words = text
			.replace(/[^a-zA-Z0-9]/g, " ")
			.toLowerCase()
			.split(" "); // 去除字符串中的非字母数字字符
		let result = words[0]; // 保留第一个转为小写的单词
		for (let i = 1; i < words.length; i++) {
			result += words[i].charAt(0).toUpperCase() + words[i].slice(1); // 遍历剩余的单词，将每个单词首字母大写并拼接至结果字符串
		}
		return result;
	}
};

window.exports = {
	names: {
		mode: "none",
		args: {
			enter: (action) => {
				// 传入参数
				let incomingParameters = action.payload;

				// 本地数据库
				let namingFormat, translationEngine, AppId, Key;
				namingFormat = window.utools.dbStorage.getItem("namingFormat") ? window.utools.dbStorage.getItem("namingFormat") : "lowerCamelCase";
				translationEngine = window.utools.dbStorage.getItem("translationEngine")
					? window.utools.dbStorage.getItem("translationEngine")
					: "baidu";
				AppId = window.utools.dbStorage.getItem(translationEngine + "AppId");
				Key = window.utools.dbStorage.getItem(translationEngine + "Key");

				// 翻译
				if (translationEngine == "google") {
					// 谷歌翻译，我没key，不接
					window.utools.outPlugin();
				} else if (translationEngine == "?") {
					// 其他翻译
					window.utools.outPlugin();
				} else if (translationEngine == "youdao") {
					// 有道翻译
					let salt = "salt";
					let input =
						incomingParameters.length > 20
							? incomingParameters.substring(0, 10) + incomingParameters.length + incomingParameters.substring(str.length - 10)
							: incomingParameters;
					let timestamp = Math.floor(Date.now() / 1000);
					let to_be_encrypted = AppId + input + salt + timestamp + Key;
					const crypto = require("crypto");
					let sha256 = crypto.createHash("sha256");
					let sign = sha256.update(to_be_encrypted).digest("hex");
					let url =
						"https://openapi.youdao.com/api" +
						"?q=" +
						incomingParameters +
						"&from=auto&to=en" +
						"&appKey=" +
						AppId +
						"&salt=" +
						salt +
						"&sign=" +
						sign +
						"&signType=v3" +
						"&curtime=" +
						timestamp;
					// 发起请求
					const https = require("https");
					https
						.get(url, (response) => {
							let result = "";
							response.on("data", (chunk) => {
								result += chunk;
							});
							response.on("end", () => {
								let res = JSON.parse(result);
								if (res.errorCode == "0") {
									// 翻译结果
									let print = codeName(res.translation[0], namingFormat);
									window.utools.hideMainWindowTypeString(print);
									window.utools.outPlugin();
								} else {
									// 错误码
									let print = "翻译错误：" + result + "。请检查设置或网络。";
									window.utools.hideMainWindowTypeString(print);
									window.utools.outPlugin();
								}
							});
						})
						.on("error", (error) => {
							window.utools.hideMainWindowTypeString("命名失败：" + error.message);
							window.utools.outPlugin();
						});
				} else {
					// 默认：百度翻译
					let salt = "salt"; // 随机字符串就免了
					let to_be_encrypted = AppId + incomingParameters + salt + Key;
					const crypto = require("crypto");
					let md5 = crypto.createHash("md5");
					let sign = md5.update(to_be_encrypted).digest("hex");
					let url =
						"https://fanyi-api.baidu.com/api/trans/vip/translate" +
						"?q=" +
						encodeURIComponent(incomingParameters) +
						"&from=auto&to=en" +
						"&appid=" +
						AppId +
						"&salt=" +
						salt +
						"&sign=" +
						sign;
					// 发起请求
					const https = require("https"); // 引别的还要自己安装，基础库够用。你utools怎么不内置一个http请求？
					https
						.get(url, (response) => {
							let result = "";
							response.on("data", (chunk) => {
								result += chunk;
							});
							response.on("end", () => {
								let res = JSON.parse(result);
								if (res.error_code) {
									// 错误码
									let print = "翻译错误：" + result + "。请检查设置或网络。";
									window.utools.hideMainWindowTypeString(print);
									window.utools.outPlugin();
								} else {
									// 翻译结果
									let print = codeName(res.trans_result[0].dst, namingFormat);
									window.utools.hideMainWindowTypeString(print);
									window.utools.outPlugin();
								}
							});
						})
						.on("error", (error) => {
							window.utools.hideMainWindowTypeString("命名失败：" + error.message);
							window.utools.outPlugin();
						});
				}
			},
		},
	},
	set: {
		mode: "list",
		args: {
			enter: (action, callbackSetList) => {
				callbackSetList([
					{
						title: "设置命名格式",
						description: "可选：小驼峰、大驼峰、蛇形、大写蛇形、烤肉串式",
						module: 1,
						type: "setNamingFormat",
					},
					{
						title: "设置翻译引擎",
						description: "可选：百度翻译、有道翻译",
						module: 1,
						type: "setUpTranslationEngine",
					},
				]);
			},
			// 用户选择列表中某个条目时被调用
			select: (action, itemData, callbackSetList) => {
				if (itemData.module == 1) {
					// 顶级选项
					if (itemData.type == "setNamingFormat") {
						let oldNamingFormat = window.utools.dbStorage.getItem("namingFormat");
						callbackSetList([
							{
								title: "小驼峰" + (oldNamingFormat == "lowerCamelCase" ? " (已选)" : ""),
								description: "lowerCamelCase",
								module: 3,
								type: "lowerCamelCase",
							},
							{
								title: "大驼峰" + (oldNamingFormat == "UpperCamelCase" ? " (已选)" : ""),
								description: "UpperCamelCase",
								module: 3,
								type: "UpperCamelCase",
							},
							{
								title: "蛇形" + (oldNamingFormat == "snake_case" ? " (已选)" : ""),
								description: "snake_case",
								module: 3,
								type: "snake_case",
							},
							{
								title: "大写蛇形" + (oldNamingFormat == "UPPER_SNAKE_CASE" ? " (已选)" : ""),
								description: "UPPER_SNAKE_CASE",
								module: 3,
								type: "UPPER_SNAKE_CASE",
							},
							{
								title: "烤肉串式" + (oldNamingFormat == "kebab-case" ? " (已选)" : ""),
								description: "kebab-case",
								module: 3,
								type: "kebab-case",
							},
						]);
					} else if (itemData.type == "setUpTranslationEngine") {
						let oldTranslationEngine = window.utools.dbStorage.getItem("translationEngine");
						callbackSetList([
							{
								title: "百度翻译" + (oldTranslationEngine == "baidu" ? " (已选)" : ""),
								description: "fanyi-api.baidu.com",
								module: 2,
								type: "baidu",
							},
							{
								title: "有道翻译" + (oldTranslationEngine == "youdao" ? " (已选)" : ""),
								description: "ai.youdao.com",
								module: 2,
								type: "youdao",
							},
						]);
					}
				} else if (itemData.module == 3) {
					// 设置命名格式
					window.utools.dbStorage.setItem("namingFormat", itemData.type);
					window.utools.outPlugin();
				} else if (itemData.module == 2) {
					// 选择引擎
					if (itemData.type == "baidu") {
						callbackSetList([
							{
								title: "设置百度翻译为翻译引擎",
								module: 4,
								type: itemData.type,
							},
							{
								title: "修改百度翻译APP ID",
								description: "百度翻译开放平台-控制台-开发者信息",
								module: 5,
								type: itemData.type + "AppId",
							},
							{
								title: "修改百度翻译密钥",
								description: "百度翻译开放平台-控制台-开发者信息",
								module: 5,
								type: itemData.type + "Key",
							},
						]);
					} else if (itemData.type == "youdao") {
						callbackSetList([
							{
								title: "设置有道翻译为翻译引擎",
								module: 4,
								type: itemData.type,
							},
							{
								title: "修改有道翻译应用ID",
								description: "有道智云-控制台-应用管理",
								module: 5,
								type: itemData.type + "AppId",
							},
							{
								title: "修改有道翻译应用密钥",
								description: "有道智云-控制台-应用管理",
								module: 5,
								type: itemData.type + "Key",
							},
						]);
					}
				} else if (itemData.module == 4) {
					// 设置翻译引擎
					window.utools.dbStorage.setItem("translationEngine", itemData.type);
					window.utools.outPlugin();
				} else if (itemData.module == 5) {
					// 设置输入框
					input_key = itemData.type;
					window.utools.setSubInput(({ text }) => {
						input_value = text;
					}, itemData.title);
					callbackSetList([
						{
							title: "保存",
							module: 6,
							type: "save",
						},
						{
							title: "取消",
							module: 6,
							type: "cancel",
						},
					]);
				} else if (itemData.module == 6) {
					// 输入
					if (itemData.type == "save") {
						window.utools.dbStorage.setItem(input_key, input_value);
						window.utools.outPlugin();
					} else {
						window.utools.outPlugin();
					}
				}
			},
		},
	},
};
