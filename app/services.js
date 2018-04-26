function Comment(by, at, text) {
    this.createdBy = by;
    this.createdAt = at;
    this.text = text;
}

function Message(by, at, title, text) {
    this.createdBy = by;
    this.createdAt = at;
    this.text = text;
    this.title = title;
    this.readFlag = true;
    this.mesageList = [];
}

function Issue(by, at, priority, title) {
    let tmp = /limit/i;
    this.createdAt = tmp.test(at) ? at : new Date(at);
    this.createdBy = by;
    this.priority = priority;
    this.title = title;
    this.status = "Open";
    this.comments = [];
    this.readFlag = true;
    this.dueDate = "No limit";
}

Issue.prototype.getID = function () {
    let tmp = this.createdAt + this.createdBy;
    return tmp.replace(/\s/g, "");
}

Message.prototype.getID = function () {
    let tmp = this.createdAt + this.createdBy;
    return tmp.replace(/\s/g, "");
}

Message.prototype.addMessage = function (msgObj) {
    this.mesageList.push(msgObj);
}


//directives


homeOwnSys.directive("colapsCard", function () {
    return {
        templateUrl: templateFolder + "/acordListTemplate.html"
    }
});

homeOwnSys.directive("simpleHeader", function () {
    return {
        templateUrl: templateFolder + "/simpleHeader.html"
    }
});

homeOwnSys.directive("notifHeader", function () {
    return {
        templateUrl: templateFolder + "/complexHeader.html"
    }
});

//Services
homeOwnSys.factory("issues", function ($log, ServerRequets) { 
    $log.debug("Start issues Service ....");
    //let tmp = new Issue("Dummy", "Just now", "ergent", "Just for test");
    //let initState = false;
    let isuList = [];
    let stateLevels = {
        "Open": 1,
        "Postponed": 2,
        "Closed": 3
    };
    let openIssues = [];
    let closeIssues = [];
    let overdueIssues = [];

    function createIssue(rec) {
        res = new Issue(rec.createdBy, rec.createdAt, rec.title);
        for (key in res) {
            if (rec.hasOwnProperty(key))
                res[key] = rec[key];
        }
        return res;
    }

    function load(jSon) {
        isuList.splice(0);
        openIssues.splice(0);
        closeIssues.splice(0);
        overdueIssues.splice(0);
        for (let i = 0; i < jSon.length; i++) {
            let isuRec = createIssue(jSon[i]);
            let curent = new Date();
            isuList.push(isuRec);
            if (isuRec.status != "Closed") {
                if (isuRec.dueDate != "No limit" & Date.parse(isuRec.dueDate) < curent.getTime())
                    overdueIssues.push(isuRec)
                else openIssues.push(isuRec);
            } else
                closeIssues.push(isuRec);
        }
    }

    function init() {
        $log.debug("Issues services load DB");
        let url = ServerRequets.localMode ? dbFolder + "/Issues.json" : "iSsue-Server-Remote";
        let req = ServerRequets.sendSequredReq(url, {});
        req.then(load, function () { throw "fail to load Issues from DB" });
    }

    function findIssue(isuID) {
        for (let i = 0; i < isuList.length; i++) {
            if (isuList[i].getID() == isuID) {
                return isuList[i];
            }
        }
    }

    function updateComments(isuID, commentObj) {
        $log.debug("issues Services. update comments");
        let tmp = findIssue(isuID);
        if (tmp != undefined) {
            tmp.comments.push(commentObj);
        }
    }

    function changeIssueState(isuID, commentRec, state) {
        if (state in stateLevels) {
            let tmp = findIssue(isuID);
            if (tmp != undefined) {
                let chkFlag = tmp.state != "Closed" && state == "Closed";
                tmp.state = state;
                tmp.comments.push(commentRec);
                if (chkFlag) {
                    $log.debug("Issues Services - move Issue to closed issues list.");
                    for (let i = 0; i < Math.max(overdueIssues.length, openIssues.length); i++) {
                        if (i < openIssues.length && openIssues[i].getID() == isuID) {
                            let isuTmpList = openIssues.splice(i, 1);
                            closeIssues.push(isuTmpList[0]);
                            break;
                        }
                        if (i < overdueIssues.length && overdueIssues[i].getID() == isuID) {
                            let isuTmpList = overdueIssues.splice(i, 1);
                            closeIssues.push(isuTmpList[0]);
                            break;
                        }
                    }
                }
            } else {
                throw "fail to update State. Issue Record " + isuID + " not found.";
            }
        } else {
            $log.console.error("unsupported State " + state);
        }
    }

    function getDetails(comments) {
        result = [];
        $log.debug("build contetnt (details)");
        $log.debug(comments);
        for (let i = 0; i < comments.length; i++) {
            let tmp = comments[i].createdAt + "  " + comments[i].createdBy;
            result.push(tmp + "<br>" + comments[i].text);
        }
        return result.join("<br>");
    }

    function delIssue(isuID) {
        for (let i = 0; i < closeIssues.length; i++) {
            if (closeIssues[i].getID() == isuID) {
                closeIssues.splice(i, 1);
                break;
            }
        }
    }

    function addIssue(rec) {
        let tmp = createIssue(rec);
        isuList.push(tmp);
        openIssues.push(tmp);
    }
    init();
    //$log.debug("about to return ....");
    return {
        //issue: tmp,
        openIssues: openIssues,
        closedIssues: closeIssues,
        overdueIssues: overdueIssues,
        getDetails: getDetails,
        getIssueByID: findIssue,
        createComment: (by, at, text) => ({
            text: text, createdBy: by,
            createdAt: new Date(at).toString().replace(/GMT.+/, "")
        }),
        addComment: updateComments,
        changeState: changeIssueState,
        rmIssue: delIssue,
        createIssue: addIssue
    }
});


