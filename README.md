# Expression Tree Studio 🌳✨

A full-stack, interactive mathematical Expression Tree Generator and Step-by-Step Evaluator. Visualizes arithmetic expressions as binary syntax trees in both 2D and 3D with interactive animations, step-by-step evaluation playback, history tracking, and audio effects.

---

## 🚀 Features

- **Interactive 2D & 3D Visualizer**:
  - Interactive 2D tree graph with customizable nodes and branches.
  - Immersive 3D tree visualization powered by Three.js and `@react-three/fiber`.
- **Step-by-Step Evaluation Player**:
  - Play, pause, step forward, and step backward through each reduction step in the expression evaluation.
- **Tree Inspector**:
  - Detailed metadata including prefix, infix, postfix notations, tree depth, node count, and complexity.
- **History & Presets**:
  - Load quick presets or view and manage saved expression evaluations.
- **Micro-Interactions & Audio**:
  - Web Audio synthesis feedback and celebratory confetti effects upon parsing.
- **Full-Stack Architecture**:
  - **Client**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Three.js.
  - **Server**: Node.js, Express, TypeScript, custom Shunting-Yard parser & AST evaluation engine.

---

## 🛠️ Project Structure

```text
├── client/                 # React frontend (Vite + Tailwind CSS + Three.js)
│   ├── src/
│   │   ├── components/     # 2D/3D visualizers, player, inspector, header
│   │   ├── services/       # API client & local fallback tree engine
│   │   └── utils/          # Sound generator & audio effects
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express REST API backend
│   ├── src/
│   │   ├── tree/           # Parser, AST generator & step evaluator
│   │   ├── index.ts        # Express server entry point
│   │   └── types.ts        # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🏃 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

The server will run on `http://localhost:5000`.

### 2. Start the Frontend Client

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The client will be accessible at `http://localhost:5173`.

---

## 📜 License

MIT License.