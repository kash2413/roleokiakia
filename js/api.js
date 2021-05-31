
var Api = {
    head: false,
    pn: 0,
    terms: '',
    from: '',
    base_url: '',
    canvas_height: 570,
    canvas_width: 982,

    init: function ()        
    {        
        var i,el,
            results = YAHOO.util.Dom.getElementsByClassName('result', 'div','left');
        for (i in results) {
            el = results[i];
            if (typeof el != 'function') {
                if (! el.id) {
                    continue;
                }
                this.capture(el,i);
            }
        }
    },

    capture: function (el,i)
    {
        var l,
            article_key = el.id,
            source_id = el.getAttribute('source_id'),            
            fav_links = YAHOO.util.Dom.getElementsByClassName('fav', 'a',el),
            links = YAHOO.util.Dom.getElementsByClassName('capture', 'a',el),
            url = el.getAttribute('url'),
            pos = el.getAttribute('pos'),
            campaign_id = el.getAttribute('campaign_id');
            
        for (l in links) {
            links[l].onmousedown = function () { Api.change_link(this); Api.click(source_id, article_key, this.getAttribute('element'), url, pos, campaign_id); }
        }
        for (l in fav_links) {
            fav_links[l].onclick = function () { Api.fav(article_key, fav_links[l]); }
        }
    },

    change_link: function (el)
    {
        var new_link = el.getAttribute('view_link');
        if (new_link) {
            el.href = new_link;
        }
    },
    


    fav: function (article_key, ob, just_add)
    {
        var callback = {
            success: Api.fav_cb,
            failure: function (o) { /*console.log(o,'error');*/ },
            argument: [article_key, ob],
            cache:false
        };
        if (! just_add) {
            just_add = 0;
        }
        YAHOO.util.Connect.asyncRequest('POST', Api.base_url + '/favorites.php', callback, "ajax=1&article_key=" + article_key +"&just_add=" + just_add);
        return false;
    },
    fav_cb: function(o)
    {
        var article_key = o.argument[0];
        if (o.argument[1]) {
        var ob = o.argument[1];
        if (YAHOO.util.Dom.hasClass(ob,'fav_activ')) {
            YAHOO.util.Dom.removeClass(ob,'fav_activ');
        } else {
            YAHOO.util.Dom.addClass(ob,'fav_activ');
            var p = ob.parentNode;
            var msg = document.createElement("SPAN");
                msg.className = 'fav_msg';
                msg.innerHTML = '<a href="'+ Api.base_url +'/favorites.php">Reteta salvata in favorite</a>';
                p.appendChild(msg);
            //var t = setTimeout(function() { p.removeChild(msg); }, 5000);
            setTimeout( function() { fade(msg, 1000.0, true); }, 2000);
        }
        }
    },


    click: function (source_id, article_key, element, url, pos, campaign_id)
    {   
        var link = 'click.php?x'
                            + '&source_id=' + source_id
                            + '&article_key=' + article_key
                            + '&element=' + element
                            + '&from=' + this.from
                            + '&pos=' + pos
                            + '&pn=' + this.pn
                            + '&campaign_id=' + campaign_id
                            + '&terms=' + encodeURI(this.terms)
                            + '&url=' + encodeURI(url)
                            + '';
        this.send(link);
        this.ga_log(campaign_id, source_id, article_key, this.from, element, this.pn, pos, this.terms);
    },

    ga_log: function (campaign_id, source_id, article_key, from, element, pn, pos, terms)
    {
        try {
            var log_url = '/click' +
                        '/campaign_id=' + campaign_id +
                        '/source_id=' + source_id +
                        '/article_key=' + article_key +
                        '/from=' + from +
                        '/element=' + element +
                        '/pn=' + pn +
                        '/pos=' + pos +
                        '/terms=' + terms;
            var value = parseInt(campaign_id,10) > 0 ? 1 : 0;
            _gaq.push(['_trackEvent', 'Search', 'click', log_url, value]);
            //pageTracker._trackEvent("Anunturi", "click", log_url, value);
        } catch (err) {
        }
    },
        
        
    get_head: function ()
    {
        if (this.head) {
            return this.head;
        }
        var head = document.getElementsByTagName("head");
        if (head.length==0) {
            head = document.createElement("HEAD");
            document.appendChild(head);
        } else {
            head = head[0];
        }
        this.head = head;
        return head;
    },



    send: function (link)
    {
        link += '&ts='+ (new Date().getTime());        
        var js = document.createElement("SCRIPT");
            js.type="text/javascript";
            js.charset="utf-8";
            js.src = link;
        var head = this.get_head();
            head.appendChild(js);
        if (window.location.hash == '#debug') {
            try {
                console.log(js.src);
            } catch (e) {
                alert(js.src);
            }
        }
    }

}


