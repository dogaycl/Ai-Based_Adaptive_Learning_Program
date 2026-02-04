🎓 AI-Based Adaptive Learning Platform
👥 Contributors

Nisa Doğa Yücel – 220201012

Lütfiye Buse Gürdal – 210204009

📌 Project Overview

This project is a fully implemented AI-based adaptive learning platform designed to evaluate students’ levels through an intelligent placement (level) test and continuously adapt the learning experience based on real performance data.

The system supports separate authentication and workflows for teachers and students, offers a modern and intuitive user interface, and applies AI-supported logic to analyze learning behavior in real time.

This is not a static quiz application, but a data-driven adaptive learning system.

🚀 Core Features
👨‍🏫 Teacher Panel

Secure teacher authentication with hashed password

Create, update and delete lessons

Add, edit and remove questions

AI-assisted question generation

View student lists

Monitor each student’s:

Current level

Accuracy rate

Solved question count

Performance trends over time

🎓 Student Panel

Secure student authentication with hashed password

Initial placement (level) test

Adaptive quizzes based on performance

Continuous level evaluation during learning

Transparent progress and accuracy tracking

🤖 AI-Powered Adaptive System (Implemented)

The platform actively analyzes:

Correct and incorrect answers

Question difficulty levels

Time spent per question

Historical performance data

Using this data, the system:

Determines the student’s current learning level

Dynamically adjusts question difficulty

Prevents under-challenging or overwhelming students

Produces meaningful performance insights for teachers

This AI-supported logic runs continuously during quizzes and placement tests and directly affects the learning flow.

📊 Analytics & Performance Monitoring
👨‍🏫 Teacher View

Real-time visibility into:

Individual student levels

Accuracy percentages

Learning progress and trends

Data-driven evaluation of student performance

Clear overview of class-wide success

🎓 Student View

Level estimation based on real performance

Continuous feedback through adaptive quizzes

Measurable learning progress

🧠 Intelligent Question Management
Teachers can:

Add lecture notes or videos (e.g. PDF or URL)

Manually manage questions

Generate questions with AI support

Each question:

Is associated with a difficulty level

Is used directly in adaptive decision-making

Student evaluation is continuously recalculated based on question difficulty and performance.

🏆 Why This Project Stands Out

AI-supported level testing is fully implemented

Real adaptive behavior, not rule-only quizzes

Clear separation of teacher & student roles

Clean backend architecture (service–repository pattern)

Strong foundation for intelligent learning analytics

Modern, user-friendly interface

Designed as a production-ready adaptive learning system

🛠️ Tech Stack
Backend

Python

FastAPI

SQLAlchemy

MySQL

JWT-based Authentication

Frontend

React (Vite)

Tailwind CSS

Axios

📄 License

This project is developed for educational purposes.


Fr list:
Kod,Gereksinim (FR),Durum,Projedeki Karşılığı (Kanıt)
FR1,Secure Registration & Login (Güvenli Kayıt/Giriş),✅ TAMAM,"auth.py ve jwt.py ile JWT tabanlı, şifreli (hashing) güvenli giriş. Role-based (Öğrenci/Öğretmen) ayrımı var."
FR2,Personalized Dashboard (Kişiselleştirilmiş Panel),✅ TAMAM,"Dashboard.jsx. Kullanıcının seviyesi, XP'si ve sadece ona özel ""AI Coach"" önerisi gösteriliyor."
FR3,Data Collection (Veri Toplama),✅ TAMAM,"history_service.py. Her soru çözüldüğünde süre, doğruluk ve cevap veritabanına History tablosuna kaydediliyor."
FR4,Initial Learning Path (Placement Test),✅ TAMAM,"PlacementTest.jsx. Yeni üye olan kullanıcıyı zorunlu seviye tespit sınavına sokuyor ve seviyesini (1, 2, 3) atıyor."
FR5,Content Recommendation (İçerik Önerisi),✅ TAMAM,"recommendation.py ve ai_service.py. Başarı oranına ve süreye bakarak ""Review"" (Tekrar et) veya ""Challenge"" (Zorlan) önerisi veriyor."
FR6,Difficulty Adjustment (Zorluk Ayarı),✅ TAMAM,"AI Servisi (ai_service.py), öğrencinin durumuna göre dinamik soru üretiyor veya sistem zorluk seviyesine göre ders öneriyor."
FR7,Personalized Quiz (Kişisel Sınav),✅ TAMAM,Quiz.jsx. Kullanıcı testi çözdüğünde anlık geri bildirim alıyor ve sonuç ekranında AI analizi görüyor.
FR-Adm,Teacher/Admin Content Mgmt (İçerik Yön.),✅ TAMAM,"TeacherDashboard.jsx. Öğretmen ders ekleyebiliyor, silebiliyor, öğrencilerin başarı grafiklerini görebiliyor."
NFR,Performance & Usability (Performans/Kullanılabilirlik),✅ TAMAM,"React + Tailwind ile responsive tasarım. Backend asenkron (async) çalışıyor, sayfalar arası geçiş çok hızlı."