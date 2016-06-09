
//var canUpdate = true;


var ProgressBox = React.createClass({

  /*loadSitesFromServer: function() {
    if (!canUpdate) {//Don't start refreshing if we can't update.
      return;
    };
    var sentInfo = { //We want to only get the 'progress' ones, so we send that info with the request.
      status: "progress",
    };
    $.ajax({
      url: '/api/update',
      dataType: 'json',
      cache: false,
      type: "POST",
      data: sentInfo,
      success: function(data) {
        if (!canUpdate) {//Don't post changes if we can't update.
          return;
        }
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },*/

  deleteSite: function(array, id) {
    array.forEach(function(result, index) {
      if(result["id"] === id) {
        array.splice(index, 1); //Takes the ID and deletes the site from the local array.  Bye site!
      }
    });
  },

  handleSiteDelete: function(id) {
    //canUpdate = false;
    let oldData = this.state.data;
    this.deleteSite(this.state.data, id); //Delete function right above
    var newData = this.state.data; //We now have a local copy of the data that doesn't include the site.
    /*var sentData = {
      id: id,
      status: "progress" //We need to send status so that the mongodb can return the appropriate ones afterwards
    };
    this.setState({data: newData});
    $.ajax({
      url: '/api/delete',
      dataType: 'json',
      type: 'POST',
      data: sentData, //"Hello please delete this site"
      success: function() {
        canUpdate = true;
      }
    });*/
  },

  findSite: function(array, id) {
    var dataToCompleted;
    let oldData = this.state.data;
    array.forEach(function(result, index) {
      if(result["id"] === id) {
         dataToCompleted = oldData[index]; //Finds the site we're sending to finished.js
      }
    });
    return dataToCompleted;
  },

  handleToCompleted: function(id) {
    //canUpdate = false;
    let oldData = this.state.data;
    var changedSite = this.findSite(oldData, id);
    this.deleteSite(this.state.data, id);
    var newData = this.state.data;
    var templateURL = window.prompt("Please enter the URL for the finished template.", "");
    changedSite.templateURL = templateURL; //Add the url to the local site so we can send to finished.js
    var dateNow = new Date(); //To compute legible date added
    var dateCompleted = (dateNow.getMonth() + 1) + "/" + dateNow.getDate() + "/" + dateNow.getFullYear();
    changedSite.dateCompleted = dateCompleted;
    var myEvent = new CustomEvent("toCompleted", { detail: changedSite }); //defines data sent with event as site we care about
    window.dispatchEvent(myEvent); //"Hello finished.js!  Here's a present for you!"
    this.setState({data: newData}); //sets local before updating from mongo
    /*var sentData = {
      id: id,
      changeTo: "completed",
      templateURL: templateURL,
      dateCompleted: dateCompleted,
    };
    $.ajax({
      url: "/api/change-status",
      dataType: 'json',
      type: 'POST',
      data: sentData,
      success: function() {
        canUpdate = true;
    }
  });*/
  },

  getInitialState: function() {
    return {data: []};
  },

  handleNewSite: function(evt) {
    //canUpdate = false;
    var newSite = evt.detail; // grabs the site from the event information from potential.js
    var oldData = this.state.data;
    oldData.push(newSite); //adds in the new site to the local data array
    this.setState({data: oldData}); //sets local state before updating from db
    //setTimeout(function() {canUpdate = true;}, 2000); //When getting new sites from local, can't update from db for two seconds to ensure gap
  },

  componentDidMount: function() {
    //this.loadSitesFromServer();
    window.addEventListener("toProgress", this.handleNewSite); //Listening for new sites
    //setInterval(this.loadSitesFromServer, this.props.pollInterval);
  },

  render:function() {
    return (
      <div className = "progressBox">
        <h1>Sites in Progress</h1>
        <SiteList data = {this.state.data} onSiteDelete = {this.handleSiteDelete} onToComplete = {this.handleToCompleted}/>
      </div>
    );
  }
});

var SiteList = React.createClass({
  render: function() {
    var gettingParentFunction = this.props.onSiteDelete;
    var gettingParentToCompleteFunction = this.props.onToComplete;

    var siteNodes = this.props.data.map(function(site) {
      return (
        <Site name = {site.name} key = {site.id} id = {site.id} url = {site.url} dateAdd = {site.dateAdd} description = {site.description} forSiteDelete = {gettingParentFunction} toCompleted = {gettingParentToCompleteFunction} >
        </Site>
      );
    });

    return (
      <div className = "siteList">
        {siteNodes}
      </div>
    );
  }
});

var Site = React.createClass({

  deleteSite: function(e) {
    e.preventDefault();
    this.props.forSiteDelete(this.props.id);
  },

  toCompleted: function(e) {
    e.preventDefault();
    this.props.toCompleted(this.props.id);//Don't need to delete any more, as delete would remove from db
  },

  render: function() {
    return (
      <div className = "site">
      <h2 className = "siteName">
        <a href = {this.props.url} target="_blank">
          {this.props.name}
        </a>
      </h2>
      <span> Date added: {this.props.dateAdd} </span>
      <span title = {this.props.description}> {this.props.description}</span>
        <form className = "deleteSite" onSubmit = {this.deleteSite}>
          <input
            type = "submit"
            value = "Delete"
          />
        </form>
        <form className = "toCompleted" onSubmit = {this.toCompleted}>
          <input
            type = "submit"
            value = "Completed"
          />
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <ProgressBox /*url="/api/progress" pollInterval={2000}*/ />,
  document.getElementById('sites-in-progress')
);
