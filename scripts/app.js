var Gaffa = require('gaffa'),
    myApp = {},
    gaffa = new Gaffa(),
    views = gaffa.views.constructors = require('./views'),
    actions = gaffa.actions.constructors = require('./actions'),
    behaviours = gaffa.behaviours.constructors = require('./behaviours'),
    doc = require('doc-js');

myApp.gaffa = gaffa;

function getViewItemSettings(element){
    var settings = {};
    for(var i = 0; i < element.attributes.length; i++) {
        var attribute = element.attributes[i],
            propertyInfo = attribute.name.split('-');

        if(attribute.name === 'view-type'){
            continue;
        }

        if(propertyInfo.length === 1){
            settings[propertyInfo[0]] = attribute.value;
            continue;
        }

        var property = {};
        property[propertyInfo[1]] = attribute.value;
        settings[propertyInfo[0]] = property;
    }

    return settings;
}

function inflateView(element){
    var viewSettings = {};
    var viewItem = new views[element.getAttribute('view-type') || element.tagName.toLowerCase()](getViewItemSettings(element));

    if(viewItem.views){
        viewItem.views.content.add(inflateViewsFromDom(element));
    }

    return viewItem;
}

function inflateActionsFromDom(element){
    var actions = [];

    for(var i = 0; i < target.childNodes.length; i++) {
        var element = target.childNodes[i];

        if(element.nodeType === 3){
            continue;
        }

        if(element.nodeType === 1){

            var action = new actions[element.tagName.toLowerCase()](getViewItemSettings(element));

            actions.push(inflateView(element));
            continue;
        }
    }

    return viewItems;
}

function inflateViewsFromDom(target){
    var viewItems = [];

    for(var i = 0; i < target.childNodes.length; i++) {
        var element = target.childNodes[i];

        if(element.nodeType === 3){
            viewItems.push(new views.text({text:{value:element.textContent}}));
            continue;
        }

        if(element.nodeType === 1){
            if(element.tagName.toLowerCase() === 'actions'){

                continue;
            }
            viewItems.push(inflateView(element));
            continue;
        }
    }

    return viewItems;
}

function viewFromDom(){
    var root = doc.findOne('[g]'),
        viewItems = inflateViewsFromDom(root);

    while(root.childNodes.length) {
        root.removeChild(root.childNodes[0]);
    }

    gaffa.views.renderTarget = root;

    gaffa.views.add(viewItems);
}

window.onload = function(){
    viewFromDom();
};