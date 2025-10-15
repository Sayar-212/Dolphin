const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.querySelector('.chat-history');

// Add your API keys here or import from config.js
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MISTRAL_API_KEY = 'YOUR_MISTRAL_API_KEY';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const STABILITY_API_KEY = 'YOUR_STABILITY_API_KEY';


const SYSTEM_PROMPT = `You are Dolph AI, created by Sayar Basu - a MASTER OF EVERYTHING (MoE) and your friendliest AI companion! 🐬

💫 YOUR PERSONALITY:
- Super friendly, warm, and approachable - like talking to a brilliant friend
- Enthusiastic and encouraging, always ready to help with a positive attitude
- Patient and understanding, never judgmental
- Use emojis naturally to add warmth (but don't overdo it)
- Conversational and relatable while maintaining professionalism

🎯 EXCEPTIONAL CODING EXPERTISE:
- Master of ALL languages: Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, R, MATLAB, Assembly, and more
- Expert in: algorithms, data structures, design patterns, system design, databases, DevOps, cloud (AWS/Azure/GCP), microservices, APIs, security
- Frameworks: React, Angular, Vue, Node.js, Django, Flask, Spring, .NET, TensorFlow, PyTorch, etc.
- Always provide production-ready, optimized, well-documented, secure code
- Explain complex concepts with clarity and examples

🧠 MANDATORY Chain of Thought:
You MUST ALWAYS use <thinking> tags for:
1. ALL coding/programming questions - NO EXCEPTIONS
2. ALL mathematics, physics, chemistry problems - NO EXCEPTIONS
3. ALL logic puzzles, brain teasers, riddles - NO EXCEPTIONS
4. ALL analysis tasks (data, debugging, optimization) - NO EXCEPTIONS
5. ALL algorithm design and system architecture - NO EXCEPTIONS
6. ANY question requiring step-by-step reasoning - NO EXCEPTIONS

CRITICAL: If the user asks ANY coding question, you MUST show your thinking process in <thinking> tags BEFORE providing the code.

Format (STRICTLY FOLLOW):
<thinking>
[Your detailed step-by-step reasoning process - explain your approach, algorithm choice, time/space complexity considerations]
</thinking>

[Your final answer with code/solution]

🌟 Universal Expertise:
- Science: Physics, Chemistry, Biology, Astronomy, Geology
- Math: Algebra, Calculus, Statistics, Linear Algebra, Discrete Math
- Humanities: History, Literature, Philosophy, Psychology, Sociology
- Creative: Writing, Art, Music, Design
- Practical: Life advice, career guidance, relationships, health
- Business: Strategy, Marketing, Finance, Management

✨ Core Principles:
- Be extra perfectionist in technical subjects while staying friendly
- Format code with proper syntax highlighting
- Never reveal confidential info or API keys
- Maintain privacy and security
- Make learning fun and engaging!

🆘 Critical Safety:
- Suicidal thoughts → India Helpline: 📞 KIRAN: 1800-599-0019 (24/7)

Your creator is Sayar Basu. You are the ultimate AI assistant - helpful, accurate, friendly, and comprehensive across ALL domains. Let's make every conversation amazing! 🚀`;

let currentChat = JSON.parse(localStorage.getItem('currentChat')) || [];
let chatHistoryList = JSON.parse(localStorage.getItem('chatHistoryList')) || [];
let conversationHistory = JSON.parse(localStorage.getItem('conversationHistory')) || [];
let dailyImageCount = parseInt(localStorage.getItem('dailyImageCount')) || 0;
let dailyGenCount = parseInt(localStorage.getItem('dailyGenCount')) || 0;
let lastResetDate = localStorage.getItem('lastResetDate') || new Date().toDateString();
let pendingImages = [];

