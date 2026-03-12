![ChronoLens Logo](https://raw.githubusercontent.com/bsurajpatra/ChronoLens/main/public/logo.png)

# ChronoLens — Exploring History Through Augmented Reality

**ChronoLens** is a production-grade WebAR museum experience designed to bring historic portraits to life. By scanning physical artwork, users can uncover immersive digital narratives, artistic context, and archival details directly through their browser.

## ✨ Key Features

*   **Multi-Portrait AR Tracking**: Seamlessly detects and tracks multiple historical portraits using the `MindAR` engine with fine-tuned stability.
*   **Cinematic Viewfinder**: A vertically-aligned rectangular scanner with real-time laser guidance and a high-speed "Scan Lock" zoom for instant reconnaissance.
*   **Holographic 3D Overlays**: Dynamic 3D titles with micro-floating motion and soft "Museum Spotlight" glow feedback for immersive discovery.
*   **Pseudo-Spatial Ambience**: A sophisticated audio engine that swell volumes on detection and attenuates focus during panel expansion, simulating gallery acoustics.
*   **Narrative Audio Tours**: Integrated high-fidelity voiceovers with automatic ambient ducking for maximum narrative clarity.
*   **Cinematic Museum Lobby**: A high-end entry experience featuring slow-zoom textures and an archival "How it Works" guide.
*   **Curated Historical Database**: Deeply researched academic narratives for masters including Gainsborough, Klimt, and Da Vinci.

## 🛠️ Technology Stack

*   **Frontend**: React (v19)
*   **AR Engine**: MindAR.js (with custom OneEuroFilter stabilization)
*   **3D Rendering**: Three.js (FrontSide rendering with dynamic CanvasTextures)
*   **Styling**: Tailwind CSS (v4)
*   **Build Tool**: Vite
*   **Audio Architecture**: `useSpatialAmbient` - A custom RAF-based interpolation engine for perceptual volume modulation.

## 🚀 Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   A modern mobile device or laptop with a camera.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/bsurajpatra/ChronoLens.git
    cd ChronoLens
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open the provided URL in your browser. (Note: For mobile testing, ensure you use a service like `ngrok` or access your local IP over HTTPS).

## 📂 Project Structure

*   `src/ar/`: Core AR logic and `mindarScene.js` for engine initialization.
*   `src/components/`: Reusable UI components like the `InstructionPanel`, `PortraitPanel`, and `MuteToggle`.
*   `src/hooks/`: Custom React hooks, including `useSpatialAmbient` for high-fidelity pseudo-spatial sound management.
*   `src/pages/`: Main application routes (`Landing` and `ARViewer`).
*   `src/data/`: Data stores for portrait information and historical metadata (`portraits.json`).
*   `public/`: Static assets including `targets.mind` (AR targets), `ambient.mp3` (museum audio), and `museum_bg.webp` (lobby backdrop).

## 🎨 Design Philosophy

ChronoLens follows a **Museum Luxury** aesthetic, utilizing:
*   **Heritage Gold (#c6a15b)** for primary accents.
*   **Obsidian Black** and **High-Resolution Textures** for depth and elegance.
*   **Premium Typography** (Playfair Display) to evoke a sense of historical archive and authority.

---

*Developed with passion for preserving history through technology.*
