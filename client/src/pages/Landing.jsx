import { Link } from 'react-router-dom';
import SwapMark from '../components/common/SwapMark';

const tickerItems = [
  'Cooking ⇄ Coding', 'Tamil ⇄ French', 'Yoga ⇄ Guitar',
  'Excel ⇄ Photography', 'Carnatic Music ⇄ Public Speaking', 'Painting ⇄ React'
];

const popularSkills = [
  'Web Development', 'Cooking', 'Tamil', 'Guitar', 'Yoga', 'Photography',
  'Public Speaking', 'Carnatic Music', 'Excel', 'Painting', 'French',
  'Video Editing', 'Chess', 'Bharatanatyam', 'English Speaking'
];

const testimonials = [
  {
    quote: "I taught Excel to a college student for two weekends, and learned guitar basics in return. Never spent a rupee.",
    name: 'A SkillSwap tutor',
    role: 'Excel · Coimbatore'
  },
  {
    quote: "Found someone five minutes from my house teaching Tamil typing. We just messaged, met, and started.",
    name: 'A SkillSwap learner',
    role: 'Tamil Typing · Salem'
  }
];

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white border-2 border-slate/10 rounded-xl p-6 hover:border-marigold transition">
      <div className="w-12 h-12 mb-4">{icon}</div>
      <h3 className="font-display text-xl mb-2 text-slate">{title}</h3>
      <p className="text-sm text-slate/70">{desc}</p>
    </div>
  );
}

function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-slate text-chalk px-6 py-24 text-center relative overflow-hidden">
        <SwapMark className="w-20 h-10 mx-auto mb-6" color="#E8A33D" />
        <h1 className="font-display text-5xl md:text-6xl leading-tight max-w-3xl mx-auto">
          Your skills are the <span className="text-marigold">only currency</span> here.
        </h1>
        <p className="text-chalk/70 max-w-xl mx-auto mt-6 text-lg">
          Teach what you know. Learn what you don't. No money changes hands — just hours, credits, and community.
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <Link to="/register" className="bg-marigold text-slate px-7 py-3 rounded-full font-semibold hover:scale-105 transition">
            Start Swapping
          </Link>
          <a href="#how" className="border border-chalk/30 px-7 py-3 rounded-full hover:bg-slate-light transition">
            How it works
          </a>
        </div>
      </section>

      {/* TODAY'S SWAP BOARD - marquee ticker */}
      <div className="bg-slate-light py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-flex gap-8 animate-[marquee_25s_linear_infinite]">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="font-mono text-marigold text-sm border border-marigold/30 px-4 py-1.5 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* STATS STRIP */}
      <section className="bg-chalk px-6 py-12 border-b border-slate/10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-mono text-3xl md:text-4xl text-marigold">1,200+</p>
            <p className="text-xs md:text-sm text-slate/60 mt-1">Hours swapped</p>
          </div>
          <div>
            <p className="font-mono text-3xl md:text-4xl text-leaf">40+</p>
            <p className="text-xs md:text-sm text-slate/60 mt-1">Skills on the board</p>
          </div>
          <div>
            <p className="font-mono text-3xl md:text-4xl text-vermilion">₹0</p>
            <p className="text-xs md:text-sm text-slate/60 mt-1">Money exchanged, ever</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="how" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-center mb-12 text-slate">How the swap works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Find nearby tutors"
            desc="Geo-matching finds people in your city who teach what you want to learn."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#20292B" strokeWidth="1.5">
                <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            }
          />
          <FeatureCard
            title="Chat & book a session"
            desc="Message in real time, then request a swap — accept, schedule, and go live."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#20292B" strokeWidth="1.5">
                <path d="M4 4h16v12H7l-3 3V4z" />
              </svg>
            }
          />
          <FeatureCard
            title="Teach, learn, earn credits"
            desc="1 hour taught = 1 credit earned. Spend credits to learn from someone else."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#20292B" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12h6M12 9v6" />
              </svg>
            }
          />
        </div>
      </section>

      {/* POPULAR SKILLS - tag cloud */}
      <section className="bg-slate-light/10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl text-slate mb-3">What's on the board today</h2>
          <p className="text-slate/60 mb-8">A small sample of skills being taught right now.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSkills.map((skill, i) => (
              <span
                key={skill}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  i % 3 === 0
                    ? 'bg-marigold/15 text-marigold border-marigold/30'
                    : i % 3 === 1
                    ? 'bg-leaf/15 text-leaf border-leaf/30'
                    : 'bg-slate/5 text-slate border-slate/15'
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl text-center mb-12 text-slate">From the community</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border-2 border-slate/10 rounded-xl p-6">
              <p className="text-slate/80 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <p className="font-display text-slate">{t.name}</p>
              <p className="text-xs text-slate/50 font-mono">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate text-chalk px-6 py-20 text-center">
        <SwapMark className="w-16 h-8 mx-auto mb-5" color="#E8A33D" />
        <h2 className="font-display text-4xl mb-4">Ready to swap your first skill?</h2>
        <p className="text-chalk/70 mb-8">Sign up free — you start with 5 credits, no card required.</p>
        <Link to="/register" className="bg-marigold text-slate px-8 py-3.5 rounded-full font-semibold hover:scale-105 transition inline-block">
          Create Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-light text-chalk/60 px-6 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SwapMark className="w-6 h-3" color="#F2EFE6" />
          <span className="font-display text-chalk">SkillSwap</span>
        </div>
        <p>A money-less skill barter community. Built for neighbors who want to teach and learn.</p>
        <p className="mt-2 text-xs">© 2026 SkillSwap. All swaps, no spending.</p>
      </footer>
    </div>
  );
}

export default Landing;