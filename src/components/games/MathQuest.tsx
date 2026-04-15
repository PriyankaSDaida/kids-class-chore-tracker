// ─── MathQuest — Adaptive Math Game ───────────────────────────────────────────
// Hero vs monster math challenges. Difficulty adapts to child's age.
// Every 5 correct = 1 hero costume unlock. Streak tracked.
import React, { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type Op = '+' | '-' | '×';

interface Question { a: number; b: number; op: Op; answer: number; choices: number[]; }

function makeQuestion(age: number): Question {
  const ops: Op[] = age >= 10 ? ['+','-','×'] : age >= 7 ? ['+','-'] : ['+'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  if (op === '+') {
    const max = age <= 6 ? 10 : age <= 9 ? 20 : 50;
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    answer = a + b;
  } else if (op === '-') {
    const max = age <= 9 ? 20 : 50;
    a = Math.floor(Math.random() * max) + 5;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
  }

  // Generate 3 wrong choices near the answer
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const delta = Math.floor(Math.random() * 8) + 1;
    const w = answer + (Math.random() < 0.5 ? delta : -delta);
    if (w !== answer && w > 0) wrong.add(w);
  }
  const choices = [answer, ...Array.from(wrong)].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices };
}

const HERO_COSTUMES = ['🦁','🐯','🦊','🐺','🦅','🐉','🦄','🤴','👸','🧙'];

interface Props { onBack: () => void; childId: string; }

