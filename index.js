// 游戏介绍页面脚本

document.addEventListener('DOMContentLoaded', function() {
    // 获取开始游戏按钮
    const playButton = document.getElementById('playButton');
    
    // 为按钮添加点击事件
    playButton.addEventListener('click', function() {
        // 跳转到游戏页面
        window.location.href = 'game.html';
    });

    // 添加一些动画效果
    animateElements();
});

function animateElements() {
    // 获取所有卡片元素
    const cards = document.querySelectorAll('.feature-card, .weapon-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 添加页面滚动时的动画
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});
