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
updateDoc,
where
} from 'firebase/firestore';

import './styles.css';

const ENTRY_FEE = 1.99;
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_8x24gAaY90Ca5cT1Sfc7u00';
const ADMIN_EMAIL = 'manios-13@hotmail.com';
const GROUP_TABLE_LOCK_TIME = '2026-06-11T20:00:00+02:00';

const groups = {
A: ['Mexico', 'South Africa', 'South Korea', 'Czech Republic'],
B: ['Canada', 'Switzerland', 'Qatar', 'Norway'],
C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
D: ['United States', 'Paraguay', 'Australia', 'Playoff Winner'],
E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
F: ['Netherlands', 'Japan', 'Tunisia', 'New Zealand'],
G: ['Belgium', 'Egypt', 'Iran', 'Panama'],
H: ['Spain', 'Saudi Arabia', 'Uruguay', 'Cape Verde'],
I: ['France', 'Senegal', 'Colombia', 'Jamaica'],
J: ['Argentina', 'Austria', 'Algeria', 'Jordan'],
K: ['England', 'Croatia', 'Ghana', 'Bolivia'],
L: ['Portugal', 'Poland', 'Costa Rica', 'UAE']
};

const groupKeys = Object.keys(groups);
const totalGroups = groupKeys.length;
const matchesPerGroup = 6;
const totalMatches = totalGroups * matchesPerGroup;

const scheduleByGroup = {
  A: ['2026-06-11T21:00:00+02:00', '2026-06-12T00:00:00+02:00', '2026-06-17T21:00:00+02:00', '2026-06-18T00:00:00+02:00', '2026-06-24T21:00:00+02:00', '2026-06-24T21:00:00+02:00'],
  B: ['2026-06-12T21:00:00+02:00', '2026-06-13T00:00:00+02:00', '2026-06-18T21:00:00+02:00', '2026-06-19T00:00:00+02:00', '2026-06-25T21:00:00+02:00', '2026-06-25T21:00:00+02:00'],
  C: ['2026-06-13T18:00:00+02:00', '2026-06-13T21:00:00+02:00', '2026-06-19T18:00:00+02:00', '2026-06-19T21:00:00+02:00', '2026-06-26T21:00:00+02:00', '2026-06-26T21:00:00+02:00'],
  D: ['2026-06-14T18:00:00+02:00', '2026-06-14T21:00:00+02:00', '2026-06-20T18:00:00+02:00', '2026-06-20T21:00:00+02:00', '2026-06-27T21:00:00+02:00', '2026-06-27T21:00:00+02:00'],
  E: ['2026-06-15T18:00:00+02:00', '2026-06-15T21:00:00+02:00', '2026-06-21T18:00:00+02:00', '2026-06-21T21:00:00+02:00', '2026-06-28T21:00:00+02:00', '2026-06-28T21:00:00+02:00'],
  F: ['2026-06-16T18:00:00+02:00', '2026-06-16T21:00:00+02:00', '2026-06-22T18:00:00+02:00', '2026-06-22T21:00:00+02:00', '2026-06-29T21:00:00+02:00', '2026-06-29T21:00:00+02:00'],
  G: ['2026-06-17T18:00:00+02:00', '2026-06-17T21:00:00+02:00', '2026-06-23T18:00:00+02:00', '2026-06-23T21:00:00+02:00', '2026-06-30T21:00:00+02:00', '2026-06-30T21:00:00+02:00'],
  H: ['2026-06-18T18:00:00+02:00', '2026-06-18T21:00:00+02:00', '2026-06-24T18:00:00+02:00', '2026-06-24T21:00:00+02:00', '2026-07-01T21:00:00+02:00', '2026-07-01T21:00:00+02:00'],
  I: ['2026-06-19T18:00:00+02:00', '2026-06-19T21:00:00+02:00', '2026-06-25T18:00:00+02:00', '2026-06-25T21:00:00+02:00', '2026-07-02T21:00:00+02:00', '2026-07-02T21:00:00+02:00'],
  J: ['2026-06-20T18:00:00+02:00', '2026-06-20T21:00:00+02:00', '2026-06-26T18:00:00+02:00', '2026-06-26T21:00:00+02:00', '2026-07-03T21:00:00+02:00', '2026-07-03T21:00:00+02:00'],
  K: ['2026-06-21T18:00:00+02:00', '2026-06-21T21:00:00+02:00', '2026-06-27T18:00:00+02:00', '2026-06-27T21:00:00+02:00', '2026-07-04T21:00:00+02:00', '2026-07-04T21:00:00+02:00'],
  L: ['2026-06-22T18:00:00+02:00', '2026-06-22T21:00:00+02:00', '2026-06-28T18:00:00+02:00', '2026-06-28T21:00:00+02:00', '2026-07-05T21:00:00+02:00', '2026-07-05T21:00:00+02:00']
};

