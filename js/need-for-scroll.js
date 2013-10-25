/* 
 * Need For Scroll
 * Copyright @ Vladimir Shafikov
 */
;




(function(window, document, undefined) {
//------------------------------------------
// All variables defined here
//------------------------------------------




//------------------------------------------
// Helper functions
//------------------------------------------




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
        };

        return needForScroll;

    })();

    // Run this script only when content is loaded and addEventListener is suppported by the browser
    if (window.addEventListener) {
        window.addEventListener("DOMContentLoaded", window.NeedForScroll.init, false);
    }

})(window, document);