/*
    Form default text
*/
// @fallbackClass - class to toggle with the placeholder if native browser support is not detected
Api.placeholder = function(input, placeholderText, fallbackClass)
{
    var disabled_color = '#AAAAAA';
    var example = 'test';
    placeholderText = placeholderText ? placeholderText : example;
    // check for native browser support, as per http://diveintohtml5.org/detect.html#input-placeholder
    if ('placeholder' in input) {
        input.setAttribute('placeholder', placeholderText);
    } else {
        // setPlaceholderClass() returns true if the input had been showing
        var setPlaceholderClass = function(on) {
            var wasShowing;
            if (fallbackClass) {
                wasShowing = YAHOO.util.Dom.hasClass(input, fallbackClass);
                if (on) {
                    YAHOO.util.Dom.addClass(input, fallbackClass);
                } else {
                    YAHOO.util.Dom.removeClass(input, fallbackClass);
                }
            } else {
                wasShowing = YAHOO.util.Dom.hasClass(input, '__placeholder');
                input.style.color = (on ? disabled_color : '');
                if (on) {
                    YAHOO.util.Dom.addClass(input, '__placeholder');
                } else {
                    YAHOO.util.Dom.removeClass(input, '__placeholder');
                }
            }
            return wasShowing;
        }
        
        var onBlur = function() {
            setPlaceholderClass(! input.value);
            if (! input.value) {
                input.value = placeholderText;
            }
        };
        
        var onFocus = function() {
            var wasShowing = setPlaceholderClass(false);
            if (wasShowing) {
                input.value = '';
            }
        };
        
        YAHOO.util.Event.addListener(input, 'focus', onFocus);
        YAHOO.util.Event.addListener(input, 'blur', onBlur);
        onBlur();
    }
};


function fade(element, TimeToFade, doRemove)
{
    if (element == null)
        return;
        
    if (element.FadeState == null) {
        if(element.style.opacity == null 
            || element.style.opacity == '' 
            || element.style.opacity == '1') {
            
            element.FadeState = 2;
        } else {
            element.FadeState = -2;
        }
    }
    
    if (element.FadeState == 1 || element.FadeState == -1) {
        element.FadeState = element.FadeState == 1 ? -1 : 1;
        element.FadeTimeLeft = TimeToFade - element.FadeTimeLeft;
    } else {
        element.FadeState = element.FadeState == 2 ? -1 : 1;
        element.FadeTimeLeft = TimeToFade;
        var curTick = new Date().getTime();
        setTimeout(function () { animateFade(curTick, element, TimeToFade, doRemove); }, 33);
    }  
}

