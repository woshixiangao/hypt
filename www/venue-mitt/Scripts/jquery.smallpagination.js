//可分页式右侧列表
;(function($){
    $.fn.extend({
        pagination: function(args) {
            var $objs = this;
            var option = { pageSize: 5, subDom: 'li' };

            if (typeof args == 'object') {
                option = $.extend(option, args);
            }

            // 显示区间列表
            var show_page = function($curr, page) {
                var start = (option.pageSize * (page - 1)) - 1;
                var end = option.pageSize;
                var css = option.subDom;
                if (start > 0) css += ':gt('+(start)+')';
                if (end > 0) css += ':lt('+end+')';
                $curr.find(option.subDom).hide();
                $curr.find(css).show();
            }

            // 构建分页器
            var build_dom = function($curr, maxPage) {
                var $dom = $('<div class="stat">').data('page', 1);
                var $prev = $('<span>&lt;</span>');
                var $info = $('<span>').text('1/'+maxPage);
                var $next = $('<span>&gt;</span>');
                $dom.append($prev).append($info).append($next);
                // 上一页动作
                $prev.click(function(){
                    var $stat = $(this).parent('.stat');
                    var getPage = parseInt($stat.data('page'));
                    var prevPage = getPage - 1;

                    if (getPage > 1 && getPage <= maxPage) {
                        $info.text([prevPage, maxPage].join('/'));
                        $stat.data('page', prevPage);
                        show_page($curr, prevPage);
                    }
                });
                // 下一页动作
                $next.click(function(){
                    var $stat = $(this).parent('.stat');
                    var getPage = parseInt($stat.data('page'));
                    var nextPage = getPage + 1;

                    if (getPage < maxPage) {
                        $info.text([nextPage, maxPage].join('/'));
                        $stat.data('page', nextPage);
                        show_page($curr, nextPage);
                    }
                });
                return $dom;
            }

            return $objs.each(function(){
                var $curr = $(this), $h5 = $curr.find('h5');

                var pageSize = $curr.data('show');
                if (pageSize >= 1) option.pageSize = pageSize;

                var count = $curr.find(option.subDom).size();
                if (count <= option.pageSize) return true;

                var maxPage = Math.ceil(count/option.pageSize);

                var $handle = build_dom($curr, maxPage);
                $h5.prepend($handle);

                var css = option.subDom+':gt('+(option.pageSize-1)+')';
                $curr.find(css).hide();

                return this;
            });
        }
    });
})(jQuery);