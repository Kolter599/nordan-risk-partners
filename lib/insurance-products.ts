/**
 * Insurance product catalog — single source of truth for every
 * /erhvervsforsikringer/[slug] page. Add/edit products here and they'll
 * render through the shared InsurancePageTemplate.
 */

export type InsuranceSection = {
  title: string;
  body: string; // short paragraphs separated by \n\n
  bullets?: string[];
};

export type InsuranceProduct = {
  slug: string;
  title: string; // page h1
  navLabel: string; // short label for A-Z listing
  letter: string; // A-Z bucket
  metaDescription: string;
  eyebrow: string;
  intro: string; // hero body paragraph
  heroImage: string; // /images/... path
  cvrLabel: string; // headline shown in CvrLookup card ("Se hvordan vi kan hjælpe med din cyberforsikring")
  sections: InsuranceSection[];
  related?: string[]; // slugs of related products
};

// Shared assets we pull from
const IMG = {
  meeting: "/images/unsplash-meeting.jpg",
  business: "/images/unsplash-business.jpg",
  copenhagen: "/images/copenhagen.jpg",
  partnership: "/images/unsplash-partnership.jpg",
  mandrup: "/images/unsplash-mandrup.jpg",
  vandergriff: "/images/unsplash-vandergriff.jpg",
  mcbrayer: "/images/unsplash-mcbrayer.jpg",
  moisa: "/images/unsplash-moisa.jpg",
  mks: "/images/unsplash-mks.jpg",
  puskeiler: "/images/unsplash-puskeiler.jpg",
  wenchen: "/images/unsplash-wenchen.jpg",
  marion: "/images/unsplash-marion.jpg",
  nordan50: "/images/nordan-50.jpg",
  nordan52: "/images/nordan-52.jpg",
  nordan56: "/images/nordan-56.jpg",
  nordan75: "/images/nordan-75.jpg",
};

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    slug: "advokatansvarsforsikring",
    title: "Advokatansvarsforsikring",
    navLabel: "Advokatansvar",
    letter: "A",
    eyebrow: "Professionelt ansvar",
    metaDescription:
      "Advokatansvarsforsikring beskytter advokatfirmaet mod krav om økonomisk tab opstået som følge af rådgivning eller sagsbehandling.",
    intro:
      "Advokater har et skærpet professionelt ansvar. Vi sammensætter dækninger der matcher kompleksiteten i jeres sagsportefølje — og sikrer jer mod de stigende krav om dækningssummer i branchen.",
    heroImage: IMG.business,
    cvrLabel: "Se hvad vi kan gøre for jeres advokatansvarsforsikring",
    sections: [
      {
        title: "Hvad dækker advokatansvarsforsikring?",
        body: "Advokatansvar dækker erstatningskrav der udspringer af den juridiske rådgivning, sagsbehandling eller håndtering af klientmidler. Forsikringen er obligatorisk under Advokatsamfundets regler.",
      },
      {
        title: "Hvorfor en mægler?",
        body: "Markedet for advokatansvar er specialiseret og prisfastsat individuelt. Vi ved hvilke selskaber der løser hvilke brancher bedst — og kan forhandle vilkår der matcher netop jeres praksis.",
      },
    ],
    related: ["bestyrelsesansvarsforsikring", "erhvervs-og-produktansvarsforsikring", "it-ansvarsforsikring"],
  },
  {
    slug: "arbejdsskadeforsikring",
    title: "Arbejdsskadeforsikring",
    navLabel: "Arbejdsskade",
    letter: "A",
    eyebrow: "Lovpligtig forsikring",
    metaDescription:
      "Lovpligtig arbejdsskadeforsikring til virksomheder med ansatte. Vi hjælper med den rigtige dækning til den rigtige pris.",
    intro:
      "Arbejdsskadeforsikring er lovpligtig for alle arbejdsgivere i Danmark. Vi gennemgår jeres lønsummer og risikoprofil og forhandler præmien på markedet.",
    heroImage: IMG.mandrup,
    cvrLabel: "Få tjekket jeres arbejdsskadeforsikring gratis",
    sections: [
      {
        title: "Hvad dækker arbejdsskadeforsikringen?",
        body: "Forsikringen dækker personskader der opstår under arbejdet. Det omfatter behandlingsudgifter, erstatning ved varigt mén og tab af erhvervsevne samt erstatning til efterladte ved dødsfald.",
        bullets: [
          "Erstatning ved varigt mén og tab af erhvervsevne",
          "Dækning af lægebehandling og genoptræning",
          "Erstatning til efterladte ved dødsfald",
        ],
      },
      {
        title: "Sådan hjælper vi",
        body: "Vi gennemgår jeres nuværende dækning, sikrer at alle ansatte er korrekt tilmeldt, og kontrollerer at lønsummer og risikoprofil matcher det der er oplyst til selskabet. Ofte kan vi både forbedre vilkår og reducere præmien.",
      },
    ],
    related: ["kollektiv-ulykkesforsikring", "sundhedsforsikring", "erhvervsforsikringer"],
  },
  {
    slug: "bestyrelsesansvarsforsikring",
    title: "Bestyrelses- og direktionsansvarsforsikring",
    navLabel: "Bestyrelsesansvar",
    letter: "B",
    eyebrow: "Ledelsesansvar",
    metaDescription:
      "D&O-forsikring der beskytter bestyrelsesmedlemmer og direktion personligt mod erstatningskrav. Vi sammensætter dækninger for danske og internationale selskaber.",
    intro:
      "Bestyrelses- og direktionsansvar (D&O) beskytter ledelsen personligt mod krav fra aktionærer, kreditorer, medarbejdere og myndigheder. Vi sammensætter dækninger der passer til virksomhedens størrelse og kompleksitet.",
    heroImage: IMG.meeting,
    cvrLabel: "Få tjekket jeres bestyrelsesansvarsforsikring",
    sections: [
      {
        title: "Hvem har brug for den?",
        body: "Alle selskaber med en bestyrelse eller direktion bør have D&O-dækning. Særligt relevant for virksomheder i vækst, eksportorienterede selskaber, og virksomheder med eksterne investorer.",
      },
      {
        title: "Hvad dækker den?",
        body: "Sagsomkostninger og erstatning når et bestyrelsesmedlem eller en direktør personligt sagsøges for deres handlinger eller beslutninger. Dækker også efter fratrædelse for handlinger begået i perioden.",
      },
    ],
    related: ["advokatansvarsforsikring", "kriminalitetsforsikring", "cyberforsikring"],
  },
  {
    slug: "bilforsikring",
    title: "Bilforsikring",
    navLabel: "Bilforsikring",
    letter: "B",
    eyebrow: "Køretøjer",
    metaDescription:
      "Bilforsikring til erhvervsbiler og firmakøretøjer. Vi sammenligner markedet og samler jeres flåde under de bedste vilkår.",
    intro:
      "Erhvervsbiler kører hver dag — og kræver en forsikringsløsning der følger med. Vi finder de bedste vilkår for firmabiler, hvad enten det er en enkelt bil eller en hel flåde.",
    heroImage: IMG.mks,
    cvrLabel: "Få tilbud på jeres bilforsikringer",
    sections: [
      {
        title: "Enkeltbil eller flåde",
        body: "For virksomheder med flere køretøjer kan en flådeforsikring reducere administrationen og give bedre vilkår. Vi vurderer hvad der giver bedst mening for jer.",
      },
    ],
    related: ["flaadeforsikring", "lastbilforsikring", "transportforsikring"],
  },
  {
    slug: "bygningsforsikring",
    title: "Bygningsforsikring",
    navLabel: "Bygning",
    letter: "B",
    eyebrow: "Ejendom",
    metaDescription:
      "Bygningsforsikring til erhvervsejendomme, ejer- og andelsboligforeninger. Dækker brand, storm, vandskade og mere.",
    intro:
      "Bygningsforsikring er grundstenen for enhver virksomhed der ejer sin ejendom. Vi sikrer at dækningssummer matcher genopførselsomkostningerne — og at vilkårene er opdaterede.",
    heroImage: IMG.marion,
    cvrLabel: "Få en gratis gennemgang af jeres bygningsforsikring",
    sections: [
      {
        title: "Hvad dækker den typisk?",
        body: "Brand, storm, vandskade, indbrud og hærværk. Valgfrie tilføjelser: glas- og sanitetsskade, rørforsikring, svampe- og insektskade.",
        bullets: [
          "Brand og eksplosion",
          "Storm og sky­brud",
          "Vand- og rørskader",
          "Indbrud og hærværk",
          "Svampe-, insekt- og følgeskader (tilvalg)",
        ],
      },
    ],
    related: ["fredede-ejendomme-forsikring", "forsikring-andelsboligforening-ejerforening", "ejendomsforsikring"],
  },
  {
    slug: "cyberforsikring",
    title: "Cyberforsikring",
    navLabel: "Cyber",
    letter: "C",
    eyebrow: "Digital risiko",
    metaDescription:
      "Cyberforsikring beskytter virksomheden mod tab ved hackerangreb, ransomware, databrud og driftsstop. Få hjælp 24/7 når uheldet sker.",
    intro:
      "Et cyberangreb kan lukke virksomheden i dagevis. Cyberforsikring dækker de økonomiske tab og giver jer direkte adgang til et beredskab der hjælper jer i gang igen hurtigst muligt.",
    heroImage: IMG.vandergriff,
    cvrLabel: "Se hvordan vi kan hjælpe med jeres cyberforsikring",
    sections: [
      {
        title: "Hvad dækker cyberforsikring?",
        body: "Ransomware, databrud, driftsstop, krisebistand og eventuelle bøder fra Datatilsynet. Inkluderer typisk også adgang til et eksternt IT-beredskab når skaden sker.",
        bullets: [
          "Driftstab ved systemnedbrud",
          "Genskabelse af data og systemer",
          "Juridisk rådgivning ved databrud",
          "Krisekommunikation og PR-bistand",
          "Ransomware-forhandling (hvor lovligt)",
        ],
      },
      {
        title: "Hvem har brug for cyberforsikring?",
        body: "Stort set alle virksomheder der bruger IT, håndterer kundedata eller har en webshop. Specielt vigtigt for virksomheder med persondata (GDPR) eller kritisk drift.",
      },
    ],
    related: ["it-ansvarsforsikring", "it-kaskoforsikring", "kriminalitetsforsikring", "netbanksforsikring"],
  },
  {
    slug: "driftstabsforsikring",
    title: "Driftstabsforsikring",
    navLabel: "Driftstab",
    letter: "D",
    eyebrow: "Forretningskontinuitet",
    metaDescription:
      "Driftstabsforsikring kompenserer for tabt dækningsbidrag og løbende omkostninger når virksomheden rammes af en dækningsberettiget skade.",
    intro:
      "Når uheldet sker, er det ikke kun bygningen der skal repareres — det er også indtjeningen der forsvinder. Driftstabsforsikring holder virksomheden kørende økonomisk indtil driften er oppe igen.",
    heroImage: IMG.mcbrayer,
    cvrLabel: "Tjek om jeres driftstabsforsikring er stor nok",
    sections: [
      {
        title: "Hvad dækker driftstabsforsikring?",
        body: "Tabt dækningsbidrag og faste omkostninger (løn, leje, renter) i den periode virksomheden er nedlukket eller reduceret som følge af en dækningsberettiget skade — typisk brand, vand eller storm.",
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
    metaDescription:
      "Entrepriseforsikring dækker bygge- og anlægsprojekter mod pludselige skader og ansvarsrisiko under udførelsen.",
    intro:
      "Et byggeprojekt har mange aktører og risici. Entrepriseforsikring samler dækningerne for bygherre, entreprenør og underentreprenører under ét — og sikrer at en skade under byggeriet ikke vælter økonomien.",
    heroImage: IMG.puskeiler,
    cvrLabel: "Få tilbud på jeres entrepriseforsikring",
    sections: [
      {
        title: "All-risks eller projektspecifik",
        body: "Vi skræddersyer dækningen til det konkrete projekt — eller etablerer en årsentrepriseaftale der dækker alle virksomhedens projekter løbende.",
      },
    ],
    related: ["erhvervs-og-produktansvarsforsikring", "aarsentrepriseforsikring", "projektansvarsforsikring"],
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
      "Ansvarsforsikring er absolut grundlæggende. Én stor sag kan true virksomhedens eksistens — vi sikrer at dækningsgrundlag, summer og vilkår matcher jeres reelle eksponering.",
    heroImage: IMG.moisa,
    cvrLabel: "Se om jeres ansvarsforsikring er i orden",
    sections: [
      {
        title: "Erhvervsansvar vs. produktansvar",
        body: "Erhvervsansvar dækker skader der opstår under driften (fx en montør der uforvarende skader kundens ejendom). Produktansvar dækker skader forårsaget af solgte eller leverede produkter efter overdragelse.",
      },
      {
        title: "Typiske dækninger",
        body: "",
        bullets: [
          "Personskade på tredjemand",
          "Tingsskade hos kunde",
          "Produktansvar efter levering",
          "Sagsomkostninger og juridisk bistand",
        ],
      },
    ],
    related: ["bestyrelsesansvarsforsikring", "professionel-ansvarsforsikring", "entrepriseforsikring"],
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
    sections: [
      {
        title: "Hvad skal en forenings­forsikring dække?",
        body: "De fleste foreninger har brug for bygnings-, ansvar- og bestyrelsesansvarsforsikring. Er der ansættelsesforhold kræves også arbejdsskadeforsikring.",
        bullets: [
          "Bygningsforsikring (brand, storm, vandskade)",
          "Bestyrelsesansvarsforsikring",
          "Ansvarsforsikring for foreningen",
          "Retshjælpsforsikring",
          "Glas- og sanitetsdækning",
          "Rør- og stikledninger",
          "Svampe- og insektdækning",
          "Arbejdsskade- og ulykkesforsikring",
        ],
      },
    ],
    related: ["bygningsforsikring", "bestyrelsesansvarsforsikring", "arbejdsskadeforsikring"],
  },
  {
    slug: "fredede-ejendomme-forsikring",
    title: "Forsikring af fredede ejendomme",
    navLabel: "Fredede ejendomme",
    letter: "F",
    eyebrow: "Specialrådgivning",
    metaDescription:
      "Rådgivning i et marked med få muligheder. Vi hjælper ejere og bestyrelser af fredede ejendomme med at finde dækning.",
    intro:
      "Forsikring af fredede ejendomme er blandt de mest udfordrede områder i markedet. Mange ejere får afslag eller markante prisstigninger. Vi hjælper med at navigere markedet og finde løsninger.",
    heroImage: IMG.wenchen,
    cvrLabel: "Få en uforpligtende vurdering af jeres fredede ejendom",
    sections: [
      {
        title: "Markedet lige nu",
        body: "Ca. 50% af henvendelser afvises eller får ikke tilbud. Præmier stiger typisk 30-100%. Markedet er begrænset og få produkter er målrettet fredede ejendomme.",
      },
      {
        title: "Hvorfor er det så dyrt?",
        body: "Fredede bygninger kræver særlige materialer og håndværkere, reparationer skal godkendes af Slots- og Kulturstyrelsen, og selskaberne ser en forhøjet risiko ved ældre konstruktioner.",
      },
    ],
    related: ["bygningsforsikring", "forsikring-andelsboligforening-ejerforening"],
  },
  {
    slug: "hole-in-one-forsikring",
    title: "Hole in one forsikring",
    navLabel: "Hole in one",
    letter: "H",
    eyebrow: "Specialforsikring",
    metaDescription:
      "Hole in one forsikring til golfarrangementer. Lad arrangøren udlove præmier uden selv at bære risikoen.",
    intro:
      "Gør jeres golfarrangement uforglemmeligt. Vi dækker risikoen hvis en deltager rammer et hole in one — så I kan udlove attraktive præmier uden selv at stå med regningen.",
    heroImage: IMG.puskeiler,
    cvrLabel: "Få tilbud på jeres hole in one forsikring",
    sections: [
      {
        title: "Sådan fungerer det",
        body: "Arrangøren betaler præmien, forsikringsselskabet overtager risikoen. Dækningen gælder når en deltager fra tee rammer hullet i ét slag under den pågældende turnering.",
      },
      {
        title: "Sådan får du et tilbud",
        body: "Send os arrangementsdetaljer: dato, antal deltagere, præmiestørrelse og bane. Vi vender tilbage hurtigst muligt.",
      },
    ],
    related: ["eventforsikring", "arrangoerforsikring", "aflysningsforsikring"],
  },
  {
    slug: "it-ansvarsforsikring",
    title: "IT-ansvarsforsikring",
    navLabel: "IT-ansvar",
    letter: "I",
    eyebrow: "Professionelt ansvar",
    metaDescription:
      "IT-ansvarsforsikring for konsulenthuse og softwarevirksomheder. Dækker krav fra kunder ved fejl, forsinkelser eller databrud.",
    intro:
      "Som IT-leverandør lever I af tillid og leveringsevne. IT-ansvar dækker de økonomiske krav hvis en leverance går galt — fejl i kode, forsinket implementation eller datalæk.",
    heroImage: IMG.vandergriff,
    cvrLabel: "Se hvordan vi kan hjælpe med jeres IT-ansvarsforsikring",
    sections: [
      {
        title: "Typisk dækning",
        body: "Krav fra kunder som følge af fejl eller udeladelser i leverancen. Dækker også sagsomkostninger og defence ved uberettigede krav.",
      },
    ],
    related: ["cyberforsikring", "professionel-ansvarsforsikring", "it-kaskoforsikring"],
  },
  {
    slug: "kollektiv-ulykkesforsikring",
    title: "Kollektiv ulykkesforsikring",
    navLabel: "Kollektiv ulykke",
    letter: "K",
    eyebrow: "Medarbejdere",
    metaDescription:
      "Kollektiv ulykkesforsikring giver jeres medarbejdere en ekstra tryghed ved ulykker i og uden for arbejdstiden.",
    intro:
      "Kollektiv ulykkesforsikring er et stærkt medarbejdergode. Den supplerer den lovpligtige arbejdsskadeforsikring med dækning for ulykker der rammer medarbejderen også uden for arbejdstiden.",
    heroImage: IMG.partnership,
    cvrLabel: "Få tilbud på kollektiv ulykkesforsikring",
    sections: [
      {
        title: "Hvad er forskellen på arbejdsskade og kollektiv ulykke?",
        body: "Arbejdsskadeforsikring er lovpligtig og dækker kun ulykker i arbejdssammenhæng. Kollektiv ulykke dækker døgnet rundt — også fritidsulykker.",
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
    metaDescription:
      "Kriminalitetsforsikring dækker virksomheden mod tab ved tyveri, bedrageri eller underslæb begået af medarbejdere eller tredjemand.",
    intro:
      "Mindre virksomheder bliver oftere ramt af intern kriminalitet end de ydre trusler. Kriminalitetsforsikring dækker når underslæb, bedrageri eller CEO-fraud rammer virksomheden.",
    heroImage: IMG.meeting,
    cvrLabel: "Få jeres kriminalitetsforsikring tjekket",
    sections: [
      {
        title: "Hvad dækkes typisk?",
        body: "Tyveri, underslæb, computer­manipulation, CEO-fraud (vildledt overførsel) og falske fakturaer. Dækningssummer kan skaleres efter virksomhedens størrelse.",
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
    metaDescription:
      "Løsøreforsikring dækker virksomhedens inventar, maskiner, varer og it-udstyr mod brand, tyveri og anden pludselig skade.",
    intro:
      "Alt indvendigt i lokalet — maskiner, varer, it, kontorinventar — udgør betydelige værdier. Løsøreforsikring sikrer jer økonomisk hvis en brand, vandskade eller indbrud rammer.",
    heroImage: IMG.business,
    cvrLabel: "Få tjekket jeres løsøreforsikring",
    sections: [
      {
        title: "Hvad dækker den?",
        body: "Inventar, maskiner, lager, it-udstyr og andre aktiver i lokalerne. Dækker typisk brand, vandskade, indbrud og pludselig skade.",
      },
    ],
    related: ["bygningsforsikring", "driftstabsforsikring", "maskinkaskoforsikring"],
  },
  {
    slug: "transportforsikring",
    title: "Transportforsikring",
    navLabel: "Transport",
    letter: "T",
    eyebrow: "Varer under transport",
    metaDescription:
      "Transportforsikring dækker varer under transport — ad vej, sø eller luft. Skal virksomheden sende eller modtage gods, er den uundværlig.",
    intro:
      "Varer under transport er særligt udsatte. Transportforsikring dækker hele rejsen — og sikrer at jeres eller kundens varer er værdiforsikret fra afsendelse til levering.",
    heroImage: IMG.mcbrayer,
    cvrLabel: "Få tilbud på jeres transportforsikring",
    sections: [
      {
        title: "Enkelt eller fast aftale",
        body: "For virksomheder med løbende transport kan en abonnementsaftale dække alle forsendelser. Enkeltforsikring passer til ad hoc-transport af højværdivarer.",
      },
    ],
    related: ["fragtfoereransvarsforsikring", "flaadeforsikring", "lastbilforsikring"],
  },
  {
    slug: "netbanksforsikring",
    title: "Netbanksforsikring",
    navLabel: "Netbank",
    letter: "N",
    eyebrow: "Bedrageri",
    metaDescription:
      "Netbanksforsikring dækker tab ved netbanksbedrageri og uautoriserede transaktioner via virksomhedens bankkonti.",
    intro:
      "Netbanksbedrageri rammer virksomheder hver måned. Forsikringen dækker de økonomiske tab hvis jeres konti kompromitteres — et supplement til bankens eget sikkerhedsniveau.",
    heroImage: IMG.moisa,
    cvrLabel: "Få tilbud på jeres netbanksforsikring",
    sections: [
      {
        title: "Hvornår dækkes der?",
        body: "Uautoriserede overførsler og hackerangreb på virksomhedens netbank. Dækning er typisk et supplement til cyber- og kriminalitetsforsikring.",
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
    metaDescription:
      "Professionel ansvarsforsikring dækker rådgivningsvirksomheder mod krav som følge af fejl eller udeladelser i den ydede rådgivning.",
    intro:
      "Rådgivere, konsulenter, arkitekter, ingeniører og revisorer lever af deres faglige vurderinger. Professionel ansvar dækker de økonomiske krav hvis en vurdering eller rådgivning fører til tab for kunden.",
    heroImage: IMG.mcbrayer,
    cvrLabel: "Få tilbud på jeres professionelle ansvarsforsikring",
    sections: [
      {
        title: "Hvem bør have dækning?",
        body: "Alle der yder rådgivning mod betaling. Specielt relevant for konsulenter, arkitekter, ingeniører, revisorer, advokater og it-konsulenter.",
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
    metaDescription:
      "Sundhedsforsikring som medarbejdergode — reducerer sygefravær og styrker fastholdelse. Vi sammensætter programmer skræddersyet til jeres virksomhed.",
    intro:
      "En stærk sundhedsforsikring er blevet et standardkrav blandt medarbejdere. Vi forhandler programmer der både reducerer sygefravær og styrker jer i kampen om talenter.",
    heroImage: IMG.partnership,
    cvrLabel: "Få tilbud på sundhedsforsikring til jeres medarbejdere",
    sections: [
      {
        title: "Hvad indeholder den typisk?",
        body: "Hurtig adgang til privat behandling, fysioterapi, psykologhjælp, speciallæge og i nogle tilfælde også tandlæge. Programmer kan tilpasses virksomhedens størrelse og branche.",
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
