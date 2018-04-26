
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

/* ***************************
 C O N T R O L E R S !!!!!
 ****************************/

homeOwnSys.controller("ctlLogin",function($log,$scope,$location,ServerRequets){ 
    
    function finishLogin(){
        $log.debug("Checking login result ...");
        let next=$location.path();
        if ( ServerRequets.autherization() == "blocked" ) {
            $log.debug("log failed ....");
            $scope.logMessage="wrong user name or password. try again";
            $scope.pass=""; 
            $('.watingProcess').hide();
            alert("Login failed - try again ...");

        } else {
            $log.debug("log successed ...." + ServerRequets.autherization());
            next=next.replace(/[^\/]+$/,"index.html");
            $log.info("user '" + ServerRequets.user() + "' loged in.");
            $log.debug("Login successed -> routing to home" + next);
            $location.path(next);
        }
        return true;
    }

    function validate() {
        $log.debug("checking " + $scope.user) ;
        $('.watingProcess').show();
        if ( $scope.mode  ) {
            ServerRequets.dummyLogin($scope.user);
            finishLogin();
        } else {
            ServerRequets.login($scope.user,$scope.pass,finishLogin);
            //let tmp=
        }
     }

    $log.debug("Start login controller !!!!!!!!!");
    $scope.logMessage="";
    $scope.login = validate;
    
  });
 

homeOwnSys.controller("securityCheck",function($log,$scope,ServerRequets){ 
    $log.debug("Start - Security controller");   
    $scope.authorized=ServerRequets.autherization();
    $scope.sessionID="Who needs Session ID?";
    $log.debug("Security controller - authentication " + $scope.authorized); 

  });
 
homeOwnSys.controller("homeMenu",function($log,$scope,ServerRequets){
    let menuMap = {
       Dashbord : {
                 link: "test" ,
                 image: "dashboard.jpg" ,
                 text: "summerize all screens"
               } ,
       Messages : {
                 link: "messages" ,
                 image: "message.jpg" ,
                 text: "handle messaging between neighbours"
               } ,
       Issues : {
                 link: "issues" ,
                 image: "tower.jpg" ,
                 text: "handle issues"
               } ,
       Voting : {
                 link: "votes" ,
                 image: "vote.jpg" ,
                 text: "handle votes"
               } 
    }
    $scope.imgPath= (img) => "images/" + img;
    $scope.target=(link) => "#!/" + link;
    $scope.menuItems=[];
    for (item in menuMap ) {
      $scope.menuItems.push({ title: item ,
                              image: menuMap[item].image ,
                              link: menuMap[item].link ,
                              text: menuMap[item].text});
    }
  });


