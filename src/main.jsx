import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Trophy,
  Medal,
  Goal,
  Lock,
  Crown,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Users,
  Ticket,
  Mail,
  User,
  KeyRound,
  Coins,
  TrendingUp
} from 'lucide-react';

import { auth, db } from './firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  getDocs,
deleteDoc,
where
} from 'firebase/firestore';

import './styles.css';

const ENTRY_FEE = 1.99;
const PRIZE_POOL_AMOUNT_PER_PLAYER = 1.50;
const ORGANIZER_AMOUNT_PER_PLAYER = 0.49;
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_8x24gAaY90Ca5cT1Sfc7u00';
const ADMIN_EMAIL = 'manios-13@hotmail.com';
const GROUP_TABLE_LOCK_TIME = '2026-06-11T20:00:00+02:00';

const translations = {
  en: {
    play: 'Play',
    badge: 'World Cup 2026 Predictor Challenge',
    heroTitle: 'Predict every group. Predict every match. Win the growing prize pool.',
    heroText: 'Create an account, pay the entry fee, then unlock all groups and all group-stage games.',
    createAccountFirst: 'Create Account First',
    currentPrizePool: 'Current Live Prize Pool',
    prizeGrows: 'Prize pool grows with every paid entry.',
    paidPlayers: 'Paid Players',
    entryFee: 'Entry Fee',
    predictionsSubmitted: 'Predictions Submitted',
    leaderboardUpdate: 'Leaderboard Update',
    daily: 'Daily',
    predictTable: 'Predict the Table',
    predictTableText: 'Predict 1st, 2nd, 3rd and 4th for every group.',
    predictScores: 'Predict Scores & Scorers',
    predictScoresText: 'Predict all group-stage games.',
    knockoutLocked: 'Knockout Locked',
    knockoutText: 'Knockout predictions open later.',
    dailyLeaderboard: 'Daily Leaderboard',
    dailyLeaderboardText: 'Leaderboard updates at the end of each day.',
    pointsTitle: 'How points are earned',
    correctWinner: 'Correct winner/draw: 3 points',
    exactScore: 'Exact score for both teams: 5 points',
    correctScorer: 'Correct scorer from one team: 1 point',
    correctGroupPosition: 'Correct group position: 5 points',
    perfectGroup: 'Perfect group table: 10 bonus points',
    createYourAccount: 'Create Your Account',
    login: 'Login',
    username: 'Username',
    email: 'Email Address',
    password: 'Password',
    continueGoogle: 'Continue with Google',
    alreadyAccount: 'Already have an account? Login',
    needAccount: 'Need an account? Create account',
    payEntry: 'Pay Entry Fee',
    payWithCard: 'Pay with Card',
    accountReady: 'Account Ready',
    startPredictor: 'Start Full Tournament Predictor',
    fullPredictor: 'Full Tournament Predictor: 12 Groups · 72 Games',
    completion: 'Completion',
    reviewSubmit: 'Review & Submit Entry',
    continueEntry: 'Continue Full Tournament Entry',
    groupTableTitle: 'Predict the Table',
    moveTeams: 'Move teams up or down. 1st and 2nd qualify.',
    scoresTitle: 'Predict Scores & Scorers',
    allTimes: 'Each match can be edited until 30 minutes before kickoff. All times are Amsterdam time.',
    locked: 'Locked',
    locks30: 'Locks 30 min before kickoff',
    goalScorers: 'Goal scorers',
    backGroups: 'Back to Groups',
    backAllGroups: 'Back to All Groups',
    reviewFull: 'Review Full Entry',
    submitEntry: 'Submit Full Tournament Entry',
    entrySubmitted: 'Entry Submitted',
    savedText: 'your full tournament prediction entry has been saved.',
    leaderboardNotStarted: 'Leaderboard not started yet',
    pointsUpdate: 'Points update at the end of each World Cup day after match results are added.',
    editResubmit: 'Edit & Resubmit Predictions',
    logout: 'Logout',
    welcome: 'Welcome',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    admin: 'Admin'
  },
  nl: {
    play: 'Spelen',
    badge: 'World Cup 2026 Voorspellingswedstrijd',
    heroTitle: 'Voorspel elke groep. Voorspel elke wedstrijd. Win de groeiende prijzenpot.',
    heroText: 'Maak een account, betaal de entree en ontgrendel alle groepen en groepswedstrijden.',
    createAccountFirst: 'Maak eerst account',
    currentPrizePool: 'Huidige prijzenpot',
    prizeGrows: 'De prijzenpot groeit met elke betaalde deelname.',
    paidPlayers: 'Betaalde spelers',
    entryFee: 'Entree',
    predictionsSubmitted: 'Inzendingen',
    leaderboardUpdate: 'Leaderboard update',
    daily: 'Dagelijks',
    predictTable: 'Voorspel de poule',
    predictTableText: 'Voorspel 1e, 2e, 3e en 4e plaats voor elke groep.',
    predictScores: 'Voorspel scores & doelpuntenmakers',
    predictScoresText: 'Voorspel alle groepswedstrijden.',
    knockoutLocked: 'Knock-out gesloten',
    knockoutText: 'Knock-out voorspellingen openen later.',
    dailyLeaderboard: 'Dagelijks leaderboard',
    dailyLeaderboardText: 'Leaderboard wordt aan het einde van elke dag bijgewerkt.',
    pointsTitle: 'Zo verdien je punten',
    correctWinner: 'Juiste winnaar/gelijkspel: 3 punten',
    exactScore: 'Exacte score voor beide teams: 5 punten',
    correctScorer: 'Juiste doelpuntenmaker van één team: 1 punt',
    correctGroupPosition: 'Juiste groepspositie: 5 punten',
    perfectGroup: 'Perfecte groepstabel: 10 bonuspunten',
    createYourAccount: 'Maak je account',
    login: 'Inloggen',
    username: 'Gebruikersnaam',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    continueGoogle: 'Doorgaan met Google',
    alreadyAccount: 'Heb je al een account? Inloggen',
    needAccount: 'Nog geen account? Account maken',
    payEntry: 'Betaal entree',
    payWithCard: 'Betaal met kaart',
    accountReady: 'Account klaar',
    startPredictor: 'Start volledige voorspeller',
    fullPredictor: 'Volledige voorspeller: 12 groepen · 72 wedstrijden',
    completion: 'Voltooid',
    reviewSubmit: 'Controleren & indienen',
    continueEntry: 'Verder met voorspellen',
    groupTableTitle: 'Voorspel de poule',
    moveTeams: 'Verplaats teams omhoog of omlaag. 1e en 2e gaan door.',
    scoresTitle: 'Voorspel scores & doelpuntenmakers',
    allTimes: 'Elke wedstrijd kan tot 30 minuten voor aftrap worden aangepast. Alle tijden zijn Amsterdamse tijd.',
    locked: 'Gesloten',
    locks30: 'Sluit 30 min voor aftrap',
    goalScorers: 'Doelpuntenmakers',
    backGroups: 'Terug naar groepen',
    backAllGroups: 'Terug naar alle groepen',
    reviewFull: 'Volledige inzending controleren',
    submitEntry: 'Volledige inzending indienen',
    entrySubmitted: 'Inzending opgeslagen',
    savedText: 'je volledige voorspelling is opgeslagen.',
    leaderboardNotStarted: 'Leaderboard is nog niet gestart',
    pointsUpdate: 'Punten worden bijgewerkt aan het einde van elke WK-dag.',
    editResubmit: 'Bewerken & opnieuw indienen',
    logout: 'Uitloggen',
    welcome: 'Welkom',
    paymentStatus: 'Betaalstatus',
    paid: 'Betaald',
    admin: 'Admin'
  },
  de: {
    play: 'Spielen',
    badge: 'World Cup 2026 Tippspiel',
    heroTitle: 'Tippe jede Gruppe. Tippe jedes Spiel. Gewinne den wachsenden Preispool.',
    heroText: 'Erstelle ein Konto, bezahle den Eintritt und schalte alle Gruppen und Spiele frei.',
    createAccountFirst: 'Zuerst Konto erstellen',
    currentPrizePool: 'Aktueller Preispool',
    prizeGrows: 'Der Preispool wächst mit jedem bezahlten Spieler.',
    paidPlayers: 'Bezahlte Spieler',
    entryFee: 'Eintritt',
    predictionsSubmitted: 'Abgegebene Tipps',
    leaderboardUpdate: 'Rangliste Update',
    daily: 'Täglich',
    predictTable: 'Tabelle tippen',
    predictTableText: 'Tippe Platz 1, 2, 3 und 4 für jede Gruppe.',
    predictScores: 'Ergebnisse & Torschützen tippen',
    predictScoresText: 'Tippe alle Gruppenspiele.',
    knockoutLocked: 'K.-o.-Phase gesperrt',
    knockoutText: 'K.-o.-Tipps öffnen später.',
    dailyLeaderboard: 'Tägliche Rangliste',
    dailyLeaderboardText: 'Die Rangliste wird täglich aktualisiert.',
    pointsTitle: 'So bekommst du Punkte',
    correctWinner: 'Richtiger Sieger/Unentschieden: 3 Punkte',
    exactScore: 'Exaktes Ergebnis beider Teams: 5 Punkte',
    correctScorer: 'Richtiger Torschütze eines Teams: 1 Punkt',
    correctGroupPosition: 'Richtige Gruppenposition: 5 Punkte',
    perfectGroup: 'Perfekte Gruppentabelle: 10 Bonuspunkte',
    createYourAccount: 'Konto erstellen',
    login: 'Einloggen',
    username: 'Benutzername',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    continueGoogle: 'Mit Google fortfahren',
    alreadyAccount: 'Schon ein Konto? Einloggen',
    needAccount: 'Noch kein Konto? Erstellen',
    payEntry: 'Eintritt bezahlen',
    payWithCard: 'Mit Karte bezahlen',
    accountReady: 'Konto bereit',
    startPredictor: 'Tippspiel starten',
    fullPredictor: 'Komplettes Tippspiel: 12 Gruppen · 72 Spiele',
    completion: 'Fortschritt',
    reviewSubmit: 'Prüfen & absenden',
    continueEntry: 'Weiter tippen',
    groupTableTitle: 'Tabelle tippen',
    moveTeams: 'Teams nach oben oder unten bewegen. Platz 1 und 2 qualifizieren sich.',
    scoresTitle: 'Ergebnisse & Torschützen tippen',
    allTimes: 'Jedes Spiel kann bis 30 Minuten vor Anpfiff bearbeitet werden. Alle Zeiten sind Amsterdam-Zeit.',
    locked: 'Gesperrt',
    locks30: 'Sperrt 30 Min vor Anpfiff',
    goalScorers: 'Torschützen',
    backGroups: 'Zurück zu Gruppen',
    backAllGroups: 'Zurück zu allen Gruppen',
    reviewFull: 'Eintrag prüfen',
    submitEntry: 'Eintrag absenden',
    entrySubmitted: 'Eintrag gespeichert',
    savedText: 'dein vollständiger Tipp wurde gespeichert.',
    leaderboardNotStarted: 'Rangliste noch nicht gestartet',
    pointsUpdate: 'Punkte werden am Ende jedes WM-Tages aktualisiert.',
    editResubmit: 'Bearbeiten & erneut senden',
    logout: 'Ausloggen',
    welcome: 'Willkommen',
    paymentStatus: 'Zahlungsstatus',
    paid: 'Bezahlt',
    admin: 'Admin'
  },
  ar: {
    play: 'العب',
    badge: 'تحدي توقعات كأس العالم 2026',
    heroTitle: 'توقع كل مجموعة. توقع كل مباراة. اربح من صندوق الجوائز.',
    heroText: 'أنشئ حساباً، ادفع رسوم الدخول، وافتح كل المجموعات والمباريات.',
    createAccountFirst: 'أنشئ الحساب أولاً',
    currentPrizePool: 'صندوق الجوائز الحالي',
    prizeGrows: 'صندوق الجوائز يكبر مع كل لاعب مدفوع.',
    paidPlayers: 'اللاعبون المدفوعون',
    entryFee: 'رسوم الدخول',
    predictionsSubmitted: 'التوقعات المرسلة',
    leaderboardUpdate: 'تحديث الترتيب',
    daily: 'يومي',
    predictTable: 'توقع ترتيب المجموعة',
    predictTableText: 'توقع المركز الأول والثاني والثالث والرابع لكل مجموعة.',
    predictScores: 'توقع النتائج والهدافين',
    predictScoresText: 'توقع كل مباريات دور المجموعات.',
    knockoutLocked: 'الأدوار الإقصائية مغلقة',
    knockoutText: 'توقعات الأدوار الإقصائية تفتح لاحقاً.',
    dailyLeaderboard: 'ترتيب يومي',
    dailyLeaderboardText: 'يتم تحديث الترتيب في نهاية كل يوم.',
    pointsTitle: 'كيف تكسب النقاط',
    correctWinner: 'الفائز الصحيح/تعادل: 3 نقاط',
    exactScore: 'النتيجة الدقيقة للفريقين: 5 نقاط',
    correctScorer: 'هداف صحيح من فريق واحد: 1 نقطة',
    correctGroupPosition: 'مركز صحيح في المجموعة: 5 نقاط',
    perfectGroup: 'ترتيب مجموعة كامل صحيح: 10 نقاط إضافية',
    createYourAccount: 'أنشئ حسابك',
    login: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    continueGoogle: 'المتابعة مع Google',
    alreadyAccount: 'لديك حساب؟ تسجيل الدخول',
    needAccount: 'تحتاج حساب؟ أنشئ حساباً',
    payEntry: 'ادفع رسوم الدخول',
    payWithCard: 'ادفع بالبطاقة',
    accountReady: 'الحساب جاهز',
    startPredictor: 'ابدأ التوقعات',
    fullPredictor: 'التوقع الكامل: 12 مجموعة · 72 مباراة',
    completion: 'الاكتمال',
    reviewSubmit: 'مراجعة وإرسال',
    continueEntry: 'متابعة التوقعات',
    groupTableTitle: 'توقع ترتيب المجموعة',
    moveTeams: 'حرّك الفرق للأعلى أو للأسفل. الأول والثاني يتأهلان.',
    scoresTitle: 'توقع النتائج والهدافين',
    allTimes: 'يمكن تعديل كل مباراة حتى 30 دقيقة قبل البداية. كل الأوقات بتوقيت أمستردام.',
    locked: 'مغلق',
    locks30: 'يغلق قبل البداية بـ30 دقيقة',
    goalScorers: 'الهدافون',
    backGroups: 'العودة للمجموعات',
    backAllGroups: 'العودة لكل المجموعات',
    reviewFull: 'مراجعة التوقع الكامل',
    submitEntry: 'إرسال التوقع الكامل',
    entrySubmitted: 'تم إرسال التوقع',
    savedText: 'تم حفظ توقعك الكامل.',
    leaderboardNotStarted: 'الترتيب لم يبدأ بعد',
    pointsUpdate: 'يتم تحديث النقاط في نهاية كل يوم من كأس العالم.',
    editResubmit: 'تعديل وإعادة الإرسال',
    logout: 'تسجيل الخروج',
    welcome: 'مرحباً',
    paymentStatus: 'حالة الدفع',
    paid: 'مدفوع',
    admin: 'مشرف'
  },
  sv: {
    play: 'Spela',
    badge: 'World Cup 2026 Predictor Challenge',
    heroTitle: 'Tippa varje grupp. Tippa varje match. Vinn den växande prispotten.',
    heroText: 'Skapa konto, betala avgiften och lås upp alla grupper och matcher.',
    createAccountFirst: 'Skapa konto först',
    currentPrizePool: 'Aktuell prispott',
    prizeGrows: 'Prispotten växer med varje betald spelare.',
    paidPlayers: 'Betalda spelare',
    entryFee: 'Avgift',
    predictionsSubmitted: 'Inlämnade tips',
    leaderboardUpdate: 'Topplista uppdatering',
    daily: 'Dagligen',
    predictTable: 'Tippa tabellen',
    predictTableText: 'Tippa 1:a, 2:a, 3:e och 4:e plats i varje grupp.',
    predictScores: 'Tippa resultat & målskyttar',
    predictScoresText: 'Tippa alla gruppspelsmatcher.',
    knockoutLocked: 'Slutspelet låst',
    knockoutText: 'Slutspelstips öppnar senare.',
    dailyLeaderboard: 'Daglig topplista',
    dailyLeaderboardText: 'Topplistan uppdateras i slutet av varje dag.',
    pointsTitle: 'Så tjänar du poäng',
    correctWinner: 'Rätt vinnare/oavgjort: 3 poäng',
    exactScore: 'Exakt resultat för båda lag: 5 poäng',
    correctScorer: 'Rätt målskytt från ett lag: 1 poäng',
    correctGroupPosition: 'Rätt grupposition: 5 poäng',
    perfectGroup: 'Perfekt grupptabell: 10 bonuspoäng',
    createYourAccount: 'Skapa ditt konto',
    login: 'Logga in',
    username: 'Användarnamn',
    email: 'E-postadress',
    password: 'Lösenord',
    continueGoogle: 'Fortsätt med Google',
    alreadyAccount: 'Har du redan konto? Logga in',
    needAccount: 'Behöver konto? Skapa konto',
    payEntry: 'Betala avgift',
    payWithCard: 'Betala med kort',
    accountReady: 'Konto klart',
    startPredictor: 'Starta tipset',
    fullPredictor: 'Fullt tips: 12 grupper · 72 matcher',
    completion: 'Färdigt',
    reviewSubmit: 'Granska & skicka',
    continueEntry: 'Fortsätt tippa',
    groupTableTitle: 'Tippa tabellen',
    moveTeams: 'Flytta lag upp eller ner. 1:a och 2:a går vidare.',
    scoresTitle: 'Tippa resultat & målskyttar',
    allTimes: 'Varje match kan ändras fram till 30 minuter före avspark. Alla tider är Amsterdam-tid.',
    locked: 'Låst',
    locks30: 'Låses 30 min före avspark',
    goalScorers: 'Målskyttar',
    backGroups: 'Tillbaka till grupper',
    backAllGroups: 'Tillbaka till alla grupper',
    reviewFull: 'Granska hela tipset',
    submitEntry: 'Skicka hela tipset',
    entrySubmitted: 'Tips sparat',
    savedText: 'ditt fullständiga tips har sparats.',
    leaderboardNotStarted: 'Topplistan har inte startat än',
    pointsUpdate: 'Poäng uppdateras i slutet av varje VM-dag.',
    editResubmit: 'Redigera & skicka igen',
    logout: 'Logga ut',
    welcome: 'Välkommen',
    paymentStatus: 'Betalningsstatus',
    paid: 'Betald',
    admin: 'Admin'
  }
};

