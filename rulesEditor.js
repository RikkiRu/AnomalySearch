var $ = $;

/**
 * @typedef {Object} RuleEditor
 * @property {HTMLElement} LoadDataButton
 */
function RuleEditor()
{
    this.LoadDataButton = null;
}

$(document).ready(function() 
{
    ruleEditor.LoadDataButton = document.getElementById("LoadDataButton");
    
    ruleEditor.LoadDataButton.className += " active";
});

/**
 * @type {RuleEditor}
 */
var ruleEditor = new RuleEditor();