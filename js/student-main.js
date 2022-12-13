
gsap.registerPlugin(ScrollTrigger);

gsap.to(".text1",{
    x:4,
    scrollTrigger:{
        trigger: ".text1",
        start:"top bottom",
        scrub:1,
        toggleActions: "restart pause reverse pause"
    },
    // rotation: 360,
    duration: 3,
    fontSize: 100
}
);

gsap.to(".BlockMainHeading",{
    height:1000,
    scrollTrigger:{
        trigger: ".BlockMainHeading",
        start:"top center",
        end :"top 10px",
        scrub:1,
        toggleActions: "restart pause reverse pause"
    },
    // rotation: 360,
    duration: 3,
    fontSize: 30
}
);