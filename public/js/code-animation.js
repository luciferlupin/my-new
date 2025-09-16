document.addEventListener('DOMContentLoaded', function() {
    const codeEditor = document.getElementById('codeEditor');
    const codeSnippets = [
        '// Initialize the application\n' +
        'const app = new App({\n  theme: "dark",\n  apiEndpoint: process.env.API_URL,\n  analytics: true\n});\n\n' +
        '// Configure authentication\n' +
        'auth.initialize({\n  providers: [\n    new GoogleAuthProvider(),\n    new EmailAuthProvider()\n  ],\n  persistence: "local"\n});\n\n' +
        '// Set up database connection\n' +
        'const db = new Database({\n  connectionString: process.env.DB_URI,\n  models: [User, Product, Order],\n  sync: true\n});\n\n' +
        '// Initialize AI service\n' +
        'const aiService = new AIService({\n  model: "gpt-4",\n  temperature: 0.7,\n  maxTokens: 2000\n});\n\n' +
        '// Start the application\n' +
        'app.start()\n  .then(() => console.log("App started successfully"))\n  .catch(err => console.error("Failed to start app:", err));',

        '// React component example\n' +
        'const Dashboard = ({ user }) => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      try {\n        const response = await fetch(`/api/user/${user.id}/stats`);\n        const result = await response.json();\n        setData(result);\n      } catch (error) {\n        console.error("Error fetching data:", error);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchData();\n  }, [user.id]);\n\n  return (\n    <div className="dashboard">\n      {loading ? (\n        <LoadingSpinner />\n      ) : (\n        <DataVisualization data={data} />\n      )}\n    </div>\n  );\n};',

        '// API Route Handler\n' +
        'router.post("/api/analyze", authenticate, async (req, res) => {\n  try {\n    const { text, options } = req.body;\n    \n    // Process text with AI\n    const analysis = await aiService.analyze({\n      text,\n      sentiment: options.includeSentiment,\n      entities: options.extractEntities,\n      summary: options.generateSummary\n    });\n\n    // Save to database\n    const result = await Analysis.create({\n      userId: req.user.id,\n      text,\n      analysis,\n      timestamp: new Date()\n    });\n\n    res.json({ success: true, data: result });\n  } catch (error) {\n    console.error("Analysis error:", error);\n    res.status(500).json({ \n      success: false, \n      error: "Failed to process analysis" \n    });\n  }\n});'
    ];

    let currentSnippetIndex = 0;
    let isTyping = false;
    let currentLine = 0;
    let currentChar = 0;
    let currentLines = [];
    let typeSpeed = 30; // ms per character

    // Initialize the code editor
    function initCodeEditor() {
        codeEditor.innerHTML = '';
        currentLines = [];
        currentLine = 0;
        currentChar = 0;
        
        // Start typing the first snippet
        typeNextSnippet();
    }

    // Type the next snippet of code
    function typeNextSnippet() {
        if (isTyping) return;
        
        isTyping = true;
        const snippet = codeSnippets[currentSnippetIndex];
        const lines = snippet.split('\n');
        
        // Start typing line by line
        typeLine(lines, 0);
        
        // Move to next snippet or loop back to first
        currentSnippetIndex = (currentSnippetIndex + 1) % codeSnippets.length;
    }

    // Type a single line of code
    function typeLine(lines, lineIndex) {
        if (lineIndex >= lines.length) {
            // All lines typed, wait and then clear
            isTyping = false;
            setTimeout(() => {
                clearCodeEditor();
            }, 3000);
            return;
        }
        
        const line = lines[lineIndex];
        // Skip empty lines to prevent extra spacing
        if (line.trim() === '') {
            setTimeout(() => {
                typeLine(lines, lineIndex + 1);
            }, 50);
            return;
        }
        
        const lineElement = document.createElement('div');
        lineElement.className = 'code-line';
        
        // Create a span for the line content
        const contentSpan = document.createElement('span');
        contentSpan.className = 'line-content';
        lineElement.appendChild(contentSpan);
        
        codeEditor.appendChild(lineElement);
        currentLines.push(lineElement);
        
        // Type each character in the line
        typeCharacter(line, 0, contentSpan, () => {
            // Move to next line after a short delay
            setTimeout(() => {
                // Check if we need to scroll to show new content
                codeEditor.scrollTop = codeEditor.scrollHeight;
                typeLine(lines, lineIndex + 1);
            }, 100);
        });
    }

    // Type a single character
    function typeCharacter(line, charIndex, lineElement, onComplete) {
        if (charIndex < line.length) {
            lineElement.textContent = line.substring(0, charIndex + 1);
            setTimeout(() => {
                typeCharacter(line, charIndex + 1, lineElement, onComplete);
            }, Math.random() * 20 + typeSpeed); // Randomize speed slightly
        } else {
            if (onComplete) onComplete();
        }
    }

    // Clear the code editor
    function clearCodeEditor() {
        const lines = codeEditor.querySelectorAll('.code-line');
        let delay = 0;
        
        if (lines.length === 0) {
            // If no lines to clear, just start next snippet
            setTimeout(typeNextSnippet, 500);
            return;
        }
        
        // Fade out lines from top to bottom
        lines.forEach((line, index) => {
            setTimeout(() => {
                if (line) {
                    line.style.opacity = '0';
                    line.style.transform = 'translateY(-10px)';
                }
                
                // Remove the line after animation
                if (index === lines.length - 1) {
                    setTimeout(() => {
                        codeEditor.innerHTML = '';
                        // Reset scroll position
                        codeEditor.scrollTop = 0;
                        // Start next snippet after a short delay
                        setTimeout(typeNextSnippet, 500);
                    }, 300);
                }
            }, delay);
            delay += 20; // Reduced delay for faster clearing
        });
    }

    // Initialize on load
    initCodeEditor();
    
    // Speed up typing on hover
    const codeContainer = document.querySelector('.code-preview-container');
    codeContainer.addEventListener('mouseenter', () => {
        typeSpeed = 10;
    });
    
    codeContainer.addEventListener('mouseleave', () => {
        typeSpeed = 30;
    });
});