homeOwnSys.factory("UserManager", function ($log, ServerRequets) {
    $log.debug("Start user service ....");
    let userList = [];

    function init() {
        function readJson(jSon) {
            $log.debug("start building userlist ....");
            userList.splice(0);
            for (let i = 0; i < jSon.length; i++) {
                let tmp = jSon[i];
                userList.push(new UserObj(tmp.name, tmp.password, tmp.appartment, tmp.mail, tmp.isCommetee));
            }
        }
        let url = ServerRequets.localMode ? dbFolder + "/users.json" : "notReadyServer";
        let builder = ServerRequets.sendSequredReq(url, {});
        builder.then(readJson, () => { $log.error("user list build failed !!!") });
    }

    function findUser(user) {
        for (let i = 0; i < userList.length; i++) {
            let tmp = userList[i];
            if (tmp.name == user || tmp.mail == user)
                return tmp;
        }
        $log.debug("user " + user + " not found > " + userList.length);
        return {};
    }

    function validate(user, password) {
        if (urlAddress.isLocal) {
            userRec = findUser(user);
            if (userRec instanceof UserObj && userRec.validatePassword(password)) {
                $log.debug("user " + user + " pass authendication");
                autherization = userRec.isCommetee ? "Commetee" : "Regular";
                sessionID = Math.random().toString(36).substring(2, 15);
            } else {
                $log.error("authendication of " + user + " failed");
                autherization = "blocked";
                sessionID = "";
            }
        } else {
            $log.info("Server validation is not ready yet");
            sessionID = "testMode-Login";
            autherization = "Regular";
            userRec = { name: user };
        }
        $log.debug("UserManager Service. user Rec: " + userRec.name);
        $log.debug(userRec);
        $log.debug("autheriztion: " + autherization);
        return sessionID;
    };

    function verifyAuth(session) {
        if (!urlAddress.isLocal) {
            $log.info("Server authentication is not ready yet...");
            urlAddress.fileName = "tst";
            $log.info(urlAddress.request({}));
        } else {
            $log.debug("Verifying session " + session);
            let retVal = sessionID == session ? autherization : "blocked";
            $log.debug("autherization : " + retVal + " for session " + session);
            return retVal;
        }
    };

    init();

    return {
        getUser: findUser
    };
});

