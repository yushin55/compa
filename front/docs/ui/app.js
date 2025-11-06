// 스텝업(Step-Up) 공통 JavaScript

// 네비게이션 활성화
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop()) {
            link.style.color = 'var(--primary-color)';
            link.style.fontWeight = '700';
        }
    });
});

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        alert('로그아웃되었습니다.');
        window.location.href = 'login.html';
    }
}

// 폼 유효성 검사 헬퍼
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });

    return isValid;
}

// 입력 필드 포커스 시 에러 스타일 제거
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary-color)';
        });
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });
});

// 로컬 스토리지 관리
const StorageManager = {
    saveSpec: function(specData) {
        localStorage.setItem('userSpec', JSON.stringify(specData));
    },
    getSpec: function() {
        const data = localStorage.getItem('userSpec');
        return data ? JSON.parse(data) : null;
    },
    saveGoal: function(goalData) {
        localStorage.setItem('userGoal', JSON.stringify(goalData));
    },
    getGoal: function() {
        const data = localStorage.getItem('userGoal');
        return data ? JSON.parse(data) : null;
    },
    saveTasks: function(tasks) {
        localStorage.setItem('userTasks', JSON.stringify(tasks));
    },
    getTasks: function() {
        const data = localStorage.getItem('userTasks');
        return data ? JSON.parse(data) : [];
    },
    clear: function() {
        localStorage.clear();
    }
};

// 차트 그리기 (Canvas 사용)
function drawRadarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // 배경 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그리드
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        const r = (radius / 5) * i;
        for (let j = 0; j < data.labels.length; j++) {
            const angle = (Math.PI * 2 / data.labels.length) * j - Math.PI / 2;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // 축 그리기
    ctx.strokeStyle = '#CCCCCC';
    for (let i = 0; i < data.labels.length; i++) {
        const angle = (Math.PI * 2 / data.labels.length) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // 라벨
        ctx.fillStyle = '#2C3E50';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelX = centerX + Math.cos(angle) * (radius + 20);
        const labelY = centerY + Math.sin(angle) * (radius + 20);
        ctx.fillText(data.labels[i], labelX, labelY);
    }
    
    // 데이터 영역
    ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < data.values.length; i++) {
        const angle = (Math.PI * 2 / data.values.length) * i - Math.PI / 2;
        const value = data.values[i] / 100;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 데이터 포인트
    ctx.fillStyle = '#4A90E2';
    for (let i = 0; i < data.values.length; i++) {
        const angle = (Math.PI * 2 / data.values.length) * i - Math.PI / 2;
        const value = data.values[i] / 100;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 원형 진행도 차트
function drawCircularProgress(canvasId, percentage) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 원
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 진행도 원
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(1, '#50C878');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, (Math.PI * 2 * percentage / 100) - Math.PI / 2);
    ctx.stroke();
    
    // 텍스트
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', centerX, centerY);
}

// 날짜 포맷팅
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// D-Day 계산
function calculateDday(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        return `D-${diffDays}`;
    } else if (diffDays === 0) {
        return 'D-Day';
    } else {
        return `D+${Math.abs(diffDays)}`;
    }
}
