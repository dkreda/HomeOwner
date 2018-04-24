/* ***************************
 C O N T R O L E R S !!!!!
 ****************************/

homeOwnSys.controller("ctlLogin",function($log,$scope,UserManager,$location){
    function validate() {
       $log.debug("checking " + $scope.user) ;
       //$log.debug(u + "," + p + "," + m);
       let session = UserManager.login($scope.user,$scope.pass);
       if ( $scope.mode ) {
           UserManager.setAuthenticationServer("dummy");
           session = UserManager.login($scope.user,$scope.pass);
           UserManager.setAuthenticationServer("");
       }
       if (  session.length > 0 ) {
           $location.path("/");
       } else {
           $scope.logMessage="wrong user name or password. try again";
           alert("Login failed - try again ...");
       }
       $log.debug(" -- Login controller: ");
       $log.debug("- current user: " + UserManager.user());
       //for ( let k in UserManager) {
       //    $log.debug(k + " >>> " + UserManager[k]);
       //}
    }
    
    $log.debug("Start login controller !!!!!!!!!");
    //$scope.btnpress = myTest;
    //$scope.name="aaa";
    $scope.logMessage="";
    $scope.login = validate;
    
  });
 
homeOwnSys.controller("securityCheck",function($log,$scope,UserManager,$routeParams){
       
       $scope.authorized=UserManager.autherization($routeParams.session);
       $scope.sessionID=UserManager.sessionID();
  });
 
  homeOwnSys.controller("homeMenu",function($log,$scope,UserManager){
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
    $scope.target=(link) => "#!" + UserManager.sessionID() + "/" + link;
    $scope.menuItems=[];
    for (item in menuMap ) {
      $scope.menuItems.push({ title: item ,
                              image: menuMap[item].image ,
                              link: menuMap[item].link ,
                              text: menuMap[item].text});
    }
  });

