/*
 * 仿IOS风格弹窗
 * 作者：Duke
 * 时间：20160806 
 */
import jQuery from 'jquery';
(function ($) {

	$.extend({
		alertView: function (options) {

			// 默认参数
			var defaults = {
				showMask: true,   // 遮罩蒙版   
				title: "",
				msg: "",
			};

			var settings = {};
			if ($.type(options) == "string") {

				settings = defaults;
				settings.msg = options;
			}
			else if ($.type(options) == "object") {

				// 合并参数
				settings = $.extend(true, defaults, options);
			}

			if (!settings.buttons || settings.buttons.length == 0) {
				settings.buttons = [{ title: "确定" }];
			}

			// 移除蒙版和弹窗控件
			$.closeView();

			// 是否加载蒙版
			if (settings.showMask) {
				$("body").append('<div id="popup-dialog-mask" class="lodding-mask"></div>');
			}

			// 外框 div
			var popupDialog = $('<div id="popup-dialog" class="popup-dialog"></div>');

			// 标题
			if (settings.title) {
				popupDialog.append('<h3 id="popup-dialog-title">' + settings.title + '</h3>');
			}
			// 提示信息
			popupDialog.append('<p id="popup-dialog-msg" class="message ' + ((settings.title ? "" : "margin-top-15")) + '">' + settings.msg + '</p>');

			// 文本框
			if (settings.input && $.type(settings.input) == 'array') {
				for (var i = 0; i < settings.input.length; i++) {
					var html = "<div class='popupInput'><div class='popupInputName'>" + settings.input[i].title + "</div><input style='width:calc(100%-" + 90 + "px)'"
					$.each(settings.input[i], function (key, value) {
						html += ' ' + key + '="' + value + '"';
					})
					html += "/></div>";
					$(html).appendTo(popupDialog);
				}
			}

			// 按钮
			var btnSize = settings.buttons.length;
			if (btnSize == 2) {
				var buttonGroup = $('<div class="ui-grid-a group"></div>');
				$.each(settings.buttons, function (i, btnJson) {
					var color = btnJson.color ? 'style="color:' + btnJson.color + '"' : "";
					var button = $('<div class="ui-block-' + (i == 0 ? "a" : "b") + '" ' + color + '>' + btnJson.title + '</div>');
					addBtnEvent(button, btnJson, settings);
					buttonGroup.append(button);
				});
				popupDialog.append(buttonGroup);
			}
			else {
				$.each(settings.buttons, function (i, btnJson) {
					var color = btnJson.color ? 'style="color:' + btnJson.color + '"' : "";
					var button = $('<div class="ui-grid-a' + (i == 0 ? " group" : "") + '" ' + color + '>' + btnJson.title + '</div>');
					addBtnEvent(button, btnJson, settings);
					popupDialog.append(button);
				})
			}

			$("body").append(popupDialog);
		},
		closeView: function () {
			// 移除蒙版和弹窗控件
			$(".popup-dialog, .lodding-mask").fadeOut(50, function () {
				$(this).remove();
			});
		}
	});

	function addBtnEvent(btn, btnJson, settings) {

		btn.on("click", function () {
			// 判断是否有回调函数
			if (btnJson.click && typeof (btnJson.click) == "function") {
				// var content = $(this).closest("div.popup-dialog");
				// var val = $.trim(content.find("input::nth-of-type(1)").val());
				let result = {};
				settings.input.forEach(function (e, i) {
					result[e.id] = $('#' + e.id).val();
				});
				btnJson.click(result);
			}

			// 自动关闭弹窗
			if (!btnJson.hasOwnProperty("autoClose") || btnJson.autoClose != false) {
				$.closeView();
			}
		});
	}
})(jQuery);

jQuery(function () {
	document.body.addEventListener('touchstart', function () { });
});

