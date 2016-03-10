// DEFINE SOME GLOBAL VARIABLES 
var questions = null;
var currentQuestion = 0;
var questionsAnswered = 0;
var score = 0;

// EXECUTE IMMEDIATELY
$(document).ready( function() {    
    $('#pageQuestions').on('pageshow', function (){
        
        console.log ('pageshow: pageQuestions' );
        
        $('#btnPrev').unbind().on ('click', fPrev);
        $('#btnNext').unbind().on ('click', fNext);

        disable('#btnPrev');
        disable('#btnSubmit')
        enable('#btnNext');
        
        displayQuestion(0);
    });
    
    $('#pageLogin').on('pageshow', function() { 
      $('#btnLogin').on('click', fLogon);
      setupRegions();
    });
    
    $('#pageResults').on('pageshow', displayResults);

    // GET THE LIST OF QUESTIONS FROM THE FH SERVER
    // THERE ARE NO QUERY VALUES SO BLANK IS FINE
    
    $fh.cloud(
        {
            path: 'getquestions',
            data: { "query" : ""}
        },
      function (res) {
        console.log (res);
        questions = res;
      },
      function (code, errorprops, params) {
        alert('An error occured: ' + code + ' : ' + errorprops);
      }
  );
  

});

// LOGIN TO THE SERVER
var fLogon = function() {
    // RE-INITIALIZE IN CASE THEY RE-LOGIN 
    resetApp();
    
    // VALIDATE THAT THE EMAIL WAS FORMATTED PROPERLY e.g. foo@blah.com
    if (!validateEmail()){
        alert("Enter a valid Redhat email address!");
        return;
    }
    if ("" === document.getElementById('region').value){
        alert("PLEASE CHOOSE A REGION");
        return;
    } else {
        // VERIFY THAT THIS EMAIL HASN'T BEEN USED
        var email = $('#email').val();
        $fh.cloud(
          {
              path: 'verifyemail',
              data: { 'email' : email }
          }, 
          function (res) {
            if (res.count == 0){  
                // ALL GOOD, MOVE ON TO THE QUESITONS
                $.mobile.changePage('#pageQuestions');
                displayQuestion(0);
            } else {
                alert ('Sorry! You only get one try!');
                reassignAnswers(res.list[0].fields);
                $.mobile.changePage('#pageResults');
            }
          },
          function (code, errorprops, params) {
              alert('An error occured: ' + code + ' : ' + errorprops);
          }
        );
    }
};

// SUBMIT THE ANSWERS BACK TO THE SERVER FOR ANALYSIS
$('#btnSubmit').on( 'click', function () {
    var count = 0;
    var len = questions.length;
    var answers = "";
    
    // Figure out the score
    for (; count<len; count++){
      if (questions[count].choice == questions[count].correctAnswer){
          score++;
      }
      
      // Concatenate the answers into a comma separated string
      answers+= questions[count].choice;
      if (count<len-1){
          answers += ", ";
      }
    }
 
  var email = $('#email').val();
  var region = $('#region').val();

  $fh.cloud(
      {
        path: 'bettercallsaul',
        data: {
            "email"   : email,
            "region"  : region,
            "answers" : answers,
            "score"   : score
        }
      },
      function (res) {
        console.log (res.msg);
        // SHOW THE RESULTS PAGE
        $.mobile.changePage('#pageResults'); 
      },
      function (code, errorprops, params) {
        alert('An error occured: ' + code + ' : ' + errorprops);
      }
  );
});

// PREVIOUS BUTTON - LISTEN TO THE CLICK EVENT(S)
var fPrev = function(){  

    // DEBUG
    console.log('previous ..');
    console.log('currentQuestion: ' + currentQuestion);
    console.log('questionsAnswered: ' + questionsAnswered);
    // END DEBUG  
    enable ('#btnNext');

    if (currentQuestion == 1){
        disable('#btnPrev');
        currentQuestion--;
        displayQuestion( currentQuestion);    
    } else {
        currentQuestion--;
        displayQuestion(currentQuestion);
    }
};

// NEXT BUTTON - LISTEN TO THE CLICK EVENT(S)
var fNext = function() {    

    // DEBUG
    
    console.log('next ...');
    console.log('currentQuestion: ' + currentQuestion);
    console.log('questionsAnswered: ' + questionsAnswered);
    // END DEBUG  

    enable ('#btnPrev');
    if (currentQuestion == 8){
        disable('#btnNext');
        currentQuestion++;
        displayQuestion( currentQuestion);    
    } else {
        currentQuestion++;
        displayQuestion(currentQuestion);
    }
};