homeOwnSys.factory("Messages", function ($log, $http, ServerRequets) {//} UserManager) {
    $log.debug("Start Messages service ....");
    let rootMessageList = [];
    //let urlAddress = new UrlAddress("");
    let hashTable = {};
    let lastMsgID = 0;

    function loadRecord(jSon) {
        let tmp = new Message(jSon.createdBy, jSon.createdAt, jSon.title, jSon.text);
        if (jSon.hasOwnProperty("readFlag"))
            tmp.readFlag = jSon.readFlag;
        hashTable[tmp.getID()] = tmp;
        for (let i = 0; i < jSon.mesageList.length; i++) {
            tmp.addMessage(loadRecord(jSon.mesageList[i]));
        }
        return tmp;
    }

    function load(jSon) {
        console.log("running from load function");
        $log.debug(jSon);
        $log.debug("" + jSon);

        // clear Service
        rootMessageList.splice(0);
        for (k in hashTable) delete hashTable[k];
        for (let i = 0; i < jSon.length; i++) {
            let msgRec = loadRecord(jSon[i]);
            rootMessageList.push(msgRec);
        }
        console.log("Message service - finish load messages from DB.");
        for (let k in hashTable) $log.debug(k + " >    " + hashTable[k].title);
    }

    function init() {
        let url = ServerRequets.localMode ? dbFolder + "/Messages.json" : "Messages-remoteServer";
        let req = ServerRequets.sendSequredReq(url, {});
        $log.debug("Message Service - start retreive DB.")
        req.then(load, function () { $log.error("faile to retreive 'Messages' database") });
    }

    function addMessage(title, text, parent = undefined) {
        let today = new Date();
        let todayStr = today.toString().replace(/GMT.+/, "");
        $log.debug("Message Service - addmessage input(" + title + "," + text);
        $log.debug("Message Service - create message: " + ServerRequets.user() + " ," + todayStr + " ," + title);
        let newMessage = new Message(ServerRequets.user(), todayStr, title, text);
        $log.debug(newMessage);
        //let tmp = newMessage.createdAt + newMessage.createdBy;
        hashTable[newMessage.getID()] = newMessage;
        hashTable[newMessage]
        if (parent) {
            hashTable[parent].addMessage(newMessage);
        } else {
            rootMessageList.push(newMessage);
        }
    }

    function changeReadFlag(msgID) {
        $log.info("cahnge read state of " + msgID);
        hashTable[msgID].readFlag = false;
    }

    function getDetails(sesID) {
        return hashTable[sesID].text;
    }
    init();
    return {
        messageList: rootMessageList,
        findMessageByID: (id) => hashTable[id],
        addMessage: addMessage,
        chgFlag: changeReadFlag,
        getDetails: getDetails,
        lastMsgID: lastMsgID
    }
});

homeOwnSys.factory("VotingService", function ($log, $http, ServerRequets) {

    function extractUsers(votesRec) {
        let result = [];
        for (let op in votesRec) {
            for (let i = 0; i < votesRec[op].length; i++) {
                result.push(votesRec[op][i]);
            }
        }
        return result;
    }

    function Voting(by, dueDate, title, options, create = undefined) {
        let By = by;
        let dDate = dueDate == "No limit" ? dueDate : new Date(dueDate);
        let At = create ? create : new Date(create);

        let votes = {};
        let op = options;
        for (let i = 0; i < options.length; i++) {
            votes[options[i]] = [];
        }

        this.title = title;
        this.details = "";
        this.createdBy = () => By;
        this.createdAt = () => At;
        this.voteOp = (indx) => votes[indx].length;
        this.dueDate = () => dDate;
        this.options = () => op;
        this.users = () => extractUsers(votes);
        this.vote = (op, user) => votes[op].push(user);
    }

    function Vote(option) {
        this.votedBy = ServerRequets.user();
        this.voteVal = option;
    }

    Voting.prototype.addVote = function (voteRec) {
        let record = voteRec instanceof Vote ? voteRec : new Vote(voteRec);
        this.vote(record.voteVal, record.votedBy);
    }

    Voting.prototype.userVoted = function (userName) {
        let tmpList = this.users();
        for (let i = 0; i < tmpList.length; i++) {
            if (userName == tmpList[i])
                return true;
        }
        $log.debug(userName + " can Vote !");
        return false;
    }

    function getIndexVote(votingRec) {
        let tmpStr = "" + votingRec.createdBy() + votingRec.createdAt();

        return tmpStr.replace(/\s/g, "").replace(/GMT.+/, "");
    }
    let voteList = {};
    let vList = [];
    let urlAddress = new UrlAddress("");




    function getVoteResults(vKey) {
        let res = {};
        let vRec = voteList[vKey];
        let oList = vRec.options();
        for (let i = 0; i < oList.length; i++) {
            res[oList[i]] = vRec.vote(oList[i]);
        }
        return res;
    }

    function createVoting(jSon) {
        let requiredFields = ["dueDate", "title", "options"];
        for (let i = 0; i < requiredFields.length; i++)
            if (!requiredFields[i] in jSon)
                throw "missing field '" + requiredFields[i] + "' in record. skip this voting record";
        let tmpVotRec = jsonToVoteRec(jSon);
        let index = getIndexVote(tmpVotRec);
        voteList[index] = tmpVotRec;
        vList.push(index);
    }

    function load(jSon) {
        // clear hash table
        for (let k in voteList) delete voteList[k];
        vList.splice(0);
        for (let i = 0; i < jSon.length; i++) {
            createVoting(jSon[i]);
        }
    }

    function init() {
        let urladd = ServerRequets.localMode ? dbFolder + "/Votes.json" : "remoteServer-Vote";
        $log.debug("Votes-Service: load DB");
        let req = ServerRequets.sendSequredReq(urladd, {});
        req.then(load, () => { throw "Fail to load voting from DB" });
    }

    function jsonToVoteRec(jSon) {
        let by = jSon.hasOwnProperty("createdBy") ? jSon.createdBy : ServerRequets.user();
        let tmpVotRec = new Voting(by, jSon.dueDate, jSon.title, jSon.options,
            jSon.hasOwnProperty("createdAt") ? jSon.createdAt : undefined);
        if (jSon.hasOwnProperty("details")) tmpVotRec.details = jSon.details;
        if (jSon.hasOwnProperty("votes")) {
            for (let j = 0; j < jSon.votes.length; j++) {
                let vTmp = new Vote(jSon.votes[j].option);
                vTmp.votedBy = jSon.votes[j].user;
                tmpVotRec.addVote(vTmp);
            }
        }
        return tmpVotRec;
    }

    init();

    return {
        VotingList: vList,
        getVoting: (key) => voteList[key],

        getVoteOptions: (vKey) => voteList[vKey].options(),
        getVoteResults: getVoteResults,
        vote: (vKey, votVal) => voteList[vKey].addVote(votVal),
        userCanVote: (vKey) => !voteList[vKey].userVoted(ServerRequets.user()),
        addVotingRecord: createVoting
    }
});

