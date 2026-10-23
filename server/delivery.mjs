// How Kat Sneakers gets a pair to the customer.
// Soweto: the store delivers to the door itself. Everywhere else: PAXI store-to-store
// (the store drops the parcel at a PAXI Point; PAXI SMSes the customer a collection PIN
// when it reaches the PAXI Point they chose, and they collect with their ID).

export const SOWETO_AREAS=['Braamfischerville','Chiawelo','Diepkloof','Dlamini','Dobsonville','Doornkop','Dube','Emdeni','Jabavu','Jabulani','Kliptown','Klipspruit','Mapetla','Meadowlands','Mofolo','Molapo','Moletsane','Moroka','Naledi','Noordgesig','Orlando East','Orlando West','Phiri','Pimville','Power Park','Protea Glen','Protea North','Protea South','Senaoane','Snake Park','Tladi','Zola','Zondi','Other Soweto area'];
export const PROVINCES=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];

// Fees in cents. PAXI's published store-to-store prices for a standard bag are the defaults;
// the owner can change every fee in Store settings.
export const DEFAULT_DELIVERY={sowetoFee:5000,sowetoEta:'1-2 business days',paxiStandardFee:5995,paxiStandardEta:'7-9 business days',paxiFastFee:10995,paxiFastEta:'3-5 business days'};

export function deliveryOptions(settings){
 const d={...DEFAULT_DELIVERY,...settings};
 return {
  soweto:{label:'Kat Sneakers delivery',fee:d.sowetoFee,eta:d.sowetoEta,areas:SOWETO_AREAS},
  paxi:[{id:'standard',label:'PAXI',fee:d.paxiStandardFee,eta:d.paxiStandardEta},{id:'fast',label:'PAXI faster',fee:d.paxiFastFee,eta:d.paxiFastEta}]
 };
}

// Returns {fee, label} for a validated customer delivery choice.
export function quote(settings,customer){
 const options=deliveryOptions(settings);
 if(customer.method==='soweto')return {fee:options.soweto.fee,label:`Kat Sneakers delivery, Soweto (${options.soweto.eta})`};
 const service=options.paxi.find(o=>o.id===customer.paxiSpeed)||options.paxi[0];
 return {fee:service.fee,label:`PAXI to your PAXI Point (${service.eta})`};
}
