![ChronoLens Logo](https://raw.githubusercontent.com/bsurajpatra/ChronoLens/main/public/logo.png)

# ChronoLens — Exploring History Through Augmented Reality

**ChronoLens** is a production-grade WebAR museum experience designed to bring historic portraits to life. By scanning physical artwork, users can uncover immersive digital narratives, artistic context, and archival details directly through their browser.

## ✨ Key Features

*   **Multi-Portrait AR Tracking**: Seamlessly detects and tracks multiple historical portraits using the `MindAR` engine.
*   **Immersive Museum Ambience**: Soft, looping instrumental soundscapes that fade in naturally with user interaction.
*   **Premium XR Interface**: A custom-designed scanning viewfinder with gold accents, pulsing animations, and intelligent tracking feedback.
*   **Dynamic Information Surface**: Expandable content panels providing deep historical context for each recognized artwork.
*   **Performance Optimized**: Pre-rendered Canvas textures for smooth 60fps performance on mobile and high-end devices.

## 🛠️ Technology Stack

*   **Frontend**: React (v19)
*   **AR Engine**: MindAR.js (with Three.js integration)
*   **3D Rendering**: Three.js
*   **Styling**: Tailwind CSS (v4)
*   **Build Tool**: Vite
*   **Audio**: Custom Global Singleton Audio Hook (`useAmbientAudio`)

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
*   `src/components/`: Reusable UI components like the `Loader`, `PortraitPanel`, and `MuteToggle`.
*   `src/hooks/`: Custom React hooks, including `useAmbientAudio` for stateful sound management.
*   `src/pages/`: Main application routes (`Landing` and `ARViewer`).
*   `src/data/`: Data stores for portrait information and historical metadata.
*   `public/`: Static assets including `targets.mind` (AR targets) and `ambient.mp3` (museum audio).

## 🎨 Design Philosophy

ChronoLens follows a **Museum Luxury** aesthetic, utilizing:
*   **Heritage Gold (#c6a15b)** for primary accents.
*   **Obsidian Black** and **Ivory Textures** for depth and elegance.
*   **Premium Typography** (Playfair Display) to evoke a sense of historical archive.

---

*Developed with passion for preserving history through technology.*
