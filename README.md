# 📅 Animated Calendar Web App

A visually interactive calendar web application with smooth transitions, page-like animations, and dynamic date handling — designed to feel like a **physical flipping calendar** in the browser.

---

## 🚀 Overview

This project is a **frontend-focused interactive calendar system** that goes beyond traditional static calendars. It combines animation, DOM manipulation, and structured date logic to create a **realistic, engaging UI experience**.

The goal was to simulate a **real-world calendar interaction (page flipping, smooth transitions)** while keeping the system lightweight and fully controlled using JavaScript.

---

## 🧠 Core Idea

Instead of rendering a static calendar:

* The calendar is treated as a **state-driven system**
* Every interaction updates the **state (month/year)**
* The UI is **re-rendered dynamically with animations**

---

## ⚙️ Tech Stack

* **HTML5** → Structure
* **CSS3** → Styling + animations
* **JavaScript (Vanilla JS)** → Core logic & DOM manipulation
* **Three.js (optional)** → 3D-like transitions and rendering
* **Poly Pizza** → 3D assets (low-poly models)
* **JavaScript Date API** → Real-world date calculations

---

## 🏗️ How It Works (Flow)

### 1️⃣ State Initialization

* Get current date using JS Date API
* Extract:

  * Month
  * Year
* Store as the **active calendar state**

---

### 2️⃣ Calendar Grid Generation

* Calculate:

  * First day of the month
  * Total number of days

```js
new Date(year, month + 1, 0).getDate()
```

* Generate a **7-column grid**
* Fill:

  * Previous month spillover days
  * Current month days
  * Next month placeholders

---

### 3️⃣ Rendering Engine

Instead of static HTML:

* Elements are created dynamically using JavaScript
* DOM is updated on every state change

**Flow:**

```
State Change → Clear UI → Generate Grid → Render → Animate
```

---

### 4️⃣ Navigation System

* Buttons: **Next / Previous**
* Logic:

```js
month++
month--
```

* Edge case handling:

  * December → January (year++)
  * January → December (year--)

---

### 5️⃣ Animation System ✨

This is the **core highlight of the project**

* Implemented using:

  * CSS `transform` (rotate, translate)
  * CSS `transition`
  * Layering (`z-index`)

* Creates a **page flip / book-like effect**

---

### 6️⃣ Smooth Transition Flow

```
User Click →
Trigger Animation →
Wait (animation duration) →
Update State →
Re-render Calendar →
Apply Entry Animation
```

---

## 🍕 3D Assets (Poly Pizza Integration)

To enhance visuals and experiment with depth, I used assets from
Poly Pizza (by Google).

---

### 📥 How I Downloaded Models

1. Visited Poly Pizza
2. Browsed low-poly models (optimized for web)
3. Selected relevant assets
4. Downloaded models in **GLTF / GLB format**

---

### 📦 Why GLTF/GLB?

* Lightweight and efficient
* Web-friendly format
* Includes:

  * Mesh
  * Textures
  * Materials

---

### ⚙️ How I Used Them

* Imported models into the project
* Loaded them using JavaScript (and optionally Three.js)
* Positioned them alongside UI elements
* Used them to:

  * Enhance UI visuals
  * Experiment with **3D transitions**

---

### 🔄 3D Rendering Flow

```
Download Model → Import → Load via JS →
Attach to Scene → Transform → Render
```

---

## 🎯 Key Features

* 📆 Fully dynamic calendar
* 🔄 Smooth animated transitions
* 📖 Page-flip interaction
* ⚡ Lightweight (no heavy frameworks)
* 🧠 Logic-driven rendering
* 🧩 Easily extendable

---

## 🧪 Challenges & Solutions

### ❌ Calendar alignment issues

✔️ Fixed using `getDay()` for correct weekday positioning

---

### ❌ UI flickering during transitions

✔️ Solved by delaying DOM updates until animation completes

---

### ❌ Month/year edge cases

✔️ Handled using conditional wrapping logic

---

## 🔮 Future Improvements

* 📝 Sticky notes / reminders
* 📍 Date range selection
* 🌐 Backend integration (event storage)
* 📱 Mobile swipe gestures
* 🎮 Physics-based animations

---

## 🛠️ How to Run

```bash
git clone https://github.com/VivekArgSharma/Calender
cd Calender
open index.html
```

---

## 💡 What I Learned

* Building **state-driven UI without frameworks**
* Advanced DOM manipulation
* Animation timing & UX design
* Handling real-world date logic
* Integrating 3D assets into web apps

---

## 👨‍💻 Author

**Vivek Sharma**

> I like building interactive systems that feel real, not just functional.

---