const languages = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic' },
  { code: 'sv', flag: '🇸🇪', label: 'Svenska' }
];


const knockoutSchedule = [
  {
    round: 'Laatste 32',
    games: [
      '28 juni - 21:00 uur: Nummer 2 Poule A - Nummer 2 Poule B in Los Angeles (#73)',
      '29 juni - 19:00 uur: Winnaar Poule C - Nummer 2 Poule F in Houston (#76)',
      '29 juni - 22:30 uur: Winnaar Poule E - Nummer 3 Poule A/B/C/D/F in Boston (#74)',
      '30 juni - 03:00 uur: Winnaar Poule F - Nummer 2 Poule C in Monterrey (#75)',
      '30 juni - 19:00 uur: Nummer 2 Poule E - Nummer 2 Poule I in Dallas (#78)',
      '30 juni - 23:00 uur: Winnaar Poule I - Nummer 3 Poule C/D/F/G/H in New York/New Jersey (#77)',
      '1 juli - 03:00 uur: Winnaar Poule A - Nummer 3 Poule C/E/F/H/I in Mexico-Stad (#79)',
      '1 juli - 18:00 uur: Winnaar Poule L - Nummer 3 Poule E/H/I/J/K in Atlanta (#80)',
      '1 juli - 22:00 uur: Winnaar Poule G - Nummer 3 Poule A/E/H/I/J in San Francisco (#82)',
      '2 juli - 02:00 uur: Winnaar Poule D - Nummer 3 Poule B/E/F/I/J in Seattle (#81)',
      '2 juli - 21:00 uur: Winnaar Poule H - Nummer 2 Poule J in Los Angeles (#84)',
      '3 juli - 01:00 uur: Nummer 2 Poule K - Nummer 2 Poule L in Toronto (#83)',
      '3 juli - 05:00 uur: Winnaar Poule B - Nummer 3 Poule E/F/G/I/J in Vancouver (#85)',
      '3 juli - 20:00 uur: Nummer 2 Poule D - Nummer 2 Poule G in Dallas (#88)',
      '4 juli - 00:00 uur: Winnaar Poule J - Nummer 2 Poule H in Miami (#86)',
      '4 juli - 03:30 uur: Winnaar Poule K - Nummer 3 Poule D/E/I/J/L in Kansas City (#87)'
    ]
  },
  {
    round: 'Laatste 16',
    games: [
      '4 juli - 19:00 uur: Winnaar duel 73 - Winnaar duel 75 in Houston (#90)',
      '4 juli - 23:00 uur: Winnaar duel 74 - Winnaar duel 77 in Philadelphia (#89)',
      '5 juli - 22:00 uur: Winnaar duel 76 - Winnaar duel 78 in New York/New Jersey (#91)',
      '6 juli - 02:00 uur: Winnaar duel 79 - Winnaar duel 80 in Mexico-Stad (#92)',
      '6 juli - 21:00 uur: Winnaar duel 83 - Winnaar duel 84 in Dallas (#93)',
      '7 juli - 02:00 uur: Winnaar duel 81 - Winnaar duel 82 in Seattle (#94)',
      '7 juli - 18:00 uur: Winnaar duel 86 - Winnaar duel 88 in Atlanta (#95)',
      '7 juli - 22:00 uur: Winnaar duel 85 - Winnaar duel 87 in Vancouver (#96)'
    ]
  },
  {
    round: 'Kwartfinale',
    games: [
      '9 juli - 22:00 uur: Winnaar duel 89 - Winnaar duel 90 in Boston (#97)',
      '10 juli - 21:00 uur: Winnaar duel 93 - Winnaar duel 94 in Los Angeles (#98)',
      '11 juli - 23:00 uur: Winnaar duel 91 - Winnaar duel 92 in Miami (#99)',
      '12 juli - 03:00 uur: Winnaar duel 95 - Winnaar duel 96 in Kansas City (#100)'
    ]
  },
  {
    round: 'Halve finale',
    games: [
      '14 juli - 21:00 uur: Winnaar duel 97 - Winnaar duel 98 in Dallas (#101)',
      '15 juli - 21:00 uur: Winnaar duel 99 - Winnaar duel 100 in Atlanta (#102)'
    ]
  },
  {
    round: 'Wedstrijd om 3e/4e plaats',
    games: ['18 juli - 23:00 uur: Verliezer duel 101 - Verliezer duel 102 in Miami (#103)']
  },
  {
    round: 'Finale',
    games: ['19 juli - 21:00 uur: Winnaar duel 101 - Winnaar duel 102 in New York/New Jersey (#104)']
  }
];

