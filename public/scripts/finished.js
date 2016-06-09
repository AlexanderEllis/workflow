//Welcome!  Any code communicating with the server and database has been commented out but included for show.  This is a locally running example.


//var canUpdate = true;

var FinishedBox = React.createClass({

  /*loadSitesFromServer: function() {
    if (!canUpdate) { //Don't even start refreshing if we can't update
      return;
    }
    var sentInfo = { //We want to only get the 'completed' ones, so we send that info with the request.
      status: "completed",
    };
    $.ajax({
      url: '/api/update',
      dataType: 'json',
      cache: false,
      type: "POST",
      data: sentInfo,
      success: function(data) {
        if (!canUpdate) { //Don't post changes if we can't update.
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
        array.splice(index, 1);
      }
    });
  },

  handleSiteDelete: function(id) {
    //canUpdate = false;
    let oldData = this.state.data;
    this.deleteSite(this.state.data, id);
    var newData = this.state.data;
    /*var sentData = {
      id: id,
      status: "completed" //We need to send status so that the mongodb can return the appropriate ones afterwards
    };
    this.setState({data: newData});
    $.ajax({
      url: '/api/delete',
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

  handleNewSite: function(evt) { //evt is object coming through, looks like {detail: {site}}
    //canUpdate = false;
    var newSite = evt.detail; // grabs the site
    var oldData = this.state.data;
    oldData.push(newSite); //adds in the new site to the data array
    this.setState({data: oldData}); //sets local state before updating from db
    //setTimeout(function() {canUpdate = true;}, 2000);//When getting new sites from local, can't update from db for two seconds to ensure gap
  },

  componentDidMount: function() {
    //this.loadSitesFromServer();
    window.addEventListener("toCompleted", this.handleNewSite); //listens for event with site data
    //setInterval(this.loadSitesFromServer, this.props.pollInterval);
  },

  render:function() {
    return (
      <div className = "finishedBox">
        <h1>Finished Sites</h1>
        <SiteList data = {this.state.data} onSiteDelete = {this.handleSiteDelete} />
      </div>
    );
  }
});

var SiteList = React.createClass({
  render: function() {
    var gettingParentFunction = this.props.onSiteDelete;

    var siteNodes = this.props.data.map(function(site) {
      return (
        <Site name = {site.name} key = {site.id} id = {site.id} url = {site.url} dateCompleted = {site.dateCompleted} templateURL = {site.templateURL} description = {site.description} forSiteDelete = {gettingParentFunction} >
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

  render: function() {
    return (
      <div className = "site">
      <h2 className = "siteName">
        <a href = {this.props.url} target="_blank">
          {this.props.name}
        </a>
      </h2>
      <span> Date completed: {this.props.dateCompleted} </span>
      <span title = {this.props.description}> {this.props.description}</span>
      <br />
      <p> <a href = {this.props.templateURL} target="_blank"> Link to template</a></p>


        <form className = "deleteSite" onSubmit = {this.deleteSite}>
          <input
            type = "submit"
            value = "Delete"
          />
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <FinishedBox /*url="/api/finished" pollInterval={2000}*/ />,
  document.getElementById('finished-sites')
);