const kickoffByGroup = scheduleByGroup;

function makeMatches(groupKey, teams) {
const matches = [];
let count = 0;

for (let i = 0; i < teams.length; i++) {
for (let j = i + 1; j < teams.length; j++) {
matches.push({
  home: teams[i],
  away: teams[j],
  kickoff: kickoffByGroup[groupKey][count],
  dateTime: formatAmsterdamTime(kickoffByGroup[groupKey][count]),
  timezone: 'Amsterdam time',
  homeScore: '',
  awayScore: '',
  scorers: ''
});
  
  count += 1;
}


}

return matches;
}

const initialPredictions = Object.fromEntries(
groupKeys.map((key) => [
key,
{
ranking: groups[key],
matches: makeMatches(key, groups[key])
}
])
);

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

function App() {
const [step, setStep] = useState(0);
const [username, setUsername] = useState('');
const [selectedGroup, setSelectedGroup] = useState('A');
const [predictions, setPredictions] = useState(initialPredictions);
const [submitted, setSubmitted] = useState(false);

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const [user, setUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [authMode, setAuthMode] = useState('signup');
const [authError, setAuthError] = useState('');
const [loadingAuth, setLoadingAuth] = useState(true);

const [paidPlayers, setPaidPlayers] = useState(0);
const [predictionsSubmitted, setPredictionsSubmitted] = useState(0);

const totalPrizePool = paidPlayers * ENTRY_FEE;
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
  if (!user) return;

  const savedDraft = localStorage.getItem(`predictions-${user.uid}`);

  if (savedDraft) {
    setPredictions(JSON.parse(savedDraft));
  }
}, [user]);

useEffect(() => {
  if (!user) return;

  localStorage.setItem(
    `predictions-${user.uid}`,
    JSON.stringify(predictions)
  );
}, [user, predictions]);
  
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
      username: username || '',
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

return () => {
  unsubscribeAuth();
  unsubscribePaidUsers();
  unsubscribePredictions();
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
    const result = await signInWithPopup(auth, provider);

    console.log("Google login success:", result.user.email);
  } catch (error) {
    console.error(error);
    alert(error.code + " - " + error.message);
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
    username: username || userProfile?.username || user.email,
    predictions,
    completion,
    points: 0,
    submittedAt: serverTimestamp()
  });

  alert('Entry submitted successfully!');
  setSubmitted(true);
  setStep(5);
} catch (error) {
  console.error('Submit error:', error);
  alert(`Submit failed: ${error.message}`);
}

}

const current = predictions[selectedGroup];

