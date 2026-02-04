import google.generativeai as genai
import json
import os
import random
from app.models.questions import Question

# --- API KEY AYARI ---
# Eğer gerçek AI istiyorsan buraya "AIzaSy..." ile başlayan keyi yapıştır.
# Yoksa kod otomatik olarak "Advanced Mock Mode"a geçer.
GOOGLE_API_KEY = "AIzaSyAKgdVBTRxVTgH5xzXOEZ12tCUkX-7rrS0" 

class AIService:
    def __init__(self):
        # Environment variable'dan key almaya çalış, yoksa yukarıdaki değişkeni kullan
        api_key = os.getenv("GOOGLE_API_KEY", GOOGLE_API_KEY)
        
        self.is_active = False
        if api_key and api_key != "BURAYA_GERCEK_API_KEY_YAZABILIRSIN":
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                self.is_active = True
                print("✅ AI Service: Google Gemini ACTIVE")
            except Exception as e:
                print(f"⚠️ AI Service: Key Error. Switching to Mock Mode. Error: {e}")
        else:
            print("ℹ️ AI Service: No API Key provided. Running in ADVANCED MOCK MODE.")

    def generate_questions(self, topic: str, difficulty: str, count: int = 3):
        """
        Gemini API kullanarak konuyla ilgili soru üretir.
        Hata olursa veya key yoksa 'randomize edilmiş' mock soru döner.
        """
        if self.is_active:
            try:
                # Prompt mühendisliği: Rastgelelik (entropy) istiyoruz
                prompt = f"""
                Create {count} UNIQUE multiple-choice questions about "{topic}".
                Difficulty: {difficulty}.
                Focus on different aspects of the topic to ensure variety.
                
                STRICT JSON FORMAT:
                [
                  {{
                    "content": "Question text?",
                    "option_a": "Option A",
                    "option_b": "Option B",
                    "option_c": "Option C",
                    "option_d": "Option D",
                    "correct_answer": "A",
                    "difficulty_level": 3
                  }}
                ]
                Only return the JSON array.
                """
                response = self.model.generate_content(prompt)
                cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
                return json.loads(cleaned_text)
            except Exception as e:
                print(f"❌ AI Generation Failed: {e}")
                print("🔄 Falling back to Advanced Mock Engine...")
                return self._get_advanced_mock_questions(topic, count)
        else:
            return self._get_advanced_mock_questions(topic, count)

    def _get_advanced_mock_questions(self, topic, count):
        """
        API Key olmadığında devreye giren 'Akıllı Taklit' motoru.
        Sürekli aynı soruyu dönmemesi için şablonları ve şıkları karıştırır.
        """
        templates = [
            {
                "q": f"What is a primary characteristic of {topic}?",
                "correct": "It optimizes performance",
                "wrongs": ["It increases latency", "It is obsolete", "It ignores data"]
            },
            {
                "q": f"Why is {topic} critical in this field?",
                "correct": "Efficiency and scalability",
                "wrongs": ["High cost only", "Manual processing", "Random guessing"]
            },
            {
                "q": f"Which statement is TRUE about {topic}?",
                "correct": "It involves systematic analysis",
                "wrongs": ["It relies purely on luck", "It cannot be measured", "It is only for hardware"]
            },
            {
                "q": f"What is a common misconception about {topic}?",
                "correct": "It solves everything instantly",
                "wrongs": ["It is useless", "It is too simple", "It requires no data"]
            },
            {
                "q": f"In the context of {topic}, what does 'optimization' mean?",
                "correct": "Finding the best solution",
                "wrongs": ["Deleting all files", "Increasing errors", "Stopping the process"]
            },
            {
                "q": f"How does {topic} impact the final outcome?",
                "correct": "It improves accuracy",
                "wrongs": ["It destroys data", "It has no effect", "It slows down the user"]
            }
        ]
        
        # Şablonları karıştır ki her seferinde farklı sorular gelsin
        selected_templates = random.sample(templates, min(count, len(templates)))
        
        results = []
        for t in selected_templates:
            # Şıkları oluştur ve karıştır
            options = [t["correct"]] + t["wrongs"]
            random.shuffle(options)
            
            # Doğru cevabın hangi şıkta (A,B,C,D) olduğunu bul
            correct_index = options.index(t["correct"])
            correct_char = ['A', 'B', 'C', 'D'][correct_index]
            
            results.append({
                "content": t["q"],
                "option_a": options[0],
                "option_b": options[1],
                "option_c": options[2],
                "option_d": options[3],
                "correct_answer": correct_char,
                "difficulty_level": random.randint(1, 5) # Zorluk da rastgele olsun
            })
            
        return results