window.ZHUGE = {
    'A01' : {'action': '打开年会专区'},
    //	   {'status': '查询-前端失败', 'msg': 'city_name'}
    //	   {'status': '查询-前端失败', 'msg': 'start_date'}
    //	   {'status': '查询-前端失败', 'msg': 'people_num'}
    'A02' : {'action': '查询场地'},
    'A03' : {'status': '查询-前端失败'},
    'A04' : {'status': '查询成功', 'msg': '进入报价'},
    'A05' : {'action': '获取报价'},
    'A06' : {'status': '获取报价-前端失败', 'msg': '未填写手机号'},
    'A07' : {'status': '获取报价-前端失败', 'msg': '手机号格式不正确'},
    'A08' : {'status': '获取报价-前端失败', 'msg': '未输入短信验证码'},
    'A09' : {'status': '获取报价-前端失败', 'msg': '未输入数字验证码'},
    'A10' : {'status': '获取报价-前端失败', 'msg': '数字验证码不正确'},
    'A11' : {'status': '获取报价-后端成功'},


    // 用户下单优化
    'x01': {'action': '打开优化弹出窗'},
    'x02': {'action': '我愿意等待'},
    'x03': {'action': '完善信息'},
};

var zg = function (key, obj) {
    if (ZHUGE[key]) {
        var title = JSDATA.source_tags;
        var opts = obj ? $.extend(ZHUGE[key], obj) : ZHUGE[key];
        hggtrack.track(title, opts);
    }
};