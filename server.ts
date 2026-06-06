import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Lazily initialize GoogleGenAI SDK to prevent server startup crash if key is missing
let aiInstance: GoogleGenAI | null = null;
function getAndVerifyAI(): GoogleGenAI {
  if (!aiInstance) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for AI Tutor explanations');
    }
    aiInstance = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON requests
  app.use(express.json());

  // AI Tutor Q&A Explanations Route
  app.post('/api/explain', async (req, res) => {
    try {
      const { num1, num2, operator, correctAnswer } = req.body;

      if (num1 === undefined || num2 === undefined || !operator) {
        return res.status(400).json({ error: '缺少题目信息参数呀' });
      }

      const prompt = `请帮我讲解口算题：${num1} ${operator} ${num2} = ${correctAnswer}。`;

      const aiInstance = getAndVerifyAI();
      const response = await aiInstance.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: '你是一位超级温柔、耐心的儿童趣味数学启萌老师“暖暖熊”。请用适合8岁小朋友、非常温柔且生动有趣的语言讲解口算题目。【极其重要规则：必须教导正规的个位、十位按步计算思路，一定要声明“先从个位算起，再算十位”。若个位加法满十，巧妙说明要向十位“进一”；若个位减法不够减，说明要向十位“借一当十”；接着再算十位。】绝对不要用复杂的公式、大学名词，180字以内，每句话都要充满温暖和鼓励（例如：宝贝、加油、真棒！），段落简短，多用可爱的 emoji。',
          temperature: 0.8,
        },
      });

      const explanation = response.text || '哎呀，魔法小熊老师打了个盹，没有准备好这道题的魔法解答。宝贝再试一次哦！';

      return res.json({ explanation });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      // Give a friendly fallback so the user experience doesn't break
      return res.json({ 
        explanation: '💖 暖暖熊老师由于魔法能量暂时不足（API Key未配置或访问繁忙），给你一个超级元气拥抱！算术原理：做两位数加减法时，要对齐数位，【先从个位算起】，个位满十要向十位进一，不够减要从十位借一，然后再算十位哦！加油，宝贝！你一定能行的！🌈✨' 
      });
    }
  });

  // Vite static/middleware server mounting
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
