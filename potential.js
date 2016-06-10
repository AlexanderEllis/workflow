
//var canUpdate = true;  //Lord and savior.  This lets us define when incoming updates are OK.

var WebsiteBox = React.createClass({
  /*loadSitesFromServer: function() {
    if (!canUpdate) { //Don't start refreshing if we can't update.
      return;
    }
    var sentInfo = { //We want to only get the 'potential' ones, so we send that info with the request.
      status: "potential",
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

  handleSiteSubmit: function(site) {
    //canUpdate = false;
    var sites = this.state.data; //Grabs data from submit form.  "this" is really the form, since the function is bubbled up from the form
    site.id = Date.now();
    var dateNow = new Date(); //To compute legible date added
    site.dateAdd = (dateNow.getMonth() + 1) + "/" + dateNow.getDate() + "/" + dateNow.getFullYear();
    site.status = "potential"; //default
    site.templateURL = ""; //no url because it's not completed yet
    var newSite = sites.concat([site]); //This creates client-side array that is new list of sites
    this.setState({data: newSite}); //This makes it look like we instantly added site!  Really the server is working in the background, but don't tell anyone
    /*$.ajax({
      url: '/api/new',
      dataType: 'json',
      type: 'POST',
      data: site,
      success: function() {
        canUpdate = true;
      },
    });*/
  },

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
    this.setState({data: newData});
    /*var sentData = {
      id: id,
      status: "potential" //We need to send status so that the mongodb can return the appropriate ones afterwards
    };
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

  findSite: function(array, id) {
    var dataToCompleted;
    let oldData = this.state.data;
    array.forEach(function(result, index) {
      if(result["id"] === id) {
         dataToCompleted = oldData[index]; //Got the site we care about
      }
    });
    return dataToCompleted;
  },

  handleToProgress: function(id) {
    //canUpdate = false; //No updates until we're done talking to server
    let oldData = this.state.data;
    var changedSite = this.findSite(oldData, id); //findSite function right above
    var myEvent = new CustomEvent("toProgress", { detail: changedSite });
    window.dispatchEvent(myEvent); //Hello progress.js please update with this site I'm sending you
    this.deleteSite(this.state.data, id); //Removes site from local array
    var newData = this.state.data;
    this.setState({data: newData}); //Updates local view
    /*var sentData = {
      id: id,
      changeTo: "progress"
    };
    $.ajax({
      url: "/api/change-status",
      dataType: 'json',
      type: 'POST',
      data: sentData,
      success: function() {
      canUpdate = true; //OK we're allowing updates now
    }
  });*/
  },

  getInitialState: function() {
    return {data: []}; //We load nothing to make sure our main components load speedy
  },

  componentDidMount: function() {
    //this.loadSitesFromServer();
    //setInterval(this.loadSitesFromServer, this.props.pollInterval); //This refreshes it regularly (every 2 seconds)
  },

  render:function() {
    return (
      <div className = "websiteBox">
        <h1>To Do</h1>
        <SiteList data = {this.state.data} onSiteDelete = {this.handleSiteDelete} onToProgress = {this.handleToProgress} />
        <SiteForm onSiteSubmit = {this.handleSiteSubmit}/>
      </div>
    );
  }
});

var SiteList = React.createClass({
  render: function() {
    var gettingParentDeleteFunction = this.props.onSiteDelete;
    var gettingParentToProgressFunction = this.props.onToProgress;
    var siteNodes = this.props.data.map(function(site) {
      return (
        <Site name = {site.name} key = {site.id} id = {site.id} url = {site.url} dateAdd = {site.dateAdd} description = {site.description} forSiteDelete = {gettingParentDeleteFunction} toProgress = {gettingParentToProgressFunction}>
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

var SiteForm = React.createClass({
  getInitialState: function() {
    return {name: '', url: '', description: ''};
  },
  handleNameChange: function(e) {
    this.setState({name: e.target.value});
  },
  handleURLChange: function(e) {
    this.setState({url: e.target.value});
  },

  handleDescriptionChange: function(e) {
    this.setState({description: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.state.name.trim();
    var url = this.state.url.trim();
    var description = this.state.description.trim();
    if (!name || !description) {
      return;
    }
    if (!url) {
      url = "#";
    }
    this.props.onSiteSubmit({name: name, url: url, description: description});
    this.setState({name: '', url: '', description: ''});
  },

  render: function() {
    return (
      <form className = "siteForm" onSubmit = {this.handleSubmit}>
        <input
          type = "text"
          placeholder = "Task name"
          value = {this.state.name}
          onChange = {this.handleNameChange}
        />
        <br />
        <input
          type = "text"
          placeholder = "Task URL"
          value = {this.state.url}
          onChange = {this.handleURLChange}
        />
        <br />
        <input
          type = "text"
          placeholder = "Task Description"
          value = {this.state.description}
          onChange = {this.handleDescriptionChange}
        />
        <input type = "submit" value = "Post" />
      </form>
    );
  }
});

var Site = React.createClass({

  deleteSite: function(e) {
    e.preventDefault();
    this.props.forSiteDelete(this.props.id);
  },

  toProgress: function(e) {
    e.preventDefault();
    this.props.toProgress(this.props.id);
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
        <form className = "toProgress" onSubmit = {this.toProgress}>
          <input
            type = "submit"
            value = "In Progress"
          />
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <WebsiteBox /*pollInterval={2000}*/ />,
  document.getElementById('potential-sites')
);
