export const lessonReviews = {
  "module-1-intelligence-ai-landscape": [
    ["Know the terms", [
      ["Artificial intelligence", "Systems that perceive an environment and act to maximise the chance of achieving a stated objective."],
      ["Intelligent agent", "Perceives through sensors; acts through actuators."],
      ["Machine learning", "AI whose behaviour is derived from data rather than specified by hand."],
      ["Deep learning", "Machine learning with many-layer neural networks that learn representations and decisions."],
      ["Generative AI", "Produces new content, typically using large deep networks trained on very large corpora."],
      ["Symbolic AI", "Explicit symbols and rules; also called good old-fashioned AI."],
    ]],
    ["Four definitions — what is being judged?", [
      ["Thinking humanly", "Reasons like a person. Evidence: psychological experiments and brain imaging, not output alone."],
      ["Thinking rationally", "Reasons correctly according to logic: the laws of thought."],
      ["Acting humanly", "Observable behaviour is indistinguishable from a person's: the Turing test position."],
      ["Acting rationally", "Chooses what is most likely to achieve its objective given what it knows. This course's position."],
      ["Remember the two axes", "Thinking / acting × human performance / ideal rationality."],
      ["Why rational agents?", "More general: acting well may need no proof. More tractable: no need to solve psychology first. Auditable: objective, percept history and action set."],
    ]],
    ["What belongs where?", [
      ["Containment", "Deep learning is inside machine learning; machine learning is inside AI. Generative systems are an application of deep learning."],
      ["AI without machine learning", "Search, planning, knowledge representation and automated reasoning."],
      ["Constraints you can write down", "Search or constraint problems: examination timetabling, route planning, diagnostic rule bases and scheduling."],
      ["Examples you cannot describe as rules", "A learning problem: correctness means agreement with collected examples."],
    ]],
    ["Dates and names", [
      ["1943 — McCulloch and Pitts", "Formal neuron model: simple threshold units compute logical functions."],
      ["1950 — Turing", "Imitation game in Mind; addressed nine objections to machine intelligence."],
      ["1956 — Dartmouth", "Term artificial intelligence coined. Organisers: McCarthy, Minsky, Rochester and Shannon."],
      ["Early results", "Logic Theorist: theorems from Principia Mathematica. General Problem Solver: means-ends analysis. Newell and Simon: physical symbol system hypothesis (necessary and sufficient means for general intelligent action)."],
      ["1966 — ALPAC report", "Machine-translation funding was cut after promises of imminent success."],
      ["1969 — Minsky and Papert", "Perceptron limitations were read too broadly as a verdict on neural approaches."],
      ["1973 — Lighthill report", "British AI funding withdrawn."],
      ["1980–1993 — expert systems", "DENDRAL: molecular structure from mass spectrometry. MYCIN: bacterial infections and antibiotics. R1: computer orders at Digital Equipment Corporation."],
      ["1986 — backpropagation papers", "Algorithmic refinements later combined with large labelled datasets and graphics hardware."],
      ["1997 — Deep Blue", "Defeated Kasparov through search and evaluation."],
      ["2012 — ImageNet", "Deep convolutional network's error reduction was too large to attribute to tuning."],
      ["2017 — transformer", "Attention replaced recurrence, making training on very large corpora practical."],
      ["2022 onward", "Large language models reached general public awareness."],
    ]],
    ["Winters, Turing test and narrow AI", [
      ["Both winters", "Real technical result → exaggerated general capability claims → funding → defunding when the gap became undeniable. The description failed, not the sound technical result."],
      ["Expert-system collapse", "Slow knowledge acquisition, brittle rules, expensive maintenance and general workstations overtaking specialised Lisp hardware."],
      ["Turing test", "A text interrogator distinguishes human from machine. Chance-level identification means passing. Useful because it is behavioural and adversarial."],
      ["Why set it aside?", "It rewards imitation of human error, hesitation and ignorance, and optimises for deception. Task-specific benchmarks with published protocols are auditable."],
      ["Two objections", "Chinese Room: manipulating symbols does not establish understanding. Empirical objection: the test also measures the interrogator's susceptibility."],
      ["Narrow AI", "One task or a narrow family; new tasks need retraining or redesign. Can fail silently outside its training distribution. The handout classifies every deployed system in 2026 as narrow."],
      ["AGI", "Hypothetical human-level competence across cognitive tasks and unaided transfer. No existing example, agreed test or timeline."],
      ["Transformer-era problems", "Confidently wrong fluent output, uncertain training-data provenance and capability claims beyond evaluation."],
    ]],
    ["For explanation questions", [
      ["Frame first", "Identify the decision, who makes it, who is affected, error costs and what the current process achieves. That last number is the baseline."],
      ["Evidence over claims", "Ask for an objective, fitted data, held-out performance and a baseline. A claim must have a possible falsifying observation."],
      ["Project discipline", "State a baseline, report dispersion and say what the system must not be used for."],
    ]],
  ],
  "module-2-intelligent-agents-task-environments": [
    ["Agent essentials", [
      ["Percept", "Input at a given instant."],
      ["Percept sequence", "Complete history of everything perceived."],
      ["Agent function", "Abstract mapping from percept sequences to actions: f: P* → A. P* means all finite percept sequences. Potentially infinite specification."],
      ["Agent programme", "Finite implementation running on the architecture; approximates the agent function."],
      ["Judge the actions", "Quality depends on actions chosen, not internal complexity. The abstraction admits thermostats, chess programmes, warehouse robots and language models."],
    ]],
    ["Rationality and the performance measure", [
      ["Rationality", "Maximise expected performance given built-in knowledge and percept history. Not omniscience or perfection (which maximises actual performance)."],
      ["Falling cargo example", "Looking both ways before crossing can be rational despite a bad outcome from falling cargo."],
      ["Information matters", "Gather information or learn when more information can cheaply be obtained. Changing the performance measure can change whether behaviour is rational."],
      ["Measure world states", "Define success over sequences of environment states, not the agent's behaviour."],
      ["Specification gaming", "Dirt collected rewards ejecting and recollecting dirt. Repair: average clean floor area over eight hours, with an energy penalty."],
    ]],
    ["PEAS — learn these four headings", [
      ["Performance measure → evaluation metric", "What counts as success? Plain accuracy can mislead with imbalanced classes."],
      ["Environment → data-collection plan", "Where and under what conditions? Variable lighting means collecting images under variable lighting."],
      ["Actuators → interface", "What outputs/actions are possible? Include refusal or human referral when appropriate."],
      ["Sensors → feature set", "What inputs are available? Every feature must come from a listed sensor."],
      ["Task environment", "The problem to which a rational agent is the solution; fully described by PEAS."],
    ]],
    ["PEAS examples from the handout", [
      ["Enrolment adviser — P", "Conflict-free term completion, prerequisite violations, adviser hours saved and student-reported clarity."],
      ["Enrolment adviser — E", "Student records, curriculum, sections, room/faculty capacity, prerequisites and deadlines."],
      ["Enrolment adviser — A", "Proposed schedule, explained conflict flags and human referral."],
      ["Enrolment adviser — S", "Completed courses, current standing, preferences and section availability feed."],
      ["Rice-leaf classifier — P", "Balanced accuracy, false-negative rate for the most damaging disease, latency under four seconds on a mid-range phone."],
      ["Rice-leaf classifier — E", "Variable daylight, wet leaves, motion blur, different camera quality, one or more leaves per frame."],
      ["Rice-leaf classifier — A", "Class label with confidence, recommended action and low-confidence refusal."],
      ["Rice-leaf classifier — S", "Camera image; optional location and timestamp."],
      ["Why abstain?", "Avoid confident answers outside competence. Report how often refusal fires."],
    ]],
    ["Six environment dimensions", [
      ["Observability", "Fully: complete sensor state. Partially: incomplete; requires internal state."],
      ["Agency", "Single or multi-agent; multi-agent may be cooperative or competitive. Competition requires adversarial reasoning."],
      ["Determinism", "Deterministic: state and action determine the next state. Stochastic: reason over probability distributions."],
      ["Episodicity", "Episodic: independent decisions. Sequential: current choices affect future ones; needs lookahead or learned value estimates."],
      ["Dynamism", "Static: world waits. Dynamic: world changes; real-time constraints. Semi-dynamic: world waits but score changes."],
      ["Continuity", "Discrete or continuous states, time, percepts and actions. Continuous spaces need optimisation or discretisation rather than enumeration."],
    ]],
    ["Worked classifications — in the six-dimension order above", [
      ["Chess with a clock", "Fully • Multi • Deterministic • Sequential • Semi-dynamic • Discrete"],
      ["Poker", "Partially • Multi • Stochastic • Sequential • Static • Discrete"],
      ["Spam filter", "Fully • Single • Deterministic • Episodic • Static • Discrete"],
      ["Jeepney route planner", "Partially • Multi • Stochastic • Sequential • Dynamic • Mixed"],
      ["Rice-leaf classifier", "Partially • Single • Stochastic • Episodic • Static • Continuous"],
      ["Flood early-warning system", "Partially • Single • Stochastic • Sequential • Dynamic • Continuous"],
    ]],
    ["Four architectures + learning", [
      ["Simple reflex", "Current percept + condition-action rules. No memory. Fast and explainable; may loop under partial observability."],
      ["Model-based reflex", "Adds internal state and a model of world evolution/action effects. Minimum for partial observability; model can drift from reality."],
      ["Goal-based", "Desirable states + search for an action sequence. More flexible, much slower. Goals are binary."],
      ["Utility-based", "Maps a state to a real number; maximises expected utility. Handles conflicting goals and uncertain outcomes; specifying utility is difficult."],
      ["Learning element", "Modifies components from experience."],
      ["Critic", "Reports performance against the standard."],
      ["Problem generator", "Proposes exploratory actions."],
      ["External standard", "Any architecture can learn. Keep its success criterion external, or it optimises the criterion instead of the task."],
    ]],
  ],
  "semis-connecting-networks": [
    ["Electrical quantities and units", [
      ["Charge (Q)", "Amount of electric charge, measured in coulombs (C). Moving charge creates current."],
      ["Voltage (V)", "Potential energy difference per charge between two points. 1 V = 1 J/C; V = ΔE/Q."],
      ["Current (I)", "Rate of charge flow. I = ΔQ/Δt; 1 A = 1 C/s. Conventional current runs from positive to negative outside the source."],
      ["Resistance (R)", "Opposition to current, measured in ohms (Ω). At fixed voltage, greater resistance means less current."],
      ["Prefixes", "k = 1,000; M = 1,000,000; m = 0.001; µ = 0.000001. Convert mA to A before circuit calculations."],
    ]],
    ["Ohm's Law and power", [
      ["Three forms", "V = IR; I = V/R; R = V/I. Use the form with the requested unknown."],
      ["What changes?", "At fixed R, I rises with V. At fixed V, I falls as R rises. An ideal resistor has a straight V-versus-I line with slope R."],
      ["Power", "P = VI = I²R = V²/R, measured in watts. Resistors commonly turn electrical energy into heat."],
      ["Rating", "Choose a resistor rated above expected dissipation, allowing for temperature and operating conditions. 0.3 W exceeds a 0.25 W rating."],
      ["Quick examples", "9 V / 1.5 kΩ = 6 mA. A 12 V drop across 1 kΩ dissipates 0.144 W."],
    ]],
    ["Series, parallel and dividers", [
      ["Series", "One path: same current, voltage drops add, Rtotal = R1 + R2 + … . One open stops the path."],
      ["Parallel", "Shared two nodes: same voltage, branch currents add, 1/Rtotal = 1/R1 + 1/R2 + … . One open branch need not stop the others."],
      ["Two parallel resistors", "Rtotal = R1R2/(R1 + R2). Two equal resistors give half the resistance of either one."],
      ["Sanity check", "A positive-resistance parallel equivalent is below the smallest branch resistance."],
      ["Unloaded divider", "With R1 above the output and R2 below: Vout = Vin × R2/(R1 + R2). Equal R1 and R2 give half Vin."],
      ["Loaded divider", "A load across R2 lowers the effective lower resistance and can lower Vout. A divider is not automatically a power supply."],
    ]],
    ["LEDs and resistor selection", [
      ["LED polarity", "Anode is commonly the longer new lead; cathode is commonly the shorter lead and flat package edge. Check the datasheet if uncertain."],
      ["Current limit", "A series resistor protects the LED and output pin. It can be on either side of the LED in the same path."],
      ["LED formula", "R = (Vs − Vf)/I, with I in amperes. At 5 V, 2 V forward drop and 10 mA: R = 300 Ω ideal."],
      ["Resistor specs", "Check nominal resistance, tolerance, wattage, working voltage and temperature. ±10% at 1 kΩ spans 900–1,100 Ω."],
      ["Color bands", "Find the isolated tolerance band and read toward it. Four-band: band 3 is multiplier; five-band: band 3 is a digit."],
      ["Gold and silver", "Multiplier position: gold ×0.1, silver ×0.01. Final tolerance band: gold ±5%, silver ±10%."],
      ["Standard values", "E12 has 12 values per decade and is often associated with 10% ranges; E24 has 24 and is common with 5% values."],
    ]],
    ["Measurement, breadboards and diagrams", [
      ["Voltage", "Meter probes go in parallel across two points; use the voltage jack and correct AC/DC mode."],
      ["Current", "Open the path and insert the ammeter in series. Its low internal resistance makes current mode across a supply dangerous."],
      ["Resistance and continuity", "Normally power down and isolate as appropriate. A continuity beep means low resistance under the meter's threshold."],
      ["Breadboard", "Five-hole groups on each side of the center trench connect internally; opposite sides are separated. Edge power rails may be split."],
      ["Schematic junction", "A dot at meeting wires means one node. Under the course convention, crossing lines without a dot do not join."],
      ["Wiring habit", "Copy electrical nodes from the schematic, not its physical layout. Verify supply, ground, rail continuity and polarity."],
    ]],
    ["Components in the kit", [
      ["Capacitor / inductor", "A capacitor stores energy in an electric field (Q = CV); an inductor stores energy in a magnetic field."],
      ["Diode / flyback", "A diode chiefly conducts forward. Across a DC inductive load, a reverse-biased flyback diode clamps the switch-off spike."],
      ["Transistor / H-bridge", "A transistor switches a load needing more current than an Arduino pin can supply. An H-bridge reverses DC motor polarity and direction."],
      ["Potentiometer / pull-down", "A potentiometer's middle wiper provides adjustable voltage or resistance. A pull-down holds an open digital input LOW."],
      ["LDR / optocoupler", "An LDR's resistance usually falls as light rises. An optocoupler transfers a signal with light across an isolation barrier."],
      ["Servo / tilt / LCD", "A typical positional micro servo moves toward a commanded angle; a mechanical tilt switch is on/off and may bounce; a 16 × 2 LCD shows 16 columns and 2 rows of characters."],
    ]],
    ["Arduino Uno quick facts", [
      ["Board and ports", "Classic Uno uses ATmega328P. USB uploads sketches and can supply power; barrel input is commonly recommended at 7–12 V."],
      ["Pins", "Digital pins 0–13 handle input/output; the onboard LED is associated with pin 13. Analog inputs are A0–A5."],
      ["ADC", "Default 10-bit resolution gives 1,024 nominal codes, 0–1,023. Resolution is not the same as accuracy."],
      ["Current limits", "Normal design commonly keeps continuous current at or below 20 mA per digital pin. 40 mA is an absolute maximum, not a target."],
      ["Board labels", "AREF sets an external ADC reference; TX/RX LEDs indicate serial activity; ON LED indicates power. Reset restarts the stored sketch."],
      ["Signals and loads", "PWM rapidly switches a digital output with controlled duty cycle. Motors and other high-current loads need a suitable driver and often a separate supply."],
    ]],
    ["Before you answer a calculation", [
      ["Work sequence", "Write known values → convert units → choose formula → substitute → check whether the result is reasonable."],
      ["Parallel check", "Equivalent resistance must be below every branch resistance."],
      ["Divider check", "Output across R2 is a fraction of Vin in the unloaded two-resistor circuit."],
      ["Safety check", "Power down before moving wires. Check polarity, common ground, meter mode and current limits."],
    ]],
  ],
};

export function ReviewScreen({ meta, onStart, onBack }) {
  const sections = lessonReviews[meta.id] || [];
  return <main className="screen">
    <div className="container quick-review">
      <button className="btn btn-secondary" onClick={onBack}>← All quizzes</button>
      <header>
        <p className="review-eyebrow">QUICK REVIEW</p>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
        <p>Skim the key terms, then try recalling them before your mock exam. Based on the provided study materials.</p>
      </header>
      {sections.map(([title, rows]) => <section className="review-section" key={title}>
        <h2>{title}</h2>
        <dl>{rows.map(([term, meaning]) => <div className="review-row" key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
      </section>)}
      <footer className="review-actions"><button className="btn btn-primary" onClick={onStart}>Start Mock Exam →</button></footer>
    </div>
  </main>;
}
