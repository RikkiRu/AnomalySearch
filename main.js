document.app = new App();

function App()
{
    this.searchInput = undefined;
}

$(document).ready(function () 
{
    document.getElementById("DiscretizingButton").className += " active";
    document.app.SuffixtreeJS();
});