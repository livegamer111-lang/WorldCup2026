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
  RotateCcw
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

function makeMatches(teams) {
  const matches = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        home: teams[i],
        away: teams[j],
        homeScore: '',
        awayScore: '',
        scorers: ''
      });
    }
  }

  return matches;
}

const initialPredictions = Object.fromEntries(
  groupKeys.map((key) => [
    key,
    {
      ranking: groups[key],
      matches: makeMatches(groups[key])
    }
  ])
);

function money(value) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
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

      if (prediction.ranking.length === 4) completedTables += 1;

      completedMatches += prediction.matches.filter(
        (match) => match.homeScore !== '' && match.awayScore !== ''
      ).length;
    });

    return Math.round(
      ((completedTables + completedMatches) / (totalGroups + totalMatches)) * 100
    );
  }, [predictions]);

  const isFullyComplete = completion === 100;
  const hasPaid = Boolean(userProfile?.paid);

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
    setAuthError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setStep(0);
    setSubmitted(false);
  }

  async function handleTestPayment() {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    await updateDoc(userRef, {
      paid: true,
      paidAt: serverTimestamp(),
      entryFee: ENTRY_FEE
    });

    setUserProfile({
      ...userProfile,
      paid: true,
      entryFee: ENTRY_FEE
    });

    setStep(1);
  }

  function goToPlaySection() {
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
    if (!user) {
      setAuthError('You must create an account first.');
      setStep(0);
      return;
    }

    if (!hasPaid) {
      setAuthError('You must pay the entry fee before submitting predictions.');
      setStep(0);
      return;
    }

    if (!isFullyComplete) {
      alert('You must complete all 12 groups and all 72 group-stage games before submitting.');
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

    setSubmitted(true);
    setStep(5);
  }

  const current = predictions[selectedGroup];

  return (
    <main className="app">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <section className="hero">
        <div className="hero-copy">
          <div className="badge">
            <Trophy size={16} /> World Cup 2026 Predictor Challenge
          </div>

          <h1>Account first. Pay entry. Predict the full World Cup group stage.</h1>

          <p>
            Create an account, pay the {money(ENTRY_FEE)} entry fee, then unlock all
            {` ${totalGroups}`} groups and all {totalMatches} group-stage games.
            Knockout predictions open later.
          </p>

          <button className="primary" onClick={goToPlaySection}>
            Create Account First <ChevronRight size={18} />
          </button>
        </div>

        <div className="prize-card">
          <div className="trophy-circle">
            <Trophy size={48} />
          </div>

          <span>Current Live Prize Pool</span>
          <strong>{money(totalPrizePool)}</strong>
          <small>Every paid account adds {money(ENTRY_FEE)}. No player limit.</small>

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
          <p>Predict 1st, 2nd, 3rd and 4th for every group from A to L.</p>
        </article>

        <article>
          <Goal />
          <h3>Predict Game Scores & Scorers</h3>
          <p>Predict scores and goal scorers for all {totalMatches} group-stage games.</p>
        </article>

        <article>
          <Lock />
          <h3>Knockout Phase Locked</h3>
          <p>Knockout predictions stay closed until the knockout phase is ready.</p>
        </article>

        <article>
          <Crown />
          <h3>Daily Leaderboard</h3>
          <p>The leaderboard is visible anytime and updates at the end of each day.</p>
        </article>
      </section>

      <section id="play-section" className="game-card">
        {step === 0 && (
          <div>
            <h2>{user ? 'Your player account' : 'Create your player account'}</h2>

            {loadingAuth && <p>Checking login...</p>}

            {!loadingAuth && !user && (
              <>
                <p>
                  Step 1: Create your account. Step 2: Pay the {money(ENTRY_FEE)} entry
                  fee. Step 3: Unlock all {totalGroups} groups and all {totalMatches}
                  group-stage games.
                </p>

                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="@yourTikTokUsername"
                />

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  type="email"
                />

                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type="password"
                />

                {authError && <p className="error">{authError}</p>}

                <div className="payment-row">
                  <span>Entry fee</span>
                  <b>{money(ENTRY_FEE)}</b>
                </div>

                <button className="primary" onClick={handleEmailAuth}>
                  {authMode === 'signup' ? 'Create Account' : 'Login'}
                </button>

                <button onClick={handleGoogleLogin}>Continue with Google</button>

                <button
                  onClick={() =>
                    setAuthMode(authMode === 'signup' ? 'login' : 'signup')
                  }
                >
                  {authMode === 'signup'
                    ? 'Already have an account? Login'
                    : 'Need an account? Sign up'}
                </button>
              </>
            )}

            {!loadingAuth && user && !hasPaid && (
              <>
                <p>Signed in as {user.email}</p>

                <div className="payment-row">
                  <span>Payment status</span>
                  <b>Not paid</b>
                </div>

                <div className="payment-row">
                  <span>Entry fee</span>
                  <b>{money(ENTRY_FEE)}</b>
                </div>

                <p>
                  Predictions are locked until payment is completed. Stripe is not
                  connected yet, so this button simulates payment for testing only.
                </p>

                <button className="primary" onClick={handleTestPayment}>
                  Test Payment: Unlock Predictions
                </button>

                <button onClick={handleLogout}>Logout</button>
              </>
            )}

            {!loadingAuth && user && hasPaid && (
              <>
                <p>Signed in as {user.email}</p>

                <div className="payment-row">
                  <span>Payment status</span>
                  <b>Paid</b>
                </div>

                <button className="primary" onClick={() => setStep(1)}>
                  Unlock Full Tournament Predictor <ChevronRight size={18} />
                </button>

                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2>Full Tournament Predictor: 12 Groups · 72 Games</h2>
            <p>
              Your entry is only complete when every group has a table prediction and
              every group-stage match has a score prediction.
            </p>

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
                    onClick={() => setSelectedGroup(group)}
                    className={selectedGroup === group ? 'selected' : ''}
                  >
                    <b>Group {group}</b>
                    <span>{done}/6 games</span>
                  </button>
                );
              })}
            </div>

            <button className="primary" onClick={() => setStep(2)}>
              Continue Full Tournament Entry <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Group {selectedGroup}: predict the table</h2>
            <p>Move teams up or down. 1st and 2nd are your teams to qualify.</p>

            <div className="ranking-list">
              {current.ranking.map((team, index) => (
                <div className="ranking-row" key={team}>
                  <div>
                    <span>{index + 1}</span>
                    <b>{team}</b>
                    <small>{index < 2 ? 'Qualifies' : 'Eliminated'}</small>
                  </div>

                  <div>
                    <button onClick={() => moveTeam(selectedGroup, index, -1)}>↑</button>
                    <button onClick={() => moveTeam(selectedGroup, index, 1)}>↓</button>
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
            <h2>Group {selectedGroup}: predict game scores and scorers</h2>
            <p>Each match can be changed until 24 hours before kickoff.</p>

            <div className="matches">
              {current.matches.map((match, index) => (
                <div className="match" key={`${match.home}-${match.away}`}>
                  <div className="lockline">
                    <span>Editable now</span>
                    <span>Locks 24h before kickoff</span>
                  </div>

                  <div className="scoreline">
                    <b>{match.home}</b>

                    <input
                      type="number"
                      min="0"
                      value={match.homeScore}
                      onChange={(event) =>
                        updateMatch(selectedGroup, index, 'homeScore', event.target.value)
                      }
                    />

                    <span>-</span>

                    <input
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
                    onChange={(event) =>
                      updateMatch(selectedGroup, index, 'scorers', event.target.value)
                    }
                    placeholder="Goal scorers: Messi, Mbappe, Vinicius Jr..."
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
            <h2>Review full tournament entry</h2>

            <p>
              Completion: {completion}%. You must complete all groups and all
              group-stage matches before final submission.
            </p>

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
                <span>Opens later when the knockout phase is ready.</span>
              </div>

              <div>
                <Crown />
                <b>Daily leaderboard</b>
                <span>Updates at the end of each day.</span>
              </div>
            </div>

            <button className="primary" onClick={submitPredictions}>
              Submit Full Tournament Entry
            </button>
          </div>
        )}

        {step === 5 && submitted && (
          <div>
            <h2>Entry submitted</h2>

            <p>
              {username || user?.email || '@player'}, your full tournament prediction
              entry has been saved.
            </p>

            <div className="leaderboard-empty">
              <Crown />
              <h3>Leaderboard not started yet</h3>
              <p>
                Everything starts at zero. Points update at the end of each World Cup
                day after match results are added.
              </p>
            </div>

            <button
              className="primary"
              onClick={() => {
                setStep(1);
                setSubmitted(false);
              }}
            >
              <RotateCcw size={18} /> Back to Predictions
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
```
