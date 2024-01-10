const _pre_loader = function() {
    token_front = page.param.token;
    let param = {
        url : "/apis/v1/workspace/task/get"
        , param : {
            "projectId"     : page.param.projectId
            , "taskNumber"  : page.param.taskNumber
            , "reqType"     : page.param.reqType
        }, returnFunction : function(rev){
            if(rev && rev.result) {
                _pre_loader_data(rev.data);
                _pre_loader_hotkey();
                page.init();
                page.fn.hideLoading();
            }
        }, errorFunction : function() {
            window.location = "/error";
        }
    };
    _common.ajax.asyncJSON2(param);
}

/**
 * pre loader of project and task data
 * @param data
 * @private
 */
const _pre_loader_data = function(data) {
    try {
        page.constants.isCO = _common.nvl(data.isCO, false);
        page.constants.taskTalkYn = _common.nvl(data.taskTalkYn, "N");
        page.constants.bboxRotateYn = _common.nvl(data.bboxRotateYn, "Y");
        page.constants.serverCoApiAddQna = _common.nvl(data.serverCoApiAddQna, "");
        page.constants.co = {
            coProjectKey: _common.nvl(data.coProjectKey, "")
            , coTaskKey: _common.nvl(data.coTaskKey, "")
            , coUserId: _common.nvl(data.coUserId, "")
            , coProjectName: _common.nvl(data.coProjectName, "")
            , coTaskName: _common.nvl(data.coTaskName, "")
        };
        page.constants.drawMin = {
            x: _common.nvl(data.minPixelX, -1)
            , y: _common.nvl(data.minPixelY, -1)
            , isUse: _common.nvl(data.minPixelSet, "N")
        };
        page.constants.reviewSystemHost = _common.nvl(data.reviewSystemHost, "N");
        page.constants.userLocation = _common.nvl(data.userLocation, "kr");
        page.constants.currentLocale = _common.nvl(data.country, "kor");
        page.constants.imageServer = [];
        for (let i = 0; i < data.imageServers.length; i++) {
            let imgServerUrl = data.imageServers[i].url;
            let imgServerName = data.imageServers[i].name;
            page.constants.imageServer.push({
                name: imgServerName
                , url: imgServerUrl
                , title: imgServerName
            });
            if(page.constants.userLocation.toUpperCase() == imgServerName.toUpperCase()) {
                page.data.imageServerURL = imgServerUrl;
                page.data.imageServerName = imgServerName;
            }
        }
        if (_common.isEmpty(page.data.imageServerURL)) {
            page.data.imageServerURL = page.constants.imageServer[0].url;
            page.data.imageServerName = page.constants.imageServer[0].name;
        }
        page.constants.imageServerURL = page.constants.imageServer[0].url;
        page.constants.imageServerName = page.constants.imageServer[0].name;

        page.constants.serverChattingApi = _common.nvl(data.serverChattingApi, "");
        page.constants.authToken = _common.nvl(data.authToken, "");
        page.constants.serverChattingStorageUrl = [];
        for (let chatStorageURL in data.serverChattingStorageUrl) {
            page.constants.serverChattingStorageUrl.push(chatStorageURL);
        }
        page.constants.serverChattingStorageHost = [];
        for (let chatStorageHost in data.serverChattingStorageHost) {
            page.constants.serverChattingStorageHost.push(chatStorageHost);
        }

        page.data.task.projectId = _common.nvl(data.projectId, "");
        page.data.task.taskNumber = _common.nvl(data.taskNumber, "");
        page.data.task.taskName = _common.nvl(data.taskName, "");
        document.getElementById("txt_taskName").innerText = "TASK : " + page.data.task.taskName;
        page.data.task.defaultClassNumber = _common.nvl(data.defTaskClassNumber, "");
        page.data.task.defaultClassNumberB = _common.nvl(data.defTaskClassNumber, "");
        page.data.task.rejectYN = _common.nvl(data.reworkYn, "");
        page.data.task.taskType = _common.nvl(data.taskType, "");
        page.data.task.dataDigit = Number.parseInt(_common.nvl(data.dataDigit, "0"));
        if(page.data.task.taskType == "private" && page.param.reqType == "worker") {
            $("#btnImageGiveup").remove();
            $("#btnGotoReview").remove();
        } else if (page.param.reqType == "worker") {
            $("#btnGotoReview").remove();
        }


        page.data.task.taskDescHTML = _common.nvl(data.taskDescHTML, "");
        page.data.task.reworkYn = _common.nvl(data.reworkYn, "N");
        $("#taskInfoReworkDesc").html($("#tmpl-taskInfo-rework-"+page.data.task.reworkYn).html());
        if(page.data.task.reworkYn == "Y") {
            $("#txtRejectDesc").text(page.message.titleRejectDescriptionLimit);
        } else if(page.data.task.reworkYn == "T") {
            $("#txtRejectDesc").text(page.message.titleRejectDescriptionUnlimit);
        }
        page.data.task.limitWorkCnt = _common.nvl(data.limitWorkCnt, 0);
        if(page.data.task.limitWorkCnt == 0) {
            $("#txtLimitWorkCnt").text(page.message.workLimit_unlimit);
        } else {
            $("#txtLimitWorkCnt").text(page.data.task.limitWorkCnt + page.message.workLimit_limit);
        }
        page.data.task.attachedFileSrc = data.uploadLinkUrl + data.desFile;
        page.data.task.attachedFileName = data.desOrgnFile;


        page.data.task.isExistsGuide = false;
        $("#txtDesOrgnFileName").text(page.data.task.attachedFileName);
        if(_common.isNotEmpty(page.data.task.taskDescHTML) || _common.isNotEmpty(page.data.task.attachedFileName)) {
            page.data.task.isExistsGuide = true;
            if(_common.isNotEmpty(data.desOrgnFile)) {
                $("#popGuide_downloadFotter button").attr("onclick", "chat.fn.download('"+page.data.task.attachedFileSrc+"', '"+page.data.task.attachedFileName+"');");
                $("#viewTaskGuideContents").append(_common.template.parseObject("tmpl-taskDesFile", {"src" : page.data.task.attachedFileSrc}));
            } else {
                $("#viewTaskGuideContents").html(page.data.task.taskDescHTML);
            }
        }

        page.data.task.rewardPoint = _common.nvl(data.rewardPoint, "");
        page.data.task.reviewRewardPoint = _common.nvl(data.reviewRewardPoint, "");
        if(page.param.reqType == "review") {
            $("#txtRewardPoint").text(page.data.task.reviewRewardPoint);
        } else {
            $("#txtRewardPoint").text(page.data.task.rewardPoint);
        }

        page.data.permissionCode = _common.nvl(data.permissionCode, "");
        if(page.data.permissionCode == "compWorker") {
            page.data.permissionCode = page.constants.workType.annotator;
        }
        page.data.permissionName = _common.nvl(data.permissionName, "");
        document.getElementById("txt_permissionName").innerText = "[" + page.data.permissionName + "]";
        page.data.reqType = _common.nvl(data.reqType, "");
        $("#btnCopyTaskCode").attr("data-clipboard-text", "["+data.taskCode+"]" + page.data.task.taskName);

        page.param.projectId = _common.nvl(data.projectId, "");
        page.param.taskNumber = _common.nvl(data.taskNumber, "");

        page.constants.env = _common.nvl(data.activeProfile, "local");

        page.data.task.keypoints = [];
        page.data.task.keypointMap = new HashMap();
        page.data.magicKeypointNumber = null;
        for (let i = 0; i < data.keypoints.length; i++) {
            let kp = data.keypoints[i];
            log.info(kp, "keypoint");
            try {
                page.data.task.keypoints.push({
                    keypointNumber: kp.keypointNumber
                    , keypointName: kp.keypointName
                    , pointLength: kp.pointsLength
                    , position: JSON.parse(kp.pointsPosition)
                    , relationship: JSON.parse(kp.relationship)
                    , radiusYn: kp.radiusYn
                    , roi: kp.roi ? JSON.parse(kp.roi) : []
                    , posMap: null
                    , defaultRadius: 10
                    , magicYn: kp.magicYn
                });
                page.data.task.keypointMap.put(kp.keypointNumber, {
                    keypointNumber: kp.keypointNumber
                    , keypointName: kp.keypointName
                    , pointLength: kp.pointsLength
                    , position: JSON.parse(kp.pointsPosition)
                    , relationship: JSON.parse(kp.relationship)
                    , radiusYn: kp.radiusYn
                    , roi: kp.roi ? JSON.parse(kp.roi) : []
                    , posMap: null
                    , defaultRadius: 10
                    , magicYn: kp.magicYn
                });
                if (kp.magicYn == "Y") {
                    page.data.magicKeypointNumber = kp.keypointNumber;
                }
            } catch(E) {
                log.error(E, "_pre_loader_data, convert of keypoints");
                log.error(kp, "_pre_loader_data, convert of keypoints");
            }
        }
        page.data.task.tool = [];
        page.data.useMagicAI = "Y";
        if(data.drawingToolList != null) {
            for (let i = 0; i < data.drawingToolList.length; i++) {
                let tool = data.drawingToolList[i];
                page.data.task.tool.push(tool);
                if (tool == "MagicAI") {
                    page.data.useMagicAI = "Y";
                }
            }
        }
        page.data.task.classes = [];
        page.data.rejectReason = [];
        page.data.task.classMap = new HashMap();
        const tmpl_style_class = ".CLASS_#classNumber# { stroke: #color#; background-color: #color#; fill: #color# !important; } polyline.CLASS_#classNumber# { stroke: #color# !important; }";
        let styleClasses = "";
        for (let i = 0; i < data.classList.length; i++) {
            let cls = data.classList[i];
            page.data.task.classes.push({
                classNumber: cls.classNumber
                , className: cls.className
                , hotkey: cls.hk
                , hotkeyName: cls.hkName
                , color: cls.color
            });
            page.data.task.classMap.put(cls.classNumber, {
                classNumber: cls.classNumber
                , className: cls.className
                , hotkey: cls.hk
                , hotkeyName: cls.hkName
                , color: cls.color
            });
            if (data.defTaskClassNumber == cls.classNumber) {
                page.data.task.defaultClassName = cls.className;
            }
            styleClasses += _common.template.parseMessage(tmpl_style_class, cls);
        }
        if(_common.isEmpty(page.data.task.defaultClassName)) {
            page.data.task.defaultClassName = page.data.task.classes[0].classNumber;
        }
        $("#style_classes").html(styleClasses);
        page.data.task.tags = [];
        let styleTags = "";
        const tmpl_style_tag = ".TAG_#tagNumber# { background-color: #color# }"
        if(data.tagList) {
            for (let i = 0; i < data.tagList.length; i++) {
                let tag = data.tagList[i];
                let tagData = {
                    tagNumber: tag.tagNumber
                    , name: tag.name
                    , hotkey: tag.hk
                    , hotkeyName: tag.hkName
                    , color: tag.color
                    , tagTypeCd: tag.tagTypeCd
                    , tagValTypeCd: tag.tagValTypeCd
                    , tagSelectValueVoList: []
                    , matchClasses: tag.matchClass
                    , valueFilterNumber: tag.numbering
                    , valueFilterLetter: tag.letter
                    , valueFilterSpecial: tag.specialCharacter
                    , lengthNumber: tag.numberingLength
                    , lengthLetter: tag.letterLength
                    , lengthSpecial: tag.specialCharacterLength
                };
                if (tag.tagSelectValueVoList != null) {
                    for (let i = 0; i < tag.tagSelectValueVoList.length; i++) {
                        let tv = tag.tagSelectValueVoList[i];
                        tagData.tagSelectValueVoList.push({
                            name: tv.name
                            , value: tv.val
                            , color: tv.color
                            , tagValueIdx: i + 1
                        });
                    }
                }
                styleTags += _common.template.parseMessage(tmpl_style_tag, tag);
                page.data.task.tags.push(tagData);
            }
            $("#style_tags").html(styleTags);
        }

        if (data.inspectionErrorList != null) {
            $("#inspectionErrListUl").append(_common.template.parseList("tmpl-inspectionError", data.inspectionErrorList));
            $("#popReviewErrorCodeList").append(_common.template.parseList("tmpl-inspectionErrorForReviewNg", data.inspectionErrorList));
        }
        page.data.authToken = _common.nvl(data.authToken, "");
        $("#authToken").val(page.data.authToken);
        if("compWorker/worker/crowdWorker".includes(page.data.permissionCode)) {
            $("#btnReviewAssign").hide();
        }
        if("compReviewer/reviewer/manager/master/inspector".includes(page.data.permissionCode)) {
            $("#reviewInfo_reviewerId").show();
            $("#reviewInfo_reviewerDate").show();
            $("#btnTogglePopupReview").show();
        }
        if("manager/master/inspector".includes(page.data.permissionCode)) {
            $("#reviewInfo_inspector").show();
            $("#reviewInfo_inspectedDatetime").show();
        }
        if(!"manager/inspector".includes(page.data.permissionCode)) {
            $("#popReview_btnInspOK").remove();
            $("#popReview_btnInspNG").remove();
        }
        if("co" != page.data.permissionCode) {
            $("#wrapTaskInfo").show();
            $("#btnToggleCoQna").remove();
        } else {
            //TODO co �뚯뒪�� �뺣낫 �쒗쁽 異붽��꾩슂
            $("#wrapTaskInfo_co").show();
            $("#btnTogglePopupGuide").hide();
        }
        if(page.constants.taskTalkYn == "N" || 'compReviewer/manager/master/demo'.includes(page.data.permissionCode)) {
            $("#btnTogglePopupChat").hide();
        }
        if( !"compWorker/worker".includes(page.data.permissionCode) && page.data.task.taskType != "private") {
            $("#btnImageGiveup").show();
        }
        if("demo" == page.data.permissionCode) {
            $("#btnImageCompleteDemo").show();
            $("#btnReviewAssign").hide();
            $("#btnImageTempSave").hide();
            $("#btnImageComplete").hide();
        }
        if("co" == page.data.permissionCode) {
            $("#wrapWorkButtons").hide();
        }
    } catch (E) {
        log.error(E, "_pre_loader_data()");
    }
}