return ( <main className="app"> <div className="stadium-light left" /> <div className="stadium-light right" />

  <section className="hero">
    <div className="hero-copy">
      <div className="badge">
        <Trophy size={16} /> World Cup 2026 Predictor Challenge
      </div>

      <h1>Predict every group. Predict every match. Win the growing prize pool.</h1>

      <p>
        Create an account, pay the {money(ENTRY_FEE)} entry fee, then unlock all{' '}
        {totalGroups} groups and all {totalMatches} group-stage games.
      </p>

      <button className="primary" onClick={scrollToGame}>
        Create Account First <ChevronRight size={18} />
      </button>
    </div>

    <div className="prize-card">
      <div className="trophy-circle">
        <Trophy size={48} />
      </div>

      <span>Current Live Prize Pool</span>
      <strong>{money(totalPrizePool)}</strong>
      <small>Prize pool grows with every paid entry.</small>

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
      <span>Paid Players</span>
      <b>{paidPlayers}</b>
    </div>
    <div>
      <span>Entry Fee</span>
      <b>{money(ENTRY_FEE)}</b>
    </div>
    <div>
      <span>Predictions Submitted</span>
      <b>{predictionsSubmitted}</b>
    </div>
    <div>
      <span>Leaderboard Update</span>
      <b>Daily</b>
    </div>
  </section>

  <section className="rules">
    <article>
      <Medal />
      <h3>Predict the Table</h3>
      <p>Predict 1st, 2nd, 3rd and 4th for every group.</p>
    </article>

    <article>
      <Goal />
      <h3>Predict Scores & Scorers</h3>
      <p>Predict all {totalMatches} group-stage games.</p>
    </article>

    <article>
      <Lock />
      <h3>Knockout Locked</h3>
      <p>Knockout predictions open later.</p>
    </article>

    <article>
      <Crown />
      <h3>Daily Leaderboard</h3>
      <p>Leaderboard updates at the end of each day.</p>
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

          <p className="auth-subtitle">
            Predict every group. Predict every game. Win the growing prize pool.
          </p>

          <div className="big-prize-box">
            <span>Current Prize Pool</span>
            <strong>{money(totalPrizePool)}</strong>
            <small>Starts at $0.00 and grows with every paid player.</small>
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
            <span>Registered Paid Players</span>
          </div>

          <ul className="feature-list">
            <li>
              <Ticket /> Entry fee only {money(ENTRY_FEE)}
            </li>
            <li>
              <ShieldCheck /> Predict all 12 groups
            </li>
            <li>
              <Goal /> Predict all 72 matches
            </li>
            <li>
              <TrendingUp /> Daily leaderboard updates
            </li>
            <li>
              <Coins /> Prize pool grows automatically
            </li>
          </ul>
        </div>

        <div className="auth-card">
          {loadingAuth && <p>Checking login...</p>}

          {!loadingAuth && !user && (
            <>
              <div className="steps">
                <div className="active">
                  1<span>Create Account</span>
                </div>
                <div>
                  2<span>Pay Entry</span>
                </div>
                <div>
                  3<span>Predict</span>
                </div>
              </div>

              <h2>{authMode === 'signup' ? 'Create Your Account' : 'Login'}</h2>

              <p className="form-intro">
                Step 1: Create your account. Step 2: Pay the {money(ENTRY_FEE)} entry fee.
                Step 3: Unlock all groups and matches.
              </p>

              <label>Username</label>
              <div className="input-wrap">
                <User size={20} />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Username"
                />
              </div>

              <label>Email Address</label>
              <div className="input-wrap">
                <Mail size={20} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  type="email"
                />
              </div>

              <label>Password</label>
              <div className="input-wrap">
                <KeyRound size={20} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  type="password"
                />
              </div>

              {authError && <p className="error">{authError}</p>}

              <div className="entry-fee-box">
                <div>
                  <Ticket size={26} />
                  <span>
                    Entry Fee
                    <br />
                    <small>Pay after creating account</small>
                  </span>
                </div>
                <b>{money(ENTRY_FEE)}</b>
              </div>

              <button className="auth-primary" onClick={handleEmailAuth}>
                {authMode === 'signup' ? 'Create Account' : 'Login'}
              </button>

              <div className="divider">
                <span>OR</span>
              </div>

              <button className="auth-google" onClick={handleGoogleLogin}>
                Continue with Google
              </button>

              <button
                className="auth-link"
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
              >
                {authMode === 'signup'
                  ? 'Already have an account? Login'
                  : 'Need an account? Create account'}
              </button>
            </>
          )}

          {!loadingAuth && user && !hasPaid && (
            <>
              <div className="steps">
                <div>
                  1<span>Account</span>
                </div>
                <div className="active">
                  2<span>Pay Entry</span>
                </div>
                <div>
                  3<span>Predict</span>
                </div>
              </div>

              <h2>Pay Entry Fee</h2>

              <p className="form-intro">
                Signed in as {user.email}. Pay with Visa, Mastercard, Apple Pay, or Google Pay.
              </p>

              <div className="entry-fee-box">
                <div>
                  <Ticket size={26} />
                  <span>
                    Stripe Checkout
                    <br />
                    <small>Secure test payment</small>
                  </span>
                </div>
                <b>{money(ENTRY_FEE)}</b>
              </div>

              <a
                className="auth-primary"
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay {money(ENTRY_FEE)} with Card
              </a>

              <p className="form-intro">
                After payment, access will be unlocked automatically when Stripe webhook is connected.
              </p>

              <button className="auth-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {!loadingAuth && user && hasPaid && (
            <>
              <div className="steps">
                <div>
                  1<span>Account</span>
                </div>
                <div>
                  2<span>Paid</span>
                </div>
                <div className="active">
                  3<span>Predict</span>
                </div>
              </div>

              <h2>Account Ready</h2>

              <p className="form-intro">Signed in as {user.email}</p>

              <div className="entry-fee-box">
                <div>
                  <ShieldCheck size={26} />
                  <span>
                    Payment Status
                    <br />
                    <small>{isAdmin ? 'Admin access unlocked' : 'Full access unlocked'}</small>
                  </span>
                </div>
                <b>{isAdmin ? 'Admin' : 'Paid'}</b>
              </div>

              <button className="auth-primary" onClick={() => setStep(1)}>
                Start Full Tournament Predictor <ChevronRight size={18} />
              </button>

              <button className="auth-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    )}

    {step === 1 && (
      <div>
        <h2>Full Tournament Predictor: 12 Groups · 72 Games</h2>

        <p>Your entry is complete when every group table and every group-stage score is predicted.</p>

        <div className="payment-row">
          <span>Completion</span>
          <b>{completion}%</b>
        </div>

        <div className="group-picker">
          {groupKeys.map((group) => {
            const done = predictions[group].matches.filter(
              (match) => match.homeScore !== '' && match.awayScore !== ''
            ).length;

            return (
              <button
                key={group}
                onClick={() => {
  setSelectedGroup(group);
  setStep(2);
}}
                className={selectedGroup === group ? 'selected' : ''}
              >
                <b>Group {group}</b>
                <span>{done}/6 games</span>
              </button>
            );
          })}
        </div>

        <button
          className="primary"
          onClick={() => {
            if (completion === 100) {
              setStep(4);
            } else {
              setStep(2);
            }
          }}
        >
          {completion === 100 ? 'Review & Submit Entry' : 'Continue Full Tournament Entry'}
          <ChevronRight size={18} />
        </button>
      </div>
    )}

    {step === 2 && (
      <div>
        <h2>Group {selectedGroup}: Predict the Table</h2>

        <p>Move teams up or down. 1st and 2nd qualify.</p>

        <div className="ranking-list">
          {current.ranking.map((team, index) => (
            <div className="ranking-row" key={team}>
              <div>
                <span>{index + 1}</span>
                <b>{team}</b>
                <small>{index < 2 ? 'Qualifies' : 'Eliminated'}</small>
              </div>

              <div>
               <button
  disabled={isGroupTableLocked()}
  onClick={() => moveTeam(selectedGroup, index, -1)}
>
  ↑
</button>

<button
  disabled={isGroupTableLocked()}
  onClick={() => moveTeam(selectedGroup, index, 1)}
>
  ↓
</button>
              </div>
            </div>
          ))}
        </div>

        <button className="primary" onClick={() => setStep(3)}>
          Predict Scores & Scorers <ChevronRight size={18} />
        </button>
      </div>
    )}

    {step === 3 && (
      <div>
        <h2>Group {selectedGroup}: Predict Scores & Scorers</h2>

        <p>Each match can be edited until 24 hours before kickoff. All times are Amsterdam time.</p>

        <div className="matches">
          {current.matches.map((match, index) => (
            <div className="match" key={`${match.home}-${match.away}`}>
             <div className="lockline">
  <span>{match.dateTime}</span>

  <span>
    {isMatchLocked(match)
      ? '🔒 Locked'
      : '🔓 Locks 30 min before kickoff'}
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
                placeholder="Goal scorers"
              />
            </div>
          ))}
        </div>

        <div className="actions">
          <button onClick={() => setStep(1)}>Back to All Groups</button>

          <button className="primary" onClick={() => setStep(4)}>
            Review Full Entry
          </button>
        </div>
      </div>
    )}

    {step === 4 && (
      <div>
        <h2>Review Full Tournament Entry</h2>

        <p>Completion: {completion}%. You must complete all groups and matches before final submission.</p>

        <div className="review-grid">
          <div>
            <ShieldCheck />
            <b>{totalGroups} groups required</b>
            <span>All A–L tables must be predicted.</span>
          </div>

          <div>
            <CalendarDays />
            <b>{totalMatches} games required</b>
            <span>All group-stage scores must be predicted.</span>
          </div>

          <div>
            <Lock />
            <b>Knockout locked</b>
            <span>Opens later.</span>
          </div>

          <div>
            <Crown />
            <b>Daily leaderboard</b>
            <span>Updates every day.</span>
          </div>
        </div>

        <div className="actions">
  <button onClick={() => setStep(1)}>
    Back to Groups
  </button>

  <button className="primary" onClick={submitPredictions}>
    Submit Full Tournament Entry
  </button>
</div>
      </div>
    )}

    {step === 5 && submitted && (
      <div>
        <h2>Entry Submitted</h2>

        <p>{username || user?.email || '@player'}, your full tournament prediction entry has been saved.</p>

        <div className="leaderboard-empty">
          <Crown />
          <h3>Leaderboard not started yet</h3>
          <p>Points update at the end of each World Cup day after match results are added.</p>
        </div>

        <button
          className="primary"
          onClick={() => {
            setStep(1);
            setSubmitted(false);
          }}
        >
          <RotateCcw size={18} /> Edit & Resubmit Predictions
        </button>
      </div>
    )}
  </section>
</main>

);
}

createRoot(document.getElementById('root')).render(<App />);