/*
** THIS WILL GENEARATE A SET OF RADIO BUTTONS (RB) WITHIN A FIELDSET.
** EACH RB WILL CALL A HANDLER TO MODIFY THE ANSWERED QUESTIONS
*/
function displayQuestion (currentQuestion){
    // VARIABLE CRAP
    var q = questions[currentQuestion];
    var a = q.answers;
    var len = a.length;
    var count = 0;

    // ADDED THE DIV CLASS TO SHOW A PROGRESS BAR. 
    // BILL - COMMENT THE LINE BELOW AND UNCOMMENT THE ONE BENEATH THAT
    // THIS IS SO THAT I CAN SEE IT'S WORKING
	var html = '<div class="meter"><span style="width:' + questionsAnswered + '0%">' + questionsAnswered + '0%</span></div>'
    // THIS THE ONE YOU WANT!!!!!
    //var html = '<div class="step"' + questionsAnswered +  '></div>'

    // THIS IS THE CONTAINER GROUP THAT WILL HOUSE THE RADIOBUTTONS 
    html += '<fieldset id="fsQuestions" data-role="controlgroup"><legend id="lgnd">' + q.question + '</legend>';

    // THIS IS THE QUESTION
    $('#lgnd').text(q.question);
    
    // THESE ARE THE POSSIBLE ANSWERS    
    for (; count < len; count++){
        // THIS ADJUSTS FOR ZERO INDEXED ARRAYS. MATCHES THAT VALUES THAT GET PERSISTED. 
        // E.G. USER CHOSE ANSWER 1 INSTEAD OF ANSWER 0
        var plus1 = count + 1;
        // IF WE'VE CHECKED THIS BOX ALREADY, THEN SHOW IT
        if (q.choice === plus1) {
            html += '<input type="radio" name="radio-choice-1" id="rb' + plus1 + '" onclick="rbClickHandler(' + plus1 + ')" checked="checked"><label for="rb' + plus1 + '" >' + a[count] + '</label>';
        // OTHERWISE, IT'S ALL CLEAR
        } else {
            html += '<input type="radio" name="radio-choice-1" id="rb' + plus1 + '" onclick="rbClickHandler(' + plus1 + ')"><label for="rb' + plus1 + '" >' + a[count] + '</label>';
        }
    }
    // END OF CONTAINER GROUP
    html += '</fieldset>';

    //  ADD THE HTML TO THE DIV
    $("#questionPanel").html(html);
 
    // REGENERATE THE PANEL
    $("#questionPanel").trigger('create');

}

// RADIO BUTTON CLICK HANDHLER
function rbClickHandler(value){
    var currentAnswer = questions[currentQuestion].choice;
    // first lets check to see if this question has never been answered
    if (currentAnswer==0){
        questionsAnswered++
    }
    // Okay .. now we can just update the value 
    questions[currentQuestion].choice = value
    if (questionsAnswered==10) {
        enable ('#btnSubmit');
    }
}

/*
** WOW OH WOW  - I CAN'T BELIEVE I'M CODING THIS.
** 1. TAKE THE ANSWERS STRING (3,6,3,6,1,2, ...) AND SPLIT INTO AN ARRAY
** 2. ASIGN THE VALUES BACK TO THE questions STRUCTURE
**
** THE RESULT IS THAT I CAN NOW REDISPLAY THE RESULTS FOR A PERSON WHO HAS
** ALREADY TAKE THE TEST.
**
** ICKY ... VERY ICKY!
*/

function reassignAnswers (response){
    var a = response.answers.split(',');
    var count = 0;
    var len = a.length;
    
    for (; count < len; count++){
        questions[count].choice = Number(a[count]);
    }
    
    score = response.score;
    displayResults();
}

/*
** DISPLAY THE RESULTS AND SCORE ON THE FINAL PAGE
*/
function displayResults(){
    var count = 0;
    var len = questions.length;
    
    var _html = '<h2 class="scoreHead">You got <strong>' + score + '</strong> out of <strong>' + questions.length + ' </strong>questions correct!</h2><ol type="1" class="scoreList">';
    for (; count < len; count++){

        var q = questions[count];
        // REMEBER - the answers are not zero indexed
        var correctAnswer = q.answers[q.correctAnswer - 1];
        var choice = q.answers[q.choice - 1];
        
        if (q.choice === q.correctAnswer){
            _html += '<li>' + q.question + '<p class="correctA">' + correctAnswer + '</p></li>';
        } else {
            _html += '<li>' + q.question + '<p class="correctA">' + correctAnswer + '</p><p class="wrongA">' + choice + '</p></li>';
        }
    }
    _html += '</ol>';
     $('#testResultsPanel').html(_html);             
}

// RESET QUESTIONS
function resetApp(){
    score = 0;
    currentQuestion = 0;
    questionsAnswered = 0;
    var count = 0;
    
    for (; count<10; count++){
        questions[count].choice = 0;
    }
    
}
// SHOW BUTTON
function enable(navbutton){
    //document.getElementById(navbutton).style.visibility='visible';
    //class="ui-disabled"
    $(navbutton).removeClass('ui-disabled');
}

// HIDE BUTTON
function disable(navbutton){
    //document.getElementById(navbutton).style.visibility='hidden';
    $(navbutton).addClass('ui-disabled');
}

// Validate the email format - 
// ** NEED TO CONVERT THIS TO JQUERY SYNTAX 
function validateEmail() {
    var pos = 0;
    var addr = document.getElementById('email').value;
    var atpos = addr.indexOf("@");
    var dotpos = addr.lastIndexOf(".");
    
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=addr.length) {
        return false;
    } else {
        // OKAY ... it's a valid email, now lets check for @redhat.com
        pos = addr.toLowerCase().indexOf('@redhat.com');
        if (pos > 0 ){
            return true;
        } else {
            return false;
        }
    }
}

function setupRegions(){
    $fh.cloud(
        {
            path: 'regions',
            data: { "region" : ""}
        },
      function (res) {
        console.log (res);
        $.each(res, function (index, option) {
            $('#region').append($('<option/>', { 
                value: option.value,
                text : option.text 
            }));
        });      
      },
      function (code, errorprops, params) {
        alert('An error occured: ' + code + ' : ' + errorprops);
      }
  );    
/*    
    var regions = [
        { 'value': 'wemea'  , 'text': 'WEMEA'},
        { 'value': 'cene'   , 'text': 'CENE'},
        { 'value': 'telco'  , 'text': 'Telco Vertical'},
        { 'value': 'other'  , 'text': 'Other'}
    ];    
    $.each(regions, function (index, option) {
        $('#region').append($('<option/>', { 
            value: option.value,
            text : option.text 
        }));
    });      
*/
    //$('#region').refesh();
}