const groups = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czech Republic'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Turkey'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama']
};

const groupKeys = Object.keys(groups);
const totalGroups = groupKeys.length;
const totalMatches = totalGroups * 6;

const matchesByGroup = {
  A: [
    { home: 'Mexico', away: 'South Africa', kickoff: '2026-06-11T21:00:00+02:00' },
    { home: 'South Korea', away: 'Czech Republic', kickoff: '2026-06-12T04:00:00+02:00' },
    { home: 'Czech Republic', away: 'South Africa', kickoff: '2026-06-18T18:00:00+02:00' },
    { home: 'Mexico', away: 'South Korea', kickoff: '2026-06-19T03:00:00+02:00' },
    { home: 'South Africa', away: 'South Korea', kickoff: '2026-06-25T03:00:00+02:00' },
    { home: 'Czech Republic', away: 'Mexico', kickoff: '2026-06-25T03:00:00+02:00' }
  ],

  B: [
    { home: 'Canada', away: 'Bosnia and Herzegovina', kickoff: '2026-06-12T21:00:00+02:00' },
    { home: 'Qatar', away: 'Switzerland', kickoff: '2026-06-13T21:00:00+02:00' },
    { home: 'Switzerland', away: 'Bosnia and Herzegovina', kickoff: '2026-06-18T21:00:00+02:00' },
    { home: 'Canada', away: 'Qatar', kickoff: '2026-06-19T00:00:00+02:00' },
    { home: 'Switzerland', away: 'Canada', kickoff: '2026-06-24T21:00:00+02:00' },
    { home: 'Bosnia and Herzegovina', away: 'Qatar', kickoff: '2026-06-24T21:00:00+02:00' }
  ],

  C: [
    { home: 'Brazil', away: 'Morocco', kickoff: '2026-06-14T00:00:00+02:00' },
    { home: 'Haiti', away: 'Scotland', kickoff: '2026-06-14T03:00:00+02:00' },
    { home: 'Scotland', away: 'Morocco', kickoff: '2026-06-20T00:00:00+02:00' },
    { home: 'Brazil', away: 'Haiti', kickoff: '2026-06-20T02:30:00+02:00' },
    { home: 'Morocco', away: 'Haiti', kickoff: '2026-06-25T00:00:00+02:00' },
    { home: 'Scotland', away: 'Brazil', kickoff: '2026-06-25T00:00:00+02:00' }
  ],

  D: [
    { home: 'United States', away: 'Paraguay', kickoff: '2026-06-13T03:00:00+02:00' },
    { home: 'Australia', away: 'Turkey', kickoff: '2026-06-14T06:00:00+02:00' },
    { home: 'United States', away: 'Australia', kickoff: '2026-06-19T21:00:00+02:00' },
    { home: 'Turkey', away: 'Paraguay', kickoff: '2026-06-20T05:00:00+02:00' },
    { home: 'Turkey', away: 'United States', kickoff: '2026-06-26T04:00:00+02:00' },
    { home: 'Paraguay', away: 'Australia', kickoff: '2026-06-26T04:00:00+02:00' }
  ],

  E: [
    { home: 'Germany', away: 'Curaçao', kickoff: '2026-06-14T19:00:00+02:00' },
    { home: 'Ivory Coast', away: 'Ecuador', kickoff: '2026-06-15T01:00:00+02:00' },
    { home: 'Germany', away: 'Ivory Coast', kickoff: '2026-06-20T22:00:00+02:00' },
    { home: 'Ecuador', away: 'Curaçao', kickoff: '2026-06-21T02:00:00+02:00' },
    { home: 'Curaçao', away: 'Ivory Coast', kickoff: '2026-06-25T22:00:00+02:00' },
    { home: 'Ecuador', away: 'Germany', kickoff: '2026-06-25T22:00:00+02:00' }
  ],

  F: [
    { home: 'Netherlands', away: 'Japan', kickoff: '2026-06-14T22:00:00+02:00' },
    { home: 'Sweden', away: 'Tunisia', kickoff: '2026-06-15T04:00:00+02:00' },
    { home: 'Netherlands', away: 'Sweden', kickoff: '2026-06-20T19:00:00+02:00' },
    { home: 'Tunisia', away: 'Japan', kickoff: '2026-06-21T06:00:00+02:00' },
    { home: 'Tunisia', away: 'Netherlands', kickoff: '2026-06-26T01:00:00+02:00' },
    { home: 'Japan', away: 'Sweden', kickoff: '2026-06-26T01:00:00+02:00' }
  ],

  G: [
    { home: 'Belgium', away: 'Egypt', kickoff: '2026-06-15T21:00:00+02:00' },
    { home: 'Iran', away: 'New Zealand', kickoff: '2026-06-16T03:00:00+02:00' },
    { home: 'Belgium', away: 'Iran', kickoff: '2026-06-21T21:00:00+02:00' },
    { home: 'New Zealand', away: 'Egypt', kickoff: '2026-06-22T03:00:00+02:00' },
    { home: 'New Zealand', away: 'Belgium', kickoff: '2026-06-27T05:00:00+02:00' },
    { home: 'Egypt', away: 'Iran', kickoff: '2026-06-27T05:00:00+02:00' }
  ],

  H: [
    { home: 'Spain', away: 'Cape Verde', kickoff: '2026-06-15T18:00:00+02:00' },
    { home: 'Saudi Arabia', away: 'Uruguay', kickoff: '2026-06-16T00:00:00+02:00' },
    { home: 'Spain', away: 'Saudi Arabia', kickoff: '2026-06-21T18:00:00+02:00' },
    { home: 'Uruguay', away: 'Cape Verde', kickoff: '2026-06-22T00:00:00+02:00' },
    { home: 'Cape Verde', away: 'Saudi Arabia', kickoff: '2026-06-27T02:00:00+02:00' },
    { home: 'Uruguay', away: 'Spain', kickoff: '2026-06-27T02:00:00+02:00' }
  ],

  I: [
    { home: 'France', away: 'Senegal', kickoff: '2026-06-16T21:00:00+02:00' },
    { home: 'Iraq', away: 'Norway', kickoff: '2026-06-17T00:00:00+02:00' },
    { home: 'France', away: 'Iraq', kickoff: '2026-06-22T23:00:00+02:00' },
    { home: 'Norway', away: 'Senegal', kickoff: '2026-06-23T02:00:00+02:00' },
    { home: 'Norway', away: 'France', kickoff: '2026-06-26T21:00:00+02:00' },
    { home: 'Senegal', away: 'Iraq', kickoff: '2026-06-26T21:00:00+02:00' }
  ],

  J: [
    { home: 'Argentina', away: 'Algeria', kickoff: '2026-06-17T03:00:00+02:00' },
    { home: 'Austria', away: 'Jordan', kickoff: '2026-06-17T06:00:00+02:00' },
    { home: 'Argentina', away: 'Austria', kickoff: '2026-06-22T19:00:00+02:00' },
    { home: 'Jordan', away: 'Algeria', kickoff: '2026-06-23T05:00:00+02:00' },
    { home: 'Algeria', away: 'Austria', kickoff: '2026-06-28T04:00:00+02:00' },
    { home: 'Jordan', away: 'Argentina', kickoff: '2026-06-28T04:00:00+02:00' }
  ],

  K: [
    { home: 'Portugal', away: 'DR Congo', kickoff: '2026-06-17T19:00:00+02:00' },
    { home: 'Uzbekistan', away: 'Colombia', kickoff: '2026-06-18T04:00:00+02:00' },
    { home: 'Portugal', away: 'Uzbekistan', kickoff: '2026-06-23T19:00:00+02:00' },
    { home: 'Colombia', away: 'DR Congo', kickoff: '2026-06-24T04:00:00+02:00' },
    { home: 'Colombia', away: 'Portugal', kickoff: '2026-06-28T01:30:00+02:00' },
    { home: 'DR Congo', away: 'Uzbekistan', kickoff: '2026-06-28T01:30:00+02:00' }
  ],

  L: [
    { home: 'England', away: 'Croatia', kickoff: '2026-06-17T22:00:00+02:00' },
    { home: 'Ghana', away: 'Panama', kickoff: '2026-06-18T01:00:00+02:00' },
    { home: 'England', away: 'Ghana', kickoff: '2026-06-23T22:00:00+02:00' },
    { home: 'Panama', away: 'Croatia', kickoff: '2026-06-24T01:00:00+02:00' },
    { home: 'Panama', away: 'England', kickoff: '2026-06-27T23:00:00+02:00' },
    { home: 'Croatia', away: 'Ghana', kickoff: '2026-06-27T23:00:00+02:00' }
  ]
};