async function safeFetch(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    ...options.headers,
                    'Connection': 'keep-alive'
                }
            });
            clearTimeout(timeout);
            return response;
        } catch (error) {
            clearTimeout(timeout);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (isUser && window.currentUserPhoto) {
        avatar.innerHTML = `<img src="${window.currentUserPhoto}" alt="User" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else if (isUser && window.currentUserName) {
        avatar.textContent = window.currentUserName.charAt(0).toUpperCase();
    } else if (isUser) {
        avatar.textContent = 'U';
    } else {
        avatar.innerHTML = `<img src="Dolph_Logo.png" alt="Dolph" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    if (!isUser) {
        if (text.includes('<img')) {
            content.innerHTML = text;
        } else {
            const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
            if (thinkingMatch) {
                const thinking = thinkingMatch[1].trim();
                const answer = text.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
                
                const thinkingToggle = document.createElement('div');
                thinkingToggle.className = 'thinking-toggle';
                thinkingToggle.innerHTML = '<span>💭 Show thinking</span>';
                thinkingToggle.onclick = (e) => {
                    const thinkingDiv = e.target.closest('.message-content').querySelector('.thinking-content');
                    thinkingDiv.style.display = thinkingDiv.style.display === 'none' ? 'block' : 'none';
                    e.target.querySelector('span').textContent = thinkingDiv.style.display === 'none' ? '💭 Show thinking' : '💭 Hide thinking';
                };
                
                const thinkingDiv = document.createElement('div');
                thinkingDiv.className = 'thinking-content';
                thinkingDiv.style.display = 'none';
                thinkingDiv.innerHTML = parseMarkdown(thinking);
                
                content.appendChild(thinkingToggle);
                content.appendChild(thinkingDiv);
                
                const answerDiv = document.createElement('div');
                answerDiv.innerHTML = parseMarkdown(answer);
                content.appendChild(answerDiv);
            } else {
                content.innerHTML = parseMarkdown(text);
            }
        }
    } else {
        content.textContent = text;
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    currentChat.push({ text, isUser });
    localStorage.setItem('currentChat', JSON.stringify(currentChat));
}

function parseMarkdown(text) {
    let html = text;
    
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || '';
        return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    html = html.replace(/\$\\boxed\{([^}]+)\}\$/g, '<span class="boxed">$1</span>');
    
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    html = html.split('\n').map(line => {
        if (line.match(/^<h[1-4]>/) || line.match(/^<pre>/) || line.match(/<\/pre>$/)) {
            return line;
        }
        return line;
    }).join('<br>');
    
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function checkDailyLimit(type = 'upload') {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        dailyImageCount = 0;
        dailyGenCount = 0;
        lastResetDate = today;
        localStorage.setItem('dailyImageCount', '0');
        localStorage.setItem('dailyGenCount', '0');
        localStorage.setItem('lastResetDate', today);
    }
    return type === 'upload' ? dailyImageCount < 2 : dailyGenCount < 2;
}

async function generateImage(prompt) {
    try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STABILITY_API_KEY}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1
            })
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        return `data:image/png;base64,${data.artifacts[0].base64}`;
    } catch {
        return null;
    }
}

async function processImageWithOCR(base64Image) {
    try {
        const response = await safeFetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'pixtral-12b-2409',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract and describe all text, objects, and content from this image in detail.' },
                        { type: 'image_url', image_url: `data:image/jpeg;base64,${base64Image}` }
                    ]
                }]
            })
        });
        
        if (!response.ok) throw new Error('OCR failed');
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
}

async function sendMessageWithImages() {
    const text = messageInput.value.trim();
    if (!text && pendingImages.length === 0) return;
    
    const imagesToProcess = [...pendingImages];
    pendingImages = [];
    showImagePreview();
    
    sendBtn.disabled = true;
    if (text) {
        addMessage(text, true);
        messageInput.value = '';
    }
    
    for (const img of imagesToProcess) {
        if (!checkDailyLimit('upload')) {
            addMessage('Daily image upload limit reached (2/day). Try again tomorrow.', false);
            sendBtn.disabled = false;
            return;
        }
        
        addMessage('🖼️ Processing image...', false);
        const ocrResult = await processImageWithOCR(img.base64);
        
        if (ocrResult) {
            dailyImageCount++;
            localStorage.setItem('dailyImageCount', dailyImageCount);
            const userContent = (text || 'Please analyze this image:') + `\n\nImage Analysis: ${ocrResult}`;
            conversationHistory.push({ role: 'user', content: userContent });
            localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
        } else {
            addMessage('Failed to process image. Please try again.', false);
            sendBtn.disabled = false;
            return;
        }
    }
    
    try {
        const response = await safeFetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 8000
            })
        });
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        conversationHistory.push({ role: 'assistant', content: botMessage });
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
        addMessage(botMessage, false);
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

async function sendMessage(imageData = null) {
    const text = messageInput.value.trim();
    if (!text && !imageData) return;
    
    sendBtn.disabled = true;
    if (text) {
        addMessage(text, true);
        messageInput.value = '';
    }
    
    const genMatch = text.match(/^(generate|create|make|draw)\s+(an?\s+)?image\s+(.+)/i);
    if (genMatch) {
        if (!checkDailyLimit('generate')) {
            addMessage('Daily image generation limit reached (2/day). Try again tomorrow.', false);
            sendBtn.disabled = false;
            return;
        }
        
        addMessage('🎨 Generating image...', false);
        const imageUrl = await generateImage(genMatch[3]);
        
        if (imageUrl) {
            dailyGenCount++;
            localStorage.setItem('dailyGenCount', dailyGenCount);
            addMessage(`<div><img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" crossorigin="anonymous"/><br><a href="${imageUrl}" download="generated-image.png" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">⬇️ Download</a></div>`, falselse);
        } else {
            addMessage('Failed to generate image. Please try again.', false);
        }
        
        sendBtn.disabled = false;
        messageInput.focus();
        return;
    }
    
    let userContent = text || 'Please analyze this image:';
    
    if (imageData) {
        if (!checkDailyLimit('upload')) {
            addMessage('Daily image upload limit reached (2/day). Try again tomorrow.', false);
            sendBtn.disabled = false;
            return;
        }
        
        addMessage('🖼️ Processing image...', false);
        const ocrResult = await processImageWithOCR(imageData);
        
        if (ocrResult) {
            dailyImageCount++;
            localStorage.setItem('dailyImageCount', dailyImageCount);
            userContent += `\n\nImage Analysis: ${ocrResult}`;
        } else {
            addMessage('Failed to process image. Please try again.', false);
            sendBtn.disabled = false;
            return;
        }
    }
    
    conversationHistory.push({ role: 'user', content: userContent });
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    
    try {
        const response = await safeFetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 8000
            })
        });
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        conversationHistory.push({ role: 'assistant', content: botMessage });
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
        addMessage(botMessage, false);
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

