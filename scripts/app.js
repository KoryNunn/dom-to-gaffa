var Gaffa = require('gaffa'),
    myApp = {},
    gaffa = window.gaffa = new Gaffa(),
    views = gaffa.views.constructors = require('./views'),
    actions = gaffa.actions.constructors = require('./actions'),
    behaviours = gaffa.behaviours.constructors = require('./behaviours'),
    doc = require('doc-js');

myApp.gaffa = gaffa;

function removeElement(element){
    element.parentNode && element.parentNode.removeChild(element);
}

function camelize(string, seperator){
    var parts = string.split(seperator);

    for(var i = 1; i < parts.length; i++) {
        parts[i] = parts[i].slice(0,1).toUpperCase() + parts[i].slice(1);
    }

    return parts.join('');
}

function elementTag(element){
    return camelize(element.tagName.toLowerCase(), '-');
}

function getViewItemSettings(element){
    var settings = {};
    for(var i = 0; i < element.attributes.length; i++) {
        var attribute = element.attributes[i],
            propertyInfo = attribute.name.split('_');

        if(attribute.name === 'view-type'){
            continue;
        }

        if(propertyInfo.length === 1){
            settings[camelize(propertyInfo[0], '-')] = attribute.value;
            continue;
        }

        var property = {};
        property[propertyInfo[1]] = attribute.value;
        settings[camelize(propertyInfo[0], '-')] = property;
    }

    return settings;
}

function inflateViewItem(element, constructors){
    var viewItem;
    if(element.nodeType === 1){
        viewItem = new constructors[elementTag(element)](getViewItemSettings(element));
    }else if(element.nodeType === 3 && constructors.text){
        return new views.text({text:{value:element.textContent}});
    }

    if(!viewItem){
        return;
    }

    viewItem.actions = getActions(element);
    viewItem.behaviours = getBehaviours(element);
    if(viewItem.views){
        var childViews = getViews(element);
        for(var key in childViews){
            viewItem.views[key].add(childViews[key]);
        }
        var templates = getTemplates(element);
        for(var key in templates){
            viewItem[key].template = templates[key];
        }
    }

    return viewItem;
}

function inflateAction(element){
    return inflateViewItem(element, actions);
}

function inflateBehaviour(element){
    return inflateViewItem(element, behaviours);
}

function inflateView(element){
    return inflateViewItem(element, views);
}

function inflateActions(element){
    var actions = [];
    for(var i = 0; i < element.childNodes.length; i++) {
        var action = inflateAction(element.childNodes[i]);
        if(action){
            actions.push(action);
        }
    }
    return actions;
}

function getActions(element){
    if(!element.childNodes){
        return;
    }

    var elements = element.childNodes,
        actions = {};

    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if(element.nodeType === 1 && elementTag(element) === 'actions'){
            var actionName = element.getAttribute('event');
            actions[actionName] = actions[actionName] || [];
            actions[actionName].push.apply(actions[actionName], inflateActions(element));
            removeElement(element);
            i--;
        }
    }

    return actions;
}

function getBehaviours(element){
    if(!element.childNodes){
        return;
    }

    var elements = element.childNodes,
        behaviours = [];

    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if(element.nodeType === 1 && elementTag(element) === 'behaviours'){
            behaviours.push.apply(behaviours, inflateBehaviour(element));
            removeElement(element);
            i--;
        }
    }

    return behaviours;
}

function getViews(element){
    if(!element.childNodes){
        return;
    }

    var elements = element.childNodes,
        views = {};

    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if(element.nodeType === 1){
            if(elementTag(element) === 'actions' || elementTag(element) === 'behaviours' || element.hasAttribute('template-for')){
                return;
            }
        }
        var view = inflateView(element),
            containerName = view.containerName || 'content';

        views[containerName] = views[containerName] || [];
        views[containerName].push(view);
        removeElement(element);
        i--;
    }

    return views;
}

function getTemplates(element){
    if(!element.childNodes){
        return;
    }

    var elements = element.childNodes,
        templates = {};

    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if(element.nodeType === 1){
            if(element.hasAttribute('template-for')){
                var view = inflateView(element),
                    templateFor = element.getAttribute('template-for');

                templates[templateFor] = templates[templateFor] || [];
                templates[templateFor] = view;
                removeElement(element);
                i--;
            }
        }
    }

    return templates;
}

function viewFromDom(target){
    var actions = getActions(target),
        views = getViews(target).content,
        behaviours = getBehaviours(target);

    while(target.childNodes.length) {
        target.removeChild(target.childNodes[0]);
    }

    gaffa.views.renderTarget = target;

    gaffa.views.add(views);
}

window.onload = function(){
    viewFromDom(document.body);
};