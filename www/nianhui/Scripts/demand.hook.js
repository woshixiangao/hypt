(function(){
    var source_tags = ['pc_lp8', 'pc_bx1','pc_lp9', 'pc_bx2', 'pc_mb1', 'pc_mb2'];

    var lpNode = (typeof(window.JSDATA) != 'undefined' && window.JSDATA.SOURCE_TAGS != '' && typeof(window.JSDATA.SOURCE_TAGS) != 'undefined' && $.inArray(window.JSDATA.SOURCE_TAGS, source_tags) >= 0) ? true : false;

    var $demandHookCss = '<style>\
                            .demand-hook { background: none; box-shadow: none; }\
                            .service-main { position: relative; width: 648px; height: 280px; }\
                            .service-main img.service-people { position: relative; display: block; width: 190px; height: 280px; z-index: 10; }\
                            .service-main .service-content { position: absolute; left: 0; top: 40px; width: 100%; height: 240px; padding: 40px; padding-left: 208px; background: #fff; border-radius: 2px; }\
                            .service-content .title { margin-bottom: 8px; font-size: 20px; line-height: 26px; color: #333; text-align: left; }\
                            .service-content .txt { font-size: 16px; line-height: 21px; color: #666; }\
                            .service-content .service-btn { position: absolute; left: 208px; bottom: 40px; }\
                            .service-content .service-btn .btn { width: 170px; padding: 8px 0; font-size: 18px; line-height: 24px; }\
                            .service-content .service-btn .btn-white { color: #333; border: 1px solid #ddd; background: #fff; }\
                            .service-content .service-btn .btn-white:hover { background: #f4f4f4; }\
                            .service-content .service-btn .btn-blue { margin-left: 10px; color: #fff; border: none; background: #207bee; }\
                            .service-content .service-btn .btn-blue:hover { background: #0e5ec2; }\
                            .service-main .close-btn { position: absolute; right: -40px; bottom: 0; display: block; width: 40px; height: 40px; padding: 8px; background: rgba(0, 0, 0, 0.76); overflow: hidden; }\
                            .service-main .close-btn .hggfont { display: block; width: 24px; height: 24px; font-size: 24px; color: #fff; text-align: center; line-height: 24px; }\
                            .service-main .close-btn:hover { background: #000; }\
                        </style>'

    var $demandHook = $('<div id="customer_service" class="dn">\
                        <div class="service-main">\
                            <img src="/v2/img/customer_service.png" class="service-people">\
                            <div class="service-content">\
                                <h3 class="title">会议信息发布成功！</h3>\
                                <p class="txt">为了帮您更精准的获取报价方案，会议顾问会在15分钟内和您电话再确认一下具体的需求</p>\
                                <div class="service-btn">\
                                    <a href="javascript:;" class="btn btn-white js-service-wait">我愿意等15分钟</a>\
                                    <a href="javascript:;" class="btn btn-blue js-step-perfect">自己花1分钟完善</a>\
                                </div>\
                            </div>\
                            <a href="javascript:;" class="close-btn">\
                                <i class="hggfont hgg-cha"></i>\
                            </a>\
                        </div>\
                    </div>');

    if (lpNode) {
        $demandHook.find('.service-content .title').text('会议信息发布成功！');
        $demandHook.find('.service-btn .js-step-perfect').text('自己花1分钟完善');
        $demandHook.find('.service-btn p.txt').text('为了帮您更精准的获取报价方案，会议顾问会在15分钟内和您电话再确认一下具体的需求');
    }

    $('body').append($demandHookCss).append($demandHook);

    window.isSupportVue = function () {
        var result = false;
        if (typeof (Object.prototype.__defineSetter__) != 'undefined') {
            result = true;
        }
        return result;
    }

    window.showHookDialog = function (config) {
        layer.closeAll();
        if (window.keepEntering.keep_entering_url) {
            $('#customer_service').find('.js-step-perfect').attr('href', window.keepEntering.keep_entering_url);
        }
        var defaultConfig = {
            type: 1,
            title: false,
            shade: 0.68,
            area: ['688px', '280px'],
            skin: 'demand-hook',
            closeBtn: 0,
            content: $('#customer_service')
        };

        if (config) {
            $.extend(defaultConfig, config);
        }
        
        var orderFilter = layer.open(defaultConfig);
        return orderFilter;
    }

})();