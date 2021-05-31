var BRANDING_LOADED = false
var BRANDING_DEFAULT_PADDING = 250;


function adjustHeaderForDefaultBrandingDimensions(nr_pixeli)
{
    nr_pixeli = typeof(nr_pixeli) != "undefined" ? nr_pixeli : BRANDING_DEFAULT_PADDING;
    var htmlStyle = ' '+
        '#main_container { padding-top:'+nr_pixeli+'px; } '+
        '#main_container #header .top_banner { display: block; position: absolute; margin-left: -130px; top:0; } '+
        ' ';
    var head = document.getElementsByTagName("head");
    if (head.length == 0) {
        head = document.createElement("HEAD");
        document.appendChild(head);
    } else {
        head = head[0];
    }
    var css = document.createElement("STYLE");
        css.innerHTML=htmlStyle;
        head.appendChild(css);
}

function sitePushDown(nr_pixeli)
{
    adjustHeaderForDefaultBrandingDimensions(nr_pixeli);
    console.log('sitePushDown');
    BRANDING_LOADED = true;
}

function prepareBranding(pushSiteY, moveOriginX, moveOriginY)
{
    pushSiteY = typeof(pushSiteY) != "undefined" ? pushSiteY : 250;
    moveOriginX = typeof(moveOriginX) != "undefined" ? moveOriginX - 15 : -15;
    moveOriginY = typeof(moveOriginY) != "undefined" ? moveOriginY : 0;

    e1 = YAHOO.util.Dom.get('main_container');
    YAHOO.util.Dom.setStyle(e1, 'position', 'relative');
    YAHOO.util.Dom.setStyle(e1, 'padding-top', '0');
    YAHOO.util.Dom.setStyle(e1, 'margin-top', pushSiteY + 'px');

    e2 = YAHOO.util.Dom.get('top_banner');
    YAHOO.util.Dom.removeClass(e2, 'top_banner');
    YAHOO.util.Dom.setStyle(e2, 'position', 'absolute');
    YAHOO.util.Dom.setStyle(e2, 'top', moveOriginY + 'px');
    YAHOO.util.Dom.setStyle(e2, 'left', moveOriginX + 'px');
    e3 = YAHOO.util.Dom.get('first');
    YAHOO.util.Dom.insertBefore(e2, e3);
}

function loadBranding(name, load_forced)
{
    if (BRANDING_LOADED) {
        return; 
    }
    if (! name) {
        document.getElementById("header").style.paddingTop=BRANDING_DEFAULT_PADDING+"px";
        return true;
    }

    var head = document.getElementsByTagName("head");

    if (head.length == 0) {
        head = document.createElement("HEAD");
        document.appendChild(head);
    } else {
        head = head[0];
    }
   var _loadBrandingCallback = {

        success: function(o) {

           try {
                var json = YAHOO.lang.JSON.parse(o.responseText);
            } catch(e) {
                return;
            }
            
            if (json.css_file) {
                var css = document.createElement("LINK");
                css.rel="stylesheet";
                css.href = json.css_file;
                head.appendChild(css);
            
            }
            
            if (json.script_file) {
                var js = document.createElement("SCRIPT");
                js.type="text/javascript";
                js.charset="utf-8";
                js.src = json.script_file;
                head.appendChild(js);
                
            }
            var html  = json.html +"\n"+document.getElementById('outer_body').innerHTML;
            document.getElementById('outer_body').innerHTML = html;
            BRANDING_LOADED = true;
        },
 
        failure: function(o) 
        {



        }
    };

    var url = "/miscellaneous/branding.php?id="+name+'&referer='+encodeURIComponent(top.location) + '&force='+load_forced  ;
    var transaction = YAHOO.util.Connect.asyncRequest('GET', url, _loadBrandingCallback);
}
