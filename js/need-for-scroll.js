/* 
 * Need For Scroll
 * Copyright @ Vladimir Shafikov
 */
;




(function(window, document, undefined) {
//------------------------------------------
// All variables defined here
//------------------------------------------

    // Flags
    var timeout,
        
        HDragging=false,
        VDragging=false,
        
        activeScroll=0,
        activeWrap=0,
        
        eventX,
        eventY,
        
        mouseX,
        mouseY,
        
        currentRatio,
        initPos,
        scrollValue,
        hideTimeoutSet=false,
        
        vEventFired = false,
        hEventFired = false;

    // Initialization
    var elements = [document.getElementById("box3-new"),
                    document.getElementById("box5-new"),
                    document.getElementById("box2")
                   ]; // elements for use
    var id = 0,
        
        vScrollWidth=0,
        hScrollWidth=0,
        
        addHScroll=false,
        addVScroll=false,
        
        paddingTop=0,
        paddingLeft=0,
        paddingBottom=0,
        paddingRight=0,
        
        borderTop=0,
        borderRight=0,
        borderBottom=0,
        borderLeft=0,
        
        scrollHeight=0,
        scrollWidth=0,
        
        offsetWidth=0,
        offsetHeight=0,
        
        clientWidth=0,
        clientHeight=0,
        
        vRatio=0,
        hRatio=0,
        
        vSliderHeight=0,
        hSliderHeight=0,
        
        vLbHeight=0,
        hLbHeight=0,

        v_scrollbar_node = '<div class="lb-v-scrollbar"><div class="lb-v-scrollbar-slider"></div></div>',
        h_scrollbar_node = '<div class="lb-h-scrollbar"><div class="lb-h-scrollbar-slider"></div></div>';





//------------------------------------------
// Helper functions
//------------------------------------------

    /*
     * Checks if element has particular class
     * elem - element to check
     * cn - class name to check
     */
    function hasClass(elem, cn) {
        return (' ' + elem.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    }   

    /*
     * Gets element's css property
     * elem - element with property
     * property - property name
     */
    function getCssProperty(elem, property) {
        if (!!elem) {
            return window.getComputedStyle(elem, null).getPropertyValue(property);
        }
    }

    /*
     * Gets current padding from each side, removes "px" and parse in to int
     */
    function getPadding(elem) {
        paddingTop    = parseInt(getCssProperty(elem, "padding-top").replace("px", ""));
        paddingRight  = parseInt(getCssProperty(elem, "padding-right").replace("px", ""));
        paddingBottom = parseInt(getCssProperty(elem, "padding-bottom").replace("px", ""));
        paddingLeft   = parseInt(getCssProperty(elem, "padding-left").replace("px", ""));
    }

    /*
     * Gets current border from each side, removes "px" and parse in to int
     */
    function getBorders(elem) {
        borderTop    = parseInt(getCssProperty(elem, "border-top-width").replace("px", ""));
        borderRight  = parseInt(getCssProperty(elem, "border-right-width").replace("px", ""));
        borderBottom = parseInt(getCssProperty(elem, "border-bottom-width").replace("px", ""));
        borderLeft   = parseInt(getCssProperty(elem, "border-left-width").replace("px", ""));
    }

    /*
     * Sets vertical scrollbar width
     */
    function setVScrollbarWidth(elem) {
        elem.style.overflow = "auto";
        vScrollWidth = offsetWidth - clientWidth - borderLeft - borderRight;
        elem.style.overflow = "hidden";
    }

    /*
     * Sets horizontal scrollbar width
     */
    function setHScrollbarWidth(elem) {
        elem.style.overflow = "auto";
        hScrollWidth = offsetHeight - clientHeight - borderTop - borderBottom;
        elem.style.overflow = "hidden";
    }

    /*
     * Wrap the element
     */
    function wrap(elem, vscroll, hscroll) {
        var elemId = elem.id;
        var wrap = 0;

        if (elemId !== undefined) {
            elem.innerHTML = '<div class="lb-wrap" id="lb-wrap-' + id + '-' + elemId + '">'+elem.innerHTML+'</div>';
            wrap = document.getElementById("lb-wrap-" + id + "-" + elemId);
        } else {
            elem.innerHTML = '<div class="lb-wrap" id="lb-wrap-' + id + '">'+elem.innerHTML+'</div>';
            wrap = document.getElementById("lb-wrap-" + id);
        }

        wrap.innerHTML = '<div class="lb-content">'+wrap.innerHTML+'</div>';

        if (vscroll) {
            elem.innerHTML = v_scrollbar_node + elem.innerHTML;
        }
        if (hscroll) {
            elem.innerHTML = h_scrollbar_node + elem.innerHTML;
        }

        // Preparation for the next element
        id = id + 1;
    }

    /*
     * Gets current border from each side, removes "px" and parse in to int
     */
    function getDimentions(elem, scroll, update) {
        var el = elem;

        if (update) {
            el = el.getElementsByClassName("lb-wrap")[0];
        }

        scrollHeight = (typeof(scroll) != "undefined" && scroll != false) ? scroll.height : el.scrollHeight;
        scrollWidth  = (typeof(scroll) != 'undefined' && scroll != false) ? scroll.width : el.scrollWidth;

        clientHeight = el.clientHeight;
        clientWidth  = el.clientWidth;

        offsetHeight = el.offsetHeight;
        offsetWidth  = el.offsetWidth;

        setVScrollbarWidth(elem);
        setHScrollbarWidth(elem);
    }

    /*
     * Hides default scrollbars
     */
    function hideScrollbars(elem, vscroll, hscroll) {
        
        if (vscroll || hscroll) {
            elem.style.overflow = "hidden";

            movePadding(elem, elem.getElementsByClassName("lb-wrap")[0]);

            resizeMainBox(elem);

            resizeInnerWrap(elem, elem.getElementsByClassName("lb-wrap")[0]);
        }
    }

    function movePadding(from, to) {
        from.style.padding = 0;
        to.style.paddingTop    = paddingTop + "px";
        to.style.paddingRight  = paddingRight + "px";
        to.style.paddingBottom = paddingBottom + "px";
        to.style.paddingLeft   = paddingLeft + "px";
    }

    function resizeMainBox(elem) {
        var el = elem;

        el.style.width  = parseInt(getCssProperty(el, "width").replace("px", ""))  + paddingLeft + paddingRight + "px";
        el.style.height = parseInt(getCssProperty(el, "height").replace("px", "")) + paddingTop  + paddingBottom + "px";
    }

    function resizeInnerWrap(main, child) {
        main.style.position = "relative";
        
        child.style.width   = parseInt(getCssProperty(main, "width").replace("px", ""))  + vScrollWidth - paddingLeft - paddingRight + "px";
        child.style.height  = parseInt(getCssProperty(main, "height").replace("px", "")) + hScrollWidth - paddingTop  - paddingBottom + "px";
    }

    /*
     * Reduce scrollbars width and height
     */
    function reduceScrollbarsWidthHeight(elem) {
        var elem_v = elem.getElementsByClassName("lb-v-scrollbar")[0],
            elem_h = elem.getElementsByClassName("lb-h-scrollbar")[0];

        if (addVScroll && addHScroll) {
            vLbHeight = parseInt(getCssProperty(elem, "height").replace("px", ""))-12;
            hLbHeight = parseInt(getCssProperty(elem, "width").replace("px", ""))-12;

            elem_v.style.height = vLbHeight + "px";
            elem_h.style.width  = hLbHeight + "px";
        } else {
            vLbHeight = parseInt(getCssProperty(elem, "height").replace("px", ""))-4;
            hLbHeight = parseInt(getCssProperty(elem, "width").replace("px", ""))-4;

            if (!!elem_v) { elem_v.style.height = vLbHeight + "px"; }
            if (!!elem_h) { elem_h.style.width  = hLbHeight + "px"; }
        }
    }

    /*
     * Sets sliders height
     */
    function setSlidersHeight(elem) {
        var hmin, hmax, gap,
            elem_v_scrollbar = elem.getElementsByClassName("lb-v-scrollbar")[0],
            elem_h_scrollbar = elem.getElementsByClassName("lb-h-scrollbar")[0],
            elem_v_slider    = elem.getElementsByClassName("lb-v-scrollbar-slider")[0],
            elem_h_slider    = elem.getElementsByClassName("lb-h-scrollbar-slider")[0];

        if (elem.getElementsByClassName("lb-v-scrollbar").length != 0) {
            hmin = 20;
            gap  = offsetHeight - parseInt(getCssProperty(elem_v_scrollbar, "height").replace("px", ""));
            hmax = offsetHeight - gap - hmin;

            vSliderHeight = Math.round((offsetHeight*hmax)/scrollHeight);
            vSliderHeight = (vSliderHeight < hmin) ? hmin : vSliderHeight;
        }

        if (elem.getElementsByClassName("lb-h-scrollbar").length != 0) {
            hmin = 20;
            gap  = offsetWidth - parseInt(getCssProperty(elem_h_scrollbar, "width").replace("px", ""));
            hmax = offsetWidth - gap - hmin;

            hSliderHeight = Math.round((offsetWidth*hmax)/scrollWidth);
            hSliderHeight = (hSliderHeight < hmin) ? hmin : hSliderHeight;
        }

        if (!!elem_v_slider) { elem_v_slider.style.height = vSliderHeight + "px"; }
        if (!!elem_h_slider) { elem_h_slider.style.width  = hSliderHeight + "px"; }
    }

    /*
     * Set scroll ratios
     */
    function setScrollRatios(elem) {
        vRatio = (offsetHeight - elem.getElementsByClassName("lb-wrap")[0].scrollHeight - borderTop - borderBottom)/(vLbHeight - vSliderHeight);
        hRatio = (offsetWidth  - elem.getElementsByClassName("lb-wrap")[0].scrollWidth - borderLeft - borderRight)/(hLbHeight  - hSliderHeight);

        elem.setAttribute("vratio", vRatio);
        elem.setAttribute("hratio", hRatio);
    }

    /*
     * Remove scrollbars that appear when user overselects the content
     */
    function hideScrollbarsAfterSelect() {
        var par_elem,               // parent element
            par_dist_el_left,       // distance of parent element from left border of the window
            par_border_par_left,    // left border of parent element
            par_dist_el_top,        // distance of parent element from top border of the window
            par_border_par_top,     // top border of parent element

            elements = document.getElementsByClassName("lb-wrap"), // all main elements
            element,                // current element
            dist_el_left,           // distance from left of main element - width of border of parent element
            dist_el_top,            // distance from top of main element - width of border of parent element
            dist_diff_hor,          // horizontal difference of offsets of main element and parent element
            dist_diff_ver;          // horizontal difference of offsets of main element and parent element

        for (var i = 0; i < elements.length; i++) {
            element                = elements[i];
            par_elem               = element.parentNode;
            par_dist_el_left       = par_elem.getBoundingClientRect().left;
            par_border_par_left    = parseInt(getCssProperty(par_elem, "border-left").replace("px", ""));
            par_dist_el_top        = par_elem.getBoundingClientRect().top;
            par_border_par_top     = parseInt(getCssProperty(par_elem, "border-top").replace("px", ""));
            
            dist_el_left           = element.getBoundingClientRect().left - par_border_par_left;
            dist_el_top            = element.getBoundingClientRect().top  - par_border_par_top;
            dist_diff_hor          = par_dist_el_left - dist_el_left;
            dist_diff_ver          = par_dist_el_top  - dist_el_top;

            if (dist_diff_hor > 0 || dist_diff_ver > 0) { // If inner div is moved place it in right position and hide scrollbars
                element.style.position = "fixed"; // force element to repositioning
                
                setTimeout(function (element) {
                    return function() {
                        element.style.position = "";  // set default position type
                    }
                }(element), 0);
            }
        }
    }

    /*
     * Resets all values preparing for next element
     */
    function resetVars() {
        vScrollWidth = 0;
        hScrollWidth = 0;
        addHScroll=false;
        addVScroll=false;
        paddingTop = 0;
        paddingLeft = 0;
        paddingBottom = 0;
        paddingRight = 0;
        borderTop = 0;
        borderLeft = 0;
        borderBottom = 0;
        borderRight = 0;
        scrollHeight = 0;
        scrollWidth = 0;
        offsetWidth = 0;
        offsetHeight = 0;
        clientWidth = 0;
        clientHeight = 0;
        // vRatio = 0;
        // hRatio = 0;
        vSliderHeight = 0;
        hSliderHeight = 0;
        vLbHeight = 0;
        hLbHeight = 0;
    }





//------------------------------------------
// Core functions
//------------------------------------------

    /*
     * Check if scrollbar are needed
     */
    function needScrollbars(elem) {

        addVScroll = false;
        addHScroll = false;

        // If there is slider already, then don't add another one
        if (elem.getElementsByClassName("lb-v-scrollbar-slider").length) { return false; }

        getPadding(elem);
        getBorders(elem);

        var overflowY = getCssProperty(elem, "overflow-y");
        var overflowX = getCssProperty(elem, "overflow-x");

        elem.style.overflow = "hidden";

        // Check for vertical scrollbars
        if (overflowY != 'hidden' && elem.scrollHeight > elem.clientHeight) {
            addVScroll = true;
        }

        // Check for horizontal scrollbars
        if (overflowX != 'hidden' && elem.scrollWidth  > elem.clientWidth) {
            addHScroll = true;
        }

        elem.style.overflow = "auto";

        // Positive if scrollbar is needed
        if (addVScroll || addHScroll) { return true; }
    }

    /*
     * Main loop...
     */
    function mainLoop() {
        for (var i=0; elements[i] !== undefined; i++) {
            if (needScrollbars(elements[i]) && !hasClass(elements[i], "no-needforscroll")) {
                // Get element from array
                target = elements[i];

                // Get some values before the element is wrapped
                getDimentions(target);

                // Wrap the element with scrollbars
                wrap(target, addVScroll, addHScroll);

                // Hide default scrollbar
                hideScrollbars(target, addVScroll, addHScroll);

                // Calculate the size of the scrollbars
                reduceScrollbarsWidthHeight(target);
                setSlidersHeight(target);

                // Set variables needed to calculate scroll speed, etc.
                setScrollRatios(target);

                // Set events
                setEvents(target);

                // Prepare for next element
                resetVars();
            } // end if
        } // end loop
    }

    // Set default events
    window.addEventListener("mousemove", function(e) {


        if (HDragging || VDragging) {

            if(VDragging) {
                mouseY = e.pageY;
                activeWrap.scrollTop = (initPos + mouseY - eventY) * Math.abs(currentRatio);
            }
            if(HDragging) {
                mouseX = e.pageX;
                activeWrap.scrollLeft = (initPos + mouseX - eventX) * Math.abs(currentRatio);
            }
        }
    }, false);
    // Set default events
    window.addEventListener("mouseup", function(e) {
        hideScrollbarsAfterSelect();
        
        if (HDragging || VDragging) {
            if (VDragging) {
                VDragging = false;
            }
            if (HDragging) {
                HDragging = false;
            }
        }
    }, false);

    // Core
    function setEvents(elem) {
        if (addVScroll || addHScroll) {
            var elem_v_slider = elem.getElementsByClassName("lb-v-scrollbar-slider")[0],
                elem_h_slider = elem.getElementsByClassName("lb-h-scrollbar-slider")[0],
                elem_lb_wrap  = elem.getElementsByClassName("lb-wrap")[0];


            elem_lb_wrap.addEventListener("scroll", function(e) {
                if (!!elem_v_slider) { elem_v_slider.style.top  = -this.scrollTop /elem.getAttribute("vratio")+"px"; }
                if (!!elem_h_slider) { elem_h_slider.style.left = -this.scrollLeft/elem.getAttribute("hratio")+"px"; }

                // TODO: Finish load on scroll
                // var v_scrollbar_height     = parseInt(getCssProperty(elem.getElementsByClassName("lb-v-scrollbar")[0], "height").replace("px", "")),
                //     v_scrollbar_slider_top = parseInt(getCssProperty(elem_v_slider, "top").replace("px", "")) +
                //                              parseInt(getCssProperty(elem_v_slider, "height").replace("px", ""));
            }, false);

            if (addVScroll) {
                elem_v_slider.onmousedown = function(e){
                    eventY       = e.pageY;
                    VDragging    = true;
                    activeScroll = this;

                    activeWrap   = elem_lb_wrap;
                    currentRatio = activeWrap.parentNode.getAttribute("vratio");
                    initPos      = parseInt(getCssProperty(activeScroll, "top").replace("px", ""));
                    return false;
                }

                elem.getElementsByClassName("lb-v-scrollbar")[0].onmousedown = function(e){
                    if (!hasClass(e.target, "lb-v-scrollbar-slider")) {
                        var this_offset_top = this.getBoundingClientRect().top + window.pageYOffset;
                        elem_lb_wrap.scrollTop = (e.pageY - this_offset_top) * Math.abs(elem.getAttribute("vratio")) - parseInt(getCssProperty(this.getElementsByClassName("lb-v-scrollbar-slider")[0], "height").replace("px", ""))/2;
                    }
                    return false;
                }
            }

            if (addHScroll) {
                elem_h_slider.onmousedown = function(e){
                    eventX       = e.pageX;
                    HDragging    = true;
                    activeScroll = this;

                    activeWrap   = elem_lb_wrap;
                    currentRatio = activeWrap.parentNode.getAttribute("hratio");
                    initPos      = parseInt(getCssProperty(activeScroll, "left").replace("px", ""));
                    return false;
                }

                elem.getElementsByClassName("lb-h-scrollbar")[0].onmousedown = function(e){
                    if (!hasClass(e.target, "lb-h-scrollbar-slider")) {
                        var this_offset_left = this.getBoundingClientRect().left + window.pageXOffset;
                        elem_lb_wrap.scrollLeft = (e.pageX - this_offset_left) * Math.abs(elem.getAttribute("hratio")) - parseInt(getCssProperty(this.getElementsByClassName("lb-h-scrollbar-slider")[0], "width").replace("px", ""))/2;
                    }
                    return false;
                }
            }
        } // end both scrollbars
    }


    /*
     * Initial run of Need For Scroll
     */
    window.NeedForScroll = (function()
    {

        var _init = false, needForScroll = { };

        needForScroll.init = function()
        {
            // Exit function if it's already running
            if (_init) { return; }

            // Indicate that function is running
            _init = true;

            // console.log("Hello world!");
            mainLoop();
        };

        return needForScroll;

    })();

    // Run this script only when content is loaded and addEventListener is suppported by the browser
    if (window.addEventListener) {
        window.addEventListener("DOMContentLoaded", window.NeedForScroll.init, false);
    }

})(window, document);