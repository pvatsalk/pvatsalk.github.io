let studentI = [
    ["I’m an international student in Canada. Can I work while studying?","You may be eligible to work in Canada while studying, if your study permit includes a condition that says you can work on or off campus. You must also meet all the other requirements. You can only start working in Canada when you start your study program. You can’t work before your studies begin."],
    ["Do I need a permit to study in Canada?","Most foreign nationals need a study permit to study in Canada. Some people in specific situations may not. Learn more about who needs a study permit.You should apply for a study permit before coming to Canada. Only some people can apply for a study permit from within Canada. Before you apply, you must have a letter of acceptance from a designated learning institution in Canada."],
    ["I want to change my school or study program. How can I change my study permit?","You don’t need to change your study permit if you’re changing your school or study program"],
    ["How can you check processing time for your application time?","Visit this Link to check \n https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html"],
];

let workI = [
    ["Is it possible for a student to work for a shorter or longer period within the context of the summer employment program?","A student can work for a shorter period, as negotiated with the hiring manager but cannot work for a longer period. "],
    ["What can a student expect in terms of wages?","The Senate applies the Student Rate of Pay approved by the Treasury Board Secretariat. The rates are calculated based on specific criteria (e.g. years of study, relevant work experience, etc.). "],
    ["Where to find a job efficiently?","Any retail sites, Linkdin, Canada Job Bank, Indeed."],
    ["Best Way to find job quickly...","Go physically to all the nearest places and give them your resumes."],
];

let flightI = [
    ["What travel documents do I need before I travel?","You'll find a list of embassies on the Embassy World https://www.embassy-worldwide.com/"],
    ["What’s the difference between a direct flight and a connecting flight?","In the aviation industry, a direct flight is any flight between two places that carries a single flight number, but which may include one or more stops where customers don’t have to change planes. Customers travelling on connecting flights need to change from one plane or airline to another at an intermediate point, called the connecting point, en route to their destination."],
    ["How do I choose my own seat?","1. When booking a new flight Select your seat from the seat map when you reach the Seat Selection screen.  2. After booking From the My Bookings tab on the homepage, retrieve your booking and then look for the Change Seats link"],
    ["How to upgrade my seat?","Check on the respective website and ask the agency for the free upgrade if possible"],
];

function fadeBlock(){
    $("#q1").fadeOut(1000);
    $("#q2").fadeOut(1000);
    $("#q3").fadeOut(1000);
    $("#q4").fadeOut(1000);
    $("#q1").fadeIn(1000);
    $("#q2").fadeIn(2000);
    $("#q3").fadeIn(3000);
    $("#q4").fadeIn(4000);
        // $('#block1').html("djskjd").css('color','blue').css('background','red');
}

$(document).ready(()=>{
    $('#generalI').click(()=>{
        fadeBlock();
        $('#qq1').html(flightI[0][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa1').html(flightI[0][1]).css('color','pink');
        $('#qq2').html(flightI[1][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa2').html(flightI[1][1]).css('color','pink');
        $('#qq3').html(flightI[2][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa3').html(flightI[2][1]).css('color','pink');
        $('#qq4').html(flightI[3][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa4').html(flightI[3][1]).css('color','pink');
    });




    $('#studentI').click(()=>{
        fadeBlock();
        $('#qq1').html(studentI[0][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa1').html(studentI[0][1]).css('color','pink');
        $('#qq2').html(studentI[1][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa2').html(studentI[1][1]).css('color','pink');
        $('#qq3').html(studentI[2][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa3').html(studentI[2][1]).css('color','pink');
        $('#qq4').html(studentI[3][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa4').html(studentI[3][1]).css('color','pink');
    });


    $('#flightI').click(()=>{
        fadeBlock();
        $('#qq1').html(flightI[0][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa1').html(flightI[0][1]).css('color','pink');
        $('#qq2').html(flightI[1][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa2').html(flightI[1][1]).css('color','pink');
        $('#qq3').html(flightI[2][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa3').html(flightI[2][1]).css('color','pink');
        $('#qq4').html(flightI[3][0]).css('color','white').css('font-weight','bold').css('font-size','larger');
        $('#aa4').html(flightI[3][1]).css('color','pink');
    });

});