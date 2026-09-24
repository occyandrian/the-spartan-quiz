const QUESTIONS=[
{id:1,text:"Kekerabatan di The Spartan, kita biasa menyebut Andre dengan julukan:",options:["Laga Bomba","Imut","Galak","Om Andrew"],multi:false},
{id:2,text:"Kekerabatan di The Spartan, kita biasa menyebut nama FPGFCM. dengan sebutan:",options:["Bima","Ler","Dewazeus","Om"],multi:false},
{id:3,text:"Kekerabatan The Spartan, siapa saja admin Spartan? (pilih lebih dari 1)",options:["Mocca_","Andre","FPG","NNAEN"],multi:true},
{id:4,text:"Berapa jumlah hattrick Leo Messi di LaLiga?",options:["36","15","20","38"],multi:false},
{id:5,text:"Siapa pencetak assist terbanyak di LaLiga?",options:["C. Ronaldo","Xavi","Iniesta","Messi"],multi:false},
{id:6,text:"Siapa pendribel handal di Chelsea *2017*?",options:["Eden Hazard","Mauro Dinaira","Willias Proquista","Messi"],multi:false},
{id:7,text:"Club apa yang memiliki UCL terbanyak di Premier League kecuali:",options:["Arsenal","Manchester United","Manchester City","Nottingham Forest"],multi:false}
];
const CORRECT={1:["A"],2:["B"],3:["A","B","C"],4:["A"],5:["D"],6:["A"],7:["A"]};
function same(a,b){return JSON.stringify([...(a||[])].sort())===JSON.stringify([...b].sort())}
module.exports={QUESTIONS,CORRECT,same};
