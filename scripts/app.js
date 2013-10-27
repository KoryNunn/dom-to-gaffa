var Gaffa = require('gaffa'),
    myApp = {},
    gaffa = window.gaffa = new Gaffa(),
    views = gaffa.views.constructors = require('./views'),
    actions = gaffa.actions.constructors = require('./actions'),
    behaviours = gaffa.behaviours.constructors = require('./behaviours'),
    doc = require('doc-js'),
    domToGaffa = require('./dom-to-gaffa');

myApp.gaffa = gaffa;


window.onload = function(){
    gaffa.load(domToGaffa(gaffa, document.body));
};