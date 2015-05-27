/*
Charting library, based on Raphaël
 */
(function(){

    /**
     *
     * @param values []
     * @param options {}
     */
    Raphael.fn.pie = function (values, opt) {
        var paper = this,
            w = this.width,
            h = this.height,
            rad = Math.PI / 180,
            /*chart = paper.set(),*/
            colors = opt.colors,

            onSectorClicked = opt.onSectorClicked || function () {};
        /* paper settings */
        var cX = w/2,
            cY = h/ 2,
            z = 30;


        /* Chart data */
        var chart = {};
        chart.c0 = [cX, cY];
        chart.rX = 80;
        chart.rY = opt.is3d ? 40 : chart.rX;
        chart.height = opt.is3d ? 20 : 0;
        chart.sectors = [];

        chart.currentX = chart.c0[0] + chart.rX;
        chart.currentY = chart.c0[1];
        /**
         *
         * @param i number
         * @param val value
         * @param currentAngle start angle
         * @constructor
         */
        function Sector (i, val, currentAngle) {
            //console.log(c, val);
            /** general properties */
            this.r1 = chart.rX;
            this.r2 = chart.rY;
            this.x0 = chart.c0[0];
            this.y0 = chart.c0[1];

            /** special properties */
            this.val = val;
            this.startAngle = currentAngle;

            var color = colors[i],
                //color = Raphael.hsb(0.1, .75, 1),
                param = {
                    stroke: "#000",
                    "stroke-width": 0.5,
                    fill: color
                };

            var angle = 360*val/100,
                startAngle = this.startAngle,
                endAngle = this.startAngle + angle;

            return this.drawSector(this.x0, this.y0, this.r1, this.r2, startAngle, endAngle, param, val);
        }
        Sector.prototype.drawSector = function (cx, cy, r1, r2, startAngle, endAngle, params, val) {
            var endX = chart.currentX,
                endY = chart.currentY,
                largeArcFlag = calculateLargeArcFlag(val, 100),
                sector = paper.set();
            this.startX = cx + r1 * Math.cos(endAngle * rad);
            this.startY = cy + r2 * Math.sin(endAngle * rad);

            var path = createPathForTopPart(this.startX, this.startY, endX, endY, largeArcFlag),
                borderPath = createPathForBorderPart(this.startX, this.startY, endX, endY),
                rightSidePath = createPathForSide1Part(this.startX, this.startY),
                leftSidePath = createPathForSide2Part(this.startX, this.startY);
            chart.currentX = this.startX;
            chart.currentY = this.startY;
            function createPathForTopPart(startX, startY, endX, endY, largeArcFlag) {
                return ["M", cx, cy,
                    "L", startX, startY,
                    "A", r1, r2, "0", +(endAngle - startAngle > 180), "0", endX, endY,
                    "L", cx, cy, "z" ].join(",");
            }
            function createPathForBorderPart(startX, startY, endX, endY) {
                return ["M", startX, startY,
                    "A", r1, r2, "0", +(endAngle - startAngle > 180), "0", endX, endY,
                    "L", endX, endY + chart.height,
                    "A", r1, r2, "0", +(endAngle - startAngle > 180), "1", startX, startY + chart.height,
                    "L", startX, startY, "z" ].join(",");

            }
            function createPathForSide1Part(startX, startY) {
                return ["M", startX, startY,
                    "L", cx, cy,
                    "L", cx, cy + chart.height,
                    "L", startX, startY + chart.height, "z"].join(",");
            }
            function createPathForSide2Part(endX, endY) {
                return ["M", endX, endY,
                    "L", cx, cy,
                    "L", cx, cy + chart.height,
                    "L", endX, endY + chart.height, "z"].join(",");
            }
            function calculateLargeArcFlag(val, total) {
                return (total * val) < 180 ? 0 : 1;
            }

            sector.push(paper.path(borderPath).attr(params));
            sector.push(paper.path(path).attr(params).toFront());
            sector.push(paper.path(leftSidePath).attr(params).toBack());
            sector.push(paper.path(rightSidePath).attr(params).toBack());
            return sector;
        };

        function createSectors() {
            if (!values) {
                console.log("your values is empty: (" + values + ")");
            }
            var sector,
                i,
                currentAngle = 0;
            for (i=0; values[i]; i+=1){
                sector = new Sector(i, values[i], currentAngle);
                currentAngle += 360*values[i]/100;
                chart.sectors.push(sector);
            }
        }

        createSectors();
        addMouseEvents(chart.sectors);


        // --- Mouse Events ---
        /** add mouse events */
        function addMouseEvents(chart) {
            var sectors = chart,
                i, el;
            for (i = 0; sectors[i]; i++){
                var s = sectors[i];
                addMouseEvent(s);
            }
            function addMouseEvent(el) {
                el
                    .mouseover(function (e) {
                        addOpacity(el);
                    })
                    .mouseout(function (e) {
                        removeOpacity(el);
                    })
                    .click(function (e) {
                        animateSlice(el);
                    });
            }
            function addOpacity(s) {
                s.attr({
                    "fill-opacity": 0.6
                });
            }
            function removeOpacity(s) {
                s.attr({
                    "fill-opacity": 1
                });
            }
        }
        function animateSlice(s, xcord, ycord, speed) {
            var sliceAnimation = Raphael.animation({transform: "T" + xcord + "," + ycord}, speed);
            if (s.side1) {
                s.top.animate(sliceAnimation);
                s.side1.animateWith(s.top, sliceAnimation, sliceAnimation);
                if (s.side2) s.side2.animateWith(s.top, sliceAnimation, sliceAnimation);
                if (s.border) s.border.animateWith(s.top, sliceAnimation, sliceAnimation);
            } else {
                s.top.animate(sliceAnimation);
            }
        }
    };


    /**
     *
     * @param values []
     * @param options {}
     */
    Raphael.fn.bar = function (values, options) {
        var paper = this,
            opt = options || {};
        paper.el = this.canvas.offsetParent;

        var o = {
            padding: opt.padding || 0,
            paddingX: opt.paddingX || 0, //todo: is it needs?
            paddingY: opt.paddingY || 0, //todo: is it needs?

            is3d: opt.is3d,
            type3d: 'cuboid', //'cuboid', 'cylinder'
            size3d: opt.is3d ? opt.size3d || 10 : 0,   //10

            max: 0,
            roundingUp: opt.rounding || 10,

            colors: opt.colors,
            darkColors: [],
            lightColors: [],

            legendText: opt.legendText || options.labels || [],
            legendColors: opt.legendColors || [],
            labels: opt.labels || [],

            onSectorClicked: opt.onSectorClicked || function () { },

            horizontal: options.horizontal || false,
            tooltip: options.tooltip || false,
            backgroundFill: options.backgroundFill || ["#fff", "#fff"],
            animation : options.animation || false,
            animateTime: options.animateTime || 500
        };

        paper.stngs = {
            scaleY: null
        };

        var paperWidth = this.width,
            paperHeight = this.height,
            x0 = o.padding,
            y0 = paperHeight - o.padding,
            screenW = paperWidth - x0,
            screenH = y0;

        var barParameters = {
            stroke: "#000",
            "stroke-width": 0.5,
            fill: "#777"
        };

        calculateMaxValueAndUsedColors();
        function calculateMaxValueAndUsedColors() {
            Raphael.getColor.reset();

            for (var i = 0; i < values.length; i++) {
                if (values[i] > o.max) {
                    o.max = values[i];
                }
                if (o.colors[i] == undefined) o.colors[i] = Raphael.getColor();

                o.darkColors[i] = utils.calculateDarkColor(o.colors[i]);
                o.lightColors[i] = utils.calculateLightColor(o.colors[i]);
            }
        }

        var numberOfValues = values.length,
            padding = 10,//space between bars / 2
            bottomPartWidth = o.horizontal ? screenH : screenW,
            barPlace = Math.floor((bottomPartWidth - padding * 2) / numberOfValues),//place for each bar
            maxValueRounded = utils.calculateMaxValue(values, 10),
            bars = [],

            x, y,
            h, w;

        if (o.horizontal) {
            if (o.is3d && !o.size3d) o.size3d = barPlace / 4;

            h = /*barPlace - 2 * padding;*/(barPlace / 1.5 < 20) ? barPlace / 1.5 : 20;
            y = y0 - (h + padding * 2);
            x = x0;
        } else {
            if (o.is3d && !o.size3d) o.size3d = barPlace / 4;

            w = /*barPlace - 2 * padding;*/(barPlace / 1.5 < 30) ? barPlace / 1.5 : 30;
            x = x0 + padding * 2//(barPlace - w + o.size3d) / 2;
            y = screenH;
        }

        for (var i = 0; i < numberOfValues; i++) {

            var emulation;

            if (o.horizontal) {
                w = (screenW / maxValueRounded) * values[i];

                var radiusX = h / 6,
                    radiusY = h / 2;

                console.log(x, y, w, h);
                var frontPathStart = [
                    "M", x, y,
                    "L", x, y,
                    "L", x, (y + h),
                    "L", x, (y + h),
                    "Z"];

                var frontPathEnd = [
                    "M", x, y,
                    "L", (x + w), y,
                    "L", (x + w), (y + h),
                    "L", x, (y + h),
                    "Z"];

                barParameters.fill = o.colors[i];
                var frontPart = paper.path(frontPathStart)
                    .attr(barParameters);

                frontPart.animate({path: frontPathEnd}, o.animateTime);
                emulation = paper.rect(x, y, w, h);
            } else {
                h = (screenH / maxValueRounded) * values[i];


                var radiusX = w / 2,
                    radiusY = w / 6,
                    centerX = x + radiusX,
                    centerY = y;

                console.log(x, y, w, h);
                var frontPathStart = createBarPath('front', [x, y, w, 0]);

                var frontPathEnd = createBarPath('front', [x, y, w, h]);

                barParameters.fill = o.colors[i];
                if (o.is3d){
                    var topPathStart = createBarPath('top', [x, y, w]);
                    var topPathEnd = createBarPath('top', [x, y - h, w]);
                    var sidePathStart = createBarPath('side', [x, y, w, 0]);
                    var sidePathEnd = createBarPath('side', [x, y, w, h]);
                    var buttonPath = createBarPath('top', [x, y, w]);

                    var topPart = paper.path(topPathStart).attr(barParameters);
                    var sidePart = paper.path(sidePathStart).attr(barParameters);
                    var buttonPart = paper.path(buttonPath).attr(barParameters).toBack();
                }

                frontPart = paper.path(frontPathStart)
                    .attr(barParameters);

                frontPart.animate({path: frontPathEnd}, o.animateTime);
                if (o.is3d){
                    topPart.animate({path: topPathEnd}, o.animateTime);
                    sidePart.animate({path: sidePathEnd}, o.animateTime);
                }

                emulation = paper.rect(x, y - h, w, h)
            }

            emulation.attr({
                fill: "#fff",
                "stroke-width": 0,
                opacity: 0
            });

            bars[i] = emulation;
            bars[i].num = i;

            if (o.tooltip) {
                bars[i].mouseover(function () {
                    this.prev.attr({
                        opacity: barOpacityHover
                    });
                    showTooltip(this.num, true);
                }).mouseout(function () {
                        this.prev.attr({
                            opacity: barOpacity
                        });
                        showTooltip(this.num, false);
                    });
            }
            (o.horizontal) ? y -= barPlace : x += barPlace;
        }
        /**
         *
         * @param type
         * @param params arr [x, y, w, h]
         * @returns {*}
         */
        function createBarPath(type, params) {
            var types = {
                front: front,
                top: top,
                side: side
            };
            if (typeof types[type] == "function"){
                return types[type].apply(this, params);
            }
            function front(x, y, w, h){
                var size3d = o.size3d || 0;
                return [
                    "M", x - size3d, y + size3d,
                    "L", x - size3d, y - h + size3d,
                    "L", x - size3d + w, y + size3d - h,
                    "L", x - size3d + w, y + size3d,
                    "Z"
                ].join(",");
            }
            function top(x, y, w) {
                var size3d = o.size3d || 0;
                return [
                    "M", x, y,
                    "L", x - size3d, y + size3d,
                    "L", x + w - size3d, y + size3d,
                    "L", x + w, y,
                    "Z"
                ].join(",");
            }
            function side(x, y, w, h) {
                var size3d = o.size3d || 0;
                return [
                    "M", x + w - size3d, y + size3d,
                    "L", x + w - size3d, y - h + size3d,
                    "L", x + w, y - h,
                    "L", x + w, y,
                    "Z"
                ].join(",");
            }
        }


        /* draw bar chart */
        function Bar (value, opt){
            this.val = value;
            this.x = opt.x;
            this.y = opt.y;
            this.w = opt.w || 20;

            this.parts = [];

            this.onMouseOver = function(){};

            if (typeof opt.onMouseOver == 'function'){
                this.onMouseOver = opt.onMouseOver
            }
            return this;
        }
        Bar.prototype.createPath = function (type, params) {
            var types = {
                    top: top,
                    side: side
                };
            if (typeof types[type] == "function"){
                return types[type].apply(this, params);
            }
            function top(x, y, w) {
                var size3d = o.size3d;
                return [
                    "M", x, y,
                    "L", x + size3d, y - size3d,
                    "L", x + w + size3d, y - size3d,
                    "L", x + w, y, "z"].join(",");
            }
            function side(x, y, w, h) {
                var size3d = o.size3d;
                return [
                    "M", x + w + size3d, y - size3d,
                    "L", x + w + size3d, y + h - size3d,
                    "L", x + w, y + h,
                    "L", x + w, y, "z"].join(",");
            }
        };
        Bar.prototype.drawRect = function(x, y, w, h, params){
            var pms = params || {};
            return paper.rect(x, y, w, h).attr(pms)
        };
        Bar.prototype.drawPart = function (path, params) {
            return paper.path(path).attr(params);
        };
        Bar.prototype.drawBar = function (){
            var x0 = this.x,
                y0 = this.y,
                w = this.w,
                value = this.val;
            if (o.is3d){
                x0 = this.x + o.size3d;
                y0 = this.y + o.size3d;
                var top = this.createPath('top', [x0, y0 - value, w, value]);
                var side = this.createPath('side', [x0, y0 - value, w, value]);
                var topPart = this.drawPart(top, parameters);
                var sidePart = this.drawPart(side, parameters);
                this.drawPart(this.createPath('top', [0 + 20, screenH + o.size3d, screenW, o.size3d]), {
                    stroke: "#ccd4e0",
                    "stroke-width": 0.5,
                    fill: "#ccd4e0"
                }).toBack();
            }

            var frontPart = this.drawRect(x0, y0 - value, w, value, parameters);
            this.parts.push(frontPart)/*.push(topPart).push(sidePart)*/;
        };
        Bar.prototype.addEvents = function (num) {
            this.parts[0]
                .mouseover(function (e) {
                    showTooltip(e, num);
                })
                .mouseout(function (e) {
                    hideTooltip(e);
                })
                .click(function (e) {
                    o.onSectorClicked(e, num);
                });
        };

//        drawBars(x0, y0, screenW, screenH, values);
        function drawBars(x, y, w, h, vals ) {
            var x0 = x,
                y0 = y,
                canvasW = w,
                canvasH = h,
                delta = 15,
                i,
                l = values.length;
            var barWidth = 20;
            var hScale = getCanvasMaxScale();
            var opt = {
                    x: x0,
                    y: y0
                };

            for (i = 0; i<l; i++){
                var value = h/hScale*values[i];
                parameters.fill = o.colors[i];
                var bar = new Bar(value, opt);
                opt.x += delta + barWidth;
                bar.drawBar();
                bar.addEvents(i);
            }
        }




        //tooltip
        function showTooltip(e, num){
            var tooltip = createTooltip(),
                innerText = o.labels[num];
            tooltip.style.display = 'block';
            tooltip.innerHTML = innerText;
            calculatePosition();
        }
        function hideTooltip(e){
            var tooltip = document.getElementById('tooltip');
            tooltip.style.display = 'none';
        }
        function createTooltip(){
            var tooltip;
            if(document.getElementById('tooltip')){
                tooltip = document.getElementById('tooltip')
            }else {
                tooltip = document.createElement("div");
                tooltip.id = "tooltip";
                paper.el.appendChild(tooltip);
            }
            return tooltip
        }
        function calculatePosition() {

        }

        function getCanvasMaxScale(){
            return paper.stngs.scaleY;
        }

        //scale
        var isHorizontal = o.horizontal,
            scaleParams = {
                type: isHorizontal ? 'horizontal' : 'vertical',
                isHorizontal: isHorizontal,
                values: values,
                labels: o.labels,
                padding: o.is3d ? padding + o.size3d : padding,
                hGrids: isHorizontal ? 0 : 4,
                vGrids: isHorizontal ? 4 : 0
            };

        var scale = drawScale(paper, scaleParams);

        //legend
        (function(){
            var el = paper.el,
                o = {};
            o.legendText = ["legend1", "legend2", "legend3"];
            o.legendColors = ['#b1238d', '#c71057', '#fc7b06'];
            o.legendContainerCssClass = "legend-container";
            o.legendLabelCssClass = "legend-label";
            o.legendIcoCssClass = "legend-icon";

            createLegend(el, o);
        })();

    };

    /* --- Utils --- */
    var utils = (function () {
        function toHex(N) {
            if (N == null)
                return "00";
            N = parseInt(N);
            if (N == 0 || isNaN(N))
                return "00";
            N = Math.max(0, N);
            N = Math.min(N, 255);
            N = Math.round(N);
            return "0123456789ABCDEF".charAt((N - N % 16) / 16)
                + "0123456789ABCDEF".charAt(N % 16);
        }
        return {
            calculateDarkColor: function (color) {
                var c = Raphael.getRGB(color);
                var r = parseInt(c.r) - 36;
                var g = parseInt(c.g) - 30;
                var b = parseInt(c.b) - 24;
                return "#" + toHex(r) + toHex(g) + toHex(b);
            },

            calculateLightColor: function (color) {
                var c = Raphael.getRGB(color);
                var r = parseInt(c.r) + 36;
                var g = parseInt(c.g) + 30;
                var b = parseInt(c.b) + 24;
                return "#" + toHex(r) + toHex(g) + toHex(b);
            },

            calculateMaxValue: function (vals, round){
                var maxVal = vals.reduce(function (previousNum, currentNum) {
                    return (previousNum < currentNum) ? currentNum : previousNum;
                }, 0);
                return (round && typeof +round == 'number') ?   //10
                    maxVal : (((maxVal + 10) / 10) >> 0) * 10
            }
        }
    })();

    /* --- Scale --- */
    function drawScale (paper, params) {

        var paperWidth = paper.width,
            paperHeight = paper.height,
            x0 = params.padding,
            y0 = paperHeight - params.padding,
            screenW = paperWidth - x0,
            screenH = y0,
            values = params.values,
            valuesX = null, valuesY = null,
            labels = params.labels,
            numOfVals = values.length,
            maxScale = calculateMaxScale(values),
            type = params.type;

        if (type == 'curve'){
            valuesX = values[0];
            valuesY = values[1];
            var maxScaleX = calculateMaxScale(valuesX);
            var maxScaleY = calculateMaxScale(valuesY);
        }
        console.log(values);
        var lineParams = {
            stroke: "#ccd4e0",
            "stroke-width": 0.5
        };
        var axisParams = {
            stroke: "#ccd4e0",
            "stroke-width": 1
        };
        var shadowParams = {
            stroke: "#ccd4e0",
            "stroke-width": 0.5,
            fill: "#ccd4e0"
        };

        drawAxis();
        drawDivisions(maxScale);

        function calculateMaxScale (vals){
            var maxVal = vals.reduce(function (previousNum, currentNum) {
                return (previousNum < currentNum) ? currentNum : previousNum;
            }, 0);
            return maxVal;//(((maxVal + 10) / 10) >> 0) * 10
        }

        var scale = createScale(maxScale);
        function createScale (maxScale) {
            var arr = [];
            while (maxScale >= 0) {
                arr.push(maxScale);
                maxScale -= 10;
            }
            return arr.reverse();
        }

        function drawAxis() {
            paper.path(makeLinePath('h', x0, y0)).attr(axisParams);
            paper.path(makeLinePath('v', x0, y0)).attr(axisParams);
        }
        function drawDivisions (maxScale) {
            var hNumOfDivisions = params.hGrids,
                vNumOfDivisions = params.vGrids,
                numOfSubs = 0,
                i, j;
            horizontalDivisions();
            verticalDivisions();

            if (type == 'vertical'){
                for(j = 0; j < numOfVals; j++){
                    console.log(labels[j]);
                    var x = x0 + screenW/numOfVals * j;
                    paper.text(x + screenW/numOfVals/2 - 5, y0 + 5, labels[j]);
                }
            } else if (type == 'horizontal'){
                drawLabels();
            }

            function horizontalDivisions() {
                var max = maxScaleY || maxScale;
                for (i = 1; i <= hNumOfDivisions; i++){
                    var y = screenH - screenH/hNumOfDivisions*i;
                    paper.path(makeLinePath('h', x0, y)).attr(lineParams);
                    paper.text(x0 - 15, y, '' + max/hNumOfDivisions*i);
                    for (j = 1; j <= numOfSubs; j++){
                        paper.path(makeLinePath('h', x0, y +screenH/hNumOfDivisions/numOfSubs*j)).attr(lineParams);
                    }
                }
            }
            function verticalDivisions() {
                var max = maxScaleX || maxScale;
                for (i = 1; i <= vNumOfDivisions; i++){
                    var x = x0 + screenW/vNumOfDivisions*i;
                    paper.path(makeLinePath('v', x, y0)).attr(lineParams);
                    paper.text(x, y0 + 5, '' + max/vNumOfDivisions*i);
                    for (j = 1; j <= numOfSubs; j++){
                        paper.path(makeLinePath('v', x, y0 + screenW/vNumOfDivisions/numOfSubs*j)).attr(lineParams);
                    }
                }
            }
        }

        //helpers
        function makeLinePath(direction, xStart, yStart) {
            var m = {
                'v': [xStart, 0],
                'h': [screenW, yStart]
            };
            return [
                "M", xStart, yStart,
                "L", m[direction][0], m[direction][1]
            ]
        }


        function drawLabels() {
            var rootElement = paper.canvas.parentNode,
                longScaleV = document.createElement('ul'),
                containerV = document.createDocumentFragment();

            longScaleV.className = 'raphael-vertical-long-scale';
            rootElement.parentNode.insertBefore(longScaleV, rootElement);

            var numOfVals = values.length,
                step = (y0 - 2*params.padding)/ numOfVals;
            for( var i = 0; i < numOfVals; i++ ){
                var li = document.createElement('li'),
                    scaleTitle = document.createElement('span'),
                    scaleValue = document.createElement('span');

                li.style.height = step + 'px';
                li.style.lineHeight = step + 'px';
                scaleTitle.className = 'title';
                scaleValue.className = 'value';
                scaleTitle.innerHTML = labels[i];
                scaleValue.innerHTML = values[i];
                li.appendChild(scaleTitle);
                li.appendChild(scaleValue);
                containerV.appendChild(li);
            }

            longScaleV.appendChild(containerV);
        }

        return paper;
    }

    // --- Legend ---
    function createLegend (el, o) {
        var legend = new Legend(el, o);
        legend.createLegend();
    }
    /**
     *
     * @param el
     * @param o {
     *     legendText,
     *     legendContainerCssClass,
     *     legendColors
     * }
     * @constructor
     */
    function Legend(el, o) {
        this.container = document.createElement("div");
        this.lables = document.createElement("ul");
        this.colors = o.legendColors
        this.classNames = {
            'containerClass': o.legendContainerCssClass,
            'labelClass': o.legendLabelCssClass,
            'iconClass': o.legendIcoCssClass
        };
        this.legendsText = o.legendText
        this.el = el;
    }
    Legend.prototype.createLegend = function () {
        var legendContainerDiv = this.container,
            legendLabels = this.lables,
            i, l = this.legendsText.length,
            el = this.el;

        legendContainerDiv.className = this.classNames.containerClass;
        el.parentNode.insertBefore(legendContainerDiv, el.nextSibling);
        legendContainerDiv.appendChild(legendLabels);
        for (i = 0; i < l; i++) {
            this.drawLegendLabel(i, this.legendsText[i]);
        }
    };
    Legend.prototype.drawLegendLabel = function (i, lable) {
        var legendLabel = document.createElement("li"),
            legendLabelIco = document.createElement("em"),
            legendLabelText = document.createElement("span"),
            legendValue = "",
            icoBgColor = this.colors[i];

        legendLabel.className = this.classNames.labelClass;
        legendLabelIco.className = this.classNames.iconClass;

        legendLabelText.appendChild(document.createTextNode(" " + lable + legendValue));
        legendLabelIco.style.background = icoBgColor;
        legendLabel.appendChild(legendLabelIco);
        legendLabel.appendChild(legendLabelText);
        this.lables.appendChild(legendLabel);
    };

})();
