// useful links:
// http://svg.dabbles.info/snaptut-base
// http://snapsvg.io/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
;
var ARC_60 = 360 / 60, ARC_12 = 360 / 12;
var SUB_ARC_60 = ARC_60 / 60, SUB_ARC_12 = ARC_12 / 60;
var ANIMATION_TIME = 300;
var TICK = 1000; // 1 second, updates clock every second
function main(clockMaker) {
    var s = Snap(window.innerWidth, window.innerHeight);
    var x = Math.floor(window.innerWidth / 2);
    var y = Math.floor(window.innerHeight / 2);
    // creates clock with center (x,y)
    var clock = new clockMaker(x, y, s);
    // initial pointers positions (no animation)
    var now = new Date();
    clock.set(now.getHours(), now.getMinutes(), now.getSeconds());
    // update pointers at fixed TICK intervals
    setInterval(function () {
        var now = new Date();
        clock.tick(now.getHours(), now.getMinutes(), now.getSeconds());
    }, TICK);
}
;
//
// Auxiliary functions
//
function bounce(transformation, element) {
    element.animate({ 'transform': transformation }, ANIMATION_TIME, mina.bounce);
}
;
function linear(transformation, element) {
    element.animate({ 'transform': transformation }, ANIMATION_TIME, mina.linear);
}
;
function toAngles(h, m, s) {
    return [
        ((h % 12) * ARC_12) + (m * SUB_ARC_12),
        m * ARC_60 + (s * SUB_ARC_60),
        s * ARC_60
    ];
}
;
function toStrictAngles(h, m, s) {
    return [((h % 12) * ARC_12), m * ARC_60, s * ARC_60];
}
;
//
// Clocks
//
var ClockWork = (function () {
    function ClockWork(x, y, s) {
        this.oldhours = 0;
        this.oldminutes = 0;
        this.oldseconds = 0;
        // all use the same rotation transformation
        this.rotateS = function (angle) {
            return 'r' + angle + ',' + x + ',' + y;
        };
        this.rotateM = this.rotateS;
        this.rotateH = this.rotateS;
    }
    // manually change roation of element to ensure smooth animation to an
    // angle smaller than current angle.
    ClockWork.prototype.adjust = function (oldAngle, newAngle, element, transformation) {
        // only when change happens, otherwise it would bump around for nothing
        if (newAngle < oldAngle) {
            element.transform(transformation(oldAngle - 360));
        }
    };
    ;
    ClockWork.prototype.set = function (h, m, s) {
        _a = this.angler()(h, m, s), this.oldhours = _a[0], this.oldminutes = _a[1], this.oldseconds = _a[2];
        this.seconds.transform(this.rotateS(this.oldseconds));
        this.minutes.transform(this.rotateM(this.oldminutes));
        this.hours.transform(this.rotateH(this.oldhours));
        var _a;
    };
    ClockWork.prototype.angler = function () {
        return toStrictAngles;
    };
    ClockWork.prototype.tick = function (h, m, s) {
        // not proud of this reuse of parameters
        _a = this.angler()(h, m, s), h = _a[0], m = _a[1], s = _a[2];
        // see if elements' angle needs adjustments
        this.adjust(this.oldseconds, s, this.seconds, this.rotateS);
        this.adjust(this.oldminutes, m, this.minutes, this.rotateM);
        this.adjust(this.oldhours, h, this.hours, this.rotateH);
        this.oldhours = h;
        this.oldminutes = m;
        this.oldseconds = s;
        var _a;
        // derived classes must implement 'ticking' transformation
    };
    return ClockWork;
})();
;
var SimpleClock = (function (_super) {
    __extends(SimpleClock, _super);
    function SimpleClock(x, y, s) {
        _super.call(this, x, y, s);
        // fixed size clock
        var RADIUS = 280;
        var PADDING = 10;
        var BORDER_WIDTH = 4;
        var FONT_H = 30;
        var MSG = 'Just write the goddamn paper.';
        //
        // Clock's visual stuff
        //
        // background circle
        s.circle(x, y, RADIUS - BORDER_WIDTH - PADDING).attr({
            fill: "r()#fff-#999",
            stroke: '#bbb',
            strokeWidth: BORDER_WIDTH,
            filter: s.filter(Snap.filter.shadow(5, 5, 5, 'black', 0.5))
        });
        // text
        var text = s.text(x, y + 3 * FONT_H, MSG);
        text.attr({
            fontFamily: 'Gochi Hand',
            fontSize: FONT_H,
            textAnchor: 'middle'
        });
        //
        // pointers
        //
        var r_w, r_h;
        // minutes
        r_w = 20;
        r_h = Math.floor(2 * RADIUS / 3);
        this.minutes = s.rect(x - (r_w / 2), y - r_h, r_w, r_h, 4, 4).attr({
            fill: 'rgba(66,66,66,0.8)',
            filter: s.filter(Snap.filter.blur(5, 5))
        });
        // hours
        r_h = Math.floor(r_h / 2);
        this.hours = s.rect(x - (r_w / 2), y - r_h, r_w, r_h, 4, 4).attr({
            fill: 'rgba(66,66,66,0.8)',
            filter: s.filter(Snap.filter.blur(5, 5))
        });
        // seconds pointer
        r_w = 10;
        r_h = RADIUS - PADDING * 3;
        this.seconds = s.rect(x - (r_w / 2), y - r_h, r_w, r_h + 40, 4, 4).attr({
            fill: 'rgba(200,0,0.5)'
        });
        // red circle on top of seconds
        s.circle(x, y, 14).attr({
            fill: 'rgba(200,0,0,1)',
            stroke: 'rgba(210,0,0,1)',
            strokeWidth: 2,
            filter: s.filter(Snap.filter.shadow(2, 2))
        });
    }
    SimpleClock.prototype.angler = function () {
        return toAngles;
    };
    SimpleClock.prototype.tick = function (h, m, s) {
        _super.prototype.tick.call(this, h, m, s);
        bounce(this.rotateS(this.oldseconds), this.seconds);
        linear(this.rotateM(this.oldminutes), this.minutes);
        linear(this.rotateH(this.oldhours), this.hours);
    };
    return SimpleClock;
})(ClockWork);
;
var HolesClock = (function (_super) {
    __extends(HolesClock, _super);
    function HolesClock(x, y, s) {
        _super.call(this, x, y, s);
        // fixed size clock
        var RADIUS = 200;
        var FONT_H = 30;
        var PADDING = 10;
        var POS = RADIUS - FONT_H - PADDING;
        var ARC = (2 * Math.PI * ARC_12) / 360;
        var POS2 = RADIUS + FONT_H + PADDING * 2;
        var ARC2 = (2 * Math.PI * ARC_60) / 360;
        var FONT_H2 = 15;
        var pattern = s.image("images/wood.jpg", 0, 0, 640, 300).toPattern(0, 0, 300, 200);
        var pattern2 = s.image("images/wood2.png", 0, 0, 500, 500).toPattern(0, 0, 500, 500);
        s.circle(x, y, POS2 + PADDING * 2 + FONT_H2).attr({
            fill: pattern2,
            stroke: 'rgba(0,0,0,0.5)',
            strokeWidth: 4,
            filter: s.filter(Snap.filter.blur(5, 5))
        });
        // text
        // hours
        for (var i = 0; i < 12; ++i) {
            var angle = -i * ARC;
            var xx = x + POS * Math.cos(angle);
            var yy = y - POS * Math.sin(angle);
            var text = s.text(xx, yy, ((i + 2) % 12 + 1) + '');
            text.attr({
                fontFamily: 'Lobster',
                fontSize: FONT_H,
                textAnchor: 'middle',
                'alignment-baseline': 'middle'
            });
        }
        // minutes
        for (var i = 0; i < 60; ++i) {
            var angle = -i * ARC2;
            var xx = x + POS2 * Math.cos(angle);
            var yy = y - POS2 * Math.sin(angle);
            var text = s.text(xx, yy, ((i + 15) % 60) + '');
            text.attr({
                fontFamily: 'Lobster',
                fontSize: FONT_H2,
                textAnchor: 'middle',
                'alignment-baseline': 'middle'
            });
        }
        var disk = s.circle(x, y, RADIUS).attr({
            fill: pattern,
            stroke: 'rgba(114, 76, 38, 0.5)',
            strokeWidth: 4,
        });
        var group = s.group();
        group.append(s.circle(x, y, RADIUS).attr({
            fill: 'white',
            stroke: 'white'
        }));
        group.append(s.circle(x, y - POS, FONT_H).attr({
            fill: 'black',
            stroke: 'black'
        }));
        disk.attr({ 'mask': group });
        this.hours = disk;
        var disk2 = s.circle(x, y, POS2 + PADDING * 3 + FONT_H2).attr({
            fill: pattern,
            stroke: 'rgba(0,0,0,0.5)',
            strokeWidth: 22 // wtf? why doesn't 4 look the same??
        });
        var group2 = s.group();
        group2.append(s.circle(x, y, POS2 + PADDING * 2 + FONT_H2).attr({
            fill: 'white',
            stroke: 'white'
        }));
        group2.append(s.circle(x, y, RADIUS - 1).attr({
            fill: 'black',
            stroke: 'black'
        }));
        group2.append(s.circle(x, y - POS2, FONT_H2).attr({
            fill: 'black',
            stroke: 'black'
        }));
        disk2.attr({ 'mask': group2 });
        this.minutes = disk2;
        this.seconds = s.group();
        this.seconds.append(s.polyline([
            x - 10, y,
            x, y - 100,
            x + 10, y
        ]).attr({
            fill: 'rgba(114, 76, 38, 1)',
            stroke: 'rgba(20,20,20,0.2)',
            strokeWidth: 2,
        }));
        this.seconds.append(s.polyline([
            x - 10, y,
            x, y + 20,
            x + 10, y
        ]).attr({
            fill: 'rgba(114, 76, 38, 1)',
            stroke: 'rgba(20,20,20,0.2)',
            strokeWidth: 2,
        }));
    }
    HolesClock.prototype.tick = function (h, m, s) {
        _super.prototype.tick.call(this, h, m, s);
        bounce(this.rotateS(this.oldseconds), this.seconds);
        linear(this.rotateM(this.oldminutes), this.minutes);
        linear(this.rotateH(this.oldhours), this.hours);
    };
    return HolesClock;
})(ClockWork);
;
var HandsClock = (function (_super) {
    __extends(HandsClock, _super);
    function HandsClock(x, y, s) {
        _super.call(this, x, y, s);
        // fixed size clock
        var RADIUS = 300;
        var FONT_H = 40;
        var PADDING = 10;
        var POS = RADIUS - FONT_H - PADDING;
        var ARC = (2 * Math.PI * ARC_12) / 360; // to radians
        s.circle(x, y, RADIUS).attr({
            stroke: 'black',
            fill: 'white',
            strokeWidth: 8,
            filter: s.filter(Snap.filter.shadow(7, 7, 5, 'black', 0.5))
        });
        for (var i = 0; i < 12; ++i) {
            var angle = -i * ARC;
            var xx = x + POS * Math.cos(angle);
            var yy = y - POS * Math.sin(angle);
            var text = s.text(xx, yy, ((i + 2) % 12 + 1) + '');
            text.attr({
                fontFamily: 'Lobster',
                fontSize: FONT_H,
                textAnchor: 'middle',
                'alignment-baseline': 'middle'
            });
        }
        // from http://www.clker.com/clipart-watchhands-clock-hands.html
        var MINUTES = "m-323.286682,17.222778c25.009552,0 46.2854,17.883179 54.155548,42.826363c1.132568,-0.176575 2.474365,-0.379414 3.4711,-0.592262c7.426056,-9.679676 20.669418,-14.204517 32.434341,-12.963181c-1.121017,-5.341892 0.287399,-10.521538 3.281464,-15.125116c15.018646,26.278551 31.519592,41.317286 54.859802,40.725962c28.540878,-0.723022 33.960175,-27.366699 36.130463,-36.948994c-1.988342,1.349689 -4.323502,2.127594 -6.819626,2.127594c-7.26503,0 -13.156677,-6.584188 -13.156677,-14.703222c0,-8.119033 5.891647,-14.703715 13.156677,-14.703715c5.635834,0 10.444885,3.962636 12.317932,9.530282c6.96656,-17.32383 18.426117,-29.742926 41.643745,-28.233862c-0.600845,-1.499533 -0.935654,-3.161328 -0.935654,-4.91093c0,-6.642905 4.820152,-12.029672 10.76432,-12.029672c5.944588,0 10.765167,5.386766 10.765167,12.029672c0,3.785573 -1.565994,7.163094 -4.012177,9.367524c19.315659,9.978422 27.076096,34.114127 26.566185,48.753872c30.433571,-17.425014 49.308068,1.686127 81.622414,15.686378c27.675209,11.989563 71.70446,17.736671 113.18425,13.695763c0.977951,3.598969 4.065567,6.988907 6.978058,9.628586c-2.912491,2.64064 -6.000107,6.031532 -6.978058,9.631454c-41.47979,-4.04232 -85.509041,1.706177 -113.18425,13.699585c-32.314345,14.004532 -51.188843,33.119965 -81.622414,15.690178c0.509911,14.644081 -7.250526,38.785957 -26.566185,48.767723c2.446182,2.205399 4.012177,5.583389 4.012177,9.369919c0,6.645294 -4.82058,12.033478 -10.765167,12.033478c-5.944168,0 -10.76432,-5.388184 -10.76432,-12.033478c0,-1.750076 0.334808,-3.412354 0.935654,-4.912857c-23.217628,1.51004 -34.677185,-10.912384 -41.643745,-28.240524c-1.873047,5.568588 -6.682098,9.532196 -12.317932,9.532196c-7.26503,0 -13.156677,-6.586105 -13.156677,-14.70755c0,-8.120941 5.891647,-14.707527 13.156677,-14.707527c2.496124,0 4.831284,0.777931 6.819626,2.127602c-2.170288,-9.584213 -7.589584,-36.235512 -36.130463,-36.958534c-23.34021,-0.590843 -39.841156,14.451714 -54.859802,40.737434c-2.994064,-4.605034 -4.402481,-9.785614 -3.281464,-15.129921c-11.764923,1.241821 -25.008286,-3.283981 -32.434341,-12.966499c-0.997589,-0.212852 -2.34024,-0.415688 -3.473236,-0.592735c-7.872284,24.939835 -29.146423,42.819679 -54.153412,42.819679c-31.701508,0 -57.411438,-28.732109 -57.411438,-64.160583c0,-35.428936 25.709503,-64.16008 57.411438,-64.16008zm318.378976,64.161041c7.083135,4.862267 8.926319,17.065651 5.967253,28.720665c12.452887,-9.159935 30.076943,-16.805069 43.418576,-18.924561c-2.318932,-2.599106 -3.587246,-6.419998 -3.587246,-9.796104c0,-3.375603 1.268314,-7.195084 3.587246,-9.794189c-13.341633,-2.118546 -30.966114,-9.761761 -43.418576,-18.918362c2.959462,11.650723 1.115882,23.851719 -5.967253,28.712551zm-64.715745,0c16.344639,9.066391 28.551975,33.179642 42.06267,35.431816c13.511148,2.252625 22.443417,-7.193176 22.922987,-15.820496c0.275012,-4.940521 -17.430602,-7.102959 -10.365031,-19.61132c-7.065571,-12.505005 10.640042,-14.667442 10.365031,-19.606064c-0.47957,-8.624447 -9.411839,-18.067875 -22.922987,-15.816189c-13.510695,2.251213 -25.718031,26.358257 -42.06267,35.422253zm-90.239906,0c9.629181,5.844444 17.089401,13.821266 22.60524,23.82119c5.510712,-9.870094 13.377045,-18.107033 22.604836,-23.82119c-9.227791,-5.712723 -17.094124,-13.947266 -22.604836,-23.814968c-5.515839,9.996571 -12.976059,17.971958 -22.60524,23.814968zm-100.051498,0c0,15.866302 11.366882,20.094299 19.804184,18.443939c12.474258,-2.439705 17.269226,-16.251434 35.502289,-18.443939c-18.233063,-2.192497 -23.028458,-15.999931 -35.502289,-18.438705c-8.437302,-1.649857 -19.804184,2.576225 -19.804184,18.438705zm171.858917,-80.862542c17.928131,3.948316 29.601677,23.398318 26.069077,43.433915c-2.036217,11.546684 -8.680313,20.770081 -17.375137,25.759293c-6.392998,3.667236 -13.8946,5.046959 -21.490623,3.373711c-4.131317,-0.910133 -7.930405,-2.644943 -11.28833,-5.018791c-8.150299,-5.763798 -13.697754,-15.303146 -15.074142,-26.007c1.919159,2.562374 4.604919,4.436073 7.766815,5.131897c7.343643,1.617908 14.472443,-3.726379 15.919739,-11.933727c1.447716,-8.206854 -3.33445,-16.174608 -10.678062,-17.792021c-3.33017,-0.733061 -6.615913,-0.035315 -9.348213,1.711908c6.716705,-13.85849 20.935043,-21.86681 35.498878,-18.659185zm0,161.747049c17.928131,-3.94928 29.601677,-23.404999 26.069077,-43.445847c-2.036217,-11.550026 -8.680313,-20.776291 -17.375137,-25.766449c-6.392998,-3.668671 -13.8946,-5.048401 -21.490623,-3.374672c-4.131317,0.910133 -7.930405,2.645424 -11.28833,5.020226c-8.150299,5.765709 -13.697754,15.306976 -15.074142,26.01416c1.919159,-2.562851 4.604919,-4.4375 7.766815,-5.133827c7.343643,-1.617882 14.472443,3.727837 15.919739,11.93708c1.447716,8.210205 -3.33445,16.179367 -10.678062,17.79776c-3.33017,0.733536 -6.615913,0.035309 -9.348213,-1.712875c6.716705,13.862793 20.935043,21.872543 35.498878,18.664444z";
        var HOURS = "m-232.212296,-132.127625c10.428223,32.97683 21.057175,12.596657 21.719528,7.068138c0.262222,5.593887 12.855179,27.977585 23.486694,-5.665977c16.703369,10.443764 17.27092,55.504639 -23.090805,55.235001c-40.362152,-0.270142 -40.085846,-49.601463 -22.115417,-56.637161zm-104.091843,-38.872314c-31.90863,0.049637 -57.740265,28.99794 -57.695862,64.65786c0.044434,35.659462 25.948242,64.527592 57.856842,64.477482c23.410248,-0.036751 48.940399,-15.636269 60.86203,-38.025196l0.017517,15.270691l14.33493,-0.358429c0,0 5.823288,-17.515213 7.519547,-23.596375c20.688644,36.741375 68.492203,28.990307 79.710495,12.826187c-0.147766,6.658165 1.28627,12.758915 1.28627,12.758915l11.310532,-2.714146l-0.644852,16.794559c0,0 40.486862,-29.916653 48.153763,-35.594532c19.8452,42.935646 45.782318,6.959785 45.782318,6.959785l7.938511,23.845978l12.100571,-26.506676l12.667274,15.256378c0,0 2.821533,-13.202751 3.868689,-20.952408c61.966787,41.794086 107.097898,-8.904602 142.129072,-13.49865c35.035538,-4.594513 76.229202,-4.581169 117.896805,-0.111198l-3.053406,24.723663c0,0 37.093872,-20.742393 46.788025,-20.90657c9.053558,-0.153679 163.220062,-4.184563 183.842468,-4.713371c1.516083,0.107391 3.454865,-0.629494 3.591522,-3.039627c0.004242,-1.944321 0.03418,-3.880547 0.038483,-5.792427c-0.166595,-2.035492 -0.931061,-3.237213 -2.997955,-3.484901c-20.673676,-0.479156 -173.913452,-4.035675 -184.419006,-3.857185c-11.269928,0.190903 -46.91185,-20.791557 -46.91185,-20.791557l2.985123,25.023384c0,0 -65.070221,-10.719131 -125.955315,-4.469017c-0.888321,-7.60025 -1.469055,-15.444885 -1.469055,-15.444885l-11.039383,8.50753c0,0 -6.713257,-10.964439 -11.133301,-17.97625c-20.946968,71.273087 -101.692249,79.701866 -136.154194,-3.214279c-2.235645,5.192032 -6.015072,14.06369 -6.015072,14.06369l-5.096016,-6.184235c0,0 -3.295151,3.974548 -7.076706,8.602493c-24.988632,-18.099869 -57.750107,-4.045212 -57.750107,-4.045212l-3.405304,-18.92836l-14.881134,17.12912l-5.83783,-12.558472l-13.650772,14.998169c0,0 -19.957947,-34.667709 -39.091232,-4.791626c-15.88942,-29.547729 -43.975891,9.01342 -43.975891,9.01342l-5.314697,-21.404335l-16.169556,-0.075409l0.018799,15.970352c-11.975433,-22.356018 -37.548279,-37.881073 -60.961517,-37.84433l0.000427,0zm226.962959,72.948715c-12.783424,8.420189 -38.274712,24.834396 -38.274712,24.834396c0,0 10.582809,-49.775192 40.115318,-51.702827c38.401566,-2.506523 38.689804,34.122688 27.528328,42.253677c-11.161911,8.130974 -26.514519,-3.65815 -29.368935,-15.385246z";
        var PATH_OFFSET = -60;
        var makeTransformationFunction = function (box) {
            var bx = (Math.abs(box.cx - x) + (box.width / 2) + PATH_OFFSET);
            var by = (Math.abs(box.cy - y));
            return function (r) {
                return 't' + bx + ',' + by + ' ' +
                    'S0.35,' + x + ',' + y + ' ' +
                    // initial drawing is horizontal, -90 to make it vertical
                    'R' + (r - 90) + ',' + x + ',' + y;
            };
        };
        this.hours = s.path(MINUTES);
        this.rotateH = makeTransformationFunction(this.hours.getBBox());
        this.minutes = s.path(HOURS);
        this.rotateM = makeTransformationFunction(this.minutes.getBBox());
        this.seconds = s.rect(x, y - (RADIUS - 50), 5, RADIUS, 2, 2);
        s.circle(x, y, 10).attr({
            fill: 'white'
        });
        s.text(x, y + (RADIUS / 2), "c'est la vie.").attr({
            fontFamily: 'Dawning of a New Day',
            fontSize: 40,
            fontWeight: 'bold',
            textAnchor: 'middle',
            'alignment-baseline': 'middle'
        });
    }
    HandsClock.prototype.angler = function () {
        return toAngles;
    };
    HandsClock.prototype.tick = function (h, m, s) {
        _super.prototype.tick.call(this, h, m, s);
        linear(this.rotateS(this.oldseconds), this.seconds);
        linear(this.rotateM(this.oldminutes), this.minutes);
        linear(this.rotateH(this.oldhours), this.hours);
    };
    return HandsClock;
})(ClockWork);
;
//# sourceMappingURL=main.js.map