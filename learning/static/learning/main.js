document.addEventListener('DOMContentLoaded', () => {
    
    // ==================================================
    // Part 1: 课文页逻辑 (Text/Dialogue Page)
    // ==================================================
    
    // 1. 点击显示/隐藏翻译
    const dialogueEntries = document.querySelectorAll('.dialogue-entry');
    dialogueEntries.forEach(entry => {
        const sourceLangDiv = entry.querySelector('.source-language');
        const translationBlock = entry.querySelector('.translation-block');

        if (sourceLangDiv && translationBlock) {
            // 默认隐藏
            translationBlock.style.display = 'none'; 
            // 点击切换
            sourceLangDiv.addEventListener('click', () => {
                const isHidden = translationBlock.style.display === 'none';
                translationBlock.style.display = isHidden ? 'block' : 'none';
            });
        }
    });

    // 2. 目录折叠逻辑 (如果有的话)
    const collapsibles = document.querySelectorAll('.level-title');
    collapsibles.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    });

    // ==================================================
    // Part 2: 习题页逻辑 (Game Page)
    // ==================================================
    
    const gameBoard = document.getElementById('game-board');
    
    // 安全检查：只有当前页面存在 game-board 时，才执行下面的游戏逻辑
    if (gameBoard) {
        initGameLogic();
    }
});

// 封装游戏初始化逻辑
function initGameLogic() {
    const lessonTitleEl = document.getElementById('lesson-title');
    const lessonInstructionsEl = document.getElementById('lesson-instructions');

    // [关键修改] Django 适配：
    // 我们优先检查 HTML 里是否定义了全局变量 API_URL (由 Django 模板提供)
    // 如果没有，再尝试用原来的 URL 参数逻辑 (作为备份)
    let fetchUrl = '';
    
    if (typeof window.DjangoDataUrl !== 'undefined') {
        fetchUrl = window.DjangoDataUrl;
    } else {
        // 兼容旧逻辑
        const params = new URLSearchParams(window.location.search);
        const lessonId = params.get('lesson');
        if (lessonId) fetchUrl = `data/${lessonId}.json`;
    }

    if (!fetchUrl) {
        if(lessonInstructionsEl) lessonInstructionsEl.innerHTML = 'Error: No data URL found.';
        return;
    }

    fetch(fetchUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // 设置标题和说明 (如果页面上有这些元素)
            if (lessonTitleEl && data.title) {
                lessonTitleEl.innerHTML = `<span class="lang-zh">${data.title.zh}</span><span class="lang-ru">${data.title.ru}</span>`;
            }
            if (lessonInstructionsEl && data.instructions) {
                lessonInstructionsEl.innerHTML = `<span class="lang-zh">${data.instructions.zh}</span><span class="lang-ru">${data.instructions.ru}</span>`;
            }

            // 生成题目
            if (data.questions) {
                data.questions.forEach(question => {
                    buildQuestionUI(question);
                });
            }
            
            // 生成提交区域
            if (data.submission !== false) { 
                createFinalSubmitArea(); 
            }
        })
        .catch(error => {
            console.error('Error loading game data:', error);
            if(lessonInstructionsEl) lessonInstructionsEl.textContent = "Failed to load exercise data.";
        });
}

// 构建单个题目 UI
function buildQuestionUI(question) {
    const gameBoard = document.getElementById('game-board');
    const questionWrapper = document.createElement('div');
    questionWrapper.id = `question-${question.id}`;
    
    // 样式类处理
    if (question.type !== 'flashcard' && question.type !== 'explanation') {
        questionWrapper.classList.add('question-container');
    }

    let questionHTML = '';
    // 默认为造句题 (build)
    const type = question.type || 'build';

    // 这里我为了简化代码，只保留了最核心的 build 和 sort 逻辑
    // 如果你需要 flashcard 或 listening，可以再把原来的代码贴回来
    switch (type) {
        case 'sort': questionHTML = buildSortQuestion(question); break;
        case 'build': default: questionHTML = buildBuildQuestion(question); break;
    }
    
    questionWrapper.innerHTML = questionHTML;
    gameBoard.appendChild(questionWrapper);
    
    // 初始化拖拽功能 (依赖 SortableJS)
    initializeSortable(question);
    
    // 答案显示逻辑
    if (question.answer) {
        const showAnswerBtn = questionWrapper.querySelector(`#btn-answer-${question.id}`);
        const answerContainer = questionWrapper.querySelector(`#answer-${question.id}`);
        if (showAnswerBtn && answerContainer) {
            showAnswerBtn.addEventListener('click', () => {
                const isHidden = getComputedStyle(answerContainer).display === 'none';
                if (isHidden) {
                    answerContainer.style.display = 'block';
                    answerContainer.classList.add('visible');
                    showAnswerBtn.querySelector('.lang-zh').textContent = '隐藏答案';
                    showAnswerBtn.querySelector('.lang-ru').textContent = 'Скрыть ответ';
                } else {
                    answerContainer.style.display = 'none';
                    answerContainer.classList.remove('visible');
                    showAnswerBtn.querySelector('.lang-zh').textContent = '显示参考答案';
                    showAnswerBtn.querySelector('.lang-ru').textContent = 'Показать ответ';
                }
            });
        }
    }
}

