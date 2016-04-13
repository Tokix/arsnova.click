Template.questionList.onCreated(function () {
    Session.set("valid_questions",[]);

    this.subscribe("EventManager.join",Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
    this.subscribe('AnswerOptions.instructor', localData.getPrivateKey(), Session.get("hashtag"));

    this.autorun(() => {
        if(this.subscriptionsReady()) {
            if (!QuestionGroup.findOne()) return;

            var questionList = QuestionGroup.findOne().questionList;
            var valid_questions = Session.get("valid_questions");
            if(questionList.length >= valid_questions.length) return;

            valid_questions.splice(questionList.length - 1, valid_questions.length - questionList.length);

            Session.set("valid_questions",valid_questions);
        }
    });
});

Template.questionList.helpers({
    question: function () {
        var doc = QuestionGroup.findOne();
        return doc ? doc.questionList : false;
    },
    getNormalizedIndex: function (index) {
        return index + 1;
    },
    isActiveIndex: function (index) {
        if(!EventManager.findOne()) return;
        return index === EventManager.findOne().questionIndex;
    },
    hasCompleteContent: function (index) {
        var valid_questions = Session.get("valid_questions");
        valid_questions[index] = checkForValidQuestions(index);
        Session.set("valid_questions",valid_questions);
        return valid_questions[index];
    }
});

Template.questionList.events({
    'click .questionIcon:not(.active)': function (event) {
        Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_","")));
    },
    'click .removeQuestion': function (event) {
        var id = parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_",""));
        if(id > 0) {
            Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), (id - 1));
        }

        Meteor.call('AnswerOptions.deleteOption',{
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: id,
            answerOptionNumber: -1
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                Meteor.call("QuestionGroup.removeQuestion", {
                    privateKey: localData.getPrivateKey(),
                    hashtag: Session.get("hashtag"),
                    questionIndex: id
                }, (err, res) => {
                    if (err) {
                        $('.errorMessageSplash').parents('.modal').modal('show');
                        $("#errorMessage-text").html(err.reason);
                    } else {
                        localData.removeQuestion(Session.get("hashtag"), id);
                        if (QuestionGroup.findOne().questionList.length === 0) {
                            addNewQuestion();
                        }
                    }
                });
            }
        });
    },
    'click #addQuestion': function (event) {
        addNewQuestion();
        setTimeout(()=> {
            let scrollPane = $(".questionScrollPane");
            scrollPane.scrollLeft(scrollPane.width());
        }, 200);

    }
});

function checkForValidQuestions(index) {
    var questionDoc = QuestionGroup.findOne();
    var answerDoc = AnswerOptions.find({questionIndex: index});
    if(!questionDoc || !answerDoc) return false;

    var question = questionDoc.questionList[index];
    if(!question) return false;

    if(!question.questionText || question.questionText.length < 5 || question.questionText.length > 10000) return false;
    if(!question.timer || isNaN(question.timer) || question.timer < 5000 || question.timer > 260000) return false;

    var hasValidAnswers = false;
    answerDoc.forEach(function (value) {
        if(typeof value.answerText === "undefined" || value.answerText.length <= 500) hasValidAnswers = true;
    });
    return hasValidAnswers;
}

function addNewQuestion(){
    var index = QuestionGroup.findOne().questionList.length;
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: index,
        questionText: ""
    }, (err, res) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            for(var i = 0; i < 4; i++) {
                Meteor.call('AnswerOptions.addOption',{
                    privateKey:localData.getPrivateKey(),
                    hashtag:Session.get("hashtag"),
                    questionIndex: index,
                    answerOptionNumber:i,
                    answerText:"",
                    isCorrect:0
                });
            }
            
            localData.addQuestion(Session.get("hashtag"), QuestionGroup.findOne().questionList.length, "");

            var valid_questions = Session.get("valid_questions");
            valid_questions[index] = false;
            Session.set("valid_questions",valid_questions);

            Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), index);
        }
    });
}