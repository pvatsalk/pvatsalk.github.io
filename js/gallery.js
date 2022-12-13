$(document).ready(()=>{
  
  $('#gc1,#gc2,#gc3,#gc4,#gc5,#gc6,#gc7,#gc8,#gc9,#gc10,#gc11,#gc12,#gc13').fadeOut(1000);

  $('#pat1').hover(()=>{
      $('#gc1').fadeIn(1000);

      let nextSlide = $('#gc1 img:first-child');

      // start slide show
      setInterval(() => {
        $('#gc1').fadeOut(1000);
        $('#gc1').fadeIn(1000, () => {
          if (nextSlide.next().length == 0) {
            nextSlide = $('#gc1 img:first-child');
          } else {
            nextSlide = nextSlide.next();
          }
          const nextSlideSource = nextSlide.attr('src');
          const nextCaption = nextSlide.attr('alt');
          $('#gc1').attr('src', nextSlideSource).fadeIn(1000);
          $('#gc1').text(nextCaption).fadeIn(1000);
        }); // end fadeOut()
      }, 3000); // end setInterval()


  });

  $('#pat2').hover(()=>{
    $('#gc2').fadeIn(1000);
  });

  $('#pat3').hover(()=>{
    $('#gc3').fadeIn(1000);
  });

  $('#pat4').hover(()=>{
    $('#gc4').fadeIn(1000);
  });

  $('#pat5').hover(()=>{
    $('#gc5').fadeIn(1000);
  });

  $('#pat6').hover(()=>{
    $('#gc6').fadeIn(1000);
  });

  $('#pat7').hover(()=>{
    $('#gc7').fadeIn(1000);
  });

  $('#pat8').hover(()=>{
    $('#gc8').fadeIn(1000);
  });

  $('#pat9').hover(()=>{
    $('#gc9').fadeIn(1000);
  });

  $('#pat10').hover(()=>{
    $('#gc10').fadeIn(1000);
  });

  $('#pat11').hover(()=>{
    $('#gc11').fadeIn(1000);
  });

  $('#pat12').hover(()=>{
    $('#gc12').fadeIn(1000);
  });

  $('#pat13').hover(()=>{
    $('#gc13').fadeIn(1000);
  });

  // $('#im11').attr('src', nextSlideSource).fadeIn(1000);
 
  

});

gsap.registerPlugin(ScrollTrigger);

// gsap.to("h1",{
//     x:4,
//     scrollTrigger:{
//         trigger: "h1",
//         start:"top bottom",
//         scrub:1,
//         toggleActions: "restart pause reverse pause"
//     },
//     // rotation: 360,
//     duration: 3,
//     fontSize: 100,
// }
// );

gsap.utils.toArray('.section').forEach((section, i) => {
  
    if(section.getAttribute('data-color') !== null) {
      
      var colorAttr = section.getAttribute('data-color')
      
      gsap.to(".wrap", {
        backgroundColor: colorAttr === "dark" ? gsap.getProperty("html", "--dark") : gsap.getProperty("html", "--light"),
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          start:'top bottom',
          end: '+=100%'
        }
      });
  
    }
    
  });

//   gsap.to("pat",{
//     x:4,
//     scrollTrigger:{
//         trigger: "pat",
//         start:"top bottom",
//         scrub:1,
//         toggleActions: "restart pause reverse pause"
//     },
//     // rotation: 360,
//     duration: 3,
//     fontSize: 100,
// }
// );
