![ChronoLens Logo](https://raw.githubusercontent.com/bsurajpatra/ChronoLens/main/public/logo.png)

# ChronoLens — Exploring History Through Augmented Reality

**ChronoLens** is a production-grade WebAR museum experience designed to bring historic portraits to life. By scanning physical artwork, users can uncover immersive digital narratives, artistic context, and archival details directly through their browser.

## ✨ Key Features

*   **Multi-Portrait AR Tracking**: Seamlessly detects and tracks multiple historical portraits using the `MindAR` engine.
*   **Narrative Audio Tours**: Integrated voiceover transcripts for portraits, providing a guided tour experience.
*   **Intelligent Audio Ducking**: Background ambient music automatically reduces volume (ducks) during voiceovers to ensure narrative clarity.
*   **High-Resiliency Audio Engine**: A custom global singleton with a "heartbeat" keep-alive system to prevent aggressive browser power-throttling.
*   **Premium XR Interface**: Custom-designed scanning viewfinder with gold accents, pulsing animations, and a top-anchored information panel for stability.
*   **Cinematic Museum Lobby**: A high-end landing page featuring atmospheric background textures and an expandable "How it Works" guide.
*   **Curated Historical Database**: Deeply researched academic narratives for all supported masterpieces.

## 🛠️ Technology Stack

*   **Frontend**: React (v19)
*   **AR Engine**: MindAR.js (with Three.js integration)
*   **3D Rendering**: Three.js
*   **Styling**: Tailwind CSS (v4)
*   **Build Tool**: Vite
*   **Audio Architecture**: Custom Global Singleton with MediaSession API integration for OS-level persistence.

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
*   `src/hooks/`: Custom React hooks, including `useAmbientAudio` for resilient stateful sound management.
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
