function OnLoad()
{
    document.app = new App();
    //document.getElementById("SourceData").style.display = "block";
    document.getElementById("SourceDataButton").className += " active";
}

function App()
{
    this.searchInput = undefined;
}

App.prototype.search = function()
{
    this.searchInput = document.getElementById("searchInput").value;
    console.log("App Search " + this.searchInput);
}