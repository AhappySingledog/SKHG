var g_appId = 1400086104;
var g_localRender = null;
var g_remoteRender = null;
var g_token = null;
var g_id = 'ecity';
var g_pwd = '123456';
var g_getUserList = null;
var g_report = null;
var g_role = null;
var sdk = null;
var g_timer = null;
var g_inRoom = false;
var g_roomid = null;

var E_IM_CustomCmd = {
    AVIMCMD_None: 0, // 无事件：0
    AVIMCMD_EnterLive: 1, // 用户加入直播, Group消息 ： 1
    AVIMCMD_ExitLive: 2, // 用户退出直播, Group消息 ： 2
    AVIMCMD_Praise: 3, // 点赞消息, Demo中使用Group消息 ： 3
    AVIMCMD_Host_Leave: 4, // 主播或互动观众离开, Group消息 ： 4
    AVIMCMD_Host_Back: 5, // 主播或互动观众回来, Group消息 ： 5
    AVIMCMD_Multi: 2048, // 多人互动消息类型 ： 2048
    AVIMCMD_Multi_Host_Invite: 2049, // 多人主播发送邀请消息, C2C消息 ： 2049
    AVIMCMD_Multi_CancelInteract: 2050, // 已进入互动时，断开互动，Group消息，带断开者的imUsreid参数 ： 2050
    AVIMCMD_Multi_Interact_Join: 2051, // 多人互动方收到AVIMCMD_Multi_Host_Invite多人邀请后，同意，C2C消息 ： 2051
    AVIMCMD_Multi_Interact_Refuse: 2052, // 多人互动方收到AVIMCMD_Multi_Invite多人邀请后，拒绝，C2C消息 ： 2052
};

var E_Role = {
    Guest: 0, //观众
    LiveMaster: 1, //主播
    LiveGuest: 2 //连麦观众
}

//界面事件
var g_serverUrl = "http://skhg.eor.cc/index.php";

function ajaxPost(url, data, succ, err) {
    if (!window.XMLHttpRequest) {
        toastr.warning("你的浏览器不支持AJAX!");
        return;
    }
    var ajax = new XMLHttpRequest();
    ajax.open("post", url, true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                var rspJson = null;
                try {
                    rspJson = JSON.parse(ajax.responseText);
                } catch (e) {
                    toastr.warning("json解析出错,服务器返回内容:\n" + ajax.responseText);
                    return;
                }
                if (rspJson.errorCode == 0) {
                    succ(rspJson);
                } else {
                    toastr.error("错误码:" + rspJson.errorCode + " 错误信息:" + rspJson.errorInfo);
                }
            } else {
                toastr.warning("HTTP请求错误！错误码：" + ajax.status);
                if (err) {
                    err();
                }
            }
        }
    }
    ajax.send(data);
}

function report(obj) {
    clearInterval(g_report);
    var handleReport = function () {
        ajaxPost(g_serverUrl + "?svc=live&cmd=heartbeat", JSON.stringify(obj),
            function (rspJson) { }
        );
    };
    handleReport();
    g_report = setInterval(handleReport, 10000)
}

/**
 * 账号登录互踢
 */
function onForceOfflineCallback() {
    toastr.warning("你的账号在其他地方登陆.");
}

/**
 * 失去网络连接超时回调
 */
function onRoomDisconnect(errMsg) {
    alert("SDK已自动退出房间,原因: " + errMsg.code + " " + errMsg.desc);
    toastr.warning("SDK已自动退出房间,原因: " + errMsg.code + " " + errMsg.desc);
}

function onRoomEvent(roomevent) {
    console.log(roomevent);
    if (roomevent.eventid == E_iLiveRoomEventType.HAS_CAMERA_VIDEO) { //打开摄像头
        //为其分配渲染器
        if (g_remoteRender.isFreeRender()) {
            g_remoteRender.setIdentifer(roomevent.identifier);
        }
    }
}