function animateFade(lastTick, element, TimeToFade, doRemove)
{
    var curTick = new Date().getTime();
    var elapsedTicks = curTick - lastTick;    
    
    if(element.FadeTimeLeft <= elapsedTicks) {
        element.style.opacity = element.FadeState == 1 ? '1' : '0';
        element.style.filter = 'alpha(opacity = ' + (element.FadeState == 1 ? '100' : '0') + ')';
        element.FadeState = element.FadeState == 1 ? 2 : -2;
        if (element.FadeState == -2 && doRemove) {
            element.parentNode.removeChild(element);            
        }
        return;
    }
    
    element.FadeTimeLeft -= elapsedTicks;
    var newOpVal = element.FadeTimeLeft/TimeToFade;
    if(element.FadeState == 1)
        newOpVal = 1 - newOpVal;
        
    element.style.opacity = newOpVal;
    element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';
    
    setTimeout(function () { animateFade(curTick, element, TimeToFade, doRemove); }, 33);
}

var oldfp = 0;

statusbar = function (id, target)
{
    this.articles = {};
    this.placeholder = null; // tinem placeholderul care arata unde va intra reteta favorita
    this.to = null; // salvam timeout ptr a clapsa statusbar
    this.id = id;
    this.dom = YAHOO.util.Dom.get(id);
    this.target = YAHOO.util.Dom.get(target);
    this.dragEffectNode = null;
    this.currentlyDragged = null;
    this.ieversion = 0;
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
        this.ieversion=new Number(RegExp.$1) // capture x.x portion and store as a number
    }

    YAHOO.util.Event.addListener(this.dom, 'mouseout',   function() { this.collapse(); },          this, true );
    YAHOO.util.Event.addListener(this.dom, 'mouseover',  function() { if (this.to) clearTimeout(this.to); },     this, true );
    YAHOO.util.Event.addListener(this.target, 'dragenter',  this.handleDragEnter,   this );
    YAHOO.util.Event.addListener(this.target, 'dragover',   this.handleDragOver,    this );
    YAHOO.util.Event.addListener(this.target, 'dragleave',  this.handleDragLeave,   this );
    YAHOO.util.Event.addListener(this.target, 'drop',       this.handleDrop,        this );    
    YAHOO.util.Event.addListener(document.body, 'drag',     this.handleDrag,        this );
}

statusbar.prototype.drag = function (cls)
{
    YAHOO.util.Dom.getElementsByClassName(cls, 'a', 'container', 
        function (el,ob) 
        {
            YAHOO.util.Dom.generateId(el);
            YAHOO.util.Event.addListener(el, 'dragstart', ob.handleDragStart, ob);
            YAHOO.util.Event.addListener(el, 'dragend', ob.handleDragEnd, ob);
        }, this);
    YAHOO.util.Dom.getElementsByClassName(cls, 'img', 'container', 
        function (el,ob) 
        {
            YAHOO.util.Dom.generateId(el);
            YAHOO.util.Event.addListener(el, 'dragstart', ob.handleDragStart, ob);
            YAHOO.util.Event.addListener(el, 'dragend', ob.handleDragEnd, ob);
        }, this);
}

statusbar.prototype.scan = function (container,tag,cls)
{
    YAHOO.util.Dom.getElementsByClassName(cls, tag, container, 
        function (el,ob) 
        {
            YAHOO.util.Dom.generateId(el);
            ob.articles[el.getAttribute('article_key')] = el.id;
        }, this);
}

statusbar.prototype.togle = function(close)
{
    var is_closed = YAHOO.util.Dom.hasClass(this.dom, 'closed');

    if (YAHOO.util.Dom.hasClass(this.dom, 'extended') && ! is_closed) {
        this.collapse(true);
    } else if (is_closed) {
        YAHOO.util.Dom.removeClass(this.dom, 'closed');
        YAHOO.util.Dom.addClass('statusbar_show', 'closed')
    } else if (close) {
        YAHOO.util.Dom.removeClass('statusbar_show', 'closed');
        YAHOO.util.Dom.addClass(this.dom, 'closed')
    } else {
        this.extend();
    }
}

