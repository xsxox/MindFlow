// public/js/comment.js

// 1. 页面加载完成后，自动去拿评论
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
});

// 加载评论函数
async function loadComments() {
    const res = await fetch(`/api/comments?articleId=${articleId}`);
    const comments = await res.json();
    
    const list = document.getElementById('comment-list');
    list.innerHTML = ''; // 清空“加载中...”

    if (comments.length === 0) {
        list.innerHTML = '<p class="text-muted">暂无评论，快来抢沙发！</p>';
        return;
    }

    // 循环拼接 HTML
    comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'border-bottom mb-2 pb-2';
        div.innerHTML = `
            <div class="text-secondary small">${new Date(comment.createdAt).toLocaleString()}</div>
            <div>${comment.content}</div>
        `;
        list.appendChild(div);
    });
}

// 提交评论函数
async function submitComment() {
    const input = document.getElementById('comment-content');
    const content = input.value;

    if (!content.trim()) return alert("写点什么吧！");

    // 发送 POST 请求
    const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: articleId, content: content })
    });

    if (res.ok) {
        input.value = '';
        loadComments();
    } else {
        alert("评论失败");
    }
}