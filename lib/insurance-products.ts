/**
 * Insurance product catalog — single source of truth for every
 * /erhvervsforsikringer/[slug] page. Add/edit products here and they'll
 * render through the shared InsurancePageTemplate with rich blocks.
 */

export type InsuranceBullet = { label: string; body?: string };

export type FeatureBlock = {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: InsuranceBullet[];
  image: string;
  imageSide?: "left" | "right"; // default right
};

export type Stat = { value: string; label: string };

export type Faq = { q: string; a: string };

export type Quote = { text: string; who?: string; role?: string };

export type InlineCta = {
  /** Where in the page flow to render the CTA strip. */
  position: "afterIntro" | "afterFeatures";
  eyebrow?: string;
  headline: string;
  body?: string;
  /** Override default button label ("Få gratis analyse"). */
  buttonLabel?: string;
};

export type InsuranceProduct = {
  slug: string;
  title: string;
  navLabel: string;
  letter: string;
  metaDescription: string;
  eyebrow: string;
  intro: string;
  heroImage: string;
  cvrLabel: string;

  // Rich content blocks — all optional, template renders only what's present
  introParagraphs?: string[]; // extra paragraphs shown in the intro band
  features?: FeatureBlock[]; // alternating image + text sections
  stats?: Stat[]; // numbered stat strip
  quote?: Quote; // editorial pull quote
  faq?: Faq[]; // accordion FAQ
  inlineCtas?: InlineCta[]; // optional mid-page CTA strips for CRO

  related?: string[];
};