statusbar.prototype.extend = function ()
{
    if (this.to) {
        clearTimeout(this.to);
    }
    YAHOO.util.Dom.addClass(this.dom,'extended');
}
statusbar.prototype.collapse = function (now)
{
    if (now) {
        YAHOO.util.Dom.removeClass(this.dom,'extended');
    } else {
        var o = this;
        if (this.to) {
            clearTimeout(this.to);
        }
        this.to = setTimeout(function() { o.collapse(true); }, 1000);
    }
}

statusbar.prototype.cancelEvent = function (e, ob) // scope is on dom object
{
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'copy';
    return false;
}

statusbar.prototype.handleDragStart = function (e, ob) // scope is on dom object
{
    //e.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable
    // store the ID of the element, and collect it on the drop later on
    ob.droped = false;
    e.dataTransfer.setData('Text', this.id);
    if (! doesShowVisualCues(e)) {
        //ob.dragEffectNode = this.cloneNode(true);
        ob.dragEffectNode = document.createElement('img');
        ob.dragEffectNode.setAttribute('width', 100);
        ob.dragEffectNode.setAttribute('height', 100);
        ob.dragEffectNode.src = this.getAttribute('small');
        document.body.appendChild(ob.dragEffectNode);
        ob.dragEffectNode.style.position = 'absolute';
        ob.dragEffectNode.style.visibility = 'hidden';
        ob.dragEffectNode.style.opacity = 0.5;
        ob.dragEffectNode.style.filter = 'alpha(opacity=50)';
        //ob.dragEffectNode.style.zIndex = 1000;
        ob.currentlyDragged = this;
    } else {
    //if (e.dataTransfer.setDragImage) {
        var dragIcon = document.createElement('img');
        dragIcon.src = this.getAttribute('small');
        e.dataTransfer.setDragImage(dragIcon, 50, 50);
    }
    
    ob.extend();
}

statusbar.prototype.handleDrag = function (e, ob)
{
    if (! doesShowVisualCues(e)) {
        ob.dragEffectNode.style.visibility = 'visible';
        var xy = [];
        if (oldfp && ob.currentlyDragged.nodeName == 'A') {
            xy[0] = e.offsetX + YAHOO.util.Dom.getDocumentScrollLeft() - 50;
            xy[1] = e.offsetY + YAHOO.util.Dom.getDocumentScrollTop() - 50;
        } else {
            xy = YAHOO.util.Dom.getXY(ob.currentlyDragged);
            xy[0] += e.offsetX - 50;
            xy[1] += e.offsetY - 50;        
        }
        
        YAHOO.util.Dom.setXY(ob.dragEffectNode, xy);
    }
}
statusbar.prototype.handleDragEnd = function (e, ob) // scope is on dom object
{
    if (!doesShowVisualCues(e)) {
        document.body.removeChild(ob.dragEffectNode);
    }
    ob.remove_placeholder();
    if (ob.droped) {
        return false;
    }
    ob.collapse(true);
}


statusbar.prototype.handleDragOver = function (e, ob)
{
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    //e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.    
    YAHOO.util.Dom.addClass(this,'over');
    return false;
}

statusbar.prototype.handleDragEnter = function (e, ob)
{
    if (e.preventDefault) {
        e.preventDefault();
    }
    // this / e.target is the current hover target.
    YAHOO.util.Dom.addClass(this,'over');
    //if (YAHOO.util.Dom.hasClass(e.target, 'item')) {
    if (e.target && e.target.className == 'item') {
        ob.add_placeholder(e.target); // adauga in fata lui
    } else {
        ob.add_placeholder();
    }
    return false;
}

statusbar.prototype.handleDragLeave = function (e, ob)
{
    // this / e.target is previous target element.
    YAHOO.util.Dom.removeClass(this,'over');
}


