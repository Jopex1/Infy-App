# Infy - Baby Tracker: Project Documentation for Thesis

## 1. Project Overview
**Infy - Baby Tracker** is a comprehensive Progressive Web Application (PWA) designed to assist parents in tracking their child's growth, receiving daily childcare tips, and getting instant, AI-driven pediatric advice. The application acts as a companion for parents, focusing on newborn care, nutrition, sleep cycles, and vaccination schedules. 

Because it is built as a **Progressive Web App (PWA)**, users can install the application directly onto their mobile devices or desktops from their web browser, allowing it to look and feel like a native application with a dedicated home screen icon, standalone display mode, and seamless performance.

## 2. Technology Stack & Tools Used

### Frontend Architecture
* **Next.js 14/15 (React Framework):** The core framework used to build the application. It enables Server-Side Rendering (SSR) and Static Site Generation (SSG), ensuring the application is extremely fast and SEO-friendly. It utilizes the App Router for seamless page navigation (e.g., routing for `/manage-account`, `/notifications`, etc.).
* **React:** The underlying library for building dynamic, component-driven user interfaces.
* **Tailwind CSS:** Used for highly customizable and responsive styling. It allows for rapid UI development with utility classes, maintaining a clean and modern aesthetic (e.g., using the brand theme color `#027027`).
* **Lucide React:** An iconography library used throughout the app for consistent, crisp, and scalable SVG icons.
* **LottieFiles (`@lottiefiles/dotlottie-react`):** Used to render lightweight, high-quality vector animations (like the success state animations) to improve user engagement and application aesthetics.

### Backend, Database & Authentication
* **Firebase (BaaS - Backend as a Service):** Firebase is integrated to handle the backend infrastructure.
  * **Authentication:** Manages user login and registration sessions securely.
  * **Firestore/Realtime Database:** Stores dynamic user data, such as baby growth metrics, profile configurations, and notification histories. 

### Artificial Intelligence Integration
* **Groq API:** The application integrates with Groq's blazing-fast inference API to power the **"Infy AI Doctor"**.
* **LLM Model (`llama-3.1-8b-instant`):** The AI chatbot uses the open-source Llama 3.1 model. The system prompt is specifically engineered to act as an expert pediatric consultant. It provides warm, conversational, and highly accurate advice formatted cleanly using HTML. It also contextually integrates visual assets (e.g., nutrition, sleep, and hygiene thumbnails) to enrich the answers.
* **Safety Mechanism:** The AI is strictly prompted to always encourage parents to seek a personalized medical opinion or visit a local health center for critical matters.

## 3. PWA (Progressive Web App) Execution
To ensure the app behaves like a native mobile application, it is configured with a Web App Manifest (`manifest.json`).
* **Standalone Mode:** The app runs without standard browser UI components (like the URL bar), providing a full-screen, immersive experience.
* **Custom Branding:** Configured with specific theme colors (`#027027`), background colors, and high-resolution splash icons (`192x192` and `512x512`) to ensure a premium look when installed on an iOS or Android home screen.

## 4. Hosting and Deployment
* **Netlify:** The application is deployed and hosted on Netlify, a premium platform for modern web frameworks. 
* **Netlify Next.js Plugin (`@netlify/plugin-nextjs`):** This plugin is explicitly configured in the `netlify.toml` execution pipeline. It ensures that Next.js server-side API routes (like the Groq API endpoint) and Server-Side Rendered pages function perfectly on Netlify's serverless edge network.
* **Continuous Integration/Continuous Deployment (CI/CD):** Pushing code changes to the connected Git repository automatically triggers a build (`npm run build`) and publishes the `.next` production bundle to the live environment. Cross-Origin policies are also enforced via Netlify headers for enhanced security.