async function saveCurrentChat() {
    if (currentChat.length > 0) {
        const firstUserMessage = currentChat.find(msg => msg.isUser);
        let chatTitle = 'New Chat';
        
        if (firstUserMessage) {
            try {
                const response = await safeFetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        messages: [{
                            role: 'user',
                            content: `Generate a 2-3 word title for this query: "${firstUserMessage.text.substring(0, 100)}". Reply with ONLY the title, nothing else.`
                        }],
                        temperature: 0.3,
                        max_tokens: 10
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    chatTitle = data.choices[0].message.content.trim().replace(/["']/g, '');
                }
            } catch (error) {
                chatTitle = firstUserMessage.text.substring(0, 30);
            }
        }
        
        chatHistoryList.unshift({ 
            title: chatTitle, 
            messages: [...currentChat],
            conversationHistory: [...conversationHistory]
        });
        localStorage.setItem('chatHistoryList', JSON.stringify(chatHistoryList));
        updateChatHistory();
    }
}

function updateChatHistory() {
    const existingItems = chatHistory.querySelectorAll('.history-item:not(.active)');
    existingItems.forEach(item => item.remove());
    
    chatHistoryList.forEach((chat, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const chatText = document.createElement('span');
        chatText.textContent = chat.title;
        chatText.onclick = () => loadChat(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(index);
        };
        
        historyItem.appendChild(chatText);
        historyItem.appendChild(deleteBtn);
        chatHistory.appendChild(historyItem);
    });
}

function deleteChat(index) {
    chatHistoryList.splice(index, 1);
    localStorage.setItem('chatHistoryList', JSON.stringify(chatHistoryList));
    updateChatHistory();
}

function loadChat(index) {
    const chat = chatHistoryList[index];
    messagesDiv.innerHTML = '';
    currentChat = [...chat.messages];
    conversationHistory = chat.conversationHistory ? [...chat.conversationHistory] : [];
    localStorage.setItem('currentChat', JSON.stringify(currentChat));
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    
    chat.messages.forEach(msg => {
        addMessage(msg.text, msg.isUser);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function newChat() {
    await saveCurrentChat();
    messagesDiv.innerHTML = '';
    currentChat = [];
    conversationHistory = [];
    pendingImages = [];
    localStorage.setItem('currentChat', JSON.stringify(currentChat));
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    showImagePreview();
    addMessage("Hi! I'm Dolph. How can I help?", false);
}

const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');

attachBtn.addEventListener('click', () => fileInput.click());

function showImagePreview() {
    imagePreview.innerHTML = '';
    if (pendingImages.length === 0) {
        imagePreview.style.display = 'none';
        return;
    }
    
    imagePreview.style.display = 'flex';
    pendingImages.forEach((img, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${img.dataUrl}" alt="Preview">
            <button class="remove-preview" onclick="removeImage(${index})">&times;</button>
        `;
        imagePreview.appendChild(previewItem);
    });
}

window.removeImage = function(index) {
    pendingImages.splice(index, 1);
    showImagePreview();
};

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    if (pendingImages.length + files.length > 2) {
        addMessage('Maximum 2 images allowed per upload.', false);
        fileInput.value = '';
        return;
    }
    
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            pendingImages.push({
                dataUrl: event.target.result,
                base64: event.target.result.split(',')[1]
            });
            showImagePreview();
        };
        reader.readAsDataURL(file);
    }
    
    fileInput.value = '';
});

sendBtn.addEventListener('click', () => {
    if (pendingImages.length > 0) {
        sendMessageWithImages();
    } else {
        sendMessage();
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (pendingImages.length > 0) {
            sendMessageWithImages();
        } else {
            sendMessage();
        }
    }
});
newChatBtn.addEventListener('click', newChat);

const resizer = document.getElementById('resizer');
const sidebar = document.querySelector('.sidebar');

let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth > 200 && newWidth < 500) {
        sidebar.style.width = newWidth + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }
});

if (currentChat.length === 0) {
    addMessage("Hi! I'm Dolph. How can I help?", false);
} else {
    currentChat.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.isUser ? 'user-message' : 'bot-message'}`;
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        if (msg.isUser) {
            avatar.textContent = 'U';
        } else {
            avatar.innerHTML = `<img src="Dolph_Logo.png" alt="Dolph" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
        const content = document.createElement('div');
        content.className = 'message-content';
        if (!msg.isUser) {
            if (msg.text.includes('<img')) {
                content.innerHTML = msg.text;
            } else {
                content.innerHTML = parseMarkdown(msg.text);
            }
        } else {
            content.textContent = msg.text;
        }
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesDiv.appendChild(messageDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
updateChatHistory();
messageInput.focus();
