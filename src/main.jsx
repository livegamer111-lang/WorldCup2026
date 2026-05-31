import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Trophy, Medal, Goal, Lock, Crown, Users, CalendarDays, ShieldCheck, ChevronRight, RotateCcw } from 'lucide-react';
import './styles.css';

const ENTRY_FEE = 1.99;
const registeredPlayers = 0;
const predictionsSubmitted = 0;
const totalPrizePool = registeredPlayers * ENTRY_FEE;
const firstPrize = totalPrizePool * 0.6;
const secondPrize = totalPrizePool * 0.25;
const thirdPrize = totalPrizePool * 0.15;

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
      matches.push({ home: teams[i], away: teams[j], homeScore: '', awayScore: '', scorers: '' });
    }
  }
  return matches;
}

const initialPredictions = Object.fromEntries(
  groupKeys.map((key) => [key, { ranking: groups[key], matches: makeMatches(groups[key]) }])
);

function money(value) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function App() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [predictions, setPredictions] = useState(initialPredictions);
  const [submitted, setSubmitted] = useState(false);

  const completion = useMemo(() => {
    let completedTables = 0;
    let completedMatches = 0;
    groupKeys.forEach((group) => {
      const p = predictions[group];
      if (p.ranking.length === 4) completedTables += 1;
      completedMatches += p.matches.filter(m => m.homeScore !== '' && m.awayScore !== '').length;
    });
    return Math.round(((completedTables + completedMatches) / (totalGroups + totalMatches)) * 100);
  }, [predictions]);

  function moveTeam(group, index, direction) {
    const ranking = [...predictions[group].ranking];
    const target = index + direction;
    if (target < 0 || target >= ranking.length) return;
    [ranking[index], ranking[target]] = [ranking[target], ranking[index]];
    setPredictions({ ...predictions, [group]: { ...predictions[group], ranking } });
  }

  function updateMatch(group, index, field, value) {
    const matches = [...predictions[group].matches];
    matches[index] = { ...matches[index], [field]: value };
    setPredictions({ ...predictions, [group]: { ...predictions[group], matches } });
  }

  const current = predictions[selectedGroup];

  return (
    <main className="app">
      <div className="glow glow-left" />
      <div className="glow glow-right" />
      <section className="hero">
        <div className="hero-copy">
          <div className="badge"><Trophy size={16} /> World Cup 2026 Predictor Challenge</div>
          <h1>Predict every group. Predict every match. Win the growing prize pool.</h1>
          <p>Players must complete all groups from A to L and all group-stage games. Knockout predictions stay closed until the knockout phase is ready.</p>
          <button className="primary" onClick={() => setStep(0)}>Create Account & Play <ChevronRight size={18} /></button>
        </div>
        <div className="prize-card">
          <div className="trophy-circle"><Trophy size={48} /></div>
          <span>Current Live Prize Pool</span>
          <strong>{money(totalPrizePool)}</strong>
          <small>Starts at $0.00. Every paid account adds $1.99.</small>
          <div className="prize-grid">
            <div><b>{money(firstPrize)}</b><span>1st · 60%</span></div>
            <div><b>{money(secondPrize)}</b><span>2nd · 25%</span></div>
            <div><b>{money(thirdPrize)}</b><span>3rd · 15%</span></div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><span>Players Registered</span><b>{registeredPlayers}</b></div>
        <div><span>Entry Fee</span><b>{money(ENTRY_FEE)}</b></div>
        <div><span>Predictions Submitted</span><b>{predictionsSubmitted}</b></div>
        <div><span>Leaderboard Update</span><b>Daily</b></div>
      </section>

      <section className="rules">
        <article><Medal /><h3>Predict the Table</h3><p>Predict 1st, 2nd, 3rd and 4th for every group from A to L.</p></article>
        <article><Goal /><h3>Predict Game Scores & Scorers</h3><p>Predict the score and goal scorers for all {totalMatches} group-stage games.</p></article>
        <article><Lock /><h3>Knockout Phase Locked</h3><p>Knockout predictions stay closed until the knockout phase is ready.</p></article>
        <article><Crown /><h3>View the Leaderboard</h3><p>The leaderboard is visible anytime and updates at the end of each day.</p></article>
      </section>

      <section className="game-card">
        {step === 0 && (
          <div>
            <h2>Create your player account</h2>
            <p>Demo version: payment and login are not connected yet. In the real version, players sign up, pay $1.99, then unlock predictions.</p>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@yourTikTokUsername" />
            <div className="payment-row"><span>Entry fee</span><b>{money(ENTRY_FEE)}</b></div>
            <button className="primary" onClick={() => setStep(1)}>Continue <ChevronRight size={18} /></button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2>Complete all World Cup groups</h2>
            <p>Your entry is only complete when every group has a table prediction and every group-stage match has a score prediction.</p>
            <div className="group-picker">
              {groupKeys.map(group => {
                const done = predictions[group].matches.filter(m => m.homeScore !== '' && m.awayScore !== '').length;
                return <button key={group} onClick={() => setSelectedGroup(group)} className={selectedGroup === group ? 'selected' : ''}>
                  <b>Group {group}</b><span>{done}/6 games</span>
                </button>;
              })}
            </div>
            <button className="primary" onClick={() => setStep(2)}>Predict Group {selectedGroup} <ChevronRight size={18} /></button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Group {selectedGroup}: predict the table</h2>
            <p>Move teams up or down. 1st and 2nd are your teams to qualify.</p>
            <div className="ranking-list">
              {current.ranking.map((team, index) => <div className="ranking-row" key={team}>
                <div><span>{index + 1}</span><b>{team}</b><small>{index < 2 ? 'Qualifies' : 'Eliminated'}</small></div>
                <div><button onClick={() => moveTeam(selectedGroup, index, -1)}>↑</button><button onClick={() => moveTeam(selectedGroup, index, 1)}>↓</button></div>
              </div>)}
            </div>
            <button className="primary" onClick={() => setStep(3)}>Predict Scores <ChevronRight size={18} /></button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Group {selectedGroup}: predict game scores and scorers</h2>
            <p>Each match can be changed until 24 hours before kickoff.</p>
            <div className="matches">
              {current.matches.map((m, index) => <div className="match" key={`${m.home}-${m.away}`}>
                <div className="lockline"><span>Editable now</span><span>Locks 24h before kickoff</span></div>
                <div className="scoreline">
                  <b>{m.home}</b><input type="number" min="0" value={m.homeScore} onChange={(e) => updateMatch(selectedGroup, index, 'homeScore', e.target.value)} />
                  <span>-</span>
                  <input type="number" min="0" value={m.awayScore} onChange={(e) => updateMatch(selectedGroup, index, 'awayScore', e.target.value)} /><b>{m.away}</b>
                </div>
                <input value={m.scorers} onChange={(e) => updateMatch(selectedGroup, index, 'scorers', e.target.value)} placeholder="Goal scorers: Messi, Mbappe, Vinicius Jr..." />
              </div>)}
            </div>
            <div className="actions"><button onClick={() => setStep(1)}>Back to Groups</button><button className="primary" onClick={() => setStep(4)}>Review Entry</button></div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>Review full tournament entry</h2>
            <p>Completion: {completion}%. Players must complete all groups and all group-stage matches before final submission.</p>
            <div className="review-grid">
              <div><ShieldCheck /><b>{totalGroups} groups required</b><span>All A–L tables must be predicted.</span></div>
              <div><CalendarDays /><b>{totalMatches} games required</b><span>All group-stage scores must be predicted.</span></div>
              <div><Lock /><b>Knockout locked</b><span>Opens later when the knockout phase is ready.</span></div>
              <div><Crown /><b>Daily leaderboard</b><span>Updates at the end of each day.</span></div>
            </div>
            <button className="primary" onClick={() => { setSubmitted(true); setStep(5); }}>Submit Demo Entry</button>
          </div>
        )}

        {step === 5 && submitted && (
          <div>
            <h2>Entry submitted</h2>
            <p>{username || '@player'}, your demo prediction entry has been saved locally. Real saving needs Firebase or another database.</p>
            <div className="leaderboard-empty"><Crown /><h3>Leaderboard not started yet</h3><p>Everything starts at zero. Points update at the end of each World Cup day after match results are added.</p></div>
            <button className="primary" onClick={() => { setStep(0); setSubmitted(false); }}><RotateCcw size={18} /> Start Again</button>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
