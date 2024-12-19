/** @format */

// 全局变量
let input_key = "";
let input_value = "";

// 加载
const db = window.utools.dbStorage;

const quit = () => {
	// console.log("插件退出");
	window.utools.outPlugin();
};
// 字符处理
const codeName = (text, type) => {
	// 为已经转换过的字符串添加空格
	text = text.replace(/([a-z])([A-Z])/g, "$1 $2");
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
	} else if (type == "UPPERCASE") {
		// 全大写，不含空格
		return text.toUpperCase().replace(/ /g, "");
	} else if (type == "UPPERCASE WITH SPACE") {
		// 全大写
		return text.toUpperCase();
	} else if (type == "lowercase") {
		// 全小写，不含空格
		return text.toLowerCase().replace(/ /g, "");
	} else if (type == "lowercase with space") {
		// 全小写
		return text.toLowerCase();
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
const strHasCn = (str) => {
	const regex = /[\u4e00-\u9fa5]/;
	return regex.test(str);
};
// 翻译
const translate = (str, engine, AppId, Key, namingFormat) => {
	if (engine == "google") {
		// 谷歌翻译，再说
		quit();
	} else if (engine == "?") {
		// 其他翻译
		quit();
	} else if (engine == "youdao") {
		// 有道翻译
		let salt = "salt";
		let input = str.length > 20 ? str.substring(0, 10) + str.length + str.substring(str.length - 10) : str;
		let timestamp = Math.floor(Date.now() / 1000);
		let to_be_encrypted = AppId + input + salt + timestamp + Key;
		const crypto = require("crypto");
		let sha256 = crypto.createHash("sha256");
		let sign = sha256.update(to_be_encrypted).digest("hex");
		let url =
			"https://openapi.youdao.com/api" +
			"?q=" +
			str +
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
					let print = "";
					if (res.errorCode == "0") {
						// 翻译结果
						print = codeName(res.translation[0], namingFormat);
					} else {
						// 错误码
						print = "翻译错误：" + result + "。请检查设置或网络。";
					}
					window.utools.hideMainWindowTypeString(print);
					quit();
				});
			})
			.on("error", (error) => {
				window.utools.hideMainWindowTypeString("命名失败：" + error.message);
				quit();
			});
	} else {
		// 默认：百度翻译
		let salt = "salt"; // 随机字符串就免了
		let to_be_encrypted = AppId + str + salt + Key;
		const crypto = require("crypto");
		let md5 = crypto.createHash("md5");
		let sign = md5.update(to_be_encrypted).digest("hex");
		let url =
			"https://fanyi-api.baidu.com/api/trans/vip/translate" +
			"?q=" +
			encodeURIComponent(str) +
			"&from=auto&to=en" +
			"&appid=" +
			AppId +
			"&salt=" +
			salt +
			"&sign=" +
			sign;
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
					let print = "";
					if (res.error_code) {
						// 错误码
						print = "翻译错误：" + result + "。请检查设置或网络。";
					} else {
						// 翻译结果
						print = codeName(res.trans_result[0].dst, namingFormat);
					}
					console.log(print);
					window.utools.hideMainWindowTypeString(print);
					quit();
				});
			})
			.on("error", (error) => {
				console.log(error);
				window.utools.hideMainWindowTypeString("命名失败：" + error.message);
				quit();
			});
	}
};

window.exports = {
	names: {
		mode: "list",
		args: {
			enter: (action, callbackSetList) => {
				// 传入参数
				const incomingParameters = action.payload;
				// 本地数据库
				const namingFormat = db.getItem("namingFormat") ? db.getItem("namingFormat") : "lowerCamelCase"; // 命名格式
				const translationEngine = db.getItem("translationEngine") ? db.getItem("translationEngine") : "baidu"; // 翻译引擎
				const AppId = db.getItem(translationEngine + "AppId"); // 翻译引擎AppId
				const Key = db.getItem(translationEngine + "Key"); // 翻译引擎Key
				// 检测是否包含中文
				const isCn = strHasCn(incomingParameters);
				if (isCn) {
					// 包含中文，翻译
					callbackSetList([]);
					translate(incomingParameters, translationEngine, AppId, Key, namingFormat);
				} else {
					// 不包含中文，改变命名格式
					console.log("不包含中文:", incomingParameters);
					callbackSetList([
						{
							title: codeName(incomingParameters, "lowerCamelCase"),
							description: "小驼峰",
						},
						{
							title: codeName(incomingParameters, "UpperCamelCase"),
							description: "大驼峰",
						},
						{
							title: codeName(incomingParameters, "snake_case"),
							description: "蛇形",
						},
						{
							title: codeName(incomingParameters, "UPPER_SNAKE_CASE"),
							description: "大写蛇形",
						},
						{
							title: codeName(incomingParameters, "kebab-case"),
							description: "烤肉串式",
						},
						{
							title: codeName(incomingParameters, "UPPERCASE"),
							description: "全大写，不含空格",
						},
						{
							title: codeName(incomingParameters, "UPPERCASE WITH SPACE"),
							description: "全大写",
						},
						{
							title: codeName(incomingParameters, "lowercase with space"),
							description: "全小写，不含空格",
						},
						{
							title: codeName(incomingParameters, "lowercase"),
							description: "全小写",
						},
					]);
				}
			},
			// 用户选择列表中某个条目时被调用
			select: (action, itemData) => {
				window.utools.hideMainWindowTypeString(itemData.title);
				quit();
			},
			// 子输入框为空时的占位符，默认为字符串"搜索"
			placeholder: "翻译中……",
		},
	},
	set: {
		mode: "list",
		args: {
			// 进入插件应用时调用（可选）
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
						let oldNamingFormat = db.getItem("namingFormat");
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
						let oldTranslationEngine = db.getItem("translationEngine");
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
					db.setItem("namingFormat", itemData.type);
					quit();
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
					db.setItem("translationEngine", itemData.type);
					quit();
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
						db.setItem(input_key, input_value);
						quit();
					} else {
						quit();
					}
				}
			},
		},
	},
};
