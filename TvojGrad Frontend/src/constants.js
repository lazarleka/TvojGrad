export const EVENTS_DATA = [
  { id:1, title:"Jazz večer u Tivtu", category:"Muzika", date:"2026-05-25", time:"20:00", city:"Tivat", location:"Porto Montenegro", price:0, desc:"Opustite se uz živi jazz program na otvorenom. Nastupaju lokalni i gostujući muzičari u čarobnom ambijentu marine.", emoji:"🎷", votes:{up:42,down:3}, promoted:true, status:"approved", organizer:"MuzičkiKlub", coverColor:"#1D9E75", coverImg:null },
  { id:2, title:"Maraton zdrave hrane", category:"Sport", date:"2026-05-28", time:"09:00", city:"Podgorica", location:"Trg Republike", price:0, desc:"Pridružite se trčanju za zdravlje i upoznajte fitnes zajednicu Podgorice.", emoji:"🏃", votes:{up:31,down:5}, promoted:false, status:"approved", organizer:"SportskiSavez", coverColor:"#3B6D11", coverImg:null },
  { id:3, title:"Izložba savremene umjetnosti", category:"Kultura", date:"2026-05-30", time:"18:00", city:"Podgorica", location:"MSUV", price:3, desc:"Grupna izložba mladih crnogorskih umjetnika. Djela koja istražuju identitet, prirodu i urbani prostor.", emoji:"🎨", votes:{up:18,down:2}, promoted:true, status:"approved", organizer:"GalerijaArt", coverColor:"#533AB7", coverImg:null },
  { id:4, title:"Tech Meetup Podgorica", category:"Edukacija", date:"2026-06-01", time:"17:30", city:"Podgorica", location:"Hub 387", price:0, desc:"Predavanja o AI, startap ekosistemu i karijerama u tehnologiji. Networking sa programerima i preduzetnicima.", emoji:"💻", votes:{up:55,down:4}, promoted:false, status:"approved", organizer:"TechHub", coverColor:"#185FA5", coverImg:null },
  { id:5, title:"Stand-up komedija veče", category:"Zabava", date:"2026-06-03", time:"21:00", city:"Bar", location:"Restoran Galeb", price:5, desc:"Smijte se do suza uz nastupe vodećih stand-up komičara regiona.", emoji:"🎤", votes:{up:29,down:1}, promoted:false, status:"approved", organizer:"ComedyBar", coverColor:"#BA7517", coverImg:null },
  { id:6, title:"Književna večer", category:"Kultura", date:"2026-06-05", time:"19:00", city:"Budva", location:"Gradska biblioteka", price:0, desc:"Čitanje ulomaka iz novih romana crnogorskih autora uz razgovor i potpisivanje knjiga.", emoji:"📚", votes:{up:12,down:0}, promoted:false, status:"approved", organizer:"Biblioteka", coverColor:"#993556", coverImg:null },
  { id:7, title:"Večer flamenka", category:"Muzika", date:"2026-06-08", time:"20:30", city:"Budva", location:"Stari Grad", price:8, desc:"Strastveni plesači i gitaristi iz Španije donose autentični flamenco na pozornicu Budve.", emoji:"💃", votes:{up:22,down:1}, promoted:true, status:"pending", organizer:"CulturaViva", coverColor:"#993C1D", coverImg:null },
  { id:8, title:"Startup vikend", category:"Edukacija", date:"2026-06-10", time:"10:00", city:"Podgorica", location:"Montenegro Business Center", price:15, desc:"48 sati intenzivnog rada na startup idejama uz mentorstvo iskusnih preduzetnika.", emoji:"🚀", votes:{up:8,down:0}, promoted:false, status:"approved", organizer:"TechHub", coverColor:"#0C447C", coverImg:null },
];

export const PSM_USERS = [
  { id:"u1", name:"Ana Kovačević", initials:"AK" },
  { id:"u2", name:"Marko Petrović", initials:"MP" },
  { id:"u3", name:"Sara Jovanović", initials:"SJ" },
  { id:"u4", name:"Luka Đurović", initials:"LĐ" },
];

export const CATEGORIES = ["Sve","Muzika","Sport","Kultura","Edukacija","Zabava"];
export const CITIES = ["Svi gradovi","Podgorica","Bar","Budva","Tivat","Nikšić"];
export const CAT_COLORS = { Muzika:"#1D9E75", Sport:"#3B6D11", Kultura:"#533AB7", Edukacija:"#185FA5", Zabava:"#BA7517" };

export const G = {
  green:"#1D9E75", greenDark:"#085041", greenLight:"#E1F5EE",
  greenMid:"#9FE1CB", ink:"#0f1a14", paper:"#f7faf8",
  muted:"#6b7c73", border:"rgba(29,158,117,0.18)",
  danger:"#E24B4A", warning:"#BA7517", purple:"#533AB7",
};