function onDeviceOperation(oper, code) {
    if (oper == E_iLiveOperType.Open_Camera) {
        if (code != 0) {
            toastr.warning("打开摄像头失败; 错误码:" + code);
        } else {
            g_localRender.setIdentifer(g_id);
            //StatusManager.setCamera(1);//更新状态
        }
    }
    else if (oper == E_iLiveOperType.Close_Camera) {
        if (code != 0) {
            toastr.warning("关闭摄像头失败; 错误码:" + code);
        }
        else {
            //StatusManager.setCamera(0);//更新状态
        }
    }
    else if (oper == E_iLiveOperType.Open_Mic) {
        if (code != 0) {
            toastr.warning("打开麦克风失败; 错误码:" + code);
        } else {
            toastr.success("打开麦克风成功.");
            //StatusManager.setMic(1);//更新状态
        }
    }
    else if (oper == E_iLiveOperType.Close_Mic) {
        if (code != 0) {
            toastr.warning("关闭麦克风失败; 错误码:" + code);
        } else {
            toastr.success("关闭麦克风成功.");
            //StatusManager.setMic(0);//更新状态
        }
    }
    else if (oper == E_iLiveOperType.Open_Player) {
        if (code != 0) {
            toastr.warning("打开扬声器失败; 错误码:" + code);
        } else {
            toastr.success("打开扬声器成功.");
            //StatusManager.setPlayer(1);//更新状态
        }
    }
    else if (oper == E_iLiveOperType.Close_Player) {
        if (code != 0) {
            toastr.warning("关闭扬声器失败; 错误码:" + code);
        } else {
            toastr.success("关闭扬声器成功.");
            //StatusManager.setPlayer(0);//更新状态
        }
    }
}

function logIn() {
    //从业务侧服务器获取sig
    var jsonObj = {
        "id": g_id,
        "pwd": g_pwd
    };
    ajaxPost(g_serverUrl + "?svc=account&cmd=login", JSON.stringify(jsonObj),
        function (rspJson) {
            g_token = rspJson.data.token;
            g_userSig = rspJson.data.userSig;
            var sig = rspJson.data.userSig;
            sdk.login(g_id, sig, onLoginSuc, onLoginErr);
            //setTimeout(createRoom, 1000 * 2);
            setTimeout(getRoomAndJoin, 1000 * 2);
            g_timer = setInterval(getRoomAndJoin, 1000 * 30);
        }
    );
}

/**
 * 成功登录
 */
function onLoginSuc() {
    toastr.success("登录成功！");
}

/**
 * 成功失败
 */