const _pre_loader_hotkey = function() {
    //HOTKEY
    page.constants.hotkeys = [
        {
            keyCode : "mouse_left+move"
            , keyName : "mouse_left+move"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_left_move
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "mouse_right+move"
            , keyName : "mouse_right+move"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_right_move
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "mouse_right"
            , keyName : "mouse_right"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_right
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "alt+mouse_right+move"
            , keyName : "Alt+mouse_right+move"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_right_alt_move
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "ctrl+mouse_left"
            , keyName : "Ctrl+mouse_left"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_left_ctrl
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "mouse_wheelup"
            , keyName : "mouse_wheelup"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_wheelup
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "shift+mouse_wheelup"
            , keyName : "Shift+mouse_wheeldown"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_mouse_wheeldown
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "13"
            , keyName : "ENTER"
            , excuteFunction : function(event) {
                log.info(event, "working enter key, start");
                if($(document.activeElement).prop("tagName") == "BUTTON") {
                    log.info("invalid enter key of button");
                    event.preventDefault();
                } else if(!page.data.event.isValidHotkey) {
                    log.info("valid enter key");
                    event.preventDefault();
                    event.target.blur();
                } else if(event.target.getAttribute('id') == 'popReviewFailReason') {
                    event.preventDefault();
                    document.getElementById("popReviewFailReason").value += '\n'
                } else if (event.target === $("#inputCoQnaMessage").get(0)) {
                    log.info(event, "throw event.");
                    document.getElementById("txtArea").value = document.getElementById("txtArea").value + "\n*";
                } else if($(event.target).attr("data-input-type") == "groupName") {
                    log.info("apply change of group name.");
                    page.fn.applyChangeGrpName($(event.target).attr("data-groupid"));
                    event.preventDefault();
                } else {
                    log.info("invalid enter key else");
                }
                log.info("working enter key, end");
            }, type : page.constants.hotkeyType.defaultKey
            , description: ""
            , isVisible : false
            , isCheckPermission : false
            , isCanInput : true
        }, {
            keyCode : "shift_13"
            , keyName : "Shift+ENTER"
            , type : page.constants.hotkeyType.defaultKey
            , description: ""
            , isVisible : false
            , isCheckPermission : false
            , isCanInput : true
        }, {
            keyCode : "27"
            , keyName : "ESC"
            , excuteFunction : function(event) {
                if($(event.target).attr("data-input-type") == "groupName") {
                    log.info("cancle change of group name.");
                    $(event.target).val($(event.target).attr("data-groupname"));
                    page.fn.applyChangeGrpName($(event.target).attr("data-groupid"));
                    event.preventDefault();
                } else if(page.data.event.isValidHotkey && paint.fn.isPainting()) {
                    event.preventDefault();
                    paint.fn.changeTool('reset');
                } else if(page.data.event.isValidHotkey && page.data.event.isDrawing) {
                    event.preventDefault();
                    page.fn.endNewDrawing("hotkey-esc");
                    if(!page.data.drawing.isValidDraw) {
                        page.fn.startNewDrawing(page.data.event.lastMethodType);
                    }
                } else if(!page.data.event.isValidHotkey) {
                    page.fn.rollbackInput(event.target);
                    event.target.blur("cancle");
                    event.preventDefault();
                } else if(page.data.drawing.command == page.constants.method.makeGroup) {
                    page.fn.endNewDrawing("hotkey-esc:makeGroup");
                } else if(page.data.event.selectedObjectId != null) {
                    event.preventDefault();
                    page.fn.unSelectObject();
                    if(page.data.event.lastMethodType != "magicAIPolygon"
                        && page.data.event.lastMethodType != "magicAIBox") {
                        page.fn.startNewDrawing(page.data.event.lastMethodType);
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_esc
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : true
        }, {
            keyCode : "112"
            , keyName : "F1"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.toggleGuide();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f1
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "113"
            , keyName : "F2"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.toggleViewTag();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f2
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "113"
            , keyName : "Shift+F2"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.toggleViewObjectGroup();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_shift_f2
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "114"
            , keyName : "F3"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.toggleVisibleAllObject();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f3
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "115"
            , keyName : "F4"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.togglePopupOfHotkey();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f4
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "116"
            , keyName : "F5"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f5
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.refreshPage();
            }
        }, {
            keyCode : "117"
            , keyName : "F6"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f6
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
            , excuteFunction : function(event) {
                event.preventDefault();
                if(page.data.imageData.statusOc == "reject") {
                    page.fn.toggleViewOCRejectObject();
                }
            }
        }, {
            keyCode : "120"
            , keyName : "F8"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f8
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.toggleVisiblePolylinePoints();
            }
        }, {
            keyCode : "120"
            , keyName : "F9"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f9
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.imageCenterToFit();
            }
        }, {
            keyCode : "123"
            , keyName : "F12"
            , type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f12
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.togglePopupOfControlbar();
            }
        }, {
            keyCode : "32"
            , keyName : "SPACE"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    page.fn.toCenter();
                    if($(document.activeElement).prop("tagName") == "BUTTON") {
                        event.preventDefault();
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_space
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "ctrl_83"
            , keyName : "Ctrl+S"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    page.fn.saveTemp();
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_ctrl_s
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "ctrl_67"
            , keyName : "Ctrl+C"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    page.fn.copyObject();
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_ctrl_c
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "ctrl_shift_67"
            , keyName : "Ctrl+Shift+C"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    page.fn.copyAllObject();
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_ctrl_shift_c
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "ctrl_86"
            , keyName : "Ctrl+V"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    page.fn.pasteObject();
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_ctrl_v
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "ctrl_71"
            , keyName : "Ctrl+G"
            , excuteFunction : function(event) {
                event.preventDefault();
                if(page.data.event.isValidHotkey) {
                    page.fn.startNewDrawing(page.constants.method.makeGroup);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_ctrl_g
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "46"
            , keyName : "Delete"
            , excuteFunction : function(event) {

                if(page.data.event.isValidHotkey) {
                    if (page.data.event.selectedObjectId != null) {
                        event.preventDefault();
                        page.fn.deleteObject(page.data.event.selectedObjectId);
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_del
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "ctrl_90"
            , keyName : "Ctrl+Z"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    page.gateway(page.constants.gateway.command.back);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_ctrl_z
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "49"
            , keyName : "1"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && paint.fn.isPainting()) {
                    event.preventDefault();
                    paint.fn.changeTool('brush');
                } else if(page.data.event.isValidHotkey && !page.data.keypointHotkeyAvailable) {
                    event.preventDefault();
                    let object = page.fn.getObject(page.data.event.selectedObjectId);
                    if(object != null
                        && object.objectTypeCd == page.constants.drawType.keypoint
                        && page.data.task.keypointMap.get(page.data.objectKeypointNumber).radiusYn == "Y"
                        && _common.isNotEmpty(page.data.event.resizeingRadiusNum)

                    ) {
                        log.info("bigger radius");
                        page.fn.castLocationToObject(object);
                        let domP = $("svg g[objectId='"+page.data.event.selectedObjectId+"'] circle.draw-radius[imgObjectNumber='"+page.data.event.selectedObjectId+"'][pointIndex='"+page.data.event.resizeingRadiusIndex+"']");
                        log.info(object, "finish, " + page.data.event.resizeingRadiusNum);
                        domP.css("r", Number.parseFloat(domP.css("r")) + 1);
                        object.location[page.data.event.resizeingRadiusNum][4] = Number.parseFloat(domP.css("r"));
                        object.imgObjectLocation = JSON.stringify(object.location);
                        $("#objectSizeViewer").show().text("*" + domP.attr("pointNum") + " Radius : " + domP.css("r"));
                    } else {
                        page.fn.startNewDrawing(page.constants.method.moveImage);
                    }
                } else if ( page.data.keypointHotkeyAvailable
                    && $(".multiKeypoints").is(":visible")
                    && $(".multiKeypoints[data-orderSeq ='1']").is(":visible")) {
                    event.preventDefault();
                    let t = $(".multiKeypoints[data-orderSeq ='1']");
                    page.fn.getKeypointNumber(t);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.data.keypointhotkeyavailable ? "" : page.message.hotkey_1
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "50"
            , keyName : "2"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && paint.fn.isPainting()) {
                    event.preventDefault();
                    paint.fn.changeTool('eraser');
                } else if(page.data.event.isValidHotkey && !page.data.keypointHotkeyAvailable) {
                    event.preventDefault();
                    let object = page.fn.getObject(page.data.event.selectedObjectId);
                    if( object != null
                        && object.objectTypeCd == page.constants.drawType.keypoint
                        && page.data.task.keypointMap.get(page.data.objectKeypointNumber).radiusYn == "Y"
                        && _common.isNotEmpty(page.data.event.resizeingRadiusNum)
                    ) {
                        log.info("bigger radius");
                        page.fn.castLocationToObject(object);
                        let domP = $("svg g[objectId='"+page.data.event.selectedObjectId+"'] circle.draw-radius[imgObjectNumber='"+page.data.event.selectedObjectId+"'][pointIndex='"+page.data.event.resizeingRadiusIndex+"']");
                        log.info(object, "finish, " + page.data.event.resizeingRadiusNum);
                        domP.css("r", Number.parseFloat(domP.css("r")) - 1);
                        object.location[page.data.event.resizeingRadiusNum][4] = Number.parseFloat(domP.css("r"));
                        object.imgObjectLocation = JSON.stringify(object.location);
                        $("#objectSizeViewer").show().text("*" + domP.attr("pointNum") + " Radius : " + domP.css("r"));
                    } else {
                        page.fn.startNewDrawing(page.constants.method.selectObject);
                    }
                } else if ( page.data.keypointHotkeyAvailable
                    && $(".multiKeypoints").is(":visible")
                    && $(".multiKeypoints[data-orderSeq ='2']").is(":visible")) {
                    event.preventDefault();
                    let t = $(".multiKeypoints[data-orderSeq ='2']");
                    page.fn.getKeypointNumber(t);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_2
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "51"
            , keyName : "3"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && paint.fn.isPainting()) {
                    event.preventDefault();
                    paint.fn.changeTool('contours');
                } else if(page.data.event.isValidHotkey && !page.data.keypointHotkeyAvailable) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.moveObject);
                }else if ( page.data.keypointHotkeyAvailable
                    && $(".multiKeypoints").is(":visible")
                    && $(".multiKeypoints[data-orderSeq ='3']").is(":visible")) {
                    event.preventDefault();
                    let t = $(".multiKeypoints[data-orderSeq ='3']");
                    page.fn.getKeypointNumber(t);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_3
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "52"
            , keyName : "4"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && paint.fn.isPainting()) {
                    event.preventDefault();
                    paint.fn.setVisible();
                } else if((page.data.useMagicAI == 'Y'
                    && (page.data.task.tool.includes("B.box")
                        || page.data.task.tool.includes("MagicFit"))) && !page.data.keypointHotkeyAvailable) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.magicAIBox);
                } else if ( page.data.keypointHotkeyAvailable
                    && $(".multiKeypoints").is(":visible")
                    && $(".multiKeypoints[data-orderSeq ='4']").is(":visible")) {
                    event.preventDefault();
                    let t = $(".multiKeypoints[data-orderSeq ='4']");
                    page.fn.getKeypointNumber(t);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_4
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "53"
            , keyName : "5"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && paint.fn.isPainting()) {
                    event.preventDefault();
                    paint.fn.restoreObject();
                } else if(page.data.useMagicAI == 'Y'
                    && (page.data.task.tool.includes("Polygon")
                        || page.data.task.tool.includes("MagicPin")
                        || page.data.task.tool.includes("MagicQ"))
                    && !page.data.keypointHotkeyAvailable
                ) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.magicAIPolygon);
                } else if ( page.data.keypointHotkeyAvailable
                    && $(".multiKeypoints").is(":visible")
                    && $(".multiKeypoints[data-orderSeq ='5']").is(":visible")) {
                    event.preventDefault();
                    let t = $(".multiKeypoints[data-orderSeq ='5']");
                    page.fn.getKeypointNumber(t);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_4
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "81"
            , keyName : "Q"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    let isValid = true;
                    let object = page.fn.getObject(page.data.event.selectedObjectId);
                    if(page.data.event.isSelectedObject
                        && (object.objectTypeCd == page.constants.drawType.rectangle || object.objectTypeCd == page.constants.drawType.rectangle4p)) {
                        isValid = false;
                    }
                    if(isValid) {
                        if($("#btn_magicPin").is(":visible")) {
                            page.fn.startNewDrawing(page.constants.method.magicPin);
                        }
                    } else {
                        if(page.constants.bboxRotateYn == "Y") {
                            page.fn.changeRotateOfBBOX(object, -1);
                        }
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_q
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "87"
            , keyName : "W"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_magicBox").is(":visible")) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.magicBox);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_w
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "69"
            , keyName : "E"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    let isValid = true;
                    let object = page.fn.getObject(page.data.event.selectedObjectId);
                    if(page.data.event.isSelectedObject
                        && (object.objectTypeCd == page.constants.drawType.rectangle || object.objectTypeCd == page.constants.drawType.rectangle4p)) {
                        isValid = false;
                    }
                    if(isValid) {
                        if($("#btn_drawPolygon").is(":visible")) {
                            page.fn.startNewDrawing(page.constants.method.drawPolygon);
                        }
                    } else {
                        if(page.constants.bboxRotateYn == "Y") {
                            page.fn.changeRotateOfBBOX(object, 1);
                        }
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_e
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "82"
            , keyName : "R"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_drawRectangle").is(":visible")) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.drawRectangle);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_r
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "84"
            , keyName : "T"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_drawRectangle4p").is(":visible")) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.drawRectangle4p);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_t
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "89"
            , keyName : "Y"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    event.preventDefault();
                    let isValid = true;
                    if(isValid) {
                        if($("#btn_magicKey").is(":visible")) {
                            page.fn.startNewDrawing(page.constants.method.magicKey);
                        }
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_y
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "65"
            , keyName : "A"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_drawPolyline").is(":visible")) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.drawPolyline);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_a
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "83"
            , keyName : "S"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_drawKeypoint").is(":visible")) {
                    event.preventDefault();
                    page.fn.keypointBtnClicked();
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_s
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "68"
            , keyName : "D"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey) {
                    if($("#btn_magicQ").is(":visible") && $("#btn_magicQ").is(":visible")) {
                        event.preventDefault();
                        page.fn.startNewDrawing(page.constants.method.magicQ);
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_d
            , isVisible : false
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "70"
            , keyName : "F"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_drawPointGroup").is(":visible")) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.drawPointGroup);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_f
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "71"
            , keyName : "G"
            , excuteFunction : function(event) {
                if(page.data.event.isValidHotkey && $("#btn_drawPoint").is(":visible")) {
                    event.preventDefault();
                    page.fn.startNewDrawing(page.constants.method.drawPoint);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_g
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "90"
            , keyName : "Z"
            , excuteFunction : function(event) {
                if($("#btn_drawPaint").is(":visible")) {
                    event.preventDefault();
                    if (page.data.event.isValidHotkey && paint.fn.isPainting()) {
                        paint.fn.stop();
                    } else {
                        page.fn.startNewDrawing(page.constants.method.drawPaint);
                    }
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_z
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "88x"
            , keyName : "X"
            , excuteFunction : function(event) {
                event.preventDefault();
                if($("#btn_drawSideBox").is(":visible")) {
                    page.fn.startNewDrawing(page.constants.method.drawSideBox);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_x
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        },{
            keyCode : "67"
            , keyName : "C"
            , excuteFunction : function(event) {
                event.preventDefault();
                if($("#btn_drawEdgePoints").is(":visible")) {
                    page.fn.startNewDrawing(page.constants.method.drawEdgePoints);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_c
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        },{
            keyCode : "shift_67"
            , keyName : "Shift+C"
            , excuteFunction : function(event) {
                event.preventDefault();
                if($("#btn_drawEdgePoints").is(":visible")) {
                    page.fn.startNewDrawing(page.constants.method.drawEdgeLines);
                }
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_shift_c
            , isVisible : true
            , isCheckPermission : true
            , isCanInput : false
        }, {
            keyCode : "36"
            , keyName : "Home"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.moveImageCommand(page.constants.moveImageMethod.first);
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_home
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "35"
            , keyName : "End"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.moveImageCommand(page.constants.moveImageMethod.last);
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_end
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "33"
            , keyName : "PageUp"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.moveImageCommand(page.constants.moveImageMethod.previous);
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_pageup
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "34"
            , keyName : "PageDown"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.moveImageCommand(page.constants.moveImageMethod.next);
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_pagedown
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "9"
            , keyName : "TAB"
            , excuteFunction : function(event) {
                event.preventDefault();
                if ($("#popObjectGroup").is(":visible")) {
					page.fn.selectNextObjectGroup();
				} else {
	                page.fn.selectNextObject();
				}
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_tab
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "shift_9"
            , keyName : "Shift+TAB"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.chooseNextPointForTag();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_shift_tab
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "alt_33"
            , keyName : "Alt+PageUp"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.resortingObjectList(null, null, null, null, true, "pageUp");
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_alt_pageup
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "alt_34"
            , keyName : "Alt+PageDown"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.resortingObjectList(null, null, null, null, true, "pageDown");
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_alt_pagedown
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "alt_36"
            , keyName : "Alt+Home"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.resortingObjectList(null, null, null, null, true, "pageHome");
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_alt_home
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }, {
            keyCode : "alt_35"
            , keyName : "Alt+End"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.resortingObjectList(null, null, null, null, true, "pageEnd");
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_alt_end
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        }
    ];

    if("compReviewer/manager".includes(page.data.permissionCode)) {
            page.constants.hotkeys.push({
            keyCode : "45"
            , keyName : "INSERT"
            , excuteFunction : function(event) {
                event.preventDefault();
                page.fn.toggleReviewPopup();
            }, type : page.constants.hotkeyType.defaultKey
            , description: page.message.hotkey_insert
            , isVisible : true
            , isCheckPermission : false
            , isCanInput : false
        });
    }
}