const IMG = {
  // Unsplash themed
  meeting: "/images/unsplash-meeting.jpg", // line-kjaer — woman presenting
  business: "/images/unsplash-business.jpg", // charlesdeluvio — office setting
  copenhagen: "/images/copenhagen.jpg",
  partnership: "/images/unsplash-partnership.jpg", // clarisse-croset — laptops + coffee
  mandrup: "/images/unsplash-mandrup.jpg", // magnus-mandrup — workers
  vandergriff: "/images/unsplash-vandergriff.jpg", // maranda — city/tech
  golfCourse: "/images/unsplash-mcbrayer.jpg", // matthew-mcbrayer — GOLF COURSE
  golfBall: "/images/unsplash-mks.jpg", // mk-s — GOLF BALL ON FLAG
  moisa: "/images/unsplash-moisa.jpg", // mihai-moisa — architecture/tech
  puskeiler: "/images/unsplash-puskeiler.jpg", // sebastian-puskeiler
  wenchen: "/images/unsplash-wenchen.jpg", // wen-chen — historic building
  marion: "/images/unsplash-marion.jpg", // yohan-marion — apartment block
  // Nordan B&W photo session
  nordan50: "/images/nordan-50.jpg",
  nordan52: "/images/nordan-52.jpg",
  nordan56: "/images/nordan-56.jpg",
  nordan75: "/images/nordan-75.jpg",
  nordan73: "/images/nordan-73.jpg",
  nordan27: "/images/nordan-27.jpg",
  // Topic-specific documentary photos
  ejendomBygning: "/images/ejendom-bygning.jpg", // Copenhagen apartment facade
  itKaskoServer: "/images/it-kasko-server.jpg", // server racks + cabling
  fragtLaesning: "/images/fragtfoerer-laesning.jpg", // loading pallets into lorry
  speditoerLager: "/images/speditoer-lager.jpg", // freight-forwarding warehouse
  lastbilMotorvej: "/images/lastbil-motorvej.jpg", // truck on Danish motorway
  boligselskab: "/images/boligselskab-bebyggelse.jpg", // social-housing estate
  flaade: "/images/flaade-koeretoejer.jpg", // row of company vans
};

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    slug: "hole-in-one-forsikring",
    title: "Hole in one forsikring",
    navLabel: "Hole in one",
    letter: "H",
    eyebrow: "Specialforsikring",
    metaDescription:
      "Hole in one forsikring til golfarrangementer. Lad arrangøren udlove store præmier uden selv at bære risikoen — Nordan Risk Partners dækker.",
    intro:
      "Gør jeres næste golfarrangement uforglemmeligt. Med en hole in one forsikring kan I udlove bil, rejse, kontantpræmie eller oplevelser — uden selv at stå med regningen, hvis en deltager rammer plet.",
    heroImage: IMG.golfCourse,
    cvrLabel: "Få tilbud på hole in one forsikring",
    introParagraphs: [
      "Hole in one forsikring er for jer der arrangerer turneringer, sponsorer en golfevent, eller bare gerne vil give deltagerne en oplevelse ud over det sædvanlige. Arrangøren betaler en fast præmie — vi overtager risikoen, hvis en deltager rammer bolden direkte i hul fra tee.",
      "Vi har tegnet hole in one forsikringer til alt fra små klubturneringer til erhvervsevents med mere end 200 deltagere. Vi skræddersyer dækningen til jeres specifikke arrangement, bane og præmie.",
    ],
    features: [
      {
        eyebrow: "Sådan fungerer det",
        title: "Tre spørgsmål. Tilbud i jeres indbakke.",
        body: "Vi sætter forsikringen op hurtigt og uden bøvl. Du fortæller os om arrangementet — vi vender tilbage med en præmie der matcher jeres risiko og budget.",
        bullets: [
          { label: "Dato og bane", body: "Hvilken dag og på hvilken bane afholdes turneringen?" },
          { label: "Antal deltagere", body: "Jo flere spillere, jo større sandsynlighed — og jo højere præmie." },
          { label: "Størrelse på præmien", body: "Bil, oplevelse, kontantbeløb — alt kan dækkes, så længe værdien er aftalt på forhånd." },
        ],
        image: IMG.golfBall,
        imageSide: "right",
      },
      {
        eyebrow: "Hvad dækker vi",
        title: "Udlov den vilde præmie — vi står med risikoen",
        body: "Forsikringen udløses når en deltager rammer hullet i ét slag fra tee på det udpegede hul. Vi udbetaler præmien direkte — eller dækker værdien af den fysiske gevinst arrangøren har lovet ud.",
        bullets: [
          { label: "Kontantpræmier", body: "Op til 1.000.000 kr. — eller mere ved specialaftale." },
          { label: "Bil eller rejse", body: "Værdien aftales inden arrangementet og dækkes af policen." },
          { label: "Flere huller eller flere spillere", body: "Kan skaleres op hvis I vil lave flere hole-in-one stationer." },
        ],
        image: IMG.golfCourse,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "1 ud af ~12.500", label: "amatørslag rammer hole in one" },
      { value: "Op til 1 mio. kr.", label: "præmie dækket af policen" },
      { value: "24 t", label: "fra forespørgsel til tilbud" },
    ],
    faq: [
      {
        q: "Hvad koster hole in one forsikring?",
        a: "Præmien afhænger af gevinstens størrelse, antal spillere og banens sværhedsgrad. Typisk ligger priserne mellem 3.000 og 15.000 kr. for en standardturnering med en bil som præmie.",
      },
      {
        q: "Hvornår skal vi tegne forsikringen senest?",
        a: "Vi anbefaler minimum 10 dage før arrangementet, men vi kan i de fleste tilfælde have en police klar samme dag ved akut behov.",
      },
      {
        q: "Hvilke huller kan dækkes?",
        a: "Normalt par 3-huller med en længde på mellem 120 og 210 meter. Ved meget korte eller meget lange huller justeres præmien derefter.",
      },
      {
        q: "Hvem skal bevidne hullet?",
        a: "Der skal være mindst to uafhængige vidner til hullet. Vi udleverer en enkelt bekræftelsesformular som spillerne underskriver på stedet.",
      },
    ],
    quote: {
      text: "Vi tegnede en hole in one forsikring til vores kundeturnering og kunne derved udlove en Tesla. Det var den præmie hele dagen talte om.",
      who: "Arrangør",
      role: "Erhvervsgolfevent",
    },
    related: ["eventforsikring", "arrangoerforsikring", "aflysningsforsikring"],
  },
  {
    slug: "cyberforsikring",
    title: "Cyberforsikring",
    navLabel: "Cyber",
    letter: "C",
    eyebrow: "Digital risiko",
    metaDescription:
      "Cyberforsikring beskytter virksomheden mod ransomware, databrud, driftsstop og bøder. Få 24/7 beredskab når angrebet sker.",
    intro:
      "Et cyberangreb kan lukke virksomheden i dagevis. Cyberforsikring dækker de økonomiske tab og giver jer direkte adgang til et beredskab, der hjælper jer i gang igen hurtigst muligt.",
    heroImage: IMG.vandergriff,
    cvrLabel: "Se hvordan vi kan hjælpe med jeres cyberforsikring",
    introParagraphs: [
      "Cyberforsikring er blevet en grundsten for alle virksomheder der bruger IT — og det gør de alle sammen. En enkelt phishing-mail eller et kompromitteret password kan koste millioner i driftstab, datagenskabelse og bøder.",
      "Vi hjælper jer med at finde den rigtige dækning til jeres specifikke risikoprofil. Vi taler med IT-afdelingen om jeres opsætning og forhandler vilkår og præmier med det marked der passer bedst til jeres branche og størrelse.",
    ],
    features: [
      {
        eyebrow: "Hvad dækker vi",
        title: "Den økonomiske redningskrans når angrebet sker",
        body: "Cyberforsikring er bygget op af flere dækningsblokke. I kan vælge det hele — eller kun de dele der matcher jeres risiko. Vi guider jer gennem hvad der giver mening for jeres virksomhed.",
        bullets: [
          { label: "Ransomware-dækning", body: "Inkluderer forhandling, betaling (hvor lovligt) og datagenskabelse." },
          { label: "Driftstab", body: "Dækker mistet indtjening ved systemnedbrud som følge af angreb." },
          { label: "GDPR-sanktioner", body: "Bøder og sagsomkostninger ved databrud og tilsynssager." },
          { label: "Krisekommunikation", body: "PR-bureau og juridisk rådgivning ved offentligt databrud." },
        ],
        image: IMG.moisa,
        imageSide: "right",
      },
      {
        eyebrow: "Risikoforebyggelse",
        title: "Dækning er kun halvdelen — vi styrker også jeres forsvar",
        body: "Selskaberne vi arbejder med inkluderer typisk et sikkerhedstjek og rådgivning om risikoreducerende tiltag. Vi koordinerer processen så I får maksimal værdi ud af præmien.",
        bullets: [
          { label: "Sikkerhedsaudit", body: "Gratis eller rabatteret gennemgang via forsikringsselskabets partnere." },
          { label: "Phishing-simulation", body: "Test af medarbejderes awareness-niveau." },
          { label: "Backup-strategi", body: "Vurdering af om jeres backups faktisk kan genoprette driften." },
        ],
        image: IMG.vandergriff,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "66%", label: "af danske SMB'er ramt af cyberangreb senest 12 mdr" },
      { value: "4,2 mio. kr.", label: "gennemsnitlige omkostninger ved et databrud" },
      { value: "72 timer", label: "kravet til anmeldelse af databrud under GDPR" },
    ],
    faq: [
      {
        q: "Hvem har brug for cyberforsikring?",
        a: "Alle virksomheder der bruger IT, behandler persondata eller har en webshop. Specielt vigtigt for virksomheder der har kundedata, produktion der er afhængig af IT, eller leverer digitale services.",
      },
      {
        q: "Dækker forsikringen også medarbejderfejl?",
        a: "Ja, de fleste policer dækker også menneskelige fejl (fx en medarbejder der klikker på en phishing-link). Vi sikrer at den dækning er inkluderet i jeres program.",
      },
      {
        q: "Hvor hurtigt kan I hjælpe ved et angreb?",
        a: "Selskaberne har 24/7 hotlines og beredskab. Typisk er en IT-forensiker i kontakt med jer inden for få timer efter anmeldelse.",
      },
    ],
    related: ["it-ansvarsforsikring", "it-kaskoforsikring", "kriminalitetsforsikring", "netbanksforsikring"],
  },
  {
    slug: "arbejdsskadeforsikring",
    title: "Arbejdsskadeforsikring",
    navLabel: "Arbejdsskade",
    letter: "A",
    eyebrow: "Lovpligtig forsikring",
    metaDescription:
      "Lovpligtig arbejdsskadeforsikring til virksomheder med ansatte. Vi gennemgår lønsummer og risikoprofil — og forhandler præmien på markedet.",
    intro:
      "Arbejdsskadeforsikring er lovpligtig for alle arbejdsgivere i Danmark. Vi sikrer at jeres program matcher jeres reelle risikoprofil og lønsum — og forhandler vilkår og præmie på markedet på jeres vegne.",
    heroImage: IMG.mandrup,
    cvrLabel: "Få tjekket jeres arbejdsskadeforsikring gratis",
    introParagraphs: [
      "Arbejdsskadeforsikring er grundstenen i arbejdsgiveransvaret. Den dækker behandlingsudgifter, erstatning for varigt mén og tab af erhvervsevne hvis en medarbejder kommer til skade i arbejdet — og i nogle tilfælde også erstatning til efterladte.",
      "Det er et område hvor mange virksomheder betaler for meget, fordi policen ikke er opdateret med den rette lønsum, branchekode eller risikoklasse. Vi går programmet igennem og sikrer at I betaler den rigtige pris for den rigtige dækning.",
    ],
    features: [
      {
        eyebrow: "Dækninger",
        title: "Sådan er arbejdsskadeforsikringen bygget op",
        body: "Dækningen er lovmæssigt defineret — men selskaberne kan variere på pris, vilkår og håndtering. Vi finder den kombination der fungerer bedst for jer.",
        bullets: [
          { label: "Erstatning ved varigt mén", body: "Udbetaling ved permanent men efter ulykkesskade." },
          { label: "Tab af erhvervsevne", body: "Løbende ydelser hvis medarbejderen ikke kan vende tilbage." },
          { label: "Lægebehandling og genoptræning", body: "Dækning af behandlingsomkostninger." },
          { label: "Erstatning til efterladte", body: "Ved arbejdsulykke med dødsfald." },
        ],
        image: IMG.mandrup,
        imageSide: "right",
      },
      {
        eyebrow: "Hvad vi gør for jer",
        title: "Ikke kun fornyelse — løbende overvågning",
        body: "Arbejdsskadeforsikring er et af de områder hvor vi oftest finder besparelser. Vi tjekker om lønsum og branchekode matcher virkeligheden, og om jeres skadesforløb giver adgang til bedre vilkår.",
        bullets: [
          { label: "Lønsums-validering", body: "Er den oplyste lønsum den faktiske?" },
          { label: "Branchekode-tjek", body: "Er I klassificeret i den rette risikoklasse?" },
          { label: "Skadesanalyse", body: "Kan en god skadeshistorik give rabat?" },
        ],
        image: IMG.meeting,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "Lovpligtig", label: "for alle arbejdsgivere med ansatte i Danmark" },
      { value: "10–25%", label: "typisk besparelse ved mæglerforhandling" },
    ],
    faq: [
      {
        q: "Er jeg forpligtet til at tegne arbejdsskadeforsikring?",
        a: "Ja, hvis I har ansatte — også ved korttidsansættelser, praktikanter og vikarer. Selvstændige uden ansatte kan vælge at tegne frivillig dækning.",
      },
      {
        q: "Dækker arbejdsskadeforsikringen også psykiske skader?",
        a: "Forsikringen dækker arbejdsulykker der medfører psykisk skade (fx efter en voldsom hændelse). Langvarig arbejdsrelateret stress anerkendes i nogle tilfælde som erhvervssygdom.",
      },
      {
        q: "Hvordan anmeldes en arbejdsskade?",
        a: "Arbejdsgiver har pligt til at anmelde enhver skade inden for 14 dage. Vi hjælper med selve anmeldelsen og opfølgningen hos selskabet og Arbejdsmarkedets Erhvervssikring.",
      },
    ],
    related: ["kollektiv-ulykkesforsikring", "sundhedsforsikring", "erhvervs-og-produktansvarsforsikring"],
  },
  {
    slug: "bestyrelsesansvarsforsikring",
    title: "Bestyrelses- og direktionsansvarsforsikring",
    navLabel: "Bestyrelsesansvar",
    letter: "B",
    eyebrow: "Ledelsesansvar",
    metaDescription:
      "D&O-forsikring der beskytter bestyrelse og direktion personligt mod erstatningskrav fra aktionærer, kreditorer og myndigheder.",
    intro:
      "Bestyrelses- og direktionsansvar (D&O) beskytter ledelsen personligt mod krav fra aktionærer, kreditorer, medarbejdere og myndigheder. Vi sammensætter dækninger der matcher virksomhedens kompleksitet og vækstfase.",
    heroImage: IMG.meeting,
    cvrLabel: "Få tjekket jeres bestyrelsesansvarsforsikring",
    introParagraphs: [
      "Det personlige ansvar som bestyrelsesmedlem eller direktør er stort — og voksende. Sager om erstatning for fejl i ledelsen er blevet mere almindelige, og kravene kan løbe op i millioner.",
      "D&O-forsikring dækker både sagsomkostninger og selve erstatningen. Den følger jer personligt — også efter I er trådt ud af bestyrelsen eller direktionen, så længe kravet relaterer sig til en handling i perioden.",
    ],
    features: [
      {
        eyebrow: "Hvem har brug for D&O?",
        title: "Relevant fra første bestyrelsesmøde",
        body: "D&O er ikke forbeholdt børsnoterede selskaber. Alle virksomheder med en bestyrelse eller direktion bør have dækning — især ved vækst, eksterne investorer eller international aktivitet.",
        bullets: [
          { label: "Virksomheder i vækst", body: "Flere aktører og beslutninger øger risikoen." },
          { label: "Eksterne investorer", body: "Krav fra ventureselskaber eller minoritetsejere." },
          { label: "Internationalt fokus", body: "Amerikansk og UK-jurisdiktion har højere krav." },
          { label: "Foreninger og NGO'er", body: "Bestyrelsesansvar gælder også frivillige organisationer." },
        ],
        image: IMG.nordan52,
        imageSide: "right",
      },
      {
        eyebrow: "Dækningsomfang",
        title: "Tre lag af beskyttelse",
        body: "En moderne D&O-police er bygget op af tre dækningssider — og vi vælger den kombination der bedst passer jer.",
        bullets: [
          { label: "Side A: Individuel dækning", body: "Beskytter bestyrelsesmedlemmet personligt når virksomheden ikke kan eller vil holde vedkommende skadesløs." },
          { label: "Side B: Selskabets refusion", body: "Dækker selskabets udgifter når det skadesløsholder ledelsen." },
          { label: "Side C: Selskabets egne værdipapirssager", body: "Relevant for børsnoterede selskaber — dækker selskabet selv ved værdipapirkrav." },
        ],
        image: IMG.partnership,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "+30%", label: "stigning i D&O-sager de seneste 5 år" },
      { value: "2–15 mio.", label: "typisk dækningssum for små-mellemstore virksomheder" },
    ],
    faq: [
      {
        q: "Er jeg dækket når jeg træder ud af bestyrelsen?",
        a: "Ja, de fleste D&O-policer inkluderer en 'run-off'-dækning der følger dig så længe kravet relaterer sig til handlinger i din aktive periode.",
      },
      {
        q: "Dækker forsikringen bevidste handlinger?",
        a: "Nej — hvis der er tale om bevidste overtrædelser, svig eller ulovlige fordele falder dækningen bort. Forsikringen dækker fejl og forsømmelser.",
      },
      {
        q: "Hvad er den vigtigste forskel mellem danske og amerikanske D&O-policer?",
        a: "Dækningssummer er højere og vilkårene strammere i USA/UK. Hvis I har aktiviteter i de lande, skal policen specifikt geodækning dertil.",
      },
    ],
    related: ["advokatansvarsforsikring", "kriminalitetsforsikring", "cyberforsikring"],
  },
  {
    slug: "bygningsforsikring",
    title: "Bygningsforsikring",
    navLabel: "Bygning",
    letter: "B",
    eyebrow: "Ejendom",
    metaDescription:
      "Bygningsforsikring til erhvervsejendomme, ejer- og andelsboligforeninger. Vi sikrer at dækningssummer matcher genopførselsomkostninger — og at moderne risici som skybrud er med.",
    intro:
      "Bygningsforsikring er grundstenen for enhver virksomhed eller forening der ejer sin ejendom. Vi sikrer at dækningssummer matcher genopførselsomkostningerne — og at vilkårene er opdaterede med tidens risici.",
    heroImage: IMG.marion,
    cvrLabel: "Få en gratis gennemgang af jeres bygningsforsikring",
    introParagraphs: [
      "Den gennemsnitlige genopførselsværdi er steget markant de seneste år — materialer, håndværkerløn og regulatoriske krav alt sammen dyrere. Hvis jeres forsikring stadig er baseret på gamle tal, står I i risiko for markant underforsikring ved større skader.",
      "Samtidig har klimaforandringer gjort skybrud og storm mere hyppige. Vi tjekker om jeres police har den rette kombination af grunddækning og moderne tilvalg.",
    ],
    features: [
      {
        eyebrow: "Dækninger",
        title: "Hvad en moderne bygningsforsikring bør dække",
        body: "Den klassiske bygningsforsikring dækker brand, storm og vand. Men risikobilledet har udviklet sig — og det skal programmet følge med.",
        bullets: [
          { label: "Brand og eksplosion", body: "Grundlæggende dækning i alle policer." },
          { label: "Storm og skybrud", body: "Stigende behov i takt med klimaforandringer." },
          { label: "Skjulte rørskader", body: "Ofte meget dyre — vigtigt tilvalg." },
          { label: "Svampe og insekter", body: "Bør altid være med i ældre ejendomme." },
          { label: "Glas og sanitet", body: "Relevant for butikker og udadvendte lokaler." },
          { label: "Funktionsdygtighed", body: "Genopretning af installationer der ikke er direkte skadet." },
        ],
        image: IMG.marion,
        imageSide: "right",
      },
      {
        eyebrow: "Hyppigste fejl vi ser",
        title: "Tre ting vi ofte opdager ved gennemgang",
        body: "Efter mange års erfaring ser vi de samme problemer igen og igen. Det er nemt at rette — hvis man kigger.",
        bullets: [
          { label: "Gamle dækningssummer", body: "Ikke justeret siden sidste renovering eller udbygning." },
          { label: "Manglende skjulte rør", body: "Udelukket i grunddækning — tilvalg ofte glemt." },
          { label: "Underforsikring pga. indeksfejl", body: "Prisstigninger ikke indregnet år for år." },
        ],
        image: IMG.vandergriff,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Hvordan fastsættes forsikringssummen korrekt?",
        a: "Den skal afspejle genopførselsomkostningerne — ikke ejendomsvurderingen og ikke bogført værdi. En ejendomsbesigtigelse giver det mest præcise svar.",
      },
      {
        q: "Er skybrud altid med i dækningen?",
        a: "Nej — i ældre policer er skybrud ofte kun et tilvalg. Vi sikrer at det er med, særligt for ejendomme i byområder med pressede kloaksystemer.",
      },
    ],
    related: ["fredede-ejendomme-forsikring", "forsikring-andelsboligforening-ejerforening", "loosereforsikring"],
  },
  {
    slug: "fredede-ejendomme-forsikring",
    title: "Forsikring af fredede ejendomme",
    navLabel: "Fredede ejendomme",
    letter: "F",
    eyebrow: "Specialrådgivning",
    metaDescription:
      "Rådgivning i et marked med få muligheder. Vi hjælper ejere, bestyrelser og administratorer af fredede ejendomme med at finde fuld dækning — også efter afslag.",
    intro:
      "Forsikring af fredede ejendomme er blandt de mest udfordrede områder i markedet. Mange ejere får afslag eller markante prisstigninger. Vi hjælper med at navigere markedet og finde løsninger.",
    heroImage: IMG.wenchen,
    cvrLabel: "Få en uforpligtende vurdering af jeres fredede ejendom",
    introParagraphs: [
      "Forsikring af fredede ejendomme er i øjeblikket blandt de mest udfordrede områder i det danske forsikringsmarked. Mange ejere oplever afslag, markante præmiestigninger eller væsentligt reducerede dækninger – ofte med forsikringer, der alene omfatter brand og typisk på en 1. risikosum som ingen har tjekket om reelt stemmer overens med bygningens faktiske værdi.",
      "Hos Nordan Risk Partners hjælper vi ejere, bestyrelser og administratorer med at få overblik og træffe informerede beslutninger i et marked, hvor mulighederne er få og komplekse.",
      "Ifølge branchekilder afvises omkring halvdelen af henvendelser om forsikring af fredede ejendomme allerede ved første kontakt. Mange af dem der får tilbud, oplever præmiestigninger på 30–100% — og ender ofte med reduceret dækning til højere pris.",
      "Vi specialiserer os i netop dette område og har adgang til både danske specialister og internationale markeder der løfter denne type ejendomme. Selv når andre har givet op, kan vi ofte finde en løsning.",
    ],
    features: [
      {
        eyebrow: "Vigtigt om markedet lige nu",
        title: "Hvorfor er forsikring dyrere for fredede ejendomme?",
        body: "Markedet beskrives som begrænset og ugennemsigtigt med få konkrete produkter målrettet fredede ejendomme. Ca. 50 % af ejere får ikke tilbud eller får afslag ved første henvendelse, og præmier for dem der får dækning stiger typisk 30–100 %+ som en del af branchens reaktion på højere genopbygningsomkostninger og vurderet risiko. Her er de vigtigste årsager:",
        bullets: [
          {
            label: "1. Høje omkostninger ved reparationer",
            body: "Fredede bygninger kræver særlige materialer og håndværkere (fx traditionelle tagsten, kalkmørtel, specialtømrerarbejde). Reparationer skal godkendes af Slots- og Kulturstyrelsen, hvilket gør processen dyrere og langsommere.",
          },
          {
            label: "2. Øget risiko i forsikringsselskabernes øjne",
            body: "Ældre konstruktioner kan være mere brandfølsomme. Tekniske installationer (el, VVS) kan være sværere at opgradere pga. fredningen. Mange er placeret på udsatte steder (fugt, sætningsskader osv.).",
          },
          {
            label: "3. Flere store skader de seneste år",
            body: "Mange selskaber har generelt oplevet stigende omkostninger ved storme, skybrud og fugtskader — og fredede ejendomme er ofte dyrere at reparere end moderne byggeri.",
          },
          {
            label: "4. Forsikringsselskaber trækker sig",
            body: "Nogle selskaber tilbyder slet ikke forsikring af fredede ejendomme længere, hvilket giver mindre konkurrence og højere priser for dem der gør.",
          },
        ],
        image: IMG.marion,
        imageSide: "left",
      },
      {
        eyebrow: "Hvad vi kigger på",
        title: "Specialvurdering af jeres fredede ejendom",
        body: "Vi starter med at få overblik over bygningen, dens tilstand og tidligere skader — så vi kan præsentere en komplet case overfor markedet.",
        bullets: [
          { label: "Bygningsbeskrivelse og fredningsdetaljer", body: "Hvor er bygningen og hvad er specifikt fredet?" },
          { label: "Teknisk tilstand", body: "Tag, installationer, fugtforhold — kan vi dokumentere solid stand?" },
          { label: "Skadeshistorik", body: "Tidligere skader og hvordan de er håndteret." },
          { label: "Brandforanstaltninger", body: "Sprinkler, brand­afsnit og alarmsystemer — påvirker direkte præmien." },
        ],
        image: IMG.wenchen,
        imageSide: "right",
      },
    ],
    stats: [
      { value: "~50%", label: "af henvendelser afvises eller får ikke tilbud" },
      { value: "30–100%", label: "typiske prisstigninger de sidste år" },
      { value: "Ja", label: "vi har løsninger også efter afslag" },
    ],
    inlineCtas: [
      {
        position: "afterIntro",
        eyebrow: "Står I med et afslag?",
        headline: "Vi har set markedet for fredede ejendomme indefra",
        body: "Få en uforpligtende vurdering — selv hvis I allerede har fået nej hos andre selskaber.",
        buttonLabel: "Få gratis vurdering",
      },
      {
        position: "afterFeatures",
        eyebrow: "Kom videre",
        headline: "Lad os finde en dækning der passer til jeres ejendom",
        body: "Vi har adgang til både danske specialister og internationale markeder der fortsat dækker fredede ejendomme.",
        buttonLabel: "Få gratis vurdering",
      },
    ],
    faq: [
      {
        q: "Hvorfor er det så dyrt?",
        a: "Fredede bygninger kræver særlige materialer og håndværkere. Reparationer skal godkendes af Slots- og Kulturstyrelsen. Samtidig ser selskaberne øget risiko ved ældre konstruktioner og brandfølsomme materialer.",
      },
      {
        q: "Kan I hjælpe selv hvis vi har fået afslag andre steder?",
        a: "Ja — det er faktisk ofte dér vi kommer ind i billedet. Vi har erfaring med internationale og specialiserede selskaber der dækker det danske standardmarked ikke tager.",
      },
      {
        q: "Hvor længe tager processen?",
        a: "Fra første møde til en fuld besigtigelse og tilbud kan der gå 4–8 uger. Ved komplekse sager op til 12 uger. Vi er realistiske omkring tidsrammer fra start.",
      },
    ],
    related: ["bygningsforsikring", "forsikring-andelsboligforening-ejerforening"],
  },
  {
    slug: "forsikring-andelsboligforening-ejerforening",
    title: "Forsikring til andelsboligforening og ejerforening",
    navLabel: "Foreninger",
    letter: "A",
    eyebrow: "Foreninger",
    metaDescription:
      "Forsikring til andelsboligforeninger og ejerforeninger. Bygningsforsikring, bestyrelsesansvar, retshjælp og mere — samlet i ét program.",
    intro:
      "Vi hjælper andelsboligforeninger og ejerforeninger med en uvildig gennemgang af forsikringsprogrammet — både på dækning og pris. Direkte adgang til erfarne rådgivere.",
    heroImage: IMG.marion,
    cvrLabel: "Få tjekket jeres forenings forsikringer gratis",
    introParagraphs: [
      "Forsikringsprogrammet er ofte det vigtigste ansvar bestyrelsen har — og samtidig det område hvor vi ser flest fejl og overpriser. Hovedparten af danske foreninger har programmer der ikke er blevet gennemgået struktureret siden sidste fornyelse — typisk 3–5 år.",
      "Vi tilbyder uvildig rådgivning til bestyrelser og administratorer: en komplet gennemgang af eksisterende program, udbud på markedet og en klar anbefaling om hvad der giver mest værdi.",
    ],
    features: [
      {
        eyebrow: "Hvad skal dækkes?",
        title: "Det typiske program for en ejer- eller andelsforening",
        body: "Foreninger har et forholdsvist standard sæt af forsikringer — men vi ser tit at vigtige dækninger mangler. En gennemgang kan afsløre både huller og overbetaling.",
        bullets: [
          { label: "Bygningsforsikring", body: "Brand, storm, vandskade, indbrud og hærværk." },
          { label: "Bestyrelsesansvar", body: "Vigtigt for bestyrelsesmedlemmer personligt." },
          { label: "Retshjælp", body: "Dækker advokatomkostninger ved tvister." },
          { label: "Rør- og stikledninger", body: "Ofte dyre at reparere — bør altid være med." },
          { label: "Svampe- og insektskade", body: "Især relevant i ældre bygninger." },
          { label: "Arbejdsskade", body: "Lovpligtig hvis der er ansatte (fx vicevært)." },
        ],
        image: IMG.marion,
        imageSide: "right",
      },
      {
        eyebrow: "Den typiske proces",
        title: "Fra første møde til implementeret program",
        body: "Vi arbejder altid tæt sammen med bestyrelsen. Ingen beslutninger træffes uden jeres accept — vi leverer analysen, I godkender retningen.",
        bullets: [
          { label: "1. Gennemgang af nuværende program", body: "Vi identificerer huller, overlap og underforsikring." },
          { label: "2. Udbud til markedet", body: "Vi forhandler med flere selskaber på jeres vegne." },
          { label: "3. Anbefaling til bestyrelsen", body: "Klar sammenligning, anbefalet løsning, svar på spørgsmål." },
          { label: "4. Implementering og årlig opfølgning", body: "Vi bliver ved — løbende rådgivning ved ændringer." },
        ],
        image: IMG.meeting,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "10–25%", label: "typisk besparelse ved at tage programmet i udbud" },
      { value: "1× årligt", label: "anbefalet gennemgang af programmet" },
    ],
    faq: [
      {
        q: "Hvor ofte bør vi få tjekket forsikringen?",
        a: "Minimum én gang årligt — typisk i forbindelse med fornyelsen. Vi anbefaler også en gennemgang efter større ændringer i ejendommen, bestyrelsen eller skadeshistorikken.",
      },
      {
        q: "Kan administrator eller bestyrelsen gøre det selv?",
        a: "Ja, men det kræver specialistviden. Som uvildig mægler har vi ingen incitament til at sælge bestemte produkter — og det forhandlingsgrundlag gør typisk en betydelig forskel.",
      },
      {
        q: "Hvad koster det at bruge jer?",
        a: "Vi aflønnes via honorar fra selskabet — aldrig ekstra af foreningen. Honorarstrukturen er transparent og godkendt af bestyrelsen inden vi går i gang.",
      },
    ],
    related: ["bygningsforsikring", "bestyrelsesansvarsforsikring", "arbejdsskadeforsikring"],
  },
  {
    slug: "erhvervs-og-produktansvarsforsikring",
    title: "Erhvervs- og produktansvarsforsikring",
    navLabel: "Erhvervs- og produktansvar",
    letter: "E",
    eyebrow: "Ansvar",
    metaDescription:
      "Beskyt virksomheden mod erstatningskrav. Erhvervs- og produktansvar dækker person- og tingsskader under drift og efter levering.",
    intro:
      "Ansvarsforsikring er grundlæggende for enhver virksomhed. Én stor sag kan true hele økonomien — vi sikrer at dækningsgrundlag, summer og vilkår matcher jeres reelle eksponering.",
    heroImage: IMG.moisa,
    cvrLabel: "Se om jeres ansvarsforsikring er i orden",
    introParagraphs: [
      "Erhvervs- og produktansvarsforsikring er den vigtigste 'usynlige' forsikring I kan have. Den dækker det øjeblik hvor noget I har lavet, solgt eller installeret skader en anden virksomhed eller person — og kravet kan let løbe op i millioner.",
      "Vi analyserer jeres kontrakter, leverancer og eksporter for at sikre at dækning, geografisk omfang og dækningssum matcher hvad I rent faktisk påtager jer. Mange virksomheder har 'standarddækning' — men opererer langt uden for hvad standard dækker.",
    ],
    features: [
      {
        eyebrow: "Erhvervs- vs. produktansvar",
        title: "To tætte, men ikke identiske dækninger",
        body: "Forskellen er vigtig — de dækker forskellige situationer og kan ikke erstatte hinanden.",
        bullets: [
          { label: "Erhvervsansvar", body: "Skader under driften — fx når montøren uforvarende beskadiger kundens ejendom." },
          { label: "Produktansvar", body: "Skader forårsaget af solgte eller leverede produkter efter overdragelse." },
          { label: "Produktansvarsloven", body: "Objektivt ansvar — krav kan rejses uden at kunden beviser uagtsomhed." },
          { label: "Rådgiveransvar (E&O)", body: "Rent økonomisk tab fra fagligt arbejde — separat dækning." },
        ],
        image: IMG.moisa,
        imageSide: "right",
      },
      {
        eyebrow: "Det globale aspekt",
        title: "Eksport? USA-leverancer? Det ændrer alt.",
        body: "Mange virksomheder har en dansk ansvarsforsikring der udelukker USA, Canada og Australien — netop hvor erstatningssummer er størst. Hvis I eksporterer dertil uden udvidet dækning, er risikoen reel.",
        bullets: [
          { label: "Europæisk dækning", body: "Typisk inkluderet i alle danske policer." },
          { label: "USA/Canada-tillæg", body: "Kræver særskilt dækning — ofte dyrere." },
          { label: "Andre lande", body: "Vurderes individuelt pr. land." },
        ],
        image: IMG.moisa,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Hvor stor en dækningssum er nødvendig?",
        a: "Afhænger af størrelse, branche og eksponering. Typisk 10 mio. kr. for mindre virksomheder, op til 100 mio. for producenter med international eksport. Vi hjælper med at vurdere det rigtige niveau.",
      },
      {
        q: "Dækker policen også underleverandører?",
        a: "Det kan den — men skal tilvælges. Hvis I bruger underleverandører, skal deres ansvarsdækning også tjekkes for at undgå 'coverage gap' i kæden.",
      },
    ],
    related: ["bestyrelsesansvarsforsikring", "professionel-ansvarsforsikring", "entrepriseforsikring"],
  },
  // Shorter product entries — the template gracefully handles fewer blocks
  {
    slug: "advokatansvarsforsikring",
    title: "Advokatansvarsforsikring",
    navLabel: "Advokatansvar",
    letter: "A",
    eyebrow: "Professionelt ansvar",
    metaDescription: "Advokatansvarsforsikring beskytter advokatfirmaet mod krav om økonomisk tab opstået som følge af rådgivning, sagsbehandling eller klientmidler.",
    intro: "Advokater har et skærpet professionelt ansvar. Vi sammensætter dækninger der matcher kompleksiteten i jeres sagsportefølje — og sikrer jer mod de stigende krav om dækningssummer i branchen.",
    heroImage: IMG.business,
    cvrLabel: "Se hvad vi kan gøre for jeres advokatansvarsforsikring",
    introParagraphs: [
      "Advokatansvarsforsikring er obligatorisk i henhold til Advokatsamfundets regler. Den dækker erstatningskrav udspringende af jeres rådgivning, sagsbehandling og håndtering af klientmidler.",
      "Kravene til dækningssummer stiger — især ved transaktionsrådgivning, M&A og fast ejendom. Vi sikrer at jeres dækning matcher de risici jeres praksis reelt bærer.",
    ],
    features: [
      {
        eyebrow: "Praksisområder",
        title: "Ikke alle advokatpraksisser har samme risikoprofil",
        body: "Vi differentierer policen efter jeres konkrete praksisområder — så I ikke betaler for risici I ikke har, og ikke står uden dækning der hvor risikoen faktisk ligger.",
        bullets: [
          { label: "M&A og transaktioner", body: "Kræver ofte forhøjede dækningssummer og cyberdækning." },
          { label: "Fast ejendom", body: "Specialvilkår for klientmiddelhåndtering og garantistillelse." },
          { label: "Strafferet og retssager", body: "Fokus på sagsomkostninger og defence costs." },
          { label: "Erhvervsret og selskabsret", body: "Bestyrelsesrådgivning og managementopgaver." },
        ],
        image: IMG.meeting,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Skal advokaten tegne forsikringen selv eller som firma?",
        a: "Både enkeltadvokat og firma kan være policeholder. Firmaer bør typisk tegne en samlet dækning der inkluderer alle juridiske medarbejdere.",
      },
      {
        q: "Dækker forsikringen også tidligere advokater i firmaet?",
        a: "Ja — en standard advokatansvarspolice inkluderer 'claims made basis', så krav der relaterer sig til rådgivning ydet mens personen var ansat også er dækket.",
      },
    ],
    related: ["bestyrelsesansvarsforsikring", "erhvervs-og-produktansvarsforsikring", "it-ansvarsforsikring"],
  },
  {
    slug: "bilforsikring",
    title: "Bilforsikring",
    navLabel: "Bilforsikring",
    letter: "B",
    eyebrow: "Køretøjer",
    metaDescription: "Bilforsikring til erhvervsbiler og firmakøretøjer. Vi sammenligner markedet og samler jeres flåde under de bedste vilkår.",
    intro: "Erhvervsbiler kører hver dag — og kræver en forsikringsløsning der følger med. Vi finder de bedste vilkår for firmabiler, hvad enten det er en enkelt bil eller en hel flåde.",
    heroImage: IMG.partnership,
    cvrLabel: "Få tilbud på jeres bilforsikringer",
    introParagraphs: [
      "Hvor mange biler I har, hvordan de bruges, og hvem der kører dem — alt har betydning for både dækning og præmie. Vi gennemgår jeres portefølje og finder den løsning der passer jeres hverdag.",
      "For flåder fra 5 biler og op er der ofte betydelige besparelser at hente ved at samle forsikringen på én aftale frem for enkeltpolicer.",
    ],
    features: [
      {
        eyebrow: "Enkeltbil eller flåde",
        title: "Vælg den struktur der passer jeres drift",
        body: "De fleste virksomheder sparer både administration og præmie ved at konsolidere. Men én stor skade i flåden kan også påvirke prisen i flere år — så strategien skal tænkes igennem.",
        bullets: [
          { label: "Enkeltbiler", body: "Velegnet til 1–4 køretøjer med individuelle brugere." },
          { label: "Flådeaftale", body: "Fra 5+ biler — én samlet police, ét fælles selvrisikoniveau." },
          { label: "Branchetillæg", body: "Fx håndværkerløsninger med dækning af værktøj i bilen." },
          { label: "Geografisk dækning", body: "Grønt kort og udvidet dækning ved kørsel i udlandet." },
        ],
        image: IMG.mandrup,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Er det billigere at samle mine firmabiler?",
        a: "I langt de fleste tilfælde ja. En flådeaftale giver både lavere præmier og mindre administration end enkeltpolicer.",
      },
    ],
    related: ["lastbilforsikring", "transportforsikring"],
  },
  {
    slug: "driftstabsforsikring",
    title: "Driftstabsforsikring",
    navLabel: "Driftstab",
    letter: "D",
    eyebrow: "Forretningskontinuitet",
    metaDescription: "Driftstabsforsikring kompenserer for tabt dækningsbidrag og løbende omkostninger når virksomheden rammes af en skade. Vi sikrer at dækningsperioden og summerne er realistiske.",
    intro: "Når uheldet sker, er det ikke kun bygningen der skal repareres — det er også indtjeningen der forsvinder. Driftstabsforsikring holder virksomheden kørende økonomisk indtil driften er oppe igen.",
    heroImage: IMG.partnership,
    cvrLabel: "Tjek om jeres driftstabsforsikring er stor nok",
    introParagraphs: [
      "En brand, en oversvømmelse eller et nedbrud i et afgørende produktionsanlæg kan lukke virksomheden i uger eller måneder. Mens bygningsforsikringen dækker den fysiske skade, dækker driftstabsforsikringen den tabte indtjening — og holder virksomhedens faste omkostninger oppe indtil I er tilbage på sporet.",
      "Problemet er, at mange virksomheder har en driftstabsforsikring der er baseret på gamle tal og en for kort dækningsperiode. Vi hjælper jer med at validere at både dækningssum og indeksperiode matcher virkelighedens genopretningstid.",
    ],
    features: [
      {
        eyebrow: "Hvad dækkes",
        title: "Faste omkostninger og mistet dækningsbidrag",
        body: "Driftstabsforsikringen kompenserer for den økonomiske konsekvens af en dækningsberettiget skade — typisk brand, vand eller storm, men kan også udvides med andre årsager.",
        bullets: [
          { label: "Mistet dækningsbidrag", body: "Forskellen mellem omsætning og de variable omkostninger I ikke har." },
          { label: "Faste omkostninger", body: "Løn, husleje, renter, forsikringer — det der løber uanset." },
          { label: "Meromkostninger ved midlertidig løsning", body: "Fx flytning til midlertidige lokaler eller indleje af produktionsudstyr." },
          { label: "Indekseringsperiode", body: "Antal måneder dækningen løber — vælges efter realistisk genopretningstid." },
        ],
        image: IMG.moisa,
        imageSide: "right",
      },
      {
        eyebrow: "Den kritiske faktor",
        title: "Dækningsperioden afgør om I holder til det",
        body: "Mange forsikringer har 12 måneders dækningsperiode — men realistiske genopretningstider er ofte længere, især ved specialiseret produktion eller genopbygning af fredede ejendomme. Vi regner sammen med jer.",
        bullets: [
          { label: "12 måneder — standard", body: "Fint for kontorvirksomhed og standardbyggeri." },
          { label: "18–24 måneder", body: "Anbefales ved specialiseret produktion eller komplekse bygninger." },
          { label: "36 måneder+", body: "For fredede ejendomme og hvor myndighedsgodkendelser forsinker." },
        ],
        image: IMG.golfBall,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Er driftstab det samme som en bygningsforsikring?",
        a: "Nej — bygningsforsikringen dækker det fysiske tab (reparation eller genopbygning). Driftstab dækker den mistede indtjening mens det står på. De to hænger typisk sammen — og begge er nødvendige.",
      },
      {
        q: "Hvor høj skal dækningssummen være?",
        a: "Tommelfingerreglen er jeres dækningsbidrag for den valgte dækningsperiode (fx 12 måneders dækningsbidrag). Vi hjælper med at lave den konkrete beregning.",
      },
    ],
    related: ["bygningsforsikring", "loosereforsikring", "cyberforsikring"],
  },
  {
    slug: "entrepriseforsikring",
    title: "Entrepriseforsikring",
    navLabel: "Entreprise",
    letter: "E",
    eyebrow: "Byggeri",
    metaDescription: "Entrepriseforsikring dækker bygge- og anlægsprojekter mod pludselige skader og ansvarsrisiko under udførelsen. All-risks for bygherre, entreprenør og underentreprenører.",
    intro: "Et byggeprojekt har mange aktører og risici. Entrepriseforsikring samler dækningerne for bygherre, entreprenør og underentreprenører under ét — og sikrer at en uventet skade under byggeriet ikke vælter økonomien.",
    heroImage: IMG.nordan27,
    cvrLabel: "Få tilbud på jeres entrepriseforsikring",
    introParagraphs: [
      "Entrepriseforsikring er den vigtigste forsikring at have på plads før første spadestik. Den dækker både de fysiske skader på byggeriet under opførelsen og det ansvar som de involverede parter pådrager sig overfor hinanden og tredjemand.",
      "Vi skræddersyer dækningen til det konkrete projekt — eller etablerer en årsentrepriseaftale der dækker alle jeres projekter løbende. Det sparer tid, administration og penge sammenlignet med enkeltpolicer.",
    ],
    features: [
      {
        eyebrow: "Hvad dækker entrepriseforsikring?",
        title: "All-risks under udførelsen — ikke kun brand",
        body: "En entrepriseforsikring dækker alle pludselige skader på byggeriet, uanset årsag — plus ansvar overfor naboer og tredjemand, eksisterende bygninger på grunden og materialer på byggepladsen.",
        bullets: [
          { label: "Byggeriet under opførelse", body: "Materialer, elementer og delvist opført byggeri dækkes mod alle pludselige skader." },
          { label: "Eksisterende bygninger", body: "Særligt relevant ved tilbygninger og renoveringer — skader på eksisterende dele dækkes." },
          { label: "Ansvar overfor tredjemand", body: "Erstatning hvis arbejdet forårsager skade på naboer eller passanter." },
          { label: "Nedtagnings- og oprydningsomkostninger", body: "Efter dækningsberettiget skade." },
        ],
        image: IMG.nordan27,
        imageSide: "right",
      },
      {
        eyebrow: "Projektspecifik vs. årsaftale",
        title: "To måder at tegne dækning på",
        body: "Enkeltprojektpolicer passer godt til store, komplicerede byggerier. Årsentrepriseaftaler er mere effektive hvis I udfører flere mindre projekter årligt.",
        bullets: [
          { label: "Enkeltprojekt-entreprise", body: "Én police, ét projekt. Typisk 12–24 måneders dækning afhængig af byggetid." },
          { label: "Årsentrepriseforsikring", body: "Løbende aftale der dækker alle jeres projekter op til en aftalt størrelse. Mindre administration." },
          { label: "Bygherreleveranceforsikring", body: "For bygherren selv — dækker materialer indtil entreprenøren overtager dem." },
        ],
        image: IMG.mandrup,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Hvem skal tegne entrepriseforsikringen — bygherre eller entreprenør?",
        a: "Det kommer an på entrepriseformen (total-, hoved- eller fagentreprise) og hvad der er aftalt i kontrakten. Typisk tegner bygherren forsikringen ved større byggerier efter AB18-standarden. Vi hjælper med at få det korrekt afstemt inden byggestart.",
      },
      {
        q: "Dækker almindelig erhvervs- og produktansvarsforsikring ikke byggeriet?",
        a: "Nej — erhvervsansvar dækker driften, ikke de pludselige skader på selve byggeriet under opførelse. Entrepriseforsikring er nødvendig ud over standard ansvarsdækning.",
      },
      {
        q: "Hvad koster en entrepriseforsikring?",
        a: "Typisk 0,2–0,8% af entreprisesummen afhængigt af byggeriets kompleksitet, tid og risikoprofil. Større og mere komplekse projekter har lavere procentsats.",
      },
    ],
    related: ["erhvervs-og-produktansvarsforsikring", "bygningsforsikring"],
  },
  {
    slug: "it-ansvarsforsikring",
    title: "IT-ansvarsforsikring",
    navLabel: "IT-ansvar",
    letter: "I",
    eyebrow: "Professionelt ansvar",
    metaDescription: "IT-ansvarsforsikring for konsulenthuse og softwarevirksomheder. Dækker krav fra kunder ved fejl, forsinkelser, SLA-brud eller databrud.",
    intro: "Som IT-leverandør lever I af tillid og leveringsevne. IT-ansvar dækker de økonomiske krav hvis en leverance går galt — fejl i kode, forsinket implementation, SLA-brud eller datalæk hos kunden.",
    heroImage: IMG.vandergriff,
    cvrLabel: "Se hvordan vi kan hjælpe med jeres IT-ansvarsforsikring",
    introParagraphs: [
      "IT-ansvarsforsikring er specielt designet til branchen og dækker det professionsansvar der følger af at levere software, hosting, integration eller rådgivning. Den adskiller sig fra almindelig erhvervsansvar ved også at dække rent økonomiske tab, ikke kun person- og tingsskader.",
      "For konsulenthuse og SaaS-virksomheder er den nærmest obligatorisk — både fordi kunderne ofte kræver det i kontrakten, og fordi et enkelt krav kan løbe op i mange millioner.",
    ],
    features: [
      {
        eyebrow: "Typiske dækningssituationer",
        title: "Når leverancen ikke gør det I lovede",
        body: "IT-ansvar dækker de økonomiske konsekvenser af fejl eller udeladelser i jeres rådgivning, kode, konfiguration eller drift.",
        bullets: [
          { label: "Softwarefejl", body: "Fejl i kode der leder til økonomisk tab hos kunden." },
          { label: "SLA-brud", body: "Uptime eller performance under det aftalte niveau." },
          { label: "Forsinket levering", body: "Hvis projektet trækker ud og kunden lider tab." },
          { label: "Datatab og databrud", body: "Hvis jeres håndtering forårsager GDPR-overtrædelser hos kunden." },
          { label: "Rådgivningsfejl", body: "Fejl i jeres anbefalinger eller konfigurationsvalg." },
        ],
        image: IMG.vandergriff,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Er IT-ansvar det samme som cyberforsikring?",
        a: "Nej — IT-ansvar dækker når I som leverandør er ansvarlig for tab hos en kunde. Cyberforsikring dækker når I selv bliver ramt af et angreb. Vi anbefaler at begge er på plads.",
      },
      {
        q: "Mine kunder kræver 10 mio. i dækning — er det normalt?",
        a: "Ja, især i enterprise-projekter. Dækningssummer op til 25 mio. er ikke usædvanlige. Vi forhandler vilkår der matcher kundekontrakter, så I kan byde på opgaverne.",
      },
    ],
    related: ["cyberforsikring", "professionel-ansvarsforsikring"],
  },
  {
    slug: "kollektiv-ulykkesforsikring",
    title: "Kollektiv ulykkesforsikring",
    navLabel: "Kollektiv ulykke",
    letter: "K",
    eyebrow: "Medarbejdere",
    metaDescription: "Kollektiv ulykkesforsikring giver jeres medarbejdere tryghed ved ulykker døgnet rundt — også uden for arbejdstiden. Et stærkt, skattefrit medarbejdergode.",
    intro: "Kollektiv ulykkesforsikring er et stærkt medarbejdergode. Den supplerer den lovpligtige arbejdsskadeforsikring med dækning døgnet rundt — også fritidsulykker og ferier.",
    heroImage: IMG.partnership,
    cvrLabel: "Få tilbud på kollektiv ulykkesforsikring",
    introParagraphs: [
      "Arbejdsskadeforsikringen er lovpligtig, men dækker kun arbejdsulykker. Kollektiv ulykkesforsikring udvider trygheden til at gælde hele døgnet — både i fritiden, på ferien og i weekenden. Det giver medarbejderne et ægte gode og styrker jer som arbejdsgiver.",
      "Dækningen er skattefri for medarbejderen op til en vis grænse, hvilket gør den til et af de mest omkostningseffektive personalegoder der findes.",
    ],
    features: [
      {
        eyebrow: "Forskellen på lovpligtig vs. kollektiv",
        title: "Arbejdsskade dækker kun arbejdstiden",
        body: "Mange medarbejdere tror de er dækket 24/7 af virksomheden — men det er kun tilfældet hvis I har tegnet kollektiv ulykke. Det er en god ting at kommunikere som et konkret benefit.",
        bullets: [
          { label: "Arbejdsskadeforsikring", body: "Lovpligtig, men dækker kun ulykker der er arbejdsrelaterede." },
          { label: "Kollektiv ulykkesforsikring", body: "Supplerende, frivillig — dækker 24/7 i hele verden." },
          { label: "Rejseulykke inkluderet", body: "Typisk også under ferier og tjenesterejser." },
          { label: "Skattefri op til 500 kr./md.", body: "Eget bidrag fra medarbejderen ikke nødvendigt op til grænsen." },
        ],
        image: IMG.partnership,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Er kollektiv ulykke skattefri for medarbejderen?",
        a: "Ja — op til grænsebeløbet (ca. 500 kr./måned) er dækningen skattefri. Over dette beløb beskattes det som B-indkomst hos medarbejderen.",
      },
      {
        q: "Hvordan adskiller den sig fra sundhedsforsikring?",
        a: "Sundhedsforsikring dækker behandling og sygdom. Kollektiv ulykke dækker erstatning ved varigt mén eller dødsfald som følge af ulykker. De to supplerer hinanden.",
      },
    ],
    related: ["arbejdsskadeforsikring", "sundhedsforsikring"],
  },
  {
    slug: "kriminalitetsforsikring",
    title: "Kriminalitetsforsikring",
    navLabel: "Kriminalitet",
    letter: "K",
    eyebrow: "Intern risiko",
    metaDescription: "Kriminalitetsforsikring dækker virksomheden mod tab ved underslæb, CEO-fraud, fakturasvindel eller bedrageri — både internt og eksternt.",
    intro: "Intern kriminalitet og CEO-fraud koster danske virksomheder millioner hvert år. Kriminalitetsforsikring dækker den økonomiske konsekvens når medarbejdere eller eksterne aktører snyder virksomheden.",
    heroImage: IMG.meeting,
    cvrLabel: "Få jeres kriminalitetsforsikring tjekket",
    introParagraphs: [
      "Danske virksomheder rammes langt oftere af intern svindel end af ydre cyberangreb. Typisk handler det om CEO-fraud (hvor en medarbejder lokkes til at overføre penge på vegne af en falsk direktør), fakturabedrageri eller underslæb i regnskabsafdelingen.",
      "Kriminalitetsforsikring dækker det økonomiske tab — og giver ofte adgang til et beredskab af efterforskere og jurister der hjælper med at håndtere sagen korrekt.",
    ],
    features: [
      {
        eyebrow: "Hvad dækkes",
        title: "Både de klassiske og de moderne svindelformer",
        body: "Moderne kriminalitetspolicer er udviklet til også at omfatte tab ved digital social engineering — ikke kun fysisk kasse- og varetyveri.",
        bullets: [
          { label: "Medarbejderunderslæb", body: "Tyveri af penge, varer eller aktiver fra egne medarbejdere." },
          { label: "CEO-fraud / BEC", body: "Svindel hvor en medarbejder lokkes til at overføre penge til en falsk modtager." },
          { label: "Fakturasvindel", body: "Manipulerede fakturaer med ændrede kontonumre." },
          { label: "Computermanipulation", body: "Uautoriseret ændring af betalingsdata i systemer." },
          { label: "Ekstern tyveri", body: "Indbrud, tasketyveri, kontantkuffert under transport." },
        ],
        image: IMG.moisa,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Dækker forsikringen også hvis vores medarbejder er blevet snydt?",
        a: "Ja — moderne policer dækker både når medarbejderen er offeret (fx CEO-fraud) og når medarbejderen er svindleren. Vigtigt at den nye digitale dækning er med i policen.",
      },
      {
        q: "Hvor stor bør dækningssummen være?",
        a: "Afhænger af cashflow og beløbsstørrelser i daglig drift. Vi anbefaler typisk 1–5 mio. for SMB'er og op til 25 mio. for større virksomheder.",
      },
    ],
    related: ["cyberforsikring", "netbanksforsikring", "bestyrelsesansvarsforsikring"],
  },
  {
    slug: "loosereforsikring",
    title: "Løsøreforsikring",
    navLabel: "Løsøre",
    letter: "L",
    eyebrow: "Inventar og indbo",
    metaDescription: "Løsøreforsikring dækker virksomhedens inventar, maskiner, varer, lager og it-udstyr mod brand, tyveri, vandskade og pludselige skader.",
    intro: "Alt indvendigt i lokalet — maskiner, varer, it, kontorinventar — udgør betydelige værdier. Løsøreforsikring sikrer jer økonomisk hvis en brand, vandskade eller indbrud rammer.",
    heroImage: IMG.business,
    cvrLabel: "Få tjekket jeres løsøreforsikring",
    introParagraphs: [
      "Løsøreforsikring er typisk grundforsikringen for virksomheder der ikke ejer deres ejendom selv. Den dækker alt det 'løsørlige' — inventar, maskiner, it-udstyr, lager og varer — mod brand, storm, vand, indbrud og andre pludselige skader.",
      "Det store spørgsmål er altid: er summerne realistiske? Vi ser ofte policer hvor summer ikke er justeret i 5–10 år mens virksomheden har tredoblet sit lager og udskiftet hele maskinparken. Det betyder underforsikring — og problemer når skaden sker.",
    ],
    features: [
      {
        eyebrow: "Typiske dækninger",
        title: "Fra kontorinventar til højværdi-produktion",
        body: "Løsøreforsikring tilpasses virksomhedens profil. Produktionsvirksomheder har brug for tillæg for maskiner og lager; kontorvirksomheder har hovedfokus på it og inventar.",
        bullets: [
          { label: "Inventar og kontorinventar", body: "Borde, stole, receptionsudstyr, lamper mv." },
          { label: "It-udstyr", body: "Computere, servere, printere — kan kræve separat dækning ved høje værdier." },
          { label: "Varelager", body: "Ved indstigende værdier kan kvartalsvis indberetning spare præmie." },
          { label: "Maskiner", body: "Produktionsudstyr — kan med fordel også have maskinkaskoforsikring." },
        ],
        image: IMG.business,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Hvordan fastsættes summen?",
        a: "Ud fra genanskaffelsesværdien — altså hvad det ville koste at købe tilsvarende udstyr nyt i dag. Ikke bogført værdi. Vi hjælper med den rigtige beregning.",
      },
    ],
    related: ["bygningsforsikring", "driftstabsforsikring"],
  },
  {
    slug: "transportforsikring",
    title: "Transportforsikring",
    navLabel: "Transport",
    letter: "T",
    eyebrow: "Varer under transport",
    metaDescription: "Transportforsikring dækker varer under transport — ad vej, sø eller luft. Skal virksomheden sende eller modtage gods, er den uundværlig.",
    intro: "Varer under transport er særligt udsatte. Transportforsikring dækker hele rejsen — og sikrer at jeres eller kundens varer er værdiforsikret fra afsendelse til levering.",
    heroImage: IMG.puskeiler,
    cvrLabel: "Få tilbud på jeres transportforsikring",
    introParagraphs: [
      "Ansvaret for varer under transport kan ligge hos afsender, transportør eller modtager — afhængigt af aftalevilkår (Incoterms) og branche. En transportforsikring fjerner usikkerheden og sikrer at I er dækket uanset hvor skaden opstår.",
      "Vi sammensætter både enkeltrejsepolicer til højværdivarer og løbende aftaler til virksomheder med fast transportflow.",
    ],
    features: [
      {
        eyebrow: "Dækningstyper",
        title: "Transportforsikring handler om hvor risikoen ligger",
        body: "Incoterms-reglerne definerer hvem der bærer risikoen i hvert led. Vi oversætter jeres kontrakter til den rette dækningsstruktur.",
        bullets: [
          { label: "All risks", body: "Bredeste dækning — alle pludselige skader under transport." },
          { label: "Only named perils", body: "Kun specifikt nævnte risici — typisk billigere." },
          { label: "Single transit", body: "Enkeltrejse — ad hoc transport af højværdi." },
          { label: "Open cover", body: "Løbende aftale — alle transporter dækkes automatisk." },
        ],
        image: IMG.puskeiler,
        imageSide: "right",
      },
    ],
    related: ["bilforsikring"],
  },
  {
    slug: "netbanksforsikring",
    title: "Netbanksforsikring",
    navLabel: "Netbank",
    letter: "N",
    eyebrow: "Bedrageri",
    metaDescription: "Netbanksforsikring dækker tab ved netbanksbedrageri og uautoriserede transaktioner via virksomhedens bankkonti — et supplement til cyber- og kriminalitetsforsikring.",
    intro: "Netbanksbedrageri rammer virksomheder hver måned i Danmark. Forsikringen dækker de økonomiske tab hvis jeres konti kompromitteres — og er typisk et stærkt supplement til cyber- og kriminalitetsforsikring.",
    heroImage: IMG.moisa,
    cvrLabel: "Få tilbud på jeres netbanksforsikring",
    introParagraphs: [
      "Bankerne har deres egne sikkerhedsnet — men dækningen er begrænset, og ofte ender virksomheden med tabet hvis sagen ikke klart kan kategoriseres som bankens fejl. Netbanksforsikring lukker det hul og giver jer en økonomisk bund under kontoerne.",
      "Det er en lille tilføjelse til eksisterende cyber- eller kriminalitetsforsikring, men kan dække tab på millioner ved en enkelt svindelsag.",
    ],
    features: [
      {
        eyebrow: "Hvad dækkes",
        title: "Når kontoen bliver kompromitteret",
        body: "Forsikringen træder til når uautoriserede transaktioner sker gennem jeres netbanksløsninger — uanset om det sker via phishing, malware, insider eller svag intern kontrol.",
        bullets: [
          { label: "Phishing og kompromitterede logins", body: "Svindel efter at kriminelle har fået adgang til netbank via login-tricks." },
          { label: "Malware og man-in-the-browser", body: "Transaktioner der ændres af virus under overførsel." },
          { label: "Falske betalingsordrer", body: "Når medarbejdere vildledes til at godkende forkerte overførsler." },
        ],
        image: IMG.moisa,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Dækker banken ikke allerede det her?",
        a: "Banken dækker typisk kun ved klare fejl i bankens egne systemer. Hvis angrebet skyldes jeres netværk, medarbejdere eller en kompromitteret login — så ligger tabet hos jer.",
      },
    ],
    related: ["cyberforsikring", "kriminalitetsforsikring"],
  },
  {
    slug: "professionel-ansvarsforsikring",
    title: "Professionel ansvarsforsikring",
    navLabel: "Professionel ansvar",
    letter: "P",
    eyebrow: "Rådgiveransvar",
    metaDescription: "Professionel ansvarsforsikring (E&O) dækker rådgivningsvirksomheder mod krav som følge af fejl eller udeladelser i den ydede rådgivning.",
    intro: "Rådgivere, konsulenter, arkitekter, ingeniører og revisorer lever af deres faglige vurderinger. Professionel ansvar (E&O) dækker de økonomiske krav hvis en vurdering eller rådgivning fører til tab for kunden.",
    heroImage: IMG.meeting,
    cvrLabel: "Få tilbud på jeres professionelle ansvarsforsikring",
    introParagraphs: [
      "Professionel ansvar — kendt internationalt som Errors & Omissions (E&O) — er grundstenen for alle rådgivningsvirksomheder. Den dækker når jeres rådgivning, analyse eller beregninger fører til økonomisk tab hos kunden — uanset om det skyldes en fejl, en udeladelse eller en mangelfuld vurdering.",
      "Mange kunder kræver den også kontraktligt — særligt offentlige udbud, enterprise-projekter og arkitekt/ingeniør-aftaler. Uden dækning kan I hverken byde ind eller tegne kontrakten.",
    ],
    features: [
      {
        eyebrow: "Hvem har brug for E&O?",
        title: "Alle der sælger deres faglige vurdering",
        body: "Typisk brancher: rådgivende ingeniører, arkitekter, managementkonsulenter, revisorer, advokater, finansielle rådgivere, IT-konsulenter, ejendomsmæglere og markedsføringsbureauer.",
        bullets: [
          { label: "Arkitekter og ingeniører", body: "Dækker fejl i tegninger, beregninger og tilsyn." },
          { label: "Konsulenter", body: "Beskytter mod krav ved fejlbehæftet strategi- eller rådgivning." },
          { label: "Revisorer", body: "Dækker fejl i regnskaber, skatterådgivning og due diligence." },
          { label: "Ejendomsmæglere", body: "Dækker forkert vurdering eller manglende oplysning om skjulte fejl." },
        ],
        image: IMG.meeting,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Er E&O det samme som erhvervsansvar?",
        a: "Nej. Erhvervsansvar dækker fysiske skader (person- og tings­skade). Professionel ansvar dækker rent økonomisk tab som følge af fagligt arbejde. Begge er typisk nødvendige.",
      },
      {
        q: "Hvor længe efter udført arbejde kan kunden rejse krav?",
        a: "Typisk 3–5 år efter leverancen, længere for arkitekter og ingeniører (op til 20 år efter AB-systemerne). En 'retroaktiv dato' i policen sikrer dækning for ældre sager.",
      },
    ],
    related: ["advokatansvarsforsikring", "it-ansvarsforsikring", "bestyrelsesansvarsforsikring"],
  },
  {
    slug: "sundhedsforsikring",
    title: "Sundhedsforsikring",
    navLabel: "Sundhedsforsikring",
    letter: "S",
    eyebrow: "Medarbejdergoder",
    metaDescription: "Sundhedsforsikring som medarbejdergode — reducerer sygefravær og styrker fastholdelse. Dækker privat behandling, fysioterapi, psykolog og speciallæge.",
    intro: "En stærk sundhedsforsikring er blevet et standardkrav blandt medarbejdere. Vi forhandler programmer der både reducerer sygefravær og styrker jer i kampen om talenter — og tilpasses jeres branche og virksomhedsstørrelse.",
    heroImage: IMG.partnership,
    cvrLabel: "Få tilbud på sundhedsforsikring til jeres medarbejdere",
    introParagraphs: [
      "Sundhedsforsikring er i dag et af de mest eftertragtede medarbejdergoder — og for mange kandidater er det en forudsætning for at sige ja til et job. Hurtig adgang til behandling betyder også mindre sygefravær og hurtigere tilbagekomst efter skader og operationer.",
      "Vi sammensætter sundhedsforsikringer fra 5 medarbejdere og op til virksomheder med tusindvis af ansatte. Vi vurderer både leverandørernes netværk, behandlingstilgængelighed og pris — ikke kun det billigste tilbud.",
    ],
    features: [
      {
        eyebrow: "Hvad dækker en moderne sundhedsforsikring?",
        title: "Fra fysioterapi til speciallægehenvisning",
        body: "Den typiske dækning spænder vidt. Vi hjælper med at vælge det niveau der matcher jeres branche — fysisk arbejde har brug for mere fysioterapi, kontormiljøer prioriterer psykolog og ergoterapi.",
        bullets: [
          { label: "Privat hospitalsbehandling", body: "Undgå ventelister ved operationer og udredning." },
          { label: "Fysioterapi og kiropraktor", body: "Typisk 10–20 behandlinger årligt." },
          { label: "Psykologhjælp", body: "8–12 sessioner — nøgle for moderne fastholdelse." },
          { label: "Speciallægeundersøgelse", body: "Uden henvisning fra egen læge." },
          { label: "Misbrugsbehandling", body: "Alkohol, stoffer, spiseforstyrrelser." },
        ],
        image: IMG.partnership,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Er sundhedsforsikring skattefri?",
        a: "Ja — sundhedsforsikring er skattefri for medarbejderen efter gældende regler. Det er derfor blandt de mest værdsatte og billigste medarbejdergoder at tilbyde.",
      },
      {
        q: "Kan vi vælge forskellige niveauer til forskellige medarbejdergrupper?",
        a: "Ja. Det kaldes typisk differentieret program og er helt legitimt — fx kan ledelse have udvidet dækning, mens alle medarbejdere har en basispakke.",
      },
    ],
    related: ["kollektiv-ulykkesforsikring", "arbejdsskadeforsikring"],
  },
  {
    slug: "ejendomsforsikring",
    title: "Ejendomsforsikring",
    navLabel: "Ejendom",
    letter: "E",
    eyebrow: "Fast ejendom",
    metaDescription:
      "Ejendomsforsikring til udlejnings- og investeringsejendomme, ejerforeninger og andelsboligforeninger. Bygning, husejeransvar og lejetab samlet — vi sikrer at summerne matcher genopførselsværdien.",
    intro:
      "Ejendomsforsikring er paraplyen over alt det der kan ramme en udlejnings- eller investeringsejendom — selve bygningen, ansvaret som ejer og det lejetab der følger efter en skade. Vi sikrer at dækningen er komplet, og at summerne matcher den reelle genopførselsværdi.",
    heroImage: IMG.ejendomBygning,
    cvrLabel: "Få jeres ejendomsforsikring gennemgået gratis",
    introParagraphs: [
      "For ejere af udlejningsejendomme, ejerforeninger og andelsboligforeninger er ejendomsforsikringen ofte den største enkeltpost på driftsbudgettet — og samtidig den der har størst betydning hvis uheldet er ude. En brand, en rørskade eller en stormskade kan koste millioner, og er summen sat forkert, ender ejeren selv med en del af regningen.",
      "Vi ser ofte ejendomme der er forsikret på tal fra sidste renovering — uden at prisstigninger på materialer og håndværk er regnet med. Det betyder underforsikring. Vi gennemgår policen, validerer dækningssummer og tager programmet i udbud, så I betaler den rigtige pris for den rigtige dækning.",
    ],
    features: [
      {
        eyebrow: "Hvad bør en ejendomsforsikring rumme",
        title: "Mere end bygningen — også ansvar og lejetab",
        body: "En ejendomsforsikring er bygget op af flere dækninger, der tilsammen beskytter både murstenene og økonomien bag dem. Vi sammensætter det program der passer netop jeres ejendom og lejere.",
        bullets: [
          { label: "Bygningsbrand og udvidet dækning", body: "Brand, storm, skybrud, vandskade og indbrud — fundamentet i enhver ejendomsforsikring." },
          { label: "Skjulte rør og stikledninger", body: "Ofte de dyreste skader — bør altid være med, særligt i ældre ejendomme." },
          { label: "Husejeransvar", body: "Dækker ejerens ansvar hvis en lejer eller forbipasserende kommer til skade på ejendommen." },
          { label: "Huslejetab", body: "Kompenserer for mistede lejeindtægter mens ejendommen genopbygges efter en skade." },
          { label: "Svamp, insekt og rådskade", body: "Vigtigt tilvalg i ejendomme med ældre trækonstruktioner." },
          { label: "Glas og sanitet", body: "Relevant for ejendomme med butikslejemål og udadvendte facader." },
        ],
        image: IMG.ejendomBygning,
        imageSide: "right",
      },
      {
        eyebrow: "Bygningsforsikring vs. ejendomsforsikring",
        title: "Hvad er forskellen?",
        body: "Begreberne bruges ofte i flæng, men en ejendomsforsikring tænkes typisk bredere — som det samlede program for en udlejnings- eller investeringsejendom, hvor ansvar og lejetab er lige så vigtige som selve bygningsskaden.",
        bullets: [
          { label: "Bygningsforsikring", body: "Dækker den fysiske bygning mod brand, vand, storm mv." },
          { label: "Ejendomsforsikring", body: "Samler bygning, husejeransvar og lejetab i ét program for ejeren." },
          { label: "Investeringsejendomme", body: "Her er lejetab og ansvar afgørende — en ren bygningsdækning er sjældent nok." },
        ],
        image: IMG.marion,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "3 dækninger", label: "bygning, husejeransvar og lejetab samlet i ét program" },
      { value: "10–25%", label: "typisk besparelse ved at tage programmet i udbud" },
      { value: "1× årligt", label: "anbefalet gennemgang af dækningssummer" },
    ],
    faq: [
      {
        q: "Hvordan fastsættes forsikringssummen korrekt?",
        a: "Den skal afspejle genopførselsomkostningerne — altså hvad det koster at genopbygge ejendommen i dag — ikke ejendomsvurderingen eller den bogførte værdi. En bygningsbesigtigelse giver det mest præcise grundlag og beskytter mod underforsikring.",
      },
      {
        q: "Er huslejetab automatisk med i dækningen?",
        a: "Ikke altid. I mange standardpolicer er huslejetab kun et tilvalg eller har en for kort dækningsperiode. For udlejningsejendomme er det en af de vigtigste dækninger, og vi sikrer at perioden matcher en realistisk genopbygningstid.",
      },
      {
        q: "Gælder ejendomsforsikring også for ejer- og andelsboligforeninger?",
        a: "Ja. Foreninger har samme grundbehov — bygning, ansvar og ofte bestyrelsesansvar og arbejdsskade oveni. Vi rådgiver både private ejere, professionelle udlejere og foreningsbestyrelser.",
      },
    ],
    related: ["bygningsforsikring", "forsikring-andelsboligforening-ejerforening", "driftstabsforsikring"],
  },
  {
    slug: "ansvarsforsikring",
    title: "Ansvarsforsikring",
    navLabel: "Erhvervsansvar",
    letter: "A",
    eyebrow: "Ansvar",
    metaDescription:
      "Erhvervsansvarsforsikring dækker virksomheden mod erstatningskrav når jeres drift forårsager person- eller tingsskade på andre. Vi sikrer at dækningssum og vilkår matcher jeres reelle risiko.",
    intro:
      "Ansvarsforsikring er den grundlæggende beskyttelse enhver virksomhed bør have. Den dækker erstatningskravet hvis I under driften forvolder skade på andres person eller ejendom — og én stor sag kan ellers true hele økonomien.",
    heroImage: IMG.moisa,
    cvrLabel: "Se om jeres erhvervsansvarsforsikring dækker nok",
    introParagraphs: [
      "Erhvervsansvarsforsikring — også kaldet almindelig ansvarsforsikring — træder til når jeres virksomhed bliver mødt med et erstatningskrav, fordi noget I har gjort under driften har skadet en anden. Det kan være montøren der beskadiger kundens gulv, varen der vælter på et lager, eller stilladset der falder ned på en parkeret bil.",
      "Mange virksomheder har en standarddækning, der ikke er fulgt med virkeligheden — for lav dækningssum, forkert branchekode eller geografiske begrænsninger der udelukker netop de markeder I sælger til. Vi gennemgår jeres reelle eksponering og sikrer at policen matcher den.",
    ],
    features: [
      {
        eyebrow: "Tre former for ansvar",
        title: "Erhvervs-, produkt- og rådgiveransvar er ikke det samme",
        body: "Det er afgørende at forstå forskellen — de dækker hver sin type skade, og den ene kan ikke erstatte den anden. Vi sikrer at I har den rette kombination uden huller i kæden.",
        bullets: [
          { label: "Erhvervsansvar", body: "Person- og tingsskade I forvolder under den løbende drift — fx hos en kunde eller på en byggeplads." },
          { label: "Produktansvar", body: "Skader forårsaget af et produkt I har solgt eller leveret, efter det har forladt jer." },
          { label: "Professionelt ansvar (E&O)", body: "Rent økonomisk tab som følge af fejl i jeres faglige rådgivning — en separat dækning." },
          { label: "Underleverandører", body: "Vi tjekker at ansvaret er afstemt i hele kæden, så der ikke opstår et dækningshul." },
        ],
        image: IMG.moisa,
        imageSide: "right",
      },
      {
        eyebrow: "Det vi tjekker for jer",
        title: "Er dækningssum og geografi i orden?",
        body: "De to hyppigste problemer vi ser er en dækningssum der ikke står mål med en stor kontrakt, og en geografisk afgrænsning der udelukker eksportmarkeder. Begge dele kan koste dyrt når skaden sker.",
        bullets: [
          { label: "Dækningssum", body: "Typisk 10 mio. kr. for mindre virksomheder — men store kunder og kontrakter kan kræve mere." },
          { label: "Geografisk dækning", body: "Europa er standard; USA, Canada og Australien kræver særskilt og dyrere dækning." },
          { label: "Kontraktkrav", body: "Mange kunder kræver dokumenteret ansvarsdækning før de vil indgå aftale." },
        ],
        image: IMG.mandrup,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Er erhvervsansvarsforsikring lovpligtig?",
        a: "Nej, der er ingen generel lovpligt om erhvervsansvarsforsikring i Danmark. Men i praksis er den uundværlig — og mange kunder, udbud og samarbejdsaftaler kræver den kontraktligt, før de vil arbejde sammen med jer.",
      },
      {
        q: "Hvad er forskellen på erhvervsansvar og produktansvar?",
        a: "Erhvervsansvar dækker skader I forvolder under driften — mens arbejdet står på. Produktansvar dækker skader forårsaget af et produkt efter det er leveret. De fleste produktions- og handelsvirksomheder har brug for begge, og de tegnes ofte samlet.",
      },
      {
        q: "Hvor stor bør dækningssummen være?",
        a: "Det afhænger af branche, størrelse og eksponering. For mindre virksomheder er 10 mio. kr. typisk udgangspunktet, mens producenter og virksomheder med eksport ofte har brug for væsentligt mere. Vi hjælper med at fastsætte det rigtige niveau.",
      },
    ],
    related: ["erhvervs-og-produktansvarsforsikring", "professionel-ansvarsforsikring", "bestyrelsesansvarsforsikring"],
  },
  {
    slug: "it-kaskoforsikring",
    title: "IT-kaskoforsikring",
    navLabel: "IT-kasko",
    letter: "I",
    eyebrow: "Hardware og udstyr",
    metaDescription:
      "IT-kaskoforsikring (all-risk) dækker virksomhedens it-udstyr — servere, computere, netværk og av-udstyr — mod pludselige skader, tyveri, brand, vand og overspænding. Inkl. dataretablering og meromkostninger.",
    intro:
      "IT-kaskoforsikring beskytter selve hardwaren — servere, computere, netværksudstyr og av-installationer — mod pludselige fysiske skader. Hvor cyberforsikring dækker angreb og IT-ansvar dækker jeres leverancer, dækker IT-kasko udstyret og det data der ligger på det.",
    heroImage: IMG.itKaskoServer,
    cvrLabel: "Få tilbud på jeres IT-kaskoforsikring",
    introParagraphs: [
      "Moderne virksomheder har store værdier bundet i it-udstyr — og endnu større værdier i det data og de systemer der kører på det. En overspænding, en vandskade i serverrummet eller et indbrud med tyveri af udstyr kan lamme driften på få minutter.",
      "IT-kaskoforsikring er en all-risk-dækning, der favner bredere end den almindelige løsøreforsikring. Den dækker ikke kun genanskaffelsen af hardwaren, men typisk også reetablering af data og software samt de meromkostninger der opstår mens systemerne er nede.",
    ],
    features: [
      {
        eyebrow: "Hvad dækker IT-kasko",
        title: "All-risk på hardware — og det der ligger på den",
        body: "IT-kasko er bredere end en standard løsøredækning. Den er bygget til at favne de pludselige og uforudsete skader der rammer netop teknisk udstyr.",
        bullets: [
          { label: "Pludselige fysiske skader", body: "Fald, stød, væskespild og mekaniske skader på udstyret." },
          { label: "Kortslutning og overspænding", body: "Skader fra strømudsving og lynnedslag — ofte undtaget i basisdækninger." },
          { label: "Brand, vand og tyveri", body: "De klassiske risici, der er særligt kritiske i serverrum." },
          { label: "Dataretablering", body: "Omkostninger til at genskabe tabt data og geninstallere software." },
          { label: "Meromkostninger", body: "Leje af erstatningsudstyr og ekstra arbejdstimer mens driften genoprettes." },
        ],
        image: IMG.itKaskoServer,
        imageSide: "right",
      },
      {
        eyebrow: "IT-kasko, IT-ansvar og cyber",
        title: "Tre forsikringer der dækker hver sin risiko",
        body: "It-virksomheder forveksler dem ofte — men de tre dækker vidt forskellige situationer, og de fleste har brug for mere end én.",
        bullets: [
          { label: "IT-kasko", body: "Dækker jeres eget udstyr og data mod fysiske skader og tyveri." },
          { label: "IT-ansvar", body: "Dækker når I som leverandør forvolder tab hos en kunde." },
          { label: "Cyberforsikring", body: "Dækker når I rammes af et angreb — ransomware, databrud og driftstab." },
        ],
        image: IMG.vandergriff,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Er IT-kasko ikke allerede dækket af min løsøreforsikring?",
        a: "Delvist — men løsøreforsikringen dækker typisk kun navngivne risici som brand og indbrud. IT-kasko er en all-risk-dækning, der også omfatter pludselige driftsskader, kortslutning og overspænding, og som oftest inkluderer dataretablering. For udstyrstunge virksomheder er forskellen markant.",
      },
      {
        q: "Dækker IT-kasko også tab af data?",
        a: "Selve hardwaren dækkes altid, og de fleste policer inkluderer omkostningerne til at reetablere data og geninstallere software. Det forudsætter dog at I har fungerende backups — noget vi altid anbefaler at få vurderet samtidig.",
      },
    ],
    related: ["it-ansvarsforsikring", "cyberforsikring", "loosereforsikring"],
  },
  {
    slug: "fragtforeransvarsforsikring",
    title: "Fragtføreransvarsforsikring",
    navLabel: "Fragtføreransvar",
    letter: "F",
    eyebrow: "Transportansvar",
    metaDescription:
      "Fragtføreransvarsforsikring dækker vognmandens ansvar for kundens gods under transport — efter CMR-loven og dansk vejtransportlovgivning. Vi sikrer at dækningen følger jeres reelle ansvar.",
    intro:
      "Som vognmand har I ansvaret for kundens gods fra det øjeblik I overtager det, til det er leveret. Fragtføreransvarsforsikring dækker det erstatningsansvar — og sikrer at I ikke selv står med regningen, når godset bliver beskadiget eller forsvinder undervejs.",
    heroImage: IMG.fragtLaesning,
    cvrLabel: "Få tjekket jeres fragtføreransvarsforsikring",
    introParagraphs: [
      "Fragtførerens ansvar er reguleret af loven — internationalt af CMR-konventionen og nationalt af den danske vejtransportlovgivning. Ansvaret er som udgangspunkt begrænset til SDR 8,33 pr. kilo bruttovægt af det beskadigede gods, uanset hvad varen reelt er værd. Det er dette lovbestemte ansvar, fragtføreransvarsforsikringen er bygget til at dække.",
      "Faldgruben er, at mange vognmænd tror de er fuldt dækket, men har en police der kun følger CMR-ansvaret ved international kørsel. Kører I også nationalt, skal det udtrykkeligt aftales at CMR-loven gælder — ellers kan I stå uden ordentlig dækning. Vi gennemgår jeres betingelser og forsikring, så ansvar og dækning passer sammen.",
    ],
    features: [
      {
        eyebrow: "Hvad dækker fragtføreransvar",
        title: "Jeres ansvar for godset — fra overtagelse til levering",
        body: "Forsikringen følger det ansvar lovgivningen pålægger fragtføreren. Det er vigtigt at dækningen matcher den type kørsel I rent faktisk udfører — national, international eller begge dele.",
        bullets: [
          { label: "Beskadigelse og bortkomst", body: "Erstatning for gods der skades eller forsvinder under transporten — op til den lovbestemte grænse." },
          { label: "CMR-ansvar (international)", body: "Dækker ansvaret efter CMR-konventionen ved grænseoverskridende vejtransport." },
          { label: "National transport", body: "Kræver at CMR-loven udtrykkeligt aftales — ellers gælder andre regler. Vi sikrer at det er på plads." },
          { label: "Følgeskader", body: "Visse tab ud over selve godsværdien kan dækkes — afhængigt af aftalegrundlag og betingelser." },
        ],
        image: IMG.fragtLaesning,
        imageSide: "right",
      },
    ],
    stats: [
      { value: "SDR 8,33/kg", label: "lovbestemt ansvarsgrænse pr. kilo bruttovægt" },
      { value: "CMR", label: "konventionen der gælder international vejtransport" },
      { value: "National + int.", label: "ved national kørsel skal CMR-loven aftales udtrykkeligt" },
    ],
    faq: [
      {
        q: "Er fragtføreransvarsforsikring lovpligtig?",
        a: "Selve forsikringen er ikke lovpligtig, men ansvaret for godset er lovbestemt. Uden forsikring hæfter I selv for erstatningen, og i praksis kræver de fleste transportkøbere og samarbejdspartnere dokumenteret dækning, før de overdrager gods til jer.",
      },
      {
        q: "Dækker min forsikring både national og international kørsel?",
        a: "Det skal tjekkes konkret. Mange policer er skrevet til CMR-ansvaret ved international transport. Kører I også nationalt, skal det udtrykkeligt aftales at CMR-loven gælder — ellers kan der opstå et dækningshul. Det er præcis den type detalje vi gennemgår.",
      },
      {
        q: "Hvad er forskellen på fragtføreransvar og en vareforsikring?",
        a: "Fragtføreransvar dækker jeres lovbestemte ansvar som transportør — begrænset til SDR 8,33 pr. kilo. En vareforsikring (transportforsikring) dækker varens fulde værdi og tegnes typisk af vareejeren. Ved højværdigods er ansvarsgrænsen ofte langt under varens reelle værdi, og så er en vareforsikring nødvendig oveni.",
      },
    ],
    related: ["speditoransvarsforsikring", "transportforsikring", "lastbilforsikring"],
  },
  {
    slug: "speditoransvarsforsikring",
    title: "Speditøransvarsforsikring",
    navLabel: "Speditøransvar",
    letter: "S",
    eyebrow: "Transportansvar",
    metaDescription:
      "Speditøransvarsforsikring dækker speditørens ansvar efter NSAB 2015 — godsskade, forsinkelse, oplagring og fejlekspedition. Vi sikrer at dækning og ansvarsgrænser hænger sammen.",
    intro:
      "Som speditør påtager I jer ansvar for gods I formidler, håndterer og oplagrer. Speditøransvarsforsikring dækker det ansvar — typisk efter NSAB 2015 — og sikrer at I er beskyttet mod de krav der opstår, når noget går galt i transportkæden.",
    heroImage: IMG.speditoerLager,
    cvrLabel: "Få tilbud på jeres speditøransvarsforsikring",
    introParagraphs: [
      "Speditørens ansvar reguleres i de nordiske lande af NSAB 2015 — Nordisk Speditørforbunds Almindelige Bestemmelser. De fastlægger nøje hvilket ansvar speditøren bærer, og hvilke beløbsgrænser der gælder for forskellige typer skade. Forsikringen er bygget op om netop disse regler.",
      "Ansvaret afhænger af om I optræder som formidler eller som selvkontraherende speditør, og af hvilken opgave der er tale om. Vi sikrer at jeres betingelser, ansvar og forsikringsdækning hænger sammen — så I hverken er overeksponerede eller betaler for dækning I ikke behøver.",
    ],
    features: [
      {
        eyebrow: "Ansvar efter NSAB 2015",
        title: "Klare beløbsgrænser for hver type skade",
        body: "NSAB 2015 fastlægger speditørens ansvar med specifikke grænser. Det er vigtigt at forsikringen dækker fuldt op til disse grænser — og at I forstår hvor jeres reelle eksponering ligger.",
        bullets: [
          { label: "Godsskade og bortkomst", body: "Ansvaret er begrænset til SDR 8,33 pr. kilo bruttovægt af det beskadigede gods." },
          { label: "Forsinkelse", body: "Ansvaret er begrænset til fragtbeløbet for den forsinkede sending." },
          { label: "Øvrige tab", body: "Andre formuetab er begrænset til SDR 100.000 pr. opgave." },
          { label: "Oplagring og fejlekspedition", body: "Samlet ansvar begrænset til SDR 500.000 for én og samme hændelse." },
        ],
        image: IMG.speditoerLager,
        imageSide: "right",
      },
    ],
    stats: [
      { value: "NSAB 2015", label: "regelsættet speditøransvaret bygger på" },
      { value: "SDR 8,33/kg", label: "ansvarsgrænse for beskadiget eller bortkommet gods" },
      { value: "SDR 500.000", label: "maksimalt ansvar pr. hændelse ved oplagring" },
    ],
    faq: [
      {
        q: "Hvad er NSAB 2015?",
        a: "NSAB 2015 er Nordisk Speditørforbunds Almindelige Bestemmelser — det standardregelsæt der regulerer speditørers ansvar i Danmark og de øvrige nordiske lande. Det fastlægger både ansvarets omfang og de beløbsgrænser, speditøransvarsforsikringen er bygget op om.",
      },
      {
        q: "Hvad er forskellen på speditør- og fragtføreransvar?",
        a: "Fragtføreransvar dækker den der fysisk udfører transporten (vognmanden). Speditøransvar dækker den der organiserer og formidler transporten. Optræder speditøren som selvkontraherende, kan ansvaret nærme sig fragtførerens — og så skal dækningen afspejle det.",
      },
      {
        q: "Kræver det medlemskab af Danske Speditører at bruge NSAB 2015?",
        a: "Ja, anvendelsen af NSAB 2015 som standardvilkår forudsætter medlemskab af Danske Speditører. Vi rådgiver om hvordan jeres aftalegrundlag og forsikring spiller sammen, uanset om I anvender NSAB eller andre betingelser.",
      },
    ],
    related: ["fragtforeransvarsforsikring", "transportforsikring"],
  },
  {
    slug: "lastbilforsikring",
    title: "Lastbilforsikring",
    navLabel: "Lastbil",
    letter: "L",
    eyebrow: "Køretøjer",
    metaDescription:
      "Lastbilforsikring til vognmænd og erhverv — lovpligtig ansvarsforsikring, kasko og godsansvar samlet. Vi sammenligner markedet og samler jeres lastbiler under de bedste vilkår.",
    intro:
      "En lastbil er et stort aktiv og et stort ansvar. Lastbilforsikring samler den lovpligtige ansvarsdækning, kasko på køretøjet og ansvaret for godset — så I er dækket hele vejen rundt, hvad enten det er én lastbil eller en hel flåde.",
    heroImage: IMG.lastbilMotorvej,
    cvrLabel: "Få tilbud på jeres lastbilforsikring",
    introParagraphs: [
      "Ansvarsforsikring på lastbilen er lovpligtig — den dækker de skader I forvolder på andre mennesker, køretøjer og ting i trafikken. Men for en vognmand er det kun fundamentet. Kaskodækning beskytter selve lastbilen, og godsansvaret dækker kundens varer under transport.",
      "Vi gennemgår jeres køretøjer, kørselsmønster og risikoprofil og finder den løsning der passer driften. For vognmænd med flere lastbiler er der ofte både administrative og økonomiske gevinster ved at samle det hele i én aftale frem for enkeltpolicer.",
    ],
    features: [
      {
        eyebrow: "Sådan er en lastbilforsikring bygget op",
        title: "Tre lag — ansvar, kasko og gods",
        body: "Den rigtige lastbilforsikring afhænger af om I kører eget eller andres gods, hvor langt I kører, og hvor stor en del af driften der står og falder med det enkelte køretøj.",
        bullets: [
          { label: "Lovpligtig ansvarsforsikring", body: "Dækker skader på andre i trafikken — et lovkrav for ethvert køretøj." },
          { label: "Kasko", body: "Dækker lastbilen selv ved tyveri, brand, hærværk og færdselsuheld — ofte med vejhjælp." },
          { label: "Godsansvar / fragtføreransvar", body: "Dækker ansvaret for kundens gods under transporten." },
          { label: "Afsavn og driftstab", body: "Tilvalg der kompenserer for tabt indtjening mens lastbilen er ude af drift." },
        ],
        image: IMG.lastbilMotorvej,
        imageSide: "right",
      },
    ],
    faq: [
      {
        q: "Er godsansvar med i en almindelig lastbilforsikring?",
        a: "Ikke automatisk. Ansvarsforsikringen dækker skader på andre i trafikken, og kasko dækker lastbilen — men ansvaret for kundens gods kræver en særskilt godsansvars- eller fragtføreransvarsforsikring. Vi sikrer at hele kæden er dækket.",
      },
      {
        q: "Kan jeg samle flere lastbiler på én forsikring?",
        a: "Ja, og det kan ofte betale sig. En flådeaftale giver typisk både lavere præmie og mindre administration end enkeltpolicer — og et fælles overblik over skadeshistorikken. Vi hjælper med at vurdere om en flådeløsning passer jer.",
      },
    ],
    related: ["flaadeforsikring", "fragtforeransvarsforsikring", "bilforsikring", "transportforsikring"],
  },
  {
    slug: "boligselskabsforsikring",
    title: "Boligselskabsforsikring",
    navLabel: "Boligselskab",
    letter: "B",
    eyebrow: "Almene boliger",
    metaDescription:
      "Boligselskabsforsikring til almene boligorganisationer og boligselskaber. Bygning, bestyrelsesansvar, arbejdsskade og ledningsskade samlet i ét program — uvildig gennemgang på tværs af alle afdelinger.",
    intro:
      "Et alment boligselskab forvalter store værdier og mange menneskers hjem. Boligselskabsforsikring samler bygningsdækning, ansvar og de øvrige nødvendige forsikringer i ét program — og vi sikrer at det er gennemgået uvildigt på tværs af alle afdelinger.",
    heroImage: IMG.boligselskab,
    cvrLabel: "Få jeres boligselskabs forsikringer gennemgået",
    introParagraphs: [
      "Almene boligorganisationer og boligselskaber har en forsikringsmæssig kompleksitet, de færreste andre brancher kan måle sig med: mange afdelinger, store bygningsmasser, ansatte ejendomsfunktionærer og et samlet ansvar over for både beboere og myndigheder. Det stiller krav til et program der hænger sammen på tværs.",
      "Som uvildig mægler gennemgår vi hele porteføljen — afdeling for afdeling — og sikrer at dækningssummer, vilkår og ansvar er på plads. Vi tager programmet i udbud og forhandler på selskabets vegne, så I får den rette dækning til den rigtige pris.",
    ],
    features: [
      {
        eyebrow: "Det typiske program",
        title: "Hvad et boligselskab har brug for",
        body: "Et alment boligselskab har et bredt forsikringsbehov, der rækker langt ud over selve bygningerne. Vi sammensætter et samlet program, så afdelingerne er ensartet dækket.",
        bullets: [
          { label: "Bygningsforsikring", body: "Brand, storm, skybrud, vand og indbrud på hele bygningsmassen." },
          { label: "Skjulte rør og stikledninger", body: "Blandt de hyppigste og dyreste skader i ældre boligafdelinger." },
          { label: "Bestyrelsesansvar", body: "Beskytter organisationsbestyrelse og afdelingsbestyrelser personligt." },
          { label: "Arbejdsskadeforsikring", body: "Lovpligtig for ejendomsfunktionærer, viceværter og andet personale." },
          { label: "Erhvervs- og produktansvar", body: "Dækker selskabets ansvar over for beboere og tredjemand." },
          { label: "Retshjælp", body: "Dækker advokatomkostninger ved tvister." },
        ],
        image: IMG.boligselskab,
        imageSide: "right",
      },
      {
        eyebrow: "Den uvildige gennemgang",
        title: "Fra spredte policer til samlet overblik",
        body: "Mange boligselskaber har programmer der er vokset frem afdeling for afdeling over mange år — med overlap, huller og uensartede vilkår. En struktureret gennemgang skaber både tryghed og besparelser.",
        bullets: [
          { label: "1. Kortlægning på tværs", body: "Vi samler alle afdelingers policer og finder huller, overlap og underforsikring." },
          { label: "2. Udbud til markedet", body: "Vi forhandler med flere selskaber på hele porteføljens vegne." },
          { label: "3. Anbefaling til bestyrelsen", body: "Klar sammenligning og en samlet, ensartet løsning på tværs af afdelinger." },
        ],
        image: IMG.marion,
        imageSide: "left",
      },
    ],
    stats: [
      { value: "10–25%", label: "typisk besparelse ved samlet udbud" },
      { value: "Alle afdelinger", label: "samlet program med ensartede vilkår på tværs" },
      { value: "1× årligt", label: "anbefalet gennemgang af programmet" },
    ],
    faq: [
      {
        q: "Hvad er forskellen på en boligselskabsforsikring og en foreningsforsikring?",
        a: "Behovet ligner hinanden, men et alment boligselskab er typisk større og mere komplekst end en enkelt ejer- eller andelsboligforening — med mange afdelinger, ansatte og en organisationsstruktur, der stiller andre krav. Vi rådgiver begge typer, men tilpasser programmet til den konkrete struktur.",
      },
      {
        q: "Skal hver afdeling have sin egen police?",
        a: "Ikke nødvendigvis. Ofte er det en fordel at samle afdelingerne i ét fælles program med ensartede vilkår — det giver bedre overblik, lettere administration og typisk en stærkere forhandlingsposition. Vi vurderer den rette struktur for netop jeres selskab.",
      },
    ],
    related: ["forsikring-andelsboligforening-ejerforening", "bygningsforsikring", "bestyrelsesansvarsforsikring"],
  },
  {
    slug: "projektansvarsforsikring",
    title: "Projektansvarsforsikring",
    navLabel: "Projektansvar",
    letter: "P",
    eyebrow: "Byggeri",
    metaDescription:
      "Projektansvarsforsikring samler rådgivernes ansvar på ét byggeprojekt under én police efter ABR18. Den sikrer byggeriets økonomi og giver bygherren tryghed for at ansvaret er dækket.",
    intro:
      "På et byggeprojekt er der mange rådgivere — og dermed mange ansvarsforsikringer i spil. En projektansvarsforsikring samler rådgivernes ansvar for det enkelte projekt under én police, så byggeriets økonomi er sikret hvis der opstår fejl i projekteringen.",
    heroImage: IMG.nordan27,
    cvrLabel: "Få tilbud på projektansvarsforsikring til byggeriet",
    introParagraphs: [
      "Når en teknisk rådgiver påtager sig en opgave under ABR18, skal der som udgangspunkt være en sædvanlig professionel ansvarsforsikring i bund — medmindre der tegnes en projektansvarsforsikring for det konkrete byggeri. Projektansvarsforsikringen samler alle projektets rådgivere under én dækning, knyttet til netop dette projekt.",
      "Fordelen er klarhed og tryghed: i stedet for at skulle forlade sig på den enkelte rådgivers egen police — og dennes ansvarsbegrænsning — har bygherren én samlet dækning at holde sig til. Vi rådgiver bygherrer, totalrådgivere og entreprenører om hvornår en projektansvarsforsikring giver mening, og hvordan den spiller sammen med aftalegrundlaget.",
    ],
    features: [
      {
        eyebrow: "Hvorfor projektansvar",
        title: "Én samlet dækning frem for mange spredte policer",
        body: "På større og komplekse byggerier kan det være svært at overskue om hver enkelt rådgivers forsikring er tilstrækkelig. Projektansvarsforsikringen samler trådene — og er ofte et krav på de store sager.",
        bullets: [
          { label: "Samler rådgiverne", body: "Alle projektets tekniske rådgivere er dækket under én og samme police." },
          { label: "Knyttet til projektet", body: "Dækningen følger byggeriet — ikke den enkelte virksomheds årspolice." },
          { label: "Tryghed for bygherren", body: "Én klar dækning at holde sig til, hvis der opstår projekteringsfejl." },
          { label: "Sammenhæng med ABR18", body: "Vi sikrer at forsikringssum og aftalens ansvarsbegrænsning spiller sammen." },
        ],
        image: IMG.nordan27,
        imageSide: "right",
      },
      {
        eyebrow: "Vigtigt at vide",
        title: "Ansvarsbegrænsningen og forsikringssummen hænger sammen",
        body: "Et centralt punkt under ABR18 er, at rådgiverens ansvarsbegrænsning kobles til forsikringssummen på projektansvarsforsikringen. Sættes summen forkert, kan det få direkte betydning for hvad der reelt er dækket.",
        bullets: [
          { label: "Uden projektansvarsforsikring", body: "Rådgiverens ansvar er efter ABR18 typisk begrænset til 2× honoraret, dog mindst 2,5 mio. kr." },
          { label: "Med projektansvarsforsikring", body: "Ansvaret knyttes til forsikringssummen — som derfor skal fastsættes med omhu." },
          { label: "Aftalt ansvarsbegrænsning", body: "Begrænsninger i rådgiveraftalen kan påvirke dækningen — vi gennemgår sammenhængen." },
        ],
        image: IMG.mandrup,
        imageSide: "left",
      },
    ],
    faq: [
      {
        q: "Hvad er forskellen på projektansvar og en almindelig rådgiveransvarsforsikring?",
        a: "En rådgiveransvarsforsikring (professionel ansvar) er rådgiverens egen årspolice, der dækker alle dennes opgaver. En projektansvarsforsikring er tegnet specifikt til ét byggeprojekt og samler alle projektets rådgivere under én dækning — knyttet til netop det byggeri.",
      },
      {
        q: "Hvem tegner projektansvarsforsikringen?",
        a: "Det aftales i det konkrete projekt — ofte er det bygherren eller totalrådgiveren der står for den, så alle projektets rådgivere er dækket samlet. Vi hjælper med at få det placeret korrekt og afstemt med aftalegrundlaget under ABR18.",
      },
      {
        q: "Dækker projektansvarsforsikringen også entreprenørens projekteringsfejl?",
        a: "Det afhænger af projektets opbygning og policens vilkår. Entreprenørers egen projektering og rådgiveres udførelsesfejl er traditionelt svære at forsikre på standardvilkår — derfor er det vigtigt at få vurderet den konkrete risiko fra start. Det er præcis den type rådgivning vi tilbyder.",
      },
    ],
    related: ["entrepriseforsikring", "professionel-ansvarsforsikring", "erhvervs-og-produktansvarsforsikring"],
  },
  {
    slug: "flaadeforsikring",
    title: "Flådeforsikring",
    navLabel: "Flåde",
    letter: "F",
    eyebrow: "Køretøjer",
    metaDescription:
      "Flådeforsikring samler virksomhedens køretøjer under én aftale — biler, varebiler og lastbiler. Lavere administration, fælles selvrisiko og bedre overblik over skadeshistorikken.",
    intro:
      "Har virksomheden mere end en håndfuld køretøjer, er en flådeforsikring næsten altid den smarteste løsning. Den samler biler, varebiler og lastbiler under én aftale — med lavere administration, fælles vilkår og et samlet overblik over skader og pris.",
    heroImage: IMG.flaade,
    cvrLabel: "Få tilbud på jeres flådeforsikring",
    introParagraphs: [
      "I stedet for at jonglere med en police pr. køretøj samler en flådeforsikring hele vognparken i én aftale. Det giver mindre administration, ét fælles selvrisikoniveau og — ikke mindst — et samlet billede af skadeshistorikken, der er afgørende når præmien skal forhandles.",
      "Vi gennemgår sammensætningen af jeres flåde, kørselsmønster og skadeshistorik og tager aftalen i udbud på markedet. For de fleste virksomheder med 5 køretøjer og op er der både tid og penge at spare ved at konsolidere.",
    ],
    features: [
      {
        eyebrow: "Hvorfor en flådeaftale",
        title: "Ét overblik — frem for en bunke enkeltpolicer",
        body: "Flådeforsikringen er bygget til virksomheder med flere køretøjer. Den samler dækningen og gør både administration og forhandling enklere.",
        bullets: [
          { label: "Alle køretøjstyper", body: "Personbiler, varebiler og lastbiler kan samles i én aftale." },
          { label: "Fælles selvrisiko og vilkår", body: "Ensartede betingelser på tværs af hele flåden." },
          { label: "Mindre administration", body: "Til- og afgang af køretøjer håndteres løbende uden nye policer." },
          { label: "Samlet skadeshistorik", body: "Et samlet billede der styrker forhandlingen om præmien." },
        ],
        image: IMG.flaade,
        imageSide: "right",
      },
    ],
    stats: [
      { value: "Fra 5 køretøjer", label: "typisk hvor en flådeaftale begynder at betale sig" },
      { value: "Alle typer", label: "biler, varebiler og lastbiler i samme aftale" },
      { value: "Én police", label: "i stedet for en pr. køretøj" },
    ],
    faq: [
      {
        q: "Hvor mange køretøjer skal jeg have for at få en flådeforsikring?",
        a: "Typisk begynder en flådeaftale at give mening fra omkring 5 køretøjer. Jo større flåde, jo mere er der at hente — både i administration og præmie. Vi vurderer konkret om en flådeløsning er den rigtige for jer.",
      },
      {
        q: "Kan jeg blande biler, varebiler og lastbiler i samme flåde?",
        a: "Ja. En flådeaftale kan rumme forskellige køretøjstyper, og det er ofte netop dér gevinsten ligger — alt samlet ét sted med fælles vilkår og overblik. Tunge køretøjer med godsansvar tænkes naturligt ind i den samlede løsning.",
      },
      {
        q: "Påvirker én stor skade hele flådens pris?",
        a: "Fordi flåden vurderes samlet, indgår skadeshistorikken som helhed i prissætningen. Det betyder at en god, samlet historik kan give rabat — men også at flere skader påvirker prisen. Vi hjælper med at holde øje med udviklingen og forhandle ved fornyelsen.",
      },
    ],
    related: ["bilforsikring", "lastbilforsikring", "transportforsikring"],
  },
];

export function getProduct(slug: string): InsuranceProduct | undefined {
  return INSURANCE_PRODUCTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return INSURANCE_PRODUCTS.map((p) => p.slug);
}

export function getRelated(slugs: string[] = []): InsuranceProduct[] {
  return slugs.map((s) => getProduct(s)).filter(Boolean) as InsuranceProduct[];
}
