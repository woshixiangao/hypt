$(function () {
    // get path
    var pathName = window.location.pathname;
    var pathSearch = window.location.search;
    var isDetailPage = pathSearch.indexOf('?id') !== -1;
    var isConfirmPage = pathSearch.indexOf('mid') !== -1;
    var isVenuePage = /^\/venue\/?/.test(pathName);
    var space = '/promotion/space';
    var confirm = '/promotion/space/order';

    // index space tongji
    if (pathName == '/') {
        $('.js-space-view').click(function(){
            zhuge.track('特价场地', {
                'where': '首页',
                'action': '查看更多特价场地'
            });
        });
    }

    // space list tongji
    if (pathName == space && !isDetailPage) {
        zhuge.track('特价场地', {
            'where': '特价场地列表页',
            'action': '打开页面'
        });

        $('.js-space-list').click(function () {
            var itemMid = $(this).parents('.promotion-item').attr('data-mid');
            var pathId = $(this).attr('href');

            zhuge.track('特价场地', {
                'where': '特价场地列表页',
                'action': '查看并预定',
                mid: itemMid,
                pathid: pathId
            });
        });
    };

    // space detail tongji
    if (pathName == space && isDetailPage) {
        zhuge.track('特价场地', {
            'where': '特价场地详情页',
            'action': '打开页面'
        });

        $('#js-calendar-submit').click(function () {
            zhuge.track('特价场地', {
                'where': '特价场地详情页',
                'action': '确定预订'
            });
        });
    };

    // space confirm tongji
    if (pathName == confirm && isConfirmPage) {
        zhuge.track('特价场地',{
            'where': '确认订单页面',
            'action': '打开页面'
        });

        $('#js-order-confirm').click(function () {
            var orderId = $('.confirm-order').find('input[name=order_number]').val();
            zhuge.track('特价场地', {
                'where': '确认订单页面',
                'action': '确认并支付定金',
                number : orderId
            })
        });
    };

    // vunue space tongji
    if (isVenuePage) {
        $('.js-venue-space').click(function () {
            zhuge.track('特价场地', {
                'where': '酒店列表页',
                'action': '点击右侧特价场地广告'
            })
        });
    };

})