homeOwnSys.controller("homeNav",function($scope,$log){
    const setLink = (target) => "#!/" + target;
    $scope.menuItems= [{text: "Login" , link: "#!Login"} ,
                       {text: "Votes" , link: setLink("votes") } ,
                       {text: "Messages" , link: setLink("messages") },
                       {text: "Issues" , link : setLink("issues")} ,
                       {text: "DashBord" , link: setLink("dashboard")}  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!/index.html";
});

homeOwnSys.controller("MsgNav",function($scope,$log,ServerRequets){
    const setLink = (target) => "#!/" + target;
    $scope.menuItems= [{text: "Logout" , link: "#!"} ,
                       {text: "Tenant" , link: setLink("tenant") } ,
                       {text: "Votes" , link: setLink("votes") },
                       {text: "Issues" , link : setLink("issues")} ,
                       {text: "DashBord" , link: setLink("dashboard")} ,
                       {text: "New Message" , link: setLink("newmessage") }  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!" ;
});

homeOwnSys.controller("IssueNav",function($scope,$log,ServerRequets){
    const setLink = (target) => "#!/" + target;
    $scope.menuItems= [{text: "Logout" , link: "#!"} ,
                       {text: "Tenant" , link: setLink("tenant") } ,
                       {text: "Votes" , link: setLink("votes") },
                       {text: "Message" , link : setLink("messages")} ,
                       {text: "DashBord" , link: setLink("dashboard")} ,
                       {text: "New Issue" , link: setLink("newIssue") }  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!";
});

homeOwnSys.controller("VoteNav",function($scope,$log,ServerRequets){
    const setLink = (target) => "#!/" + target;
    $scope.menuItems= [{text: "Logout" , link: "#!"} ,
                       {text: "Tenant" , link: setLink("tenant") } ,
                       {text: "Issues" , link: setLink("issues") },
                       {text: "Message" , link : setLink("messages")} ,
                       {text: "DashBord" , link: setLink("dashboard")} ,
                       {text: "New Vote" , link: setLink("newVote") }  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!" ;
});

homeOwnSys.controller("newIssues", function ($scope, $log, issues,ServerRequets) {
    $log.debug("- initiates new Issues.");
    let title = "New / Open Issues";
    function btnCommnt(issueID) {
        $scope.inputLabel="your comment";
    };
    function btnState(issueID){
        $scope.inputLabel="closing reason";
    };

    function addComment(issueID,text) {
        let tmp= issues.createComment(ServerRequets.user(),new Date(),text);
        issues.addComment(issueID,tmp);
    }

    function closeIssue(issueID,text){
        let tmp=issues.createComment(ServerRequets.user(),new Date(),text);
        issues.changeState(issueID,tmp,"Closed");
    }

    function btnAddPressed(issueID){
        if ( $scope.inputLabel == "closing reason")
            closeIssue(issueID,$scope.text[issueID])
        else 
            addComment(issueID,$scope.text[issueID]);
    }

    $scope.text={};
    $scope.secTag = "simple-title";
    $scope.headerTag = "simple"; // "notifHeader"; //
    $scope.contentTag = "list";
    $scope.secTitle = title;
    $scope.issues = issues.openIssues;
    $scope.setReadFlag = issues.chgFlag;
    $scope.getDetails = issues.getDetails;
    $scope.clickComment = btnCommnt;
    $scope.clickState = btnState;
    
    $scope.nextState="close issue";
    $scope.inputLabel="closing reason";
    $scope.clear = (indx) => $scope.text[indx]="";
    $scope.addComment = btnAddPressed ;
    $scope.closeIssue = closeIssue  ;
});

homeOwnSys.controller("overdueIssues", function ($scope, $log, issues,ServerRequets) {
    $log.debug("- initiates overdue Issues.");
    let title = "Overdue Issues";

    function btnCommnt(issueID) {
        $scope.inputLabel="your comment";
    };
    function btnState(issueID){
        $scope.inputLabel="closing reason";
    };

    function addComment(issueID,text) {
        $log.debug("overdueIssues controller - add comment request ...");
        let tmp= issues.createComment(ServerRequets.user(),new Date(),text);
        issues.addComment(issueID,tmp);
    }

    function closeIssue(issueID,text){
        let tmp=issues.createComment(ServerRequets.user(),new Date(),text);
        issues.changeState(issueID,tmp,"Closed");
    }

    function btnAddPressed(issueID){
        if ( $scope.inputLabel == "closing reason")
            closeIssue(issueID,$scope.text[issueID])
        else 
            addComment(issueID,$scope.text[issueID]);
    }


    //$scope.secTag="simple-title";
    $scope.text={};

    $scope.headerTag = "simple"; //"simple";
    $scope.contentTag = "list";
    $scope.secTitle = title;
    $scope.issues = issues.overdueIssues;
    $scope.setReadFlag = issues.chgFlag;

    $scope.clickComment = btnCommnt;
    $scope.clickState = btnState;
    $scope.nextState="close issue";
    $scope.inputLabel="closing reason";
    $scope.clear = (indx) => $scope.text[indx]="";
    $scope.addComment = btnAddPressed ;
    $scope.closeIssue = closeIssue  ;

});


homeOwnSys.controller("closedIssues", function ($scope, $log, issues,ServerRequets) {
    $log.debug("- initiates closed Issues.");

    function btnCommnt(issueID) {
        $scope.inputLabel="your comment";
    };
    function btnState(issueID){
        $scope.inputLabel="approved comment";
    };

    function addComment(issueID,text) {
        let tmp= issues.createComment(ServerRequets.user(),new Date(),text);
        issues.addComment(issueID,tmp);
    }

    function closeIssue(issueID,text){
        let tmp=issues.createComment(ServerRequets.user(),new Date(),text);
        issues.changeState(issueID,tmp,"Closed");
    }

    function btnAddPressed(issueID){
        if ( $scope.inputLabel == "approved comment")
            issues.rmIssue(issueID)
            //closeIssue(issueID,$scope.text[issueID])
        else 
            addComment(issueID,$scope.text[issueID]);
    }

    let title = "Closed Issues";
    $scope.text={};
    //$scope.secTag="simple-title";
    $scope.headerTag = "simple"; //"simple";
    $scope.contentTag = "list";
    $scope.secTitle = title;
    $scope.issues = issues.closedIssues;
    $scope.setReadFlag = issues.chgFlag;
    $scope.nextState="approve issue closing";
    $scope.inputLabel="approved comment";
    $scope.clear = (indx) => $scope.text[indx]="";
    $scope.addComment = btnAddPressed ;
    $scope.closeIssue = closeIssue  ;
    $scope.clickComment = btnCommnt;
    $scope.clickState = btnState;
});

homeOwnSys.controller("ctlMessages",function($scope,$log,Messages,$location,ServerRequets){//UserManager){
    $log.debug("- initiates Messages controller.");

    function addMessage(msgID='N/A'){
        let reqStr=$location.path();
        $log.debug("msgID : ");
        $log.debug(msgID);
        Messages.lastMsgID=msgID;
        reqStr=reqStr.replace(/[^\/]+$/,"newmessage");
        $log.debug("local: " + $location.path());
        $log.debug("url: " + reqStr);
        $location.path(reqStr);
    }

    let title = "Messages";
    $scope.secTag = "simple-title";
    $scope.headerTag = "notifHeader"; // "notifHeader"; //
    $scope.contentTag = "simple-cont"; //list
    $scope.secTitle = title;
    $scope.issues = Messages.messageList;
    $scope.setReadFlag = Messages.chgFlag;
    $scope.getDetails = Messages.getDetails;
    $scope.addMessage = addMessage ;
});

homeOwnSys.controller("addMessage",function($scope,$log,Messages,ServerRequets,$location){
    $log.debug("Input from browser:");
    let msgID=Messages.lastMsgID;
    let pMsg= Messages.findMessageByID(msgID);

    function commit(){
        $log.debug("commit new message .....");
        Messages.addMessage( $scope.title , $scope.text, msgID == 'N/A' ? undefined : msgID);
        let url=$location.path();
        Messages.lastMsgID=undefined;
        $location.path( url.replace(/[^\/]+$/,"messages"));
    }

    $log.debug("parent message:");
    $log.debug(pMsg);
    $scope.user=ServerRequets.user();
    let url=$location.path();
    $scope.home="#!" + url.replace(/[^\/]+$/,"index.html")
    if ( pMsg == undefined ) {
        $scope.msgID='N/A' ;
        $scope.parent={};
    } else {
        $scope.msgID=msgID ;
        $scope.parent=pMsg;
        $scope.title="Re: " + pMsg.title;
    }
    $scope.commit=commit;
});

homeOwnSys.controller("createIssue",function($scope,$log,issues,ServerRequets,$location){

    function commit(){
        $log.debug("commit new issue ....." + $scope.rTest);
        let dueDate = $scope.rTest == "No limit" ? 0 : Date.parse($scope.rTest);
        $log.debug(dueDate);
        $log.debug(">" + dueDate + isNaN(dueDate) );
        let dateStr=dueDate >0 ? new Date(dueDate).toString() : "No limit";
        dateStr=dateStr.replace(/GMT.+/,"");
        let creatDate= new Date().toString();
        creatDate = creatDate.replace(/GMT.+/,"");
        if ( ! isNaN(dueDate)  ) {
            let isuRec= { createdAt: creatDate ,
                          createdBy: ServerRequets.user() ,
                          title : $scope.title ,
                          dueDate : dateStr ,
                          comments : [ issues.createComment(ServerRequets.user(),creatDate,$scope.text) ] }
            issues.createIssue(isuRec);
            $log.debug("add Issue:");
            $log.debug(isuRec);
            let url=$location.path();
            $location.path( url.replace(/[^\/]+$/,"issues"));
            
        } else {
            $scope.errorMsg="Must be valid date";
            alert("Due date muast be valide date\nor select 'No due date' option");
        }
    }

    $scope.errorMsg="";
    $scope.testme= () => {$scope.rTest=$scope.dueDateVal };


    $scope.user=ServerRequets.user();
    let url=$location.path();
    $scope.home="#!" + url.replace(/[^\/]+$/,"index.html")
    $scope.commit=commit;
});

homeOwnSys.controller("votingCtl",function($log,$scope,ServerRequets,VotingService){

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(this.drawChart);

    function dataTable(voteID){
        let vOp = VotingService.getVoteResults(voteID);
        let dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string','option');
        dataTable.addColumn('number','votes');
        let rows=[];
        for ( let k in vOp ) {
            rows.push([k,vOp[k]]);
        }
        dataTable.addRows(rows);
        return dataTable;
    }

    function setIndex(vID) {
        return vID.replace(/\//g,"0").replace(/\:/g,"");
    }

    function drawChart(voteID) {

        $log.debug("index pie" + setIndex(voteID));
        let chart = new google.visualization.PieChart(document.getElementById('pie'+ setIndex(voteID)));
        chart.draw(dataTable(voteID), {title: "vote results"});
        disableList[voteID] = true;
    }

    let disableList={};
    //let lSize=VotingService.VotingList.length;
    //$log.debug("- disable list " + lSize ) ;
    for ( let i= 0 ; i< VotingService.VotingList.length ; i++ ) {
        disableList[VotingService.VotingList[i]] = false;
    }
    //$log.debug("- finish disabling ...");
    function vote(votID) {
        if ( ! VotingService.userCanVote(votID) ) {
            alert("user '" + ServerRequets.user() + "' can not vote\n" + "you already voted");
            return ;
        }
        if ( $scope.votVal[votID] === undefined  ){
            alert("No option selected");
            return ;
        }
        VotingService.vote(votID,$scope.votVal[votID]);
        drawChart(votID);
        disableList[votID]=true;
        let tmp=$scope.votVal[votID];
        $scope.votVal[votID]= undefined;
        $scope.votVal[votID] = tmp;
    }

    $log.debug("Vote Controler - start initializing scope .....");

    if ( $scope.votVal === undefined ) $scope.votVal={};
    $scope.dis=disableList;
    $scope.votingList=VotingService.VotingList;
    $scope.voteRec=VotingService.getVoting;
    $scope.canVote=VotingService.userCanVote; 
    $scope.drawPie=drawChart;
    $scope.setIndex = setIndex ;
    $scope.vote=vote;
    $scope.user=ServerRequets.user();
    $log.debug("Controller got " + $scope.votingList.length);
});

homeOwnSys.controller("createVote",function($scope,$log,VotingService,$location){
    function submit(){
        $log.debug("clicked ....");
        let vRec={
            "dueDate": $scope.dueDate, 
            "title": $scope.title, 
            "options" : getOptions(),
            details : $scope.details
        }
        VotingService.addVotingRecord(vRec);
        backToVotesPage();
    }

    function backToVotesPage(){
        $log.debug("go back ...");
        let tmpPath=$location.path();
        $log.debug("new Path:" + tmpPath.replace(/[^\/]+$/,"votes"));
        $location.path(tmpPath.replace(/[^\/]+$/,"votes"));
    }

    
    function addOption(){
        let indx=Math.max.apply(null,$scope.options) + 1;
        $scope.opHash[indx.toString()]="Option " + indx;
        $scope.options.push(indx);
    }

    function delOption(indx){
        delete $scope.opHash[indx];
        $scope.options.splice(0);
        for ( let k in $scope.opHash) $scope.options.push(k);
        $log.debug($scope.options.length);
        $log.debug($scope.options);
    }

    function getOptions() {
        let opList=[];
        for ( let k in $scope.opHash) opList.push($scope.opHash[k]);
        return opList;
    }

    $log.debug("Controler - createVote initilized ....");
    $scope.opHash={ 1 : "Yes" ,
                    2 : "No" } ;

    $scope.options=Object.keys($scope.opHash);
    $scope.delOpt=delOption;
    $scope.addOption=addOption;
    $scope.submit=submit;
    $scope.cancel=backToVotesPage;
});