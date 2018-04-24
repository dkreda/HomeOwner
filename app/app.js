// Global Objects
const templateFolder = "html" ;

function UrlAddress(baseUrl) {
  let serverUrl = baseUrl;
  let fileName;
  function buildRequest(reqParams) {
    //let queryStr = "";
    let queryList = []
    for (let key in reqParams) {
      //$log.debug(key + " >" + reqParams[key]);
      queryList.push(key + "=" + reqParams[key]);
    }
    if (serverUrl.length > 0) {
      return "http://" + serverUrl + "/" + this.fileName +
        (queryList.length > 0 ? "?" : "") + queryList.join("&");
    } else return this.fileName;
  }
  return {
    fileName: fileName,
    request: buildRequest,
    isLocal: (baseUrl.length == 0)
  }
}

function UserObj(username, userpassword, userappartment, usermail, commetee) {
  let name = username;
  var password = userpassword;
  let appartment = userappartment;
  let mail = usermail;
  let isCommetee = commetee;
  //const validatePassword= 
  return {
    name: name,
    mail: mail,
    appartment: appartment,
    isCommetee: isCommetee,
    validatePassword: (pass) => password == pass
    //validatePassword: function(pass) { 
    //  console.log("password is " + password);
    //  return password == pass ; }
  }
}

/*
UserObj.prototype.validatePassword = function(pass) {
   console.log("running from prototype ...");
   console.log("password is " + this.password);
   return this.password == pass;
}*/





console.log("Hey running from app.js")

var homeOwnSys = angular.module("homeOwn", ["ngRoute"]);
//var homeOwnSys=angular.module("homeOwn",[]);

/**************************************
 *  Directives ....
 */

 homeOwnSys.directive("isutop",function(UserManager) {
   console.log("Dynamiv directive !!!!!");
   console.log("Input element:");
   console.log(UserManager.autherization("8hd82h014029jd02"));
   console.log("attt:");
   //console.log(attr);
   return { templateUrl: UserManager.autherization("8hd82h014029jd02") == "blocked" ? "error1.html" : "issueManagment.html"};
 } ); 

homeOwnSys.directive("topNavigator",function(){return { templateUrl: templateFolder + "/navTemplate.html"}});

homeOwnSys.directive("errorNotif",function() {
   return { templateUrl: "error1.html"} ;
});

/* routing section */

homeOwnSys.config(function ($routeProvider) {
  console.log("Build routes .....");
  //$log.debug();
  //console.log($routeParams);
  $routeProvider.
    when("/", { templateUrl: "homePage.html" ,
                controller: "securityCheck"}).
    when("/:session/index.html", { 
              templateUrl: "homePage.html" ,
              controller: "securityCheck"}
    ).
    when("/:session/issues",{
        templateUrl: "issueManagment.html" ,
        controller: "securityCheck"
    }).
    when("/:session/messages",{ 
          templateUrl: "messageManage.html" ,
          controller: "securityCheck"
    }).
    when("/index.html",{ 
          templateUrl: "homePage.html" ,
          controller: "securityCheck"
    }).
    when("/:session/newmessage",{ templateUrl: templateFolder + "/newMessage.html"}).
    when("/Login",{templateUrl: "Login.html" , controller: "ctlLogin"}).
    when("/:session/newIssue",{ templateUrl: templateFolder + "/newIssue.html" ,
                                controller: "securityCheck"}).
    when("/:session/votes",{ templateUrl: "/VoteManagment.html" ,
                                controller: "securityCheck"}).
    //otherwise({ template : "<h1>error1.html</h1>"});
    otherwise({templateUrl: "error1.html"});
});

function errorUrl(ttt) {
  console.log("default page");
  console.log(ttt);
  console.log(ttt.$get);
  console.log(ttt.$get[0]);
  //var tmp=ttt.$get[8]();
  //console.log(tmp);
  //console.log(ttt.$routeParams)
  return { template: "<h1>error1.html Manual template</h1>" };
};


function ok2() {
  console.log("tesing route with secure ...");
  //console.log($routeProvider.session);
  return { templateUrl: "error1.html" };
}


/* Angular Services for homeOwn 
  - should be move to other file ... */
//homeOwnSys.service()


