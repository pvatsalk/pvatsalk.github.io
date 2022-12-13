let arrSection = [  "Future Prospects",  "Student Life",  "Work",  "Flights",  "Things to Carry",  "Accomodation",  "FAQ"];
let arrCountry = ["Select", "India", "China", "US", "Canada", "Others"];

let addSec = [];
arrSection.forEach((s) => {
  addSec += `<option>${s}</option>`;
});
document.getElementById("sectionHelp").innerHTML = addSec;

let addCountry = [];
arrCountry.forEach((s) => {
  addCountry += `<option>${s}</option>`;
});
document.getElementById("country").innerHTML = addCountry;

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "nav ul") {
    x.className += " responsive";
  } else {
    x.className = "nav ul";
  }
};

var animation = bodymovin.loadAnimation({
  container: document.getElementById("animation-container"),
  path: "./image/contact-us.json",
  renderer: "svg",
  loop: true,
  autoplay: true,
  name: "Animation",
});

function printertext(elemId, hintMsg) {
  document.getElementById(elemId).innerHTML = hintMsg;
}

function validate() {
  var fname = document.ContactUsForm.First_Name.value;
  var lname = document.ContactUsForm.Last_Name.value;
  var email = document.ContactUsForm.email.value;
  var numb = document.ContactUsForm.mobile.value;
  var country = document.ContactUsForm.country.value;
  var fnameErr = lnameErr = emailErr = numErr = countryErr = true;

  if (fname == "") {
    printertext("fnameErr", "Please enter your First Name");
  } else {
    var regex = /^[a-zA-Z\s]+$/;
    if (regex.test(fname) === false) {
      printertext("fnameErr", "Please enter a valid First Name");
    } else {
      printertext("fnameErr", "");
      fnameErr = false;
    }
  }

  if (lname == "") {
    printertext("lnameErr", "Please enter your Last Name");
  } else {
    var regex = /^[a-zA-Z\s]+$/;
    if (regex.test(lname) === false) {
      printertext("lnameErr", "Please enter a valid Last Name");
    } else {
      printertext("lnameErr", "");
      lnameErr = false;
    }
  }

  if (email == "") {
    printertext("emailErr", "Please enter your email address");
  } else {
    var regex = /^\S+@\S+\.\S+$/;
    if (regex.test(email) === false) {
      printertext("emailErr", "Please enter a valid email address");
    } else {
      printertext("emailErr", "");
      emailErr = false;
    }
  }

  if (numb == "") {
    printertext("numErr", "Please enter your mobile number");
  } else {
    var regex = /^[1-9]\d{9}$/;
    if (regex.test(numb) === false) {
      printertext("numErr", "Please enter a valid mobile number");
    } else {
      printertext("numErr", "");
      numErr = false;
    }
  }

  if(country == "Select") {
    printerrtext("countryErr", "Please select your country");
    } else {
    printerrtext("countryErr", "");
    countryErr = false;
    }

  if((fnameErr  || emailErr || numErr || countryErr) == true)
  {
    return false;

  } else {
    var dataPreview = "Kindly confirm your details: \n" + 
    "Full Name: " + fname + " " + lname + "\n" +
    "Email Address: " + email + "\n" +
    "Mobile Number: " + mobile + "\n";
    
    alert(dataPreview);
  }
};
