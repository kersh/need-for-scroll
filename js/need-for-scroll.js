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
    var elements = document.getElementById("box3-new"), // elements for use
        id = 0,
        
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
        return window.getComputedStyle(elem, null).getPropertyValue(property);
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
        console.log("paddingTop:", paddingTop);
        to.style.paddingTop    = paddingTop + "px";
        to.style.paddingRight  = paddingRight + "px";
        to.style.paddingBottom = paddingBottom + "px";
        to.style.paddingLeft   = paddingLeft + "px";
    }

    function resizeMainBox(elem) {
        elem.style.width  = parseInt(getCssProperty(elem, "width").replace("px", ""))  + paddingLeft + paddingRight;
        elem.style.height = parseInt(getCssProperty(elem, "height").replace("px", "")) + paddingTop  + paddingBottom;
    }

    function resizeInnerWrap(main, child) {
        main.style.position = "relative";
        
        console.log("main.width:", getCssProperty(main, "width"));
        console.log("main.:", main);
        console.log("myWidth:", parseInt(getCssProperty(main, "width").replace("px", ""))  + vScrollWidth - paddingLeft - paddingRight);
        
        child.style.width   = parseInt(getCssProperty(main, "width").replace("px", ""))  + vScrollWidth - paddingLeft - paddingRight;
        child.style.height  = parseInt(getCssProperty(main, "height").replace("px", "")) + hScrollWidth - paddingTop  - paddingBottom;
    }

    /*
     * Reduce scrollbars width and height
     */
    function reduceScrollbarsWidthHeight(elem) {
        if (addVScroll && addHScroll) {
            vLbHeight = parseInt(getCssProperty(elem, "height").replace("px", ""))-12;
            hLbHeight = parseInt(getCssProperty(elem, "width").replace("px", ""))-12;

            elem.getElementsByClassName("lb-v-scrollbar")[0].style.height = vLbHeight;
            elem.getElementsByClassName("lb-h-scrollbar")[0].style.width  = hLbHeight;
        } else {
            vLbHeight = parseInt(getCssProperty(elem, "height").replace("px", ""))-4;
            hLbHeight = parseInt(getCssProperty(elem, "width").replace("px", ""))-4;

            elem.getElementsByClassName("lb-v-scrollbar")[0].style.height = vLbHeight;
            elem.getElementsByClassName("lb-h-scrollbar")[0].style.width  = hLbHeight;
        }
    }

    /*
     * Sets sliders height
     */
    function setSlidersHeight(elem) {
        var hmin, hmax, gap,
            elem_v_scrollbar = elem.getElementsByClassName("lb-v-scrollbar")[0],
            elem_h_scrollbar = elem.getElementsByClassName("lb-h-scrollbar")[0];

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

        elem.getElementsByClassName("lb-v-scrollbar-slider")[0].style.height = vSliderHeight;
        elem.getElementsByClassName("lb-h-scrollbar-slider")[0].style.width  = hSliderHeight;
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





//------------------------------------------
// Core functions
//------------------------------------------

    /*
     *
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

        if (needScrollbars(elements) && !hasClass(elements, "no-needforscroll")) {
            // console.log("inside if");

            // Get element from array
            target = elements;

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
        }
    }

    function setEvents(elem) {
        if (addVScroll || addHScroll) {

        }
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