function money(value) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatAmsterdamTime(dateString) {
  return new Date(dateString).toLocaleString('en-GB', {
    timeZone: 'Europe/Amsterdam',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isGroupTableLocked() {
  return Date.now() >= new Date(GROUP_TABLE_LOCK_TIME).getTime();
}

function isMatchLocked(match) {
  const kickoffTime = new Date(match.kickoff).getTime();
  const lockTime = kickoffTime - 30 * 60 * 1000;
  return Date.now() >= lockTime;
}


function matchId(group, index) {
  return `${group}-${index}`;
}

function parseScorers(value) {
  return String(value || '')
    .split(/[,;\n]/)
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

function matchOutcome(homeScore, awayScore) {
  const home = Number(homeScore);
  const away = Number(awayScore);
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

function calculateStandings(group, resultsById) {
  const table = groups[group].map((team) => ({
    team,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0
  }));

  const getRow = (team) => table.find((row) => row.team === team);

  makeMatches(group).forEach((match, index) => {
    const result = resultsById[matchId(group, index)];
    if (!result || result.homeScore === '' || result.awayScore === '') return;

    const homeRow = getRow(match.home);
    const awayRow = getRow(match.away);
    const homeScore = Number(result.homeScore);
    const awayScore = Number(result.awayScore);

    homeRow.goalsFor += homeScore;
    homeRow.goalsAgainst += awayScore;
    awayRow.goalsFor += awayScore;
    awayRow.goalsAgainst += homeScore;

    if (homeScore > awayScore) homeRow.points += 3;
    else if (awayScore > homeScore) awayRow.points += 3;
    else {
      homeRow.points += 1;
      awayRow.points += 1;
    }
  });

  table.forEach((row) => {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  });

  return table.sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.team.localeCompare(b.team)
  );
}

function groupHasAllResults(group, resultsById) {
  return groups[group].length === 4 && makeMatches(group).every((_, index) => {
    const result = resultsById[matchId(group, index)];
    return result && result.homeScore !== '' && result.awayScore !== '';
  });
}

function calculatePointsForPrediction(predictionData, resultsById) {
  let points = 0;

  groupKeys.forEach((group) => {
    const groupPrediction = predictionData?.[group];
    if (!groupPrediction) return;

    groupPrediction.matches.forEach((prediction, index) => {
      const result = resultsById[matchId(group, index)];
      if (!result || result.homeScore === '' || result.awayScore === '') return;
      if (prediction.homeScore === '' || prediction.awayScore === '') return;

      const predictedHome = Number(prediction.homeScore);
      const predictedAway = Number(prediction.awayScore);
      const realHome = Number(result.homeScore);
      const realAway = Number(result.awayScore);

      // Correct winner/draw = 3 points
if (matchOutcome(predictedHome, predictedAway) === matchOutcome(realHome, realAway)) {
  points += 3;
}

// Exact score = +5 points
if (predictedHome === realHome && predictedAway === realAway) {
  points += 5;
}

      const predictedScorers = new Set(parseScorers(prediction.scorers));
      const realScorers = new Set(parseScorers(result.scorers));
      predictedScorers.forEach((scorer) => {
        if (realScorers.has(scorer)) points += 1;
      });
    });

    if (groupHasAllResults(group, resultsById)) {
      const actualRanking = calculateStandings(group, resultsById).map((row) => row.team);
      const predictedRanking = groupPrediction.ranking || [];

      predictedRanking.forEach((team, index) => {
        if (actualRanking[index] === team) points += 5;
      });

      if (actualRanking.every((team, index) => predictedRanking[index] === team)) {
        points += 10;
      }
    }
  });

  return points;
}

function makeMatches(groupKey) {
  return matchesByGroup[groupKey].map((match) => ({
    ...match,
    dateTime: formatAmsterdamTime(match.kickoff),
    timezone: 'Amsterdam time',
    homeScore: '',
    awayScore: '',
    scorers: ''
  }));
}

const initialPredictions = Object.fromEntries(
  groupKeys.map((key) => [
    key,
    {
      ranking: groups[key],
      matches: makeMatches(key)
    }
  ])
);

function normalizePredictions(sourcePredictions) {
  if (!sourcePredictions) return initialPredictions;

  return Object.fromEntries(
    groupKeys.map((group) => {
      const sourceGroup = sourcePredictions[group] || {};
      const officialTeams = groups[group];
      const sourceRanking = Array.isArray(sourceGroup.ranking) ? sourceGroup.ranking : [];

      const ranking = [
        ...sourceRanking.filter((team) => officialTeams.includes(team)),
        ...officialTeams.filter((team) => !sourceRanking.includes(team))
      ];

      const sourceMatches = Array.isArray(sourceGroup.matches) ? sourceGroup.matches : [];

      const matches = makeMatches(group).map((officialMatch, index) => {
        const savedMatch =
          sourceMatches.find(
            (match) =>
              match.home === officialMatch.home &&
              match.away === officialMatch.away
          ) || sourceMatches[index];

        return {
          ...officialMatch,
          homeScore: savedMatch?.homeScore ?? '',
          awayScore: savedMatch?.awayScore ?? '',
          scorers: savedMatch?.scorers ?? ''
        };
      });

      return [
        group,
        {
          ranking,
          matches
        }
      ];
    })
  );
}

function allGroupsSubmitted() {
  return Object.fromEntries(groupKeys.map((group) => [group, true]));
}


function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [predictions, setPredictions] = useState(initialPredictions);
  const [submitted, setSubmitted] = useState(false);
  const [submittedGroups, setSubmittedGroups] = useState({});
  const [, setLockTick] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authMode, setAuthMode] = useState('signup');
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [paidPlayers, setPaidPlayers] = useState(0);
  const [predictionsSubmitted, setPredictionsSubmitted] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [officialResults, setOfficialResults] = useState({});
  const [adminGroup, setAdminGroup] = useState('A');
  const [adminMatchIndex, setAdminMatchIndex] = useState(0);
  const [adminHomeScore, setAdminHomeScore] = useState('');
  const [adminAwayScore, setAdminAwayScore] = useState('');
  const [adminScorers, setAdminScorers] = useState('');

  const totalPrizePool = paidPlayers * PRIZE_POOL_AMOUNT_PER_PLAYER;
const organizerTotal = paidPlayers * ORGANIZER_AMOUNT_PER_PLAYER;
  const firstPrize = totalPrizePool * 0.6;
  const secondPrize = totalPrizePool * 0.25;
  const thirdPrize = totalPrizePool * 0.15;

  const completion = useMemo(() => {
    let completedTables = 0;
    let completedMatches = 0;

    groupKeys.forEach((group) => {
      const prediction = predictions[group];

      if (prediction.ranking.length === 4) {
        completedTables += 1;
      }

      completedMatches += prediction.matches.filter(
        (match) => match.homeScore !== '' && match.awayScore !== ''
      ).length;
    });

    return Math.round(
      ((completedTables + completedMatches) / (totalGroups + totalMatches)) * 100
    );
  }, [predictions]);

  const isFullyComplete = completion === 100;
  const isAdmin = user?.email === ADMIN_EMAIL;
  const hasPaid = Boolean(userProfile?.paid) || isAdmin;

  useEffect(() => {
    const timer = setInterval(() => setLockTick(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadDraft() {
      const draftRef = doc(db, 'drafts', user.uid);
      const draftSnap = await getDoc(draftRef);

      if (draftSnap.exists() && draftSnap.data().predictions) {
        setPredictions(normalizePredictions(draftSnap.data().predictions));
      }

      const submittedRef = doc(db, 'predictions', user.uid);
      const submittedSnap = await getDoc(submittedRef);

      if (submittedSnap.exists()) {
        const submittedData = submittedSnap.data();

        if (submittedData.predictions) {
          setPredictions(normalizePredictions(submittedData.predictions));
        }

        if (submittedData.submittedGroups) {
          setSubmittedGroups(submittedData.submittedGroups);
        }
      }
    }

    loadDraft();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const saveTimer = setTimeout(async () => {
      await setDoc(doc(db, 'drafts', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username || userProfile?.username || user.email,
        predictions,
        updatedAt: serverTimestamp()
      });
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [user, predictions, username, userProfile]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);

      if (!currentUser) {
        setUserProfile(null);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          username:
            username?.trim() ||
            currentUser.displayName?.trim() ||
            currentUser.email?.split('@')[0] ||
            'Player',
          paid: false,
          points: 0,
          createdAt: serverTimestamp()
        };

        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      } else {
        setUserProfile(userSnap.data());
      }
    });

    const paidUsersQuery = query(collection(db, 'users'), where('paid', '==', true));

    const unsubscribePaidUsers = onSnapshot(paidUsersQuery, (snapshot) => {
      setPaidPlayers(snapshot.size);
    });

    const unsubscribePredictions = onSnapshot(collection(db, 'predictions'), (snapshot) => {
  setPredictionsSubmitted(snapshot.size);
});

const unsubscribeLeaderboard = onSnapshot(collection(db, 'users'), (snapshot) => {
  const rows = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((player) => player.paid === true || Number(player.points || 0) > 0);

  rows.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

  setLeaderboard(rows);
});

    const unsubscribeResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const results = {};
      snapshot.docs.forEach((item) => {
        results[item.id] = item.data();
      });
      setOfficialResults(results);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePaidUsers();
      unsubscribePredictions();
      unsubscribeLeaderboard();
      unsubscribeResults();
    };
  }, [username]);

  async function handleEmailAuth() {
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }

    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert(error.code + ' - ' + error.message);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setStep(0);
    setSubmitted(false);
  }

  function scrollToGame() {
    setStep(0);
    document.getElementById('play-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  function moveTeam(group, index, direction) {
    if (isGroupTableLocked() || submittedGroups[group]) return;

    const ranking = [...predictions[group].ranking];
    const target = index + direction;

    if (target < 0 || target >= ranking.length) return;

    [ranking[index], ranking[target]] = [ranking[target], ranking[index]];

    setPredictions({
      ...predictions,
      [group]: {
        ...predictions[group],
        ranking
      }
    });
  }

  function updateMatch(group, index, field, value) {
    const match = predictions[group].matches[index];
    if (isMatchLocked(match)) return;

    const matches = [...predictions[group].matches];

    matches[index] = {
      ...matches[index],
      [field]: value
    };

    setPredictions({
      ...predictions,
      [group]: {
        ...predictions[group],
        matches
      }
    });
  }


  async function submitGroupPrediction(group) {
    if (!user) {
      alert('You must login first.');
      return;
    }

    if (!hasPaid) {
      alert('You must pay first.');
      return;
    }

    if (submittedGroups[group]) {
      alert(`Group ${group} was already submitted and cannot be changed.`);
      return;
    }

    if (isGroupTableLocked()) {
      alert('Group predictions are locked.');
      return;
    }

    const updatedSubmittedGroups = {
      ...submittedGroups,
      [group]: true
    };

    try {
      await setDoc(
        doc(db, 'predictions', user.uid),
        {
          uid: user.uid,
          email: user.email,
          username: username || userProfile?.username || user.displayName || user.email,
          predictions,
          submittedGroups: updatedSubmittedGroups,
          points: Number(userProfile?.points || 0),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setSubmittedGroups(updatedSubmittedGroups);
      alert(`Group ${group} submitted. This group table is now locked.`);
    } catch (error) {
      alert(`Group submit failed: ${error.message}`);
    }
  }

  async function submitMatchPredictions(group) {
    if (!user) {
      alert('You must login first.');
      return;
    }

    if (!hasPaid) {
      alert('You must pay first.');
      return;
    }

    try {
      const submittedRef = doc(db, 'predictions', user.uid);
      const submittedSnap = await getDoc(submittedRef);

      const currentSubmitted = submittedSnap.exists()
        ? normalizePredictions(submittedSnap.data().predictions)
        : normalizePredictions(predictions);

      const savedGroup = currentSubmitted[group] || predictions[group];

      const updatedMatches = predictions[group].matches.map((match, index) => {
        if (isMatchLocked(match)) {
          return savedGroup.matches?.[index] || match;
        }

        return match;
      });

      const updatedPredictions = {
        ...currentSubmitted,
        [group]: {
          ...savedGroup,
          ranking: savedGroup.ranking || predictions[group].ranking,
          matches: updatedMatches
        }
      };

      await setDoc(
        submittedRef,
        {
          uid: user.uid,
          email: user.email,
          username: username || userProfile?.username || user.displayName || user.email,
          predictions: updatedPredictions,
          submittedGroups,
          points: Number(userProfile?.points || 0),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setPredictions(updatedPredictions);
      alert(`Group ${group} matches saved.`);
    } catch (error) {
      alert(`Match submit failed: ${error.message}`);
    }
  }

  async function saveDraftNow(message = 'Saved') {
    if (!user) return;

    await setDoc(doc(db, 'drafts', user.uid), {
      uid: user.uid,
      email: user.email,
      username: username || userProfile?.username || user.displayName || user.email,
      predictions,
      updatedAt: serverTimestamp()
    });

    alert(message);
  }

  async function recalculateAllPoints(resultsOverride = officialResults) {
  if (!isAdmin) {
    alert('Only admin can recalculate points.');
    return;
  }

  try {
    const predictionsSnapshot = await getDocs(collection(db, 'predictions'));

    if (predictionsSnapshot.empty) {
      alert('No submitted predictions found.');
      return;
    }

    await Promise.all(
      predictionsSnapshot.docs.map(async (predictionDoc) => {
        const data = predictionDoc.data();
        const points = calculatePointsForPrediction(data.predictions, resultsOverride);

console.log('PLAYER:', data.email);
console.log('RESULTS:', resultsOverride);
console.log('PREDICTIONS:', data.predictions);
console.log('CALCULATED POINTS:', points);

        await setDoc(
          doc(db, 'predictions', predictionDoc.id),
          {
            points,
            pointsUpdatedAt: serverTimestamp()
          },
          { merge: true }
        );

        await setDoc(
          doc(db, 'users', predictionDoc.id),
          {
            points
          },
          { merge: true }
        );
      })
    );

    alert(`Points recalculated for ${predictionsSnapshot.size} players.`);
  } catch (error) {
    console.error('Recalculate error:', error);
    alert(`Recalculate failed: ${error.message}`);
  }
}
async function saveOfficialResult() {
  if (!isAdmin) {
    alert('Only admin can save official results.');
    return;
  }

  if (adminHomeScore === '' || adminAwayScore === '') {
    alert('Fill in both scores first.');
    return;
  }

  const match = predictions[adminGroup].matches[adminMatchIndex];
  const id = matchId(adminGroup, adminMatchIndex);

  const resultData = {
    id,
    group: adminGroup,
    matchIndex: adminMatchIndex,
    home: match.home,
    away: match.away,
    homeScore: Number(adminHomeScore),
    awayScore: Number(adminAwayScore),
    scorers: adminScorers || '',
    updatedAt: serverTimestamp()
  };

  const updatedResults = {
    ...officialResults,
    [id]: resultData
  };

  try {
    await setDoc(doc(db, 'results', id), resultData, { merge: true });
    setOfficialResults(updatedResults);

    await recalculateAllPoints(updatedResults);

    alert('Result saved and leaderboard updated.');
  } catch (error) {
    console.error('Save result error:', error);
    alert(`Result save failed: ${error.message}`);
  }
}
  async function deleteOfficialResult() {
  if (!isAdmin) {
    alert('Only admin can delete official results.');
    return;
  }

  const id = matchId(adminGroup, adminMatchIndex);

  try {
    await deleteDoc(doc(db, 'results', id));

    const updatedResults = { ...officialResults };
    delete updatedResults[id];

    setOfficialResults(updatedResults);
    setAdminHomeScore('');
    setAdminAwayScore('');
    setAdminScorers('');

    await recalculateAllPoints(updatedResults);

    alert('Result deleted and leaderboard updated.');
  } catch (error) {
    console.error('Delete result error:', error);
    alert(`Delete failed: ${error.message}`);
  }
}

async function submitPredictions() {
    try {
      setAuthError('');

      if (!user) {
        alert('You must create an account first.');
        setStep(0);
        return;
      }

      if (!hasPaid) {
        alert('You must pay the entry fee before submitting predictions.');
        setStep(0);
        return;
      }

      if (!isFullyComplete) {
        alert('You must complete all 12 groups and all 72 games first.');
        return;
      }

      await setDoc(doc(db, 'predictions', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username || userProfile?.username || user.displayName || user.email,
        predictions,
        completion,
        submittedGroups: allGroupsSubmitted(),
        points: Number(userProfile?.points || 0),
        submittedAt: serverTimestamp()
      });

      alert('Entry submitted successfully!');
      setSubmittedGroups(allGroupsSubmitted());
      setSubmitted(true);
      setStep(5);
    } catch (error) {
      alert(`Submit failed: ${error.message}`);
    }
  }

  const current = predictions[selectedGroup];
  const currentGroupIndex = groupKeys.indexOf(selectedGroup);
  const previousGroup = groupKeys[Math.max(currentGroupIndex - 1, 0)];
  const nextGroup = groupKeys[Math.min(currentGroupIndex + 1, groupKeys.length - 1)];
  const selectedAdminMatch = predictions[adminGroup].matches[adminMatchIndex];

  const welcomeName =
    userProfile?.username?.trim() ||
    username?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Player';

  function renderLeaderboard() {
    return (
      <section className="rules">
        <article style={{ gridColumn: '1 / -1' }}>
          <Crown />
          <h3>🏆 Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p>{t.leaderboardNotStarted}</p>
          ) : (
            <div className="ranking-list">
              {leaderboard.slice(0, 20).map((player, index) => (
                <div className="ranking-row" key={player.id}>
                  <div>
                    <span>{index + 1}</span>
                    <b>{player.username || player.email?.split('@')[0] || 'Player'}</b>
                
                  </div>
                  <b>{Number(player.points || 0)} pts</b>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    );
  }

  function renderKnockoutSchedule() {
    return (
      <section className="rules">
        <article style={{ gridColumn: '1 / -1' }}>
          <Lock />
          <h3>🔒 Knock-outfase</h3>
          <p>Dit onderdeel is nu zichtbaar, maar nog gesloten. Voorspellen opent later.</p>
          {knockoutSchedule.map((round) => (
            <div key={round.round} style={{ marginTop: 18 }}>
              <h3>{round.round}</h3>
              <div className="matches">
                {round.games.map((game) => (
                  <div className="match" key={game}>
                    <div className="lockline">
                      <span>{game}</span>
                      <span>🔒 Locked</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </article>
      </section>
    );
  }

  function renderAdminPanel() {
    if (!isAdmin) return null;

    return (
      <section className="rules">
        <article style={{ gridColumn: '1 / -1' }}>
          <ShieldCheck />
          <h3>Admin Panel · Match Result</h3>
          <p>Enter the official result. The site will calculate points and update the leaderboard.</p>

          <div className="group-picker">
            {groupKeys.map((group) => (
              <button
                key={group}
                className={adminGroup === group ? 'selected' : ''}
                onClick={() => {
                  setAdminGroup(group);
                  setAdminMatchIndex(0);
                  setAdminHomeScore('');
                  setAdminAwayScore('');
                  setAdminScorers('');
                }}
              >
                <b>Group {group}</b>
              </button>
            ))}
          </div>

          <div className="group-picker" style={{ marginTop: 14 }}>
            {predictions[adminGroup].matches.map((match, index) => (
              <button
                key={`${match.home}-${match.away}`}
                className={adminMatchIndex === index ? 'selected' : ''}
                onClick={() => {
                  const saved = officialResults[matchId(adminGroup, index)];
                  setAdminMatchIndex(index);
                  setAdminHomeScore(saved?.homeScore ?? '');
                  setAdminAwayScore(saved?.awayScore ?? '');
                  setAdminScorers(saved?.scorers ?? '');
                }}
              >
                <b>{match.home} - {match.away}</b>
                <span>{match.dateTime}</span>
              </button>
            ))}
          </div>

          <div className="match" style={{ marginTop: 18 }}>
            <div className="scoreline">
              <b>{selectedAdminMatch.home}</b>
              <input
                type="number"
                min="0"
                value={adminHomeScore}
                onChange={(event) => setAdminHomeScore(event.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                value={adminAwayScore}
                onChange={(event) => setAdminAwayScore(event.target.value)}
              />
              <b>{selectedAdminMatch.away}</b>
            </div>
            <input
              value={adminScorers}
              onChange={(event) => setAdminScorers(event.target.value)}
              placeholder="Official scorers, separated by comma"
            />
          </div>

          <div className="actions">
          <button className="primary" onClick={saveOfficialResult}>
  Save Result & Update Leaderboard
</button>

<button onClick={() => recalculateAllPoints()}>
  Recalculate All Points
</button>

<button onClick={deleteOfficialResult}>
  Delete Result
</button>  
          </div>
        </article>
      </section>
    );
  }

  return (
    <main className="app" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="stadium-light left" />
      <div className="stadium-light right" />

      <div
        style={{
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 10,
  padding: '20px 40px',
  marginBottom: '20px'
}}
      >
        {user && (
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.16)',
              color: 'white',
              padding: '8px 14px',
              borderRadius: 999,
              fontWeight: 800,
              backdropFilter: 'blur(12px)'
            }}
          >
            👋 {t.welcome}, {welcomeName}
          </div>
        )}

        {languages.map((item) => (
          <button
            key={item.code}
            onClick={() => setLang(item.code)}
            title={item.label}
            style={{
              border: lang === item.code ? '2px solid #facc15' : '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(0,0,0,0.35)',
              color: 'white',
              borderRadius: 999,
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: 18
            }}
          >
            {item.flag}
          </button>
        ))}
      </div>

      <section className="hero">
        <div className="hero-copy">
          <div className="badge">
            <Trophy size={16} /> {t.badge}
          </div>

          <h1>{t.heroTitle}</h1>

          <p>
            {t.heroText} {totalGroups} groups · {totalMatches} games.
          </p>

          <button className="primary" onClick={scrollToGame}>
            {t.play} <ChevronRight size={18} />
          </button>
        </div>

        <div className="prize-card">
          <div className="trophy-circle">
            <Trophy size={48} />
          </div>

          <span>{t.currentPrizePool}</span>
          <strong>{money(totalPrizePool)}</strong>
          <small>{t.prizeGrows}</small>

          <div className="prize-grid">
            <div>
              <b>{money(firstPrize)}</b>
              <span>1st · 60%</span>
            </div>
            <div>
              <b>{money(secondPrize)}</b>
              <span>2nd · 25%</span>
            </div>
            <div>
              <b>{money(thirdPrize)}</b>
              <span>3rd · 15%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div>
          <span>{t.paidPlayers}</span>
          <b>{paidPlayers}</b>
        </div>
        <div>
          <span>{t.entryFee}</span>
          <b>{money(ENTRY_FEE)}</b>
        </div>
        <div>
          <span>{t.predictionsSubmitted}</span>
          <b>{predictionsSubmitted}</b>
        </div>
        <div>
          <span>{t.leaderboardUpdate}</span>
          <b>{t.daily}</b>
        </div>
      </section>

      <section className="rules">
        <article>
          <Medal />
          <h3>{t.predictTable}</h3>
          <p>{t.predictTableText}</p>
        </article>

        <article>
          <Goal />
          <h3>{t.predictScores}</h3>
          <p>{t.predictScoresText}</p>
        </article>

        <article>
          <Lock />
          <h3>{t.knockoutLocked}</h3>
          <p>{t.knockoutText}</p>
        </article>

        <article>
          <Crown />
          <h3>{t.dailyLeaderboard}</h3>
          <p>{t.dailyLeaderboardText}</p>
        </article>
      </section>

      <section className="rules">
        <article style={{ gridColumn: '1 / -1' }}>
          <Trophy />
          <h3>{t.pointsTitle}</h3>
          <p>✅ {t.correctWinner}</p>
          <p>✅ {t.exactScore}</p>
          <p>✅ {t.correctScorer}</p>
          <p>✅ {t.correctGroupPosition}</p>
          <p>✅ {t.perfectGroup}</p>
        </article>
      </section>

      <section id="play-section" className="game-card">
        {step === 0 && (
          <div className="auth-screen">
            <div className="auth-left">
              <div className="auth-logo">
                <Trophy size={68} />
              </div>

              <h2>World Cup 2026 Predictor</h2>

              <p className="auth-subtitle">{t.heroTitle}</p>

              <div className="big-prize-box">
                <span>{t.currentPrizePool}</span>
                <strong>{money(totalPrizePool)}</strong>
                <small>{t.prizeGrows}</small>
              </div>

              <div className="winner-split">
                <div>
                  <Trophy size={24} />
                  <b>60%</b>
                  <span>1st Place</span>
                </div>
                <div>
                  <Medal size={24} />
                  <b>25%</b>
                  <span>2nd Place</span>
                </div>
                <div>
                  <Crown size={24} />
                  <b>15%</b>
                  <span>3rd Place</span>
                </div>
              </div>

              <div className="players-box">
                <Users size={28} />
                <b>{paidPlayers}</b>
                <span>{t.paidPlayers}</span>
              </div>

              <ul className="feature-list">
                <li><Ticket /> {t.entryFee}: {money(ENTRY_FEE)}</li>
                <li><ShieldCheck /> {t.predictTableText}</li>
                <li><Goal /> {t.predictScoresText}</li>
                <li><TrendingUp /> {t.dailyLeaderboardText}</li>
                <li><Coins /> {t.prizeGrows}</li>
              </ul>
            </div>

            <div className="auth-card">
              {loadingAuth && <p>Checking login...</p>}

              {!loadingAuth && !user && (
                <>
                  <div className="steps">
                    <div className="active">1<span>{t.createYourAccount}</span></div>
                    <div>2<span>{t.payEntry}</span></div>
                    <div>3<span>{t.play}</span></div>
                  </div>

                  <h2>{authMode === 'signup' ? t.createYourAccount : t.login}</h2>

                  <label>{t.username}</label>
                  <div className="input-wrap">
                    <User size={20} />
                    <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t.username} />
                  </div>

                  <label>{t.email}</label>
                  <div className="input-wrap">
                    <Mail size={20} />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.email} type="email" />
                  </div>

                  <label>{t.password}</label>
                  <div className="input-wrap">
                    <KeyRound size={20} />
                    <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t.password} type="password" />
                  </div>

                  {authError && <p className="error">{authError}</p>}

                  <div className="entry-fee-box">
                    <div><Ticket size={26} /><span>{t.entryFee}</span></div>
                    <b>{money(ENTRY_FEE)}</b>
                  </div>

                  <button className="auth-primary" onClick={handleEmailAuth}>{authMode === 'signup' ? t.createYourAccount : t.login}</button>

                  <div className="divider"><span>OR</span></div>

                  <button className="auth-google" onClick={handleGoogleLogin}>{t.continueGoogle}</button>

                  <button className="auth-link" onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
                    {authMode === 'signup' ? t.alreadyAccount : t.needAccount}
                  </button>
                </>
              )}

              {!loadingAuth && user && !hasPaid && (
                <>
                  <h2>{t.payEntry}</h2>
                  <p className="form-intro">{user.email}</p>

                  <div className="entry-fee-box">
                    <div><Ticket size={26} /><span>Stripe Checkout</span></div>
                    <b>{money(ENTRY_FEE)}</b>
                  </div>

                  <a className="auth-primary" href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">{t.payWithCard}</a>
                  <button className="auth-link" onClick={handleLogout}>{t.logout}</button>
                </>
              )}

              {!loadingAuth && user && hasPaid && (
                <>
                  <h2>{t.accountReady}</h2>
                  <p className="form-intro">{user.email}</p>

                  <div className="entry-fee-box">
                    <div><ShieldCheck size={26} /><span>{t.paymentStatus}</span></div>
                    <b>{isAdmin ? t.admin : t.paid}</b>
                  </div>

                  <button className="auth-primary" onClick={() => setStep(1)}>{t.startPredictor} <ChevronRight size={18} /></button>
                  <button className="auth-link" onClick={handleLogout}>{t.logout}</button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2>Prediction Center</h2>
            <p>Start with group table predictions. Then predict match scores and scorers. Knock-out phase is visible but locked for now.</p>

            <div className="payment-row">
              <span>{t.completion}</span>
              <b>{completion}%</b>
            </div>

            <section className="rules">
              <article style={{ gridColumn: '1 / -1' }}>
                <Medal />
                <h3>1. Group Predictions</h3>
                <p>Predict every group table separately. Group tables lock on 11 June 2026 at 20:00 Amsterdam time.</p>
                <div className="group-picker">
                  {groupKeys.map((group) => (
                    <button
                      key={group}
                      onClick={() => {
                        setSelectedGroup(group);
                        setStep(2);
                      }}
                      className={selectedGroup === group ? 'selected' : ''}
                    >
                      <b>Group {group}</b>
                      <span>{predictions[group].ranking[0]} / {predictions[group].ranking[1]}</span>
                    </button>
                  ))}
                </div>
              </article>

              <article style={{ gridColumn: '1 / -1' }}>
  <Goal />
  <h3>2. Match Predictions</h3>
  <p>
    Select a group and predict the six matches. Matches stay open until
    30 minutes before kickoff.
  </p>

  <div className="group-picker">
    {groupKeys.map((group) => {
      const done = predictions[group].matches.filter(
        (match) => match.homeScore !== '' && match.awayScore !== ''
      ).length;

      return (
        <button
          key={group}
          onClick={() => setSelectedGroup(group)}
          className={selectedGroup === group ? 'selected' : ''}
        >
          <b>Group {group}</b>
          <span>{done}/6 games</span>
        </button>
      );
    })}
  </div>

  <div className="matches" style={{ marginTop: 24 }}>
    {predictions[selectedGroup].matches.map((match, index) => (
      <div className="match" key={`${match.home}-${match.away}`}>
        <div className="lockline">
          <span>{match.dateTime}</span>
          <span>
            {isMatchLocked(match) ? `🔒 ${t.locked}` : `🔓 ${t.locks30}`}
          </span>
        </div>

        <div className="scoreline">
          <b>{match.home}</b>

          <input
            disabled={isMatchLocked(match)}
            type="number"
            min="0"
            value={match.homeScore}
            onChange={(event) =>
              updateMatch(selectedGroup, index, 'homeScore', event.target.value)
            }
          />

          <span>-</span>

          <input
            disabled={isMatchLocked(match)}
            type="number"
            min="0"
            value={match.awayScore}
            onChange={(event) =>
              updateMatch(selectedGroup, index, 'awayScore', event.target.value)
            }
          />

          <b>{match.away}</b>
        </div>

        <input
          value={match.scorers}
          disabled={isMatchLocked(match)}
          onChange={(event) =>
            updateMatch(selectedGroup, index, 'scorers', event.target.value)
          }
          placeholder={t.goalScorers}
        />
      </div>
    ))}
  </div>

  <div className="actions" style={{ marginTop: 20 }}>
    <button
      onClick={() => {
        setSelectedGroup(previousGroup);
      }}
      disabled={currentGroupIndex === 0}
    >
      ← Previous Group
    </button>

    <button
      className="primary"
      onClick={() => submitMatchPredictions(selectedGroup)}
    >
      Submit Matches
    </button>

    <button
      onClick={() => {
        setSelectedGroup(nextGroup);
      }}
      disabled={currentGroupIndex === groupKeys.length - 1}
    >
      Next Group →
    </button>
  </div>
</article>
            </section>

            <div className="actions">
              <button className="primary" onClick={() => setStep(4)}>{t.reviewSubmit}</button>
            </div>

            {renderKnockoutSchedule()}
            {renderLeaderboard()}
            {renderAdminPanel()}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Group {selectedGroup}: {t.groupTableTitle}</h2>
            <p>{t.moveTeams}</p>
            {isGroupTableLocked() && <p className="error">{t.locked}: group table predictions closed on 11 June 2026 at 20:00 Amsterdam time.</p>}
            {submittedGroups[selectedGroup] && <p className="error">Group {selectedGroup} submitted and locked.</p>}

            <div className="ranking-list">
              {current.ranking.map((team, index) => (
                <div className="ranking-row" key={team}>
                  <div>
                    <span>{index + 1}</span>
                    <b>{team}</b>
                    <small>{index < 2 ? 'Qualifies' : 'Eliminated'}</small>
                  </div>

                  <div>
                    <button disabled={isGroupTableLocked() || submittedGroups[selectedGroup]} onClick={() => moveTeam(selectedGroup, index, -1)}>↑</button>
                    <button disabled={isGroupTableLocked() || submittedGroups[selectedGroup]} onClick={() => moveTeam(selectedGroup, index, 1)}>↓</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <button onClick={() => setStep(1)}>{t.backGroups}</button>
              <button
                onClick={() => {
                  setSelectedGroup(previousGroup);
                  setStep(2);
                }}
                disabled={currentGroupIndex === 0}
              >
                ← Previous Group
              </button>
              <button
                className="primary"
                disabled={submittedGroups[selectedGroup]}
                onClick={() => submitGroupPrediction(selectedGroup)}
              >
                {submittedGroups[selectedGroup] ? 'Group Submitted' : 'Submit Group'}
              </button>
              <button
                onClick={() => {
                  setSelectedGroup(nextGroup);
                  setStep(2);
                }}
                disabled={currentGroupIndex === groupKeys.length - 1}
              >
                Next Group →
              </button>
              <button className="primary" onClick={() => setStep(3)}>Go to Matches <ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Group {selectedGroup}: {t.scoresTitle}</h2>
            <p>{t.allTimes}</p>

            <div className="matches">
              {current.matches.map((match, index) => (
                <div className="match" key={`${match.home}-${match.away}`}>
                  <div className="lockline">
                    <span>{match.dateTime}</span>
                    <span>{isMatchLocked(match) ? `🔒 ${t.locked}` : `🔓 ${t.locks30}`}</span>
                  </div>

                  <div className="scoreline">
                    <b>{match.home}</b>
                    <input disabled={isMatchLocked(match)} type="number" min="0" value={match.homeScore} onChange={(event) => updateMatch(selectedGroup, index, 'homeScore', event.target.value)} />
                    <span>-</span>
                    <input disabled={isMatchLocked(match)} type="number" min="0" value={match.awayScore} onChange={(event) => updateMatch(selectedGroup, index, 'awayScore', event.target.value)} />
                    <b>{match.away}</b>
                  </div>

                  <input value={match.scorers} disabled={isMatchLocked(match)} onChange={(event) => updateMatch(selectedGroup, index, 'scorers', event.target.value)} placeholder={t.goalScorers} />
                </div>
              ))}
            </div>

            <div className="actions">
              <button onClick={() => setStep(1)}>{t.backAllGroups}</button>
              <button
                onClick={() => {
                  setSelectedGroup(previousGroup);
                  setStep(3);
                }}
                disabled={currentGroupIndex === 0}
              >
                ← Previous Page
              </button>
              <button className="primary" onClick={() => submitMatchPredictions(selectedGroup)}>Submit Matches</button>
              <button
                onClick={() => {
                  setSelectedGroup(nextGroup);
                  setStep(3);
                }}
                disabled={currentGroupIndex === groupKeys.length - 1}
              >
                Next Page →
              </button>
              <button className="primary" onClick={() => setStep(4)}>{t.reviewFull}</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>{t.reviewFull}</h2>
            <p>{t.completion}: {completion}%</p>

            <div className="review-grid">
              <div><ShieldCheck /><b>{totalGroups} groups required</b><span>All A–L tables must be predicted.</span></div>
              <div><CalendarDays /><b>{totalMatches} games required</b><span>All group-stage scores must be predicted.</span></div>
              <div><Lock /><b>{t.knockoutLocked}</b><span>{t.knockoutText}</span></div>
              <div><Crown /><b>{t.dailyLeaderboard}</b><span>{t.dailyLeaderboardText}</span></div>
            </div>

            <div className="actions">
              <button onClick={() => setStep(1)}>{t.backGroups}</button>
              <button className="primary" onClick={submitPredictions}>{t.submitEntry}</button>
            </div>

            {renderLeaderboard()}
          </div>
        )}

        {step === 5 && submitted && (
          <div>
            <h2>{t.entrySubmitted}</h2>
            <p>{username || user?.displayName || user?.email || '@player'}, {t.savedText}</p>

            <div className="leaderboard-empty">
              <Crown />
              <h3>{t.leaderboardNotStarted}</h3>
              <p>{t.pointsUpdate}</p>
            </div>

            <div className="actions">
              <button className="primary" onClick={() => { setStep(1); setSubmitted(false); }}>
                <RotateCcw size={18} /> {t.editResubmit}
              </button>
            </div>

            {renderLeaderboard()}
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