statusbar.prototype.handleDrop = function (e, ob)
{
    // this / e.target is previous target element.
    if (e.preventDefault) {
        e.preventDefault();
    }
    ob.droped = true;
    YAHOO.util.Dom.removeClass(this,'over');
    var el = document.getElementById(e.dataTransfer.getData('Text')); // elementul tras
    if (! el) {
        return false;
    }
    ob.fav_add(el.getAttribute('article_key'), el.getAttribute('title'), el.getAttribute('url'), el.getAttribute('small'), 50, 50);
    ob.remove_placeholder();
    return false;
}
statusbar.prototype.add_placeholder = function (el)
{
    if (! el && this.placeholder) {
        return false;
    }

    if (! this.placeholder) {
        var li = document.createElement('LI');
            li.className = 'placeholder';
        this.placeholder = li;
    }

    var pparent = document.getElementById('fav_list');
    if (el) {
        if (YAHOO.util.Dom.getX(this.placeholder) < YAHOO.util.Dom.getX(el)) {
            // daca placeholder e in stanga el atunci facem insertBefore(next)
            var next = YAHOO.util.Dom.getNextSibling(el);
            pparent.insertBefore(this.placeholder,next);
        } else {
            // daca placeholder e in dreapta el atunci facem inserBefore(el)
            pparent.insertBefore(this.placeholder,el);
        }
    } else {
        pparent.appendChild(this.placeholder);
    }
    YAHOO.util.Dom.addClass(pparent, 'has_placeholder');
}
statusbar.prototype.remove_placeholder = function ()
{
    if (! this.placeholder) {
        return false;
    }
    var pparent = this.placeholder.parentNode;
        pparent.removeChild(this.placeholder);
        YAHOO.util.Dom.removeClass(pparent, 'has_placeholder');
    this.placeholder = null;
}

statusbar.prototype.fav_add = function (article_key, title, url, img, width, height)
{
    //if (! this.articles[article_key]) {
    var li = document.createElement('LI');
        li.className = 'item';
        li.innerHTML = '<a href="#" onclick="mystatusbar.fav_del(\''+article_key+'\',this.parentNode);return false;" class="remove">sterge</a>'+
            '<a href="'+url+'"><img src="'+img+'" width="'+width+'" height="'+height+'"/>'+title+'</a>';
    var pparent = document.getElementById('fav_list');
    if (this.placeholder) {
        pparent.insertBefore(li,this.placeholder);
    } else {
        pparent.insertBefore(li,pparent.firstChild);
    }
    YAHOO.util.Dom.addClass(pparent, 'has_recipe');
        li.style.opacity='0';
    YAHOO.util.Dom.generateId(li);
    this.articles[article_key] = li.id
        fade(li, 1300);
    Api.fav(article_key, YAHOO.util.Dom.get('f'+article_key), 1);    
    
    // remove 'capture_to_remove'
    YAHOO.util.Dom.getElementsByClassName('capture_to_remove', 'li', 'statusbar', 
        function (el,ob) 
        {
            el.parentNode.removeChild(el);
        }, this);


    //} else {
        // marcam visual ca exista deja
    //}
}
statusbar.prototype.fav_del = function (article_key, li)
{
    fade(li, 700, true);
    delete this.articles[article_key];
    Api.fav(article_key, YAHOO.util.Dom.get('f'+article_key));    
}




/*
* figures out if a visual cue needs to be inserted.   
*/
var cachedShowVisualCues = null;
function doesShowVisualCues(e)
{
    if (cachedShowVisualCues == null) {
        if (e.dataTransfer.setDragImage) {
            var chromeString = navigator.userAgent.match(/Chrome\/[0-9]\.[0-9]/);        
            if (chromeString) {        
                var info = chromeString[0].split('/');            
                if (parseFloat(info[1]) < 5) {
                    cachedShowVisualCues =  false;
                } else {
                    cachedShowVisualCues = true;
                }
            } else {
                cachedShowVisualCues = true;
            }   
        } else {
            cachedShowVisualCues = false;
        }
    }
    return cachedShowVisualCues;
}