homeOwnSys.factory("ServerRequets", function ($log, $http, $q) {
    let server = new UrlAddress("");
    let sessionID = "";
    let userAuthorization = "blocked";
    let userName = "";

    function sendRequest(url, jSonReq) {
        let res = $q.defer();
        server.fileName = url;
        $http.get(server.request(jSonReq)).then(
            function (responce) {
                $log.debug("- got answer from " + server.request({}));
                $log.debug("- calling resolve with " + responce.data);
                res.resolve(responce.data);
            }, function (responce) {
                $log.error("- failed to retreive " + server.request(jSonReq));
                $log.error("- server respose:");
                $log.error(responce);
                alert("Fail to retreive from " + server.request({}));
                res.reject();
            });
        return res.promise;
    }

    function sendSequredReq(url, jSonReq) {
        function validUser(v, f) {
            let valid = server.isLocal ? validateLocalSession : validateServerSession;
            if (valid()) {
                $log.debug("- session validation pass (" + sessionID + ")");
                v(url, jSonReq);
            } else {
                $log.debug("- session '" + sessionID + "' is not valid");
                alert("access denied");
                f();
            }
        }
        let res = $q.defer();
        let chkFun = $q(validUser);
        chkFun.then(function (u, j) {
            console.log("run validuser success url " + u + " options " + j);
            let tmp = sendRequest(u, j);
            console.log("got promise from send request ....");
            tmp.then(res.resolve, res.reject)
        }, function () { console.log("ooops validation failed?") });
        return res.promise;
    }

    function validateLocalSession() {
        //let bubub;
        if (sessionStorage != undefined) {
            if (!sessionStorage.hasOwnProperty("sessionID")) {
                $log.info("send request before login.");
                alert("Please login");
                return false;
            } else
                return sessionStorage.sessionID == sessionID;
        } else {
            $log.error("local storage is not supported. No security validation is avilable");
            //$log.debug(bubub);
            $log.debug(sessionStorage);
            return false;

        }
    }

    function validateServerSession() {
        $log.debug("server session validation is not implemented yet ...")
        return true;
    }

    function login(user, password, notifFunc) {
        if (server.isLocal) {
            function verifyUser(jSon) {
                for (let i = 0; i < jSon.length; i++) {
                    let jSonRec = jSon[i];
                    if (user == jSonRec.name && password == jSonRec.password) {
                        sessionID = Math.random().toString(36).substring(2, 15);
                        userAuthorization = jSonRec.isCommetee ? "Commetee" : "Regular";
                        userName = user;
                        sessionStorage.setItem("sessionID", sessionID);
                        notifFunc();
                        return;
                        //return sessionID;
                    }
                }
                $log.error("user or password are wrong. login faild");
                sessionID = "";
                userAuthorization = "blocked";
                userName = "";
                sessionStorage.removeItem("sessionID");
                notifFunc();
            }
            let req = sendRequest(dbFolder + "/users.json", {});
            req.then(verifyUser, function () { $log.error("login failed !") });
        } else {
            $log.info("Server login is not ready yet. use temporary autorization.");
            sessionID = "testMode-Login";
            userAuthorization = "Regular";
            notifFunc();
        }
    }

    function dummyLogin(user) {
        $log.info("Dummy login - working from local db only !");
        sessionID = "testMode-Login";
        userAuthorization = "Regular";
        userName = user;
        sessionStorage.setItem("sessionID", sessionID);
    }

    return {
        //sendRequest: sendRequest ,
        sendSequredReq: sendSequredReq,
        login: login,
        localMode: server.isLocal,
        user: () => userName,
        autherization: () => userAuthorization,
        dummyLogin: dummyLogin
    }

});