const MathQuest: React.FC<Props> = ({ onBack, childId }) => {
  const { children, awardXP } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const age   = child?.age ?? 7;

  const [q,          setQ]         = useState<Question>(() => makeQuestion(age));
  const [feedback,   setFeedback]  = useState<'correct' | 'wrong' | null>(null);
  const [streak,     setStreak]    = useState(0);
  const [totalRight, setTotalRight]= useState(0);
  const [heroIdx,    setHeroIdx]   = useState(0);
  const [monsterAnim,setMonsterAnim]= useState<'idle'|'shake'|'run'>('idle');
  const [heroAnim,   setHeroAnim]  = useState<'idle'|'victory'>('idle');
  const [showTrophy, setShowTrophy]= useState(false);
  const [hint,       setHint]      = useState('');

  const heroEmoji    = HERO_COSTUMES[heroIdx % HERO_COSTUMES.length];
  const monsterEmoji = totalRight >= 15 ? '🐲' : totalRight >= 8 ? '👾' : '👹';
  const costumeName  = HERO_COSTUMES[(heroIdx + 1) % HERO_COSTUMES.length];

  const handleAnswer = useCallback((choice: number) => {
    if (feedback) return;
    const correct = choice === q.answer;

    if (correct) {
      setFeedback('correct');
      setMonsterAnim('run');
      setHeroAnim('victory');
      const newStreak = streak + 1;
      const newTotal  = totalRight + 1;
      setStreak(newStreak);
      setTotalRight(newTotal);
      awardXP(childId, 5);
      setHint('');

      // Costume unlock every 5 correct
      if (newTotal % 5 === 0) {
        setHeroIdx((h) => h + 1);
        setShowTrophy(true);
        setTimeout(() => setShowTrophy(false), 2500);
      }

      // 10-streak golden trophy
      if (newStreak === 10) {
        setShowTrophy(true);
        setTimeout(() => setShowTrophy(false), 3000);
      }

      setTimeout(() => {
        setFeedback(null);
        setMonsterAnim('idle');
        setHeroAnim('idle');
        setQ(makeQuestion(age));
      }, 1200);

    } else {
      setFeedback('wrong');
      setMonsterAnim('shake');
      setStreak(0);
      const hints: Record<Op, string> = {
        '+': `Try counting ${q.a} + ${q.b} on your fingers!`,
        '-': `${q.a} - ${q.b}: start at ${q.a} and count back ${q.b}!`,
        '×': `${q.a} × ${q.b} = ${q.a} added ${q.b} times!`,
      };
      setHint(hints[q.op]);
      setTimeout(() => {
        setFeedback(null);
        setMonsterAnim('idle');
      }, 1400);
    }
  }, [q, feedback, streak, totalRight, age, childId, awardXP]);

  const answerBg = (choice: number) => {
    if (!feedback) return undefined;
    if (choice === q.answer) return 'linear-gradient(135deg,#10B981,#059669)';
    if (feedback === 'wrong') return 'linear-gradient(135deg,#EF4444,#DC2626)';
    return undefined;
  };

  return (
    <main className="page-content" id="screen-math-quest"
      style={{ background: 'linear-gradient(180deg,#4C1D95,#7C3AED,#A78BFA)', minHeight: '100vh', color: '#fff', borderRadius: 'var(--r-xl)', padding: '20px 20px 40px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onBack} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'rgba(255,255,255,0.8)' }} id="btn-math-back">
          <ArrowLeft size={18}/>
        </button>
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.1rem' }}>⚔️ Math Quest</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
          <span>🔥 {streak}</span>
          <span>⭐ +{totalRight * 5} XP</span>
        </div>
      </div>

      {/* 10-streak trophy / costume unlock */}
      {showTrophy && (
        <div style={{
          textAlign: 'center', background: 'rgba(255,255,255,0.15)',
          borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 16,
          animation: 'trophySpin 0.8s var(--ease-spring) both',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: '2.5rem' }}>🏆</div>
          <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif' }}>
            {streak >= 10 ? '10 in a row! LEGENDARY!' : `New costume: ${costumeName}!`}
          </div>
        </div>
      )}

      {/* Scene */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '24px 0', padding: '0 8px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '4rem',
            animation: heroAnim === 'victory' ? 'heroVictory 0.8s var(--ease-spring) both' : 'none',
          }}>
            {heroEmoji}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>HERO</div>
        </div>

        {/* VS */}
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.4rem', opacity: 0.8 }}>VS</div>

        {/* Monster */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '4rem',
            animation: monsterAnim === 'shake' ? 'monsterShake 0.5s ease both'
              : monsterAnim === 'run' ? 'animalWalk 1.2s ease both' : 'none',
          }}>
            {monsterEmoji}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>MONSTER</div>
        </div>
      </div>

      {/* Question */}
      <div style={{
        textAlign: 'center', background: 'rgba(255,255,255,0.15)',
        borderRadius: 'var(--r-xl)', padding: '24px 20px', marginBottom: 24,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '2.4rem', letterSpacing: '0.04em' }}>
          {q.a} {q.op} {q.b} = ???
        </div>
        {hint && (
          <div style={{
            marginTop: 12, fontSize: '0.82rem', color: '#FDE68A', fontWeight: 700,
            animation: 'slideDown 0.3s ease both',
          }}>
            💡 {hint}
          </div>
        )}
      </div>

      {/* Answer buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {q.choices.map((choice) => (
          <button key={choice}
            onClick={() => handleAnswer(choice)}
            id={`math-choice-${choice}`}
            style={{
              padding: '18px 12px',
              borderRadius: 'var(--r-xl)', border: 'none',
              background: answerBg(choice) ?? 'rgba(255,255,255,0.2)',
              color: '#fff', fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.8rem',
              cursor: feedback ? 'default' : 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'transform 0.15s ease, background 0.2s ease',
              animation: feedback === null ? undefined : undefined,
            }}
            onMouseEnter={(e) => { if (!feedback) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback === 'correct' && (
        <div style={{ textAlign: 'center', marginTop: 16, animation: 'starburstPop 0.5s var(--ease-spring) both' }}>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.1rem', color: '#D1FAE5' }}>
            Correct! +5 XP! 🎉
          </div>
        </div>
      )}
      {feedback === 'wrong' && (
        <div style={{ textAlign: 'center', marginTop: 16, animation: 'slideDown 0.3s ease both' }}>
          <div style={{ fontSize: '1.8rem' }}>❌</div>
          <div style={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#FCA5A5' }}>
            Not quite — try again!
          </div>
        </div>
      )}
    </main>
  );
};

export default MathQuest;
