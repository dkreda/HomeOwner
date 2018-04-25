function Comment(by, at, text) {
    this.createdBy = by;
    this.createdAt = at;
    this.text = text;
    //this.comments=[];
    //return { bb: "just test"};
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
    //this.details="free Text - of issue description. this example contains only text description but maybe is should contain mach" + 
    //"more complicated objects\nsuch as records , locations extera -. the text should be in\nseperate window so it would be\neasy to handle and\n" +
    //"to check with oooops fhfhfhf  jshdfjhs ksjdf ksdj fksjd f\ngjlkdfg \n\njfd gldk\nkfdjgd\n";
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

const dbFolder = "localDB";
homeOwnSys.directive("colapsCard", function () {
    return {
        templateUrl: templateFolder + "/acordListTemplate.html"
    }
    //return {template: "<p>Test of Directive ...</p>"};
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

//() => {templateUrl: "complexHeader.html"});
//Services
homeOwnSys.factory("issues", function ($log, $http) {
    $log.debug("Start issues Service ....");
    //let tmp = new Issue("Dummy", "Just now", "ergent", "Just for test");
    let initState = false;
    let isuList = [];
    let stateLevels = {
        "Open": 1,
        "Postponed": 2,
        "Closed": 3
    };
    //let isuList = [new Issue("apartment 12", "11:23 21 Jan 2017", "Default", "Dummy issue"),
    //new Issue("new neighbour", "17:25 21 May 2017", "Eargent", "elevetor 2 not works"),
    //new Issue("meme", "2:08 7 Jan 2018", "Very eargent", "load noice")];
    let openIssues = [];
    let closeIssues = [];
    let overdueIssues = [];

    let urlBuilder = new UrlAddress("");
    if (!initState)
        load();
    $log.debug("Change init state to " + initState);

    function createIssue(rec) {
        res = new Issue(rec.createdBy, rec.createdAt, rec.title);
        for (key in res) {
            if (rec.hasOwnProperty(key))
                res[key] = rec[key];
        }
        return res;
    }

    function initLocal() {
        $log.debug("local mode reading Jason file ...");
        //let urladd=buildRequest("issues.json", {});
        urlBuilder.fileName = dbFolder + "/issues.json";
        let urladd = urlBuilder.request({});
        $log.debug(urladd);
        $http.get(urladd).then(function (responce) {
            $log.info("answer arrived: " + responce);
            for (let key in responce) {
                $log.debug(key + " > " + responce[key]);
            }
            $log.debug("overwrite isuList " + isuList.length);
            $log.debug(isuList[0]);
            isuList.splice(0);
            for (let i = 0; i < responce.data.length; i++) {
                isuList.push(createIssue(responce.data[i]));
            }
            $log.debug("isuList content:");
            $log.debug(isuList);
            $log.debug(isuList[0]);
            let tttmp = isuList[0];
            $log.debug(tttmp.getID());
            $log.debug(isuList[0].getID());
            $log.debug("----------------------");
            load();
            //isuList = responce.data;
            /*
            let db = responce.data;
            $log.info("===== content:");
            for (let i = 0; i < db.length; i++) {
                let dbRec = db[i];
                for (let key in dbRec) {
                    $log.debug(key + " > " + dbRec[key]);
                }
            }*/
        }, function (res) {
            $log.info(urladd);
            alert("Fail to read DB ..." + "\n Read from:\n " + urladd);
        });
    }

    function load() {
        initState = true;
        if (urlBuilder.isLocal) {
            if (isuList.length > 0) {
                openIssues.splice(0);
                closeIssues.splice(0);
                for (let i = 0; i < isuList.length; i++) {
                    let rec = isuList[i];
                    let curent = new Date();
                    //$log.debug(rec.dueDate + " > " + curent + (Date.parse(rec.dueDate) < curent.getTime() ? "OverDue" : Date.parse(rec.dueDate)));
                    if (rec.status != "Closed") {
                        if (rec.dueDate != "No limit" & Date.parse(rec.dueDate) < curent.getTime())
                            overdueIssues.push(rec)
                        else openIssues.push(rec);
                    } else
                        closeIssues.push(rec);


                }
                $log.debug(" - finishe to load local json.");
                $log.debug(openIssues);

            } else {

                initLocal();
                //load();
            }
        } else {
            urlBuilder.fileName = "test.php";
            let req = { filter: "closedIssues" };
            $http.get(urlBuilder.request(req)).then(function (res) { closeIssues = res.data });
            req = { filter: "openIssues" };
            $http.get(urlBuilder.request(req)).then(function (res) { openIssues = res.data });
        }
    }

    function findIssue(isuID) {
        for (let i = 0; i < isuList.length; i++) {
            if (isuList[i].getID() == isuID) {
                return isuList[i];
            }
        }
    }

    function changeReadFlag(isuID) {
        $log.info("cahnge read state of " + isuID);
        for (let i = 0; i < isuList.length; i++) {
            if (isuList[i].getID() == isuID) {
                isuList[i].readFlag = false;
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

    //$log.debug("about to return ....");
    return {
        //issue: tmp,
        openIssues: openIssues,
        closedIssues: closeIssues,
        overdueIssues: overdueIssues,
        //listOfIsues: isuList,
        chgFlag: changeReadFlag,
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


homeOwnSys.factory("UserManager", function ($log, $http) {
    $log.debug("Start user service ....");
    let userList = [];
    let urlAddress = new UrlAddress("");
    let autherization = "blocked";
    let sessionID = "";
    let userRec = {};

    function initLocal() {
        $log.debug("local mode reading Jason file ...");
        //let urladd=buildRequest("issues.json", {});
        urlAddress.fileName = dbFolder + "/users.json";
        let urladd = urlAddress.request({});
        $log.debug(urladd);
        $http.get(urladd).then(function (responce) {
            $log.info("answer arrived: " + responce);
            for (let key in responce) {
                $log.debug(key + " > " + responce[key]);
            }
            $log.debug("overwrite userList " + userList.length);
            $log.debug(userList[0]);
            userList.splice(0);
            for (let i = 0; i < responce.data.length; i++) {
                let tmp = responce.data[i];
                userList.push(new UserObj(tmp.name, tmp.password, tmp.appartment, tmp.mail, tmp.isCommetee));
            }
            $log.debug("userList content:");
            $log.debug(userList);
            $log.debug(userList[0]);
            $log.debug("----------------------");
            //load();
            //isuList = responce.data;
            /*
            let db = responce.data;
            $log.info("===== content:");
            for (let i = 0; i < db.length; i++) {
                let dbRec = db[i];
                for (let key in dbRec) {
                    $log.debug(key + " > " + dbRec[key]);
                }
            }*/
        }, function (res) {
            $log.info(urladd);
            alert("Fail to read DB ..." + "\n Read from:\n " + urladd);
        });
    };

    function findUser(user) {
        if (urlAddress.isLocal) {
            for (let i = 0; i < userList.length; i++) {
                let tmp = userList[i];
                if (tmp.name == user || tmp.mail == user)
                    return tmp;
            }
            $log.debug("user " + user + " not found > " + userList.length);
        }
        return {};
    }

    function validate(user, password) {
        //$log.debug(urlAddress);
        if (urlAddress.isLocal) {
            userRec = findUser(user);
            if ( userRec instanceof UserObj && userRec.validatePassword(password)) {
                $log.debug("user " + user + " pass authendication");
                autherization = userRec.isCommetee ? "Commetee" : "Regular" ;
                sessionID = Math.random().toString(36).substring(2, 15);
            } else {
                $log.error("authendication of " + user + " failed");
                autherization = "blocked" ;
                sessionID ="" ;
            }
            /*
            $log.debug("user is " + user);
            $log.debug(userRec);
            $log.debug("check property name " + userRec.hasOwnProperty("name"));
            autherization = userRec.hasOwnProperty("name") ? userRec.validatePassword(password) : "blocked"; // can be "blocked" , "Regular" , "Commity"
            sessionID = autherization != "blocked" ? Math.random().toString(36).substring(2, 15) : "";
            */
            

        } else {
            $log.info("Server validation is not ready yet");
            sessionID = "testMode-Login";
            autherization="Regular";
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
            let retVal=sessionID == session ? autherization : "blocked";
            $log.debug("autherization : " + retVal + " for session " + session);
            return retVal;
        }
    };

    initLocal();

    return {
        login: validate,
        autherization: verifyAuth,
        user: () => userRec.name,
        sessionID: () => sessionID ? sessionID : "",
        setAuthenticationServer: function (url) { urlAddress = new UrlAddress(url); }
    };
});

homeOwnSys.factory("Messages", function ($log, $http, UserManager) {
    $log.debug("Start Messages service ....");
    let messageList = [];
    let urlAddress = new UrlAddress("");
    let hashTable = {};
    let lastMsgID = 0;

    function createMessage(objRec) {
        //$log.debug("create new message from json object:");
        //$log.debug(objRec);
        let tmp = new Message(objRec.createdBy, objRec.createdAt, objRec.title, objRec.text);
        if (objRec.hasOwnProperty("readFlag"))
            tmp.readFlag = objRec.readFlag;
        for (let i = 0; i < objRec.mesageList.length; i++) {
            tmp.addMessage(createMessage(objRec.mesageList[i]));
            //$log.debug("after add message");
            //$log.debug(tmp.mesageList[0].createdBy);
        }
        return tmp;
    }

    function lookupTable(arrayMessage) {
        //$log.debug("analyze array >" );
        //$log.debug(arrayMessage);
        for (let i = 0; i < arrayMessage.length; i++) {
            //let tmp = arrayMessage[i].createdAt + arrayMessage[i].createdBy;
            hashTable[arrayMessage[i].getID()] = arrayMessage[i];
            lookupTable(arrayMessage[i].mesageList);
        }
    }

    function initLocal() {
        urlAddress.fileName = dbFolder + "/Messages.json";
        let urladd = urlAddress.request({});
        $log.debug("Messages-Service: local mode reading Jason file " + urladd);
        $http.get(urladd).then(function (responce) {
            $log.info("answer arrived: " + responce);
            //$log.debug("overwrite userList " + userList.length);
            //$log.debug(userList[0]);
            messageList.splice(0);
            for (let i = 0; i < responce.data.length; i++) {
                //let tmp = ;
                messageList.push(createMessage(responce.data[i]));
            }
            lookupTable(messageList);
            //$log.debug("userList content:");
            //$log.debug(userList);
            //$log.debug(userList[0]);
            //$log.debug("----------------------");
        }, function (res) {
            $log.info(urladd);
            alert("Fail to read DB ..." + "\n Read from:\n " + urladd);
        });
    };

    function addMessage(title, text, parent = undefined) {
        let today = new Date();
        let todayStr = today.toString().replace(/GMT.+/, "");
        $log.debug("Message Service - addmessage input(" + title + "," + text);
        $log.debug("Message Service - create message: " + UserManager.user() + " ," + todayStr + " ," + title);
        let newMessage = new Message(UserManager.user(), todayStr, title, text);
        $log.debug(newMessage);
        //let tmp = newMessage.createdAt + newMessage.createdBy;
        hashTable[newMessage.getID()] = newMessage;
        hashTable[newMessage]
        if (parent) {
            hashTable[parent].addMessage(newMessage);
        } else {
            messageList.push(newMessage);
        }
    }

    function changeReadFlag(msgID) {
        $log.info("cahnge read state of " + msgID);
        hashTable[msgID].readFlag = false;
        /*
        for (let i = 0; i < messageList.length; i++) {
            if (messageList[i].getID() == isuID) {
                messageList[i].readFlag = false;
            }
        } */
    }

    function getDetails(sesID) {
        return hashTable[sesID].text;
    }


    initLocal();
    return {
        messageList: messageList,
        findMessageByID: (id) => hashTable[id],
        addMessage: addMessage,
        chgFlag: changeReadFlag,
        getDetails: getDetails,
        lastMsgID: lastMsgID
    }
});

homeOwnSys.factory("VotingService", function ($log, $http, UserManager) {

    function extractUsers(votesRec) {
        let result = [];
        //$log.debug("call external func with");
        //$log.debug(votesRec);
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

        //this.vv = votes;
        
    }

    function Vote(option) {
        this.votedBy = UserManager.user();
        this.voteVal = option;
    }

    Voting.prototype.addVote = function (voteRec) {
        let record = voteRec instanceof Vote ? voteRec : new Vote(voteRec);
        this.vote(record.voteVal, record.votedBy);
        //$log.debug("before vote" + this.users().length);
        //$log.debug(this.vv.toString());
        
    }

    Voting.prototype.userVoted = function (userName) {
        let tmpList = this.users();
        //$log.debug(tmpList);
        for (let i = 0; i < tmpList.length; i++) {
            if (userName == tmpList[i])
                return true;
        }
        $log.debug(userName + " can Vote !");
        return false;
    }

    function getIndexVote(votingRec) {
        //$log.debug(votingRec.createdBy() + " create at - " + votingRec.createdAt())
        let tmpStr = "" + votingRec.createdBy() + votingRec.createdAt();

        return tmpStr.replace(/\s/g, "").replace(/GMT.+/, "");
    }
    let voteList = {};
    let vList = [];
    let urlAddress = new UrlAddress("");

    function initLocal() {
        urlAddress.fileName = dbFolder + "/Votes.json";
        let urladd = urlAddress.request({});
        $log.debug("Votes-Service: local mode reading Jason file " + urladd);
        $http.get(urladd).then(function (responce) {
            $log.info("answer arrived: " + responce);
            // clear hash table
            for (let k in voteList) delete voteList[k];
            vList.splice(0);
            //let mask={createdBy: 0,dueDate:0,title:0,votes:0}
            for (let i = 0; i < responce.data.length; i++) {
                createVoting(responce.data[i]);
                /*
                let tmpJson = responce.data[i];
                let tmpVotRec = new Voting(tmpJson.createdBy, tmpJson.dueDate, tmpJson.title, tmpJson.options,
                    tmpJson.hasOwnProperty("createdAt") ? tmpJson.createdAt : undefined);
                if (tmpJson.hasOwnProperty("details")) tmpVotRec.details = tmpJson.details;
                if (tmpJson.hasOwnProperty("votes")) {
                    for (let j = 0; j < tmpJson.votes.length; j++) {
                        let vTmp = new Vote(tmpJson.votes[j].option);
                        vTmp.votedBy = tmpJson.votes[j].user;
                        tmpVotRec.addVote(vTmp);
                    }
                }
                //$log.debug("Voting Object:");
                //$log.debug(tmpVotRec);
                //$log.debug(tmpVotRec.userVoted());
                voteList[getIndexVote(tmpVotRec)] = tmpVotRec;*/
            }
            //getAllVotes();
        }, function (res) {
            $log.info(urladd);
            alert("Fail to read DB ..." + "\n Read from:\n " + urladd);
        });
    };

    initLocal();
    /*
    function getAllVotes() {
        vList.splice(0);
        for (let k in voteList) vList.push(k);
        return vList;
    }*/

    function getVoteResults(vKey) {
        let res = {};
        let vRec = voteList[vKey];
        let oList = vRec.options();
        for (let i = 0; i < oList.length; i++) {
            res[oList[i]] = vRec.vote(oList[i]);
        }
        return res;
    }

    function createVoting(jSon){
        let requiredFields=["dueDate", "title", "options"];
        for ( let i=0 ; i< requiredFields.length; i++) 
            if ( ! requiredFields[i] in jSon )
                throw "missing field '" + requiredFields[i] +"' in record. skip this voting record";
        let tmpVotRec = jsonToVoteRec(jSon);
        let index=getIndexVote(tmpVotRec);
        voteList[index] = tmpVotRec;
        vList.push(index);
    }

    function jsonToVoteRec(jSon){
        let by=jSon.hasOwnProperty("createdBy") ? jSon.createdBy : UserManager.user();
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

    
    //getAllVotes();

    return {
        VotingList: vList,
        getVoting: (key) => voteList[key],

        getVoteOptions: (vKey) => voteList[vKey].options(),
        getVoteResults: getVoteResults,
        vote: (vKey, votVal) => voteList[vKey].addVote(votVal),
        userCanVote: (vKey) => !voteList[vKey].userVoted(UserManager.user()),
        addVotingRecord: createVoting
    }
});