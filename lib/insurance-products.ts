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
      "Ifølge branchekilder afvises omkring halvdelen af henvendelser om forsikring af fredede ejendomme allerede ved første kontakt. Mange af dem der får tilbud, oplever præmiestigninger på 30–100% — og ender ofte med reduceret dækning til højere pris.",
      "Vi specialiserer os i netop dette område og har adgang til både danske specialister og internationale markeder der løfter denne type ejendomme. Selv når andre har givet op, kan vi ofte finde en løsning.",
    ],
    features: [
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
