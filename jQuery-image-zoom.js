/**
 * Created by massimo on 14/10/22.
 */
(function ($) {
    //options = {
    //  src: "http://xxx.jpg",
    //  container: $("#containerId"),
    //  img: $("#imgId"),
    //  animate: 500
    // }
    function zoom(options) {
        this.src = options.src;
        this.container = options.container;
        this.img = options.img;
        this.animate = options.animate;

        this.containerSize = {
            width: this.container.width(),
            height: this.container.height()
        };

        this.ratio = {
            x: 1,
            y: 1
        }; //缩放比

        this.isZoomIn = false; //是否是处于放大状态
        this.isNeedZoomIn = false; //是否需要放大
    }

    //开始执行，完成后回调
    zoom.prototype.done = function (cb) {
        var proxy = this; //代理this
        this.getRealSize(function () {
            proxy.fixSize(); //修正尺寸
            proxy.loadImage();
            proxy.handleDblClick();
            proxy.handleResize();
            cb();
        });
    };

    //获取缩放后点的坐标
    zoom.prototype.getPosition = function (x, y) {
        return {
            x: x * this.ratio.x,
            y: y * this.ratio.y
        }
    };

    //返回是否需要放大
    zoom.prototype.needZoomIn = function (x, y) {
        return this.isNeedZoomIn;
    };

    //获取图片真实大小
    zoom.prototype.getRealSize = function (cb) {
        var proxy = this;
        $("<img/>").attr("src", this.src).load(function () {
            proxy.realSize = {
                width: this.width,
                height: this.height
            };
            cb()
        });
    };

    //修正尺寸
    zoom.prototype.fixSize = function () {
        if (this.realSize.height <= this.containerSize.height) {
            if (this.realSize.width <= this.containerSize.width) {
                this.isNeedZoomIn = false; //不需要缩放
            }
            else {
                this.fixWidth();
            }
        }
        else {
            if (this.realSize.width > this.container.width * this.realSize.height / this.containerSize.height) {
                this.fixWidth();
            }
            else {
                this.fixHeight();
            }
        }

        //修正完成后计算压缩比
        this.ratio = {
            width: this.fixedSize.width / this.realSize.width,
            height: this.fixedSize.height / this.realSize.height
        };
    };

    // too wide
    zoom.prototype.fixWidth = function () {
        this.fixedSize = {
            width: this.containerSize.width,
            height: this.containerSize.width / this.realSize.width * this.realSize.height
        };
    };

    // too tall
    zoom.prototype.fixHeight = function () {
        this.fixedSize = {
            width: this.containerSize.height / this.realSize.height * this.realSize.width,
            height: this.containerSize.height
        };
    };

    zoom.prototype.loadImage = function () {
        this.img
            .attr("src", this.src)
            .attr('width', this.fixedSize.width)
            .attr('height', this.fixedSize.height);
    };

    zoom.prototype.handleDblClick = function () {
        var proxy = this;
        this.img.dblclick(function (e) {
            if (proxy.isZoomIn) {
                //zoom out
                proxy.zoomOut();
            }
            else {
                var posX = $(this).offset().left;
                var posY = $(this).offset().top;
                var offsetX = e.pageX - posX;
                var offsetY = e.pageY - posY;
//					proxy.img.removeAttr("width height"); //zoom in
                console.dir(proxy.ratio);
                var moveOffsetX = offsetX / proxy.ratio.width - proxy.containerSize.width / 2;
                var moveOffsetY = offsetY / proxy.ratio.height - proxy.containerSize.height / 2;
                console.log(moveOffsetX);
                console.log(moveOffsetY);
                proxy.zoomIn(moveOffsetX, moveOffsetY);
                //proxy.container.scrollTop(moveOffsetY).scrollLeft(moveOffsetX);
            }
            proxy.isZoomIn = !proxy.isZoomIn;
        });
    };

    zoom.prototype.handleResize = function () {
        $(window).resize(function (e) {
            console.log("resize");
        });
    };

    zoom.prototype.zoomOut = function () {
        this.img.animate({
            width: this.fixedSize.width,
            height: this.fixedSize.height
        }, this.animate);
        this.container.animate({
            scrollLeft: 0,
            scrollTop: 0
        }, this.animate);
    };

    zoom.prototype.zoomIn = function (scrollLeft, scrollTop) {
        if(scrollLeft < 0){
            scrollLeft = 0;
        }
        if(scrollTop < 0){
            scrollTop = 0;
        }
        this.img.animate({
            width: this.realSize.width,
            height: this.realSize.height
        }, this.animate);
        this.container.animate({
            scrollTop: scrollTop,
            scrollLeft: scrollLeft
        }, this.animate);
    };

    $.zoom = function(options, cb){
        var zoomer = new zoom(options);
        zoomer.done(function(){
            cb({
                getPosition: zoomer.getPosition
            });
        });
    };
}(jQuery));