homeOwnSys.controller("homeNav",function($scope,$log,UserManager){
    const setLink = (target) => "#!" + UserManager.sessionID() + "/" + target;
    $scope.menuItems= [{text: "Login" , link: "#!Login"} ,
                       {text: "Tenant" , link: setLink("tenant") } ,
                       {text: "Messages" , link: setLink("messages") },
                       {text: "Issues" , link : setLink("issues")} ,
                       {text: "DashBord" , link: setLink("dashboard")}  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!" + UserManager.sessionID() + "/index.html";
});

homeOwnSys.controller("MsgNav",function($scope,$log,UserManager){
    const setLink = (target) => "#!" + UserManager.sessionID() + "/" + target;
    $scope.menuItems= [{text: "Logout" , link: "#!"} ,
                       {text: "Tenant" , link: setLink("tenant") } ,
                       {text: "Votes" , link: setLink("votes") },
                       {text: "Issues" , link : setLink("issues")} ,
                       {text: "DashBord" , link: setLink("dashboard")} ,
                       {text: "New Message" , link: setLink("newmessage") }  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!" + UserManager.sessionID() + "/index.html";
});

homeOwnSys.controller("IssueNav",function($scope,$log,UserManager){
    const setLink = (target) => "#!" + UserManager.sessionID() + "/" + target;
    $scope.menuItems= [{text: "Logout" , link: "#!"} ,
                       {text: "Tenant" , link: setLink("tenant") } ,
                       {text: "Votes" , link: setLink("votes") },
                       {text: "Message" , link : setLink("messages")} ,
                       {text: "DashBord" , link: setLink("dashboard")} ,
                       {text: "New Issue" , link: setLink("newIssue") }  ] ;
    $scope.homeText="Home";
    $scope.homeLink="#!" + UserManager.sessionID() + "/index.html";
});


homeOwnSys.controller("newIssues", function ($scope, $log, issues,UserManager) {
    $log.debug("- initiates new Issues.");
    let title = "New / Open Issues";
    function btnCommnt(issueID) {
        $scope.inputLabel="your comment";
    };
    function btnState(issueID){
        $scope.inputLabel="closing reason";
    };

    function addComment(issueID,text) {
        let tmp= issues.createComment(UserManager.user(),new Date(),text);
        issues.addComment(issueID,tmp);
    }

    function closeIssue(issueID,text){
        let tmp=issues.createComment(UserManager.user(),new Date(),text);
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

homeOwnSys.controller("overdueIssues", function ($scope, $log, issues,UserManager) {
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
        let tmp= issues.createComment(UserManager.user(),new Date(),text);
        issues.addComment(issueID,tmp);
    }

    function closeIssue(issueID,text){
        let tmp=issues.createComment(UserManager.user(),new Date(),text);
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


homeOwnSys.controller("closedIssues", function ($scope, $log, issues,UserManager) {
    $log.debug("- initiates closed Issues.");

    function btnCommnt(issueID) {
        $scope.inputLabel="your comment";
    };
    function btnState(issueID){
        $scope.inputLabel="approved comment";
    };

    function addComment(issueID,text) {
        let tmp= issues.createComment(UserManager.user(),new Date(),text);
        issues.addComment(issueID,tmp);
    }

    function closeIssue(issueID,text){
        let tmp=issues.createComment(UserManager.user(),new Date(),text);
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

homeOwnSys.controller("ctlMessages",function($scope,$log,Messages,$location,UserManager){
    $log.debug("- initiates Messages controller.");

    function addMessage(msgID='N/A'){
        let reqStr=$location.path();//.replace(/\/[^\/]+$/,"");
        //let urlBuilder= new UrlAddress( reqStr);
        $log.debug("msgID : ");
        $log.debug(msgID);
        ///urlBuilder.fileName="newmessage";
        Messages.lastMsgID=msgID;
        //reqStr=urlBuilder.request(msgID == 'N/A' ? {} : { msgID: msgID} );
        reqStr=reqStr.replace(/[^\/]+$/,"newmessage");
        $log.debug("local: " + $location.path());
        $log.debug("url: " + reqStr);

        //for ( let k in $location ) {
        //    $log.debug(k + ": " + $location[k]);
        //}
        //$window.location.href="#!12345/newmessage";
        $location.path(reqStr);//\?msgID=" + msgID);//.hash({msgID: msgID});
        //$location.path("/Login");
        //$location.path(reqStr);
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

homeOwnSys.controller("addMessage",function($scope,$log,Messages,UserManager,$location){
    $log.debug("Input from browser:");
    //for ( let key in UserManager) {
    //    $log.debug(key + ": ..." ) ; //+ UserManager[key]);
    //}
    let msgID=Messages.lastMsgID;
    let pMsg= Messages.findMessageByID(msgID);

    function commit(){
        //let curent = new Date();
        //let dateStr = curent.getDate() + " " + curent.getTime();
        $log.debug("commit new message .....");
        Messages.addMessage( $scope.title , $scope.text, msgID == 'N/A' ? undefined : msgID);
        let url=$location.path();
        Messages.lastMsgID=undefined;
        $location.path( url.replace(/[^\/]+$/,"messages"));
    }

    $log.debug("parent message:");
    $log.debug(pMsg);
    $scope.user=UserManager.user();
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

homeOwnSys.controller("createIssue",function($scope,$log,issues,UserManager,$location){

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
                          createdBy: UserManager.user() ,
                          title : $scope.title ,
                          dueDate : dateStr ,
                          comments : [ issues.createComment(UserManager.user(),creatDate,$scope.text) ] }
            issues.createIssue(isuRec);
            $log.debug("add Issue:");
            $log.debug(isuRec);
            let url=$location.path();
            $location.path( url.replace(/[^\/]+$/,"issues"));
            
        } else {
            $scope.errorMsg="Must be valid date";
            alert("Due date muast be valide date\nor select 'No due date' option");
        }
        ///Messages.addMessage( $scope.title , $scope.text, msgID == 'N/A' ? undefined : msgID);
        
        //Messages.lastMsgID=undefined;
        //
        //$log.debug("radio value: " + $scope.rTest);
    }

    $scope.errorMsg="";
    $scope.testme= () => {$scope.rTest=$scope.dueDateVal };
    //var stam=$('#test').parent();
    //$scope.options={format: 'dd/mm/yyyy HH:mm', 
    //                todayHighlight: true,
    //                autoclose: true,
    //                container: stam,
      //              showClear: true};
    
    //var input=$('input[id="date"]');
    //input.datepicker($scope.options);

    $(document).ready(function(){
        console.log("....... jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
        var date_input=$('input[name="date"]'); //our date input has the name "date"
        var container=$('#test').parent();
        var options={
          format: 'mm/dd/yyyy',
          container: container,
          todayHighlight: true,
          autoclose: true,
        };
        console.log("....... test ...........");
        console.log(date_input);
        //date_input.datepicker(options);
        console.log("setup datepicker");
      })

    $scope.user=UserManager.user();
    let url=$location.path();
    $scope.home="#!" + url.replace(/[^\/]+$/,"index.html")
    $scope.commit=commit;
});