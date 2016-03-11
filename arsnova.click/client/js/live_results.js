Template.live_results.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.instructor', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('Sessions.question', Session.get("hashtag"));
    });
});

Template.live_results.helpers({
    result: function () {
        var result = [];
        var memberAmount = Responses.find({hashtag: Session.get("hashtag")}).count();
        var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        if(false && answerOptions){ //survey
            AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? ( Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: -1});
            });
        } else { //MC / SC
            if(answerOptions === 1){ //SC
                AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){
                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? (Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: value.isCorrect});
                });

            } else { //MC
                AnswerOptions.find({hashtag: Session.get("hashtag")}).forEach(function(value){

                    var amount = Responses.find({hashtag: Session.get("hashtag"), answerOptionNumber: value.answerOptionNumber}).count();
                    result.push({name: String.fromCharCode(value.answerOptionNumber + 65), absolute: amount, percent: memberAmount ? ( Math.floor((amount * 100) / memberAmount)) : 0, isCorrect: value.isCorrect});
                });
            }
        }
        return result;
    },
    isMC: function(){
        var answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return answerOptions > 1;
    },
    mcOptions: function(){
        //TODO memberAmount wrong
        const memberAmount = Responses.find({hashtag: Session.get("hashtag")}).count();
        const correctAnswers = [];
        AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect:1},{fields:{"answerOptionNumber":1}}).forEach(function (answer){
            correctAnswers.push(answer.answerOptionNumber);
        });
        let allCorrect = 0;
        let allWrong = 0;
        MemberList.find({hashtag: Session.get("hashtag")}).forEach(function(user){
            let responseAmount = 0;
            let everythingRight = true;
            let everythingWrong = true;
            Responses.find({hashtag: Session.get("hashtag"), userNick: user.nick}).forEach(function (response){
                if($.inArray(response.answerOptionNumber, correctAnswers)){
                    everythingWrong = false;
                }else{
                    everythingRight = false;
                }
                responseAmount++;
            });
            if(responseAmount){
                if(everythingRight && responseAmount === correctAnswers.length){
                    allCorrect++;
                }
                if(everythingWrong){
                    allWrong++;
                }
            }
        });
        return {
            allCorrect: {absolute: allCorrect, percent: allCorrect/memberAmount},
            allWrong: {absolute: allWrong, percent: allWrong/memberAmount}
        };
    } 
});



Template.live_results.events({
    "click #js-btn-showQuestionModal": function () {
        $('.questionContentSplash').parents('.modal').modal();
    },
    "click #js-btn-showAnswerModal": function () {
        $('.answerTextSplash').parents('.modal').modal();
    }

});


Template.result_button.helpers({
    getCSSClassForIsCorrect: function (isCorrect) {
        if (isCorrect > 0) {
            return 'progress-success';
        } else if (isCorrect < 0) {
            return 'progress-default';
        } else {
            return 'progress-failure';
        }
    }
});