function onLoginErr(errMsg) {
    toastr.warning("登录失败. " + "错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
}

function logOut(cb) {
    var jsonObj = {
        "token": g_token
    };
    ajaxPost(g_serverUrl + "?svc=account&cmd=logout", JSON.stringify(jsonObj),
        function(rspJson) {
            sdk.logout(function() {
                g_token = null;
                g_userSig = null;
                cb();
            }, function(errMsg) {
                toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
            });
        }
    );

}


function getRoomAndJoin() {
    //从业务侧获取房间列表
    if (g_inRoom == false) {
        var jsonObj = {
            "type": 'live',
            "token": g_token,
            "index": 0,
            "size": 30,
            "appid": g_appId
        };
        ajaxPost(g_serverUrl + "?svc=live&cmd=roomlist", JSON.stringify(jsonObj),
            function (rspJson) {
                var rooms = rspJson.data.rooms.filter(function (e) { return e.uid != g_id });
                if (rooms.length > 0) {
                    var roomid = rooms[0].info.roomnum;
                    g_roomid = roomid;
                    joinRoom(roomid, E_Role.Guest, function () {
                        sendC2CMessage(g_id, { "userAction": 2049, "actionParam": '' }, function () {
                            sendC2CMessage(g_id, {
                                "userAction": 2051,
                                "actionParam": ''
                            }, function () {
                                if (g_timer) clearInterval(g_timer);
                                g_inRoom = true;
                                sdk.changeRole('LiveGuest', function () {
                                    g_role = 2;
                                    report({
                                        "token": g_token,
                                        "roomnum": g_roomnum,
                                        "role": g_role,
                                        "thumbup": 0
                                    });
                                    openCamera();
                                    openMic();
                                    openPlayer();
                                });
                            })
                        });
                    });
                }
                else {
                    toastr.warning("暂无可用直播！");
                }
            }
        );
    }
}

/**
 * 加入房间
 */
function joinRoom(roomid, role, succ, err) {
    //通过url ？role=2 进来的用户，设置成连麦用户
    if (/role=2/gi.test(location.search)) {
        g_role = E_Role.LiveGuest;
    } else {
        g_role = E_Role.Guest;
    }

    var jsonObj = {
        "token": g_token,
        "roomnum": roomid,
        "role": g_role || E_Role.Guest,
        "operate": 0,
        "id": g_id
    };
    ajaxPost(g_serverUrl + "?svc=live&cmd=reportmemid", JSON.stringify(jsonObj),
        function (rspJson) {
            if (rspJson.errorCode != 0) {
                g_request_status = 0;
                toastr.error("错误码:" + rspJson.errorCode + " 错误信息:" + rspJson.errorInfo);
                return;
            }
            var authBits = (g_role == E_Role.LiveGuest) ? E_iLiveAuthBits.AuthBit_LiveGuest : E_iLiveAuthBits.AuthBit_Guest;
            sdk.joinRoom(roomid, authBits, g_role == E_Role.LiveGuest ? 'LiveGuest' : "Guest", function () {
                toastr.success("加入视频聊天成功！");
                g_roomnum = roomid;
                if (succ) succ();
                report({
                    "token": g_token,
                    "roomnum": g_roomnum,
                    "role": g_role || E_Role.Guest,
                    "thumbup": 0
                });
                if (role == E_Role.LiveGuest) {
                    sdk.changeRole('LiveGuest', function () {

                    });
                }
            }, function (errMsg) {
                toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
                if (err) err(errMsg);
            });
        },
        function () {
            g_request_status = 0;
        }
    );
}

function quitRoom(cb) {
    var url = g_serverUrl + "?svc=live&cmd=reportmemid";
    var param = {
        "token": g_token,
        "id": g_id,
        "roomnum": g_roomid,
        "role": g_role || E_Role.Guest,
        "operate": 1
    };
    ajaxPost(url, JSON.stringify(param), function(rspJson) {
        sdk.quitRoom(function() {
            cb();
        }, function(errMsg) {
            toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
        });
    });
}

function sendC2CMessage(user, msg, cb) {
    var elem = new ILiveMessageElem(E_iLiveMessageElemType.CUSTOM, JSON.stringify(msg));
    var elems = [];
    elems.push(elem);
    var message = new ILiveMessage(elems);
    sdk.sendC2CMessage(user, message, function () {
        if (cb) {
            cb();
        }
    }, function (errMsg) {
        toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
    });
}

/**
 * 发送群消息
 */
function sendGroupMessage(msg, succ, err) {
    var elem = new ILiveMessageElem(E_iLiveMessageElemType.TEXT, msg);
    var elems = [];
    elems.push(elem);
    var message = new ILiveMessage(elems);
    sdk.sendGroupMessage(message, function () {
        toastr.success("消息发送成功");
        addMessage(escapeHTML(msg));
    }, function (errMsg) {
        toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
    });
}

/**
 * 获取用户列表
 */
function getUserList() {
    clearInterval(g_getUserList);
    var temp = function () {
        var obj = {
            "token": g_token,
            "roomnum": g_roomnum,
            "index": 0,
            "size": 20
        };
        ajaxPost(g_serverUrl + "?svc=live&cmd=roomidlist", JSON.stringify(obj),
            function (rspJson) {
                console.log(rspJson);
            }
        );
    };
    temp();
    g_getUserList = setInterval(temp, 10000);
};

/**
 * 打开摄像头
 */
function openCamera() {
    if (g_role != E_Role.LiveGuest && g_role != E_Role.LiveMaster) {
        toastr.error('被连麦之后才可以打开摄像头');
        return;
    }
    var nRet = sdk.getCameraList();
    if (nRet.code != 0) {
        toastr.warning("获取摄像头列表出错; 错误码:" + nRet);
        return;
    }
    sdk.openCamera(nRet.devices[0].id);
    toastr.success("摄像头打开成功！");
}

/**
 * 打开麦克风
 */
function openMic() {
    if (g_role != E_Role.LiveGuest && g_role != E_Role.LiveMaster) {
        return toastr.error('被连麦之后才可以打开麦克风');
    }
    var nRet = sdk.getMicList();
    if (nRet.code != 0) {
        toastr.warning("获取麦克风列表出错; 错误码:" + nRet);
        return;
    }
    sdk.openMic(nRet.devices[0].id);
    toastr.success("麦克风打开成功！");
}

/**
 * 打开扬声器
 */
function openPlayer() {
    var nRet = sdk.getSpeakerList();
    if (nRet.code != 0) {
        toastr.warning("获取扬声器列表出错; 错误码:" + nRet);
        return;
    }
    sdk.openSpeaker(nRet.devices[0].id);
    toastr.success("扬声器打开成功！");
}

/**
 * 创建房间
 */
function createRoom() {

    var name = "我的直播间";
    var jsonObj = {
        "type": 'live',
        "token": g_token
    };
    ajaxPost(g_serverUrl + "?svc=live&cmd=create", JSON.stringify(jsonObj),
        function (rspJson) {
            sdk.createRoom(rspJson.data.roomnum, E_iLiveAuthBits.AuthBit_LiveMaster, "LiveMaster", function () {
                toastr.success("create room succ");
                g_role = E_Role.LiveMaster;
                g_roomnum = rspJson.data.roomnum;
                g_groupid = rspJson.data.groupid;
                jsonObj = {
                    "token": g_token,
                    "room": {
                        "title": '[Web随心播]' + name,
                        "roomnum": rspJson.data.roomnum,
                        "type": "live",
                        "groupid": rspJson.data.groupid,
                        "appid": g_appId,
                        "device": 2,
                        "videotype": 0
                    }
                };
                ajaxPost(g_serverUrl + "?svc=live&cmd=reportroom", JSON.stringify(jsonObj),
                    function (rspJson) {
                        report({
                            "token": g_token,
                            "roomnum": g_roomnum,
                            "role": g_role,
                            "thumbup": 0
                        });
                        getUserList();
                    }
                ); //这个是运营后台的事件
                openCamera();
                openMic();
                openPlayer();
            }, function (errMsg) {
                toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
            }); //这个是sdk的事件
        }
    );
}

function showMessage(msg) {
    for (i in msg.elems) {
        if (msg.elems[i].type == E_iLiveMessageElemType.TEXT) {
            addMessage(escapeHTML(msg.elems[i].content), msg.sender);
        } else if (msg.elems[i].type == E_iLiveMessageElemType.CUSTOM) {
            dealCustomMessage(msg.sender, JSON.parse(msg.elems[i].content));
        }
    }
}

/**
 * 自定义消息处理函数
 */
function dealCustomMessage(user, msg) {
    switch (msg.userAction) {
        case E_IM_CustomCmd.AVIMCMD_EnterLive:
            getUserList();
            break;
        case E_IM_CustomCmd.AVIMCMD_ExitLive:
            toastr.warning('主播' + user + '退出了房间');
            sdk.quitRoom(function () {
                toastr.success("退出房间成功");
                g_inRoom = false;
                g_timer = setInterval(getRoomAndJoin, 1000 * 30);
            }, function (errMsg) {
                toastr.error("错误码:" + errMsg.code + " 错误信息:" + errMsg.desc);
            });
            getUserList();
            break;
        case E_IM_CustomCmd.AVIMCMD_Praise:
            break;
        case E_IM_CustomCmd.AVIMCMD_Host_Leave:
        case E_IM_CustomCmd.AVIMCMD_Host_Back:
            getUserList();
            break;
        case E_IM_CustomCmd.AVIMCMD_Multi:
            break;
        case E_IM_CustomCmd.AVIMCMD_Multi_Host_Invite:
            g_invite = user;
            break;
        case E_IM_CustomCmd.AVIMCMD_Multi_CancelInteract:
            if (g_role != E_Role.LiveMaster) {
                sdk.changeRole('Guest', function () {
                    toastr.warning("被主播下麦");
                    OnBtnCloseCamera();
                    g_role = E_Role.Guest;
                    report({
                        "token": g_token,
                        "roomnum": g_roomnum,
                        "role": g_role || E_Role.Guest,
                        "thumbup": 0
                    });
                    getUserList();
                });
            } else {
                getUserList();
            }
            break;
        case E_IM_CustomCmd.AVIMCMD_Multi_Interact_Join:
            toastr.success("对方接受了你的邀请");
            getUserList();
            break;
        case E_IM_CustomCmd.AVIMCMD_Multi_Interact_Refuse:
            toastr.warning("对方拒绝了你的邀请");
        default:
            break;
    }
}

function addMessage(msg, user) {
    var sender = user || 'admin';
    var color = user ? 'bluesender' : 'yellowsender';
    var time = format(new Date(), 'yyyy-MM-dd hh:mm');
    $('#record').append("<div class='oneMsg'><div class='oneMsg-sender " + color + "'>" + sender + "</div><div class='oneMsg-body'><div class='oneMsg-time'>" + time + "</div><div class='oneMsg-msg'>" + msg + "</div></div></div>")
    $('#recordBd').scrollTop(document.getElementById('recordBd').scrollHeight);
}

/**
 * 初始化
 */
function OnInit() {
    sdk = new ILiveSDK(1400086104, 25760, "iLiveSDKCom");
    toastr.info('正在初始化，请稍候');
    sdk.init(function () {
        toastr.success('初始化成功');
        g_localRender = new ILiveRender("localRender");
        g_remoteRender = new ILiveRender("remoteRender");

        sdk.setForceOfflineListener(onForceOfflineCallback);
        sdk.setRoomDisconnectListener(onRoomDisconnect);
        sdk.setRoomEventListener(onRoomEvent);
        sdk.setDeviceOperationCallback(onDeviceOperation);

        sdk.setMessageListener(function (msg) {
            showMessage(msg);
            console.log(msg);
        });
        logIn();
    }, function (errMsg) {
        toastr.warning("初始化失败! 错误码: " + errMsg.code + "描述: " + errMsg.desc);
    });
}

/**
 * 反初始化
 */
function OnUninit() {
    if(g_timer) clearInterval(g_timer);
    if(g_inRoom) quitRoom(logOut(sdk.unInit));
    else logOut(sdk.unInit);
}

function escapeHTML(str) {
    if (typeof str != 'string') {
        return '' + str;
    }
    return str.replace(/[<>&"']/g, function ($0) {
        switch ($0) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case '"':
                return '&quot;';
            case '\'':
                return '&#39;';
        }
    });
}

/**
 * 日期格式化
 */
function format(date, fmt) {
    var o = {
        'M+': date.getMonth() + 1,                 //月份 
        'd+': date.getDate(),                    //日 
        'h+': date.getHours(),                   //小时 
        'm+': date.getMinutes(),                 //分 
        's+': date.getSeconds(),                 //秒 
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度 
        'S': date.getMilliseconds()             //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}