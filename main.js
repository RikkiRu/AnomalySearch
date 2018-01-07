function OnLoad()
{
    document.app = new App();
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