gsap.registerPlugin(ScrollTrigger);

var tl = gsap.timeline({ repeat: -1 });
tl.to(".eligibilitytext", 30, { backgroundPosition: "-960px 0" });

let b1 = 0;
let b2 = 0;
let b3 = 0;
let b4 = 0;
let b5 = 0;


$(document).ready(()=>{





  $('.no1').click(()=>{
    if(b1!=-1){
      $('.yes1').html("YES");
      $('.no1').html("NO (Selected)");
      b1=-1;
    }else{
      $('.no1').html("NO");
      b1=0;
    }
  });
  $('.yes1').click(()=>{
    if(b1!=1){
      $('.no1').html("NO");
      $('.yes1').html("YES (Selected)");
      b1=1;
    }else{
      $('.yes1').html("YES");
      b1=0;
    }
  });



  $('.no2').click(()=>{
    if(b2!=-1){
    $('.yes2').html("YES");
    $('.no2').html("NO (Selected)");
    b2=-1;
    }else{
    $('.no2').html("NO");
    b2=0;
    }
});
$('.yes2').click(()=>{
    if(b2!=1){
    $('.no2').html("NO");
    $('.yes2').html("YES (Selected)");
    b2=1;
    }else{
    $('.yes2').html("YES");
    b2=0;
    }
});



$('.no3').click(()=>{
    if(b3!=-1){
    $('.yes3').html("YES");
    $('.no3').html("NO (Selected)");
    b3=-1;
    }else{
    $('.no3').html("NO");
    b3=0;
    }
});
$('.yes3').click(()=>{
    if(b3!=1){
    $('.no3').html("NO");
    $('.yes3').html("YES (Selected)");
    b3=1;
    }else{
    $('.yes3').html("YES");
    b3=0;
    }
});



$('.no4').click(()=>{
    if(b4!=-1){
    $('.yes4').html("YES");
    $('.no4').html("NO (Selected)");
    b4=-1;
    }else{
    $('.no4').html("NO");
    b4=0;
    }
});
$('.yes4').click(()=>{
    if(b4!=1){
    $('.no4').html("NO");
    $('.yes4').html("YES (Selected)");
    b4=1;
    }else{
    $('.yes4').html("YES");
    b4=0;
    }
});



$('.no5').click(()=>{
    if(b5!=-1){
    $('.yes5').html("YES");
    $('.no5').html("NO (Selected)");
    b5=-1;
    }else{
    $('.no5').html("NO");
    b5=0;
    }
});
$('.yes5').click(()=>{
    if(b5!=1){
    $('.no5').html("NO");
    $('.yes5').html("YES (Selected)");
    b5=1;
    }else{
    $('.yes5').html("YES");
    b5=0;
    }
});

$('#check1').click(()=>{
    if(b1==1 && b2==1 && b3==1 && b4==1 && b5==1){
      $('#feedback1').html("Congratulation!! You are eligible to work");
    }else if(b1==-1 || b2==-1 || b3==-1 || b4==-1 || b5==-1){
      $('#feedback1').html("Sorry!! You are NOT eligible to work");
    }else if(b1==0 || b2==0 || b3==0 || b4==0 || b5==0){
      $('#feedback1').html("Select all the answers");
    }
});


// $('.box').hover(()=>{
//   $('.box').css("background-image","url(https://cdn.pixabay.com/photo/2017/07/03/20/17/abstract-2468874_960_720.jpg)").css('opacity','0.3');
// }, function() {
//   $('.box').css("background-color","red").css('opacity','1').css("background-image","").css('opacity','1')
// }
// );

// $('.red').mouceleave(()=>{
//   $('.red').css("background-color","red").css('opacity','1')
// });


});





// var animation = bodymovin.loadAnimation({
//   container: document.getElementById('animation-container'),
//   path: 'image/faqjson.json',
//   renderer: 'svg',
//   loop: true,
//   autoplay: true,
//   name: "Animation",
  
//   });  

// background-image: url(https://cdn.pixabay.com/photo/2017/07/03/20/17/abstract-2468874_960_720.jpg);
//   background-attachment: fixed;
//   -webkit-text-fill-color: transparent;
//   -webkit-background-clip: text;
var animation = bodymovin.loadAnimation({
  container: document.getElementById('animation-container'),
  path: 'image/certificate-for-graduation.json',
  renderer: 'svg',
  loop: true,
  autoplay: true,
  name: "Animation",
  size: 100
  });            
  
//   var animation = bodymovin.loadAnimation({
//     container: document.getElementById('animation-container2'),
//     path: 'image/search-not-found.json',
//     renderer: 'svg',
//     loop: true,
//     autoplay: true,
//     name: "Animation",
//     });                    

gsap.to(".topheading",{
    x:4,
    scrollTrigger:{
        trigger: ".topheading",
        start:"top center",
        scrub:1,
        toggleActions: "restart pause reverse pause",
        
    },
    // rotation: 360,
    duration: 3,
    fontSize: 300
}
);
// var textWrapper = document.querySelector('.ml3');
// textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

// anime.timeline({loop: false})
//   .add({
//     targets: '.ml3 .letter',
//     opacity: [0,1],
//     easing: "easeInOutQuad",
//     duration: 2000,
//     delay: (el, i) => 50 * (i+1)
//   }).add({
//     targets: '.ml3',
//     opacity: 0,
//     duration: 300,
//     easing: "easeOutExpo",
//     delay: 300
//   });



let svg = document.querySelector("svg");
let wibble = document.querySelector("#wibble");
var width = 100;
var pointz = 30;
var spacing = width / pointz;

let pointzArray = [];

for (var i = 0; i < pointz; i++) {
  var position = i / (pointz - 1);

  var point = wibble.points.appendItem(svg.createSVGPoint());

  point.x = i * spacing;
  point.y = 25;

  pointzArray.push(point);
}

let button = document.querySelector("button");
let isAnimating = false;

button.addEventListener("mouseenter", () => {
  if (isAnimating === true) {
    console.log("return");
    return;
  }

  isAnimating = true;

  pointzArray.forEach((point, index) => {
    var mapper = gsap.utils.mapRange(0, pointz, 0, 0.4);

    if (index === 0) {
      gsap
        .to(point, {
          keyframes: [
            { y: "+=6", ease: "Sine.easeInOut" },
            { y: "-=12", ease: "Sine.easeInOut" },
            { y: "+=6", ease: "Sine.easeInOut" }
          ],
          yoyo: true,
          duration: 0.6,
          onComplete: () => {
            isAnimating = false;
            console.log("ended");
          }
        })
        .progress(mapper(index));
    } else {
      gsap
        .to(point, {
          keyframes: [
            { y: "+=6", ease: "Sine.easeInOut" },
            { y: "-=12", ease: "Sine.easeInOut" },
            { y: "+=6", ease: "Sine.easeInOut" }
          ],
          yoyo: true,
          duration: 0.6
        })
        .progress(mapper(index));
    }
  });
});