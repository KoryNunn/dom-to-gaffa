var Gaffa = require('gaffa'),
    gaffa = window.gaffa = new Gaffa(),
    views = gaffa.views.constructors = require('./views'),
    actions = gaffa.actions.constructors = require('./actions'),
    behaviours = gaffa.behaviours.constructors = require('./behaviours'),
    domToGaffa = require('../dom-to-gaffa');

window.onload = function(){
    gaffa.load(domToGaffa(gaffa, document.body));
};