// 构建排序题 HTML
function buildSortQuestion(question) {
    // 简化版：直接显示打乱的词，不处理 URL 参数恢复（为了减少代码量）
    const sentenceWordsHTML = question.scrambled_words.map(word => `<div class="word-block">${word}</div>`).join('');
    return `
        <div class="question-header"><span class="lang-zh">${question.description.zh}</span><span class="lang-ru">${question.description.ru}</span></div>
        <div class="sentence-area">
            <div id="sentence-box-${question.id}" class="word-box-container sentence-box">${sentenceWordsHTML}</div>
        </div>
        ${buildAnswerSectionHTML(question)}
    `;
}

// 构建造句题 HTML
function buildBuildQuestion(question) {
    const descriptionHTML = question.description ? `<div class="sentence-prompt"><span class="lang-zh">${question.description.zh}</span><span class="lang-ru">${question.description.ru}</span></div>` : '';
    
    // 核心词显示
    const coreWordDisplay = question.coreWord ? 
        `<div class="core-word-display">
            <span class="lang-zh">核心词：</span>
            <div class="word-block core-word-reference">${question.coreWord}</div>
        </div>` : '';

    // 备选词库生成
    let poolHTML = '';
    if (question.wordPool) {
        poolHTML = Object.keys(question.wordPool).map(category => `
            <div class="word-category">
                <h4 class="category-title">${category}</h4>
                <div id="pool-${question.id}-${category}" class="word-box-container word-pool">
                    ${question.wordPool[category].map(word => `<div class="word-block">${word}</div>`).join('')}
                </div>
            </div>
        `).join('');
    }

    return `
        <div class="question-header">
            <span class="lang-zh">${question.title.zh}</span>
            <span class="lang-ru">${question.title.ru}</span>
            ${coreWordDisplay}
        </div>
        ${descriptionHTML}
        <div class="sentence-area">
            <div class="sentence-prompt"><span class="lang-zh">句子区：</span><span class="lang-ru">Зона для предложений:</span></div>
            <div id="sentence-box-${question.id}" class="word-box-container sentence-box">
                ${question.coreWord ? `<div class="word-block core-word">${question.coreWord}</div>` : ''}
            </div>
        </div>
        <div class="word-pool-area">
            <div class="word-pool-prompt"><span class="lang-zh">备选词库：</span><span class="lang-ru">Банк слов:</span></div>
            <div class="word-pool-grid">${poolHTML}</div>
        </div>
        ${buildAnswerSectionHTML(question)}
    `;
}

// 答案区域 HTML
function buildAnswerSectionHTML(question) {
    if (!question.answer) return '';
    const ruAnswerHTML = question.answer.ru ? `<div class="lang-ru">${question.answer.ru}</div>` : '';
    return `
        <div class="answer-reveal-section">
            <button id="btn-answer-${question.id}" class="show-answer-btn">
                <span class="lang-zh">显示参考答案</span><span class="lang-ru">Показать ответ</span>
            </button>
            <div id="answer-${question.id}" class="answer-container">
                <div class="lang-zh">${question.answer.zh}</div>
                ${ruAnswerHTML}
            </div>
        </div>`;
}

// 初始化 SortableJS (拖拽核心)
function initializeSortable(question) {
    const questionId = question.id;
    const sentenceBox = document.getElementById(`sentence-box-${questionId}`);
    if (!sentenceBox) return;

    // 检查 Sortable 是否存在 (防止忘记引入 CDN 报错)
    if (typeof Sortable === 'undefined') {
        console.error('SortableJS not loaded!');
        return;
    }

    if (question.type === 'sort') {
        // 排序题：只能在框内排序
        new Sortable(sentenceBox, { animation: 150 });
    } else {
        // 造句题：可以在备选区和答题区之间拖动
        const wordPools = document.querySelectorAll(`#question-${questionId} .word-pool`);
        const groupName = `group-${questionId}`;

        // 答题区配置
        new Sortable(sentenceBox, { 
            group: groupName, 
            animation: 150,
            // 禁止把核心词拖回备选区
            onMove: evt => !(evt.dragged.classList.contains('core-word') && evt.to.classList.contains('word-pool')) 
        });

        // 备选区配置
        wordPools.forEach(pool => { 
            new Sortable(pool, { 
                group: { name: groupName, pull: 'clone', put: true }, // pull:'clone' 表示拖走后原位还留一个？如果不想要复制，改成 pull: true
                animation: 150, 
                sort: false,
                onAdd: function (evt) { 
                    // 如果拖回备选区，直接删除该元素 (视觉上就是“放回去”了)
                    if (evt.to !== sentenceBox) { evt.item.remove(); } 
                } 
            }); 
        });
    }
}

// 简单的提交按钮生成
function createFinalSubmitArea() {
    const gameBoard = document.getElementById('game-board');
    const div = document.createElement('div');
    div.className = 'final-submission-container';
    div.innerHTML = `<button class="generate-link-btn" onclick="alert('完成！(这里是演示，实际提交逻辑可省略)')"><span class="lang-zh">完成练习</span><span class="lang-ru">Завершить</span></button>`;
    gameBoard.appendChild(div);
}