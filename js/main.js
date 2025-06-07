main.js
$(document).ready(function() {
    // Initialize page loading state
    $('body').addClass('loaded');

    // Debug: Log available tabs and sections on page load
    console.log('Page loaded - debugging tab structure:');
    console.log('Available nav items:', $('.nav-item a').map(function() { 
        return $(this).data('tab'); 
    }).get());
    console.log('Available tab sections:', $('.tab-content').map(function() { 
        return this.id; 
    }).get());

    // Logo functionality (if logo element exists)
    var $logo = $('#logo');
    if ($logo.length) {
        if (location.href.indexOf("#") != -1) {
            if (location.href.substr(location.href.indexOf("#")) != '#about') {
                $logo.show();
            }
        }

        // Show/hide logo based on tab selection
        $('#tab-container .tab a, .nav-item a').click(function() {
            if ($(this).attr('href') !== '#about' && $(this).data('tab') !== 'about') {
                $logo.slideDown('slow');
            } else {
                $logo.slideUp('slow');
            }
        });
    }

    // Animate meter/progress bars
    function animMeter() {
        $(".meter > span").each(function() {
            $(this)
                .data("origWidth", $(this).width())
                .width(0)
                .animate({
                    width: $(this).data("origWidth")
                }, 1200);
        });
    }

    // Animate skill bars
    function animateSkillBars() {
        $('.skill-progress').each(function() {
            const $this = $(this);
            const originalWidth = $this.attr('style').match(/width:\s*(\d+%)/);
            if (originalWidth) {
                $this.css('width', '0%');
                setTimeout(() => {
                    $this.css('width', originalWidth[1]);
                }, 100);
            }
        });
    }

    // Tab switching function
    function switchToTab(tabId) {
        console.log('Switching to tab:', tabId);
        
        // Hide all tab content
        $('.tab-content').removeClass('active').hide();
        
        // Remove active from all nav items
        $('.nav-item').removeClass('active');
        
        // Show target tab content
        const targetSection = $('#' + tabId);
        if (targetSection.length) {
            targetSection.addClass('active').show();
            console.log('Tab content shown for:', tabId);
        } else {
            console.error('Tab content not found for:', tabId);
            return false;
        }
        
        // Activate corresponding nav item
        const targetNavItem = $(`[data-tab="${tabId}"]`).parent();
        if (targetNavItem.length) {
            targetNavItem.addClass('active');
            console.log('Nav item activated for:', tabId);
        }
        
        // Run tab-specific animations
        if (tabId === 'skills') {
            setTimeout(animateSkillBars, 300);
        }
        if (tabId === 'experience') {
            setTimeout(animMeter, 300);
        }
        
        return true;
    }

    // Modern tab functionality
    $('.nav-item a').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetTab = $(this).data('tab');
        console.log('Tab clicked:', targetTab);
        console.log('Click event triggered on element:', this);
        
        if (!targetTab) {
            console.error('No data-tab attribute found on:', this);
            return;
        }

        // Switch to the tab
        if (switchToTab(targetTab)) {
            // Update URL hash
            if (history.pushState) {
                history.pushState(null, null, '#' + targetTab);
            } else {
                window.location.hash = targetTab;
            }
        }
    });

    // Handle direct URL access with hash
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        console.log('Hash change detected:', hash);
        
        if (hash) {
            if (!switchToTab(hash)) {
                console.log('Failed to switch to hash tab, showing default');
                showDefaultTab();
            }
        } else {
            showDefaultTab();
        }
    }

    function showDefaultTab() {
        console.log('Showing default tab (about)');
        switchToTab('about');
    }

    // Listen for hash changes
    $(window).on('hashchange', handleHashChange);

    // Handle initial page load
    setTimeout(() => {
        handleHashChange();
    }, 100);

    // Scroll to top functionality
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('#scroll').fadeIn();
        } else {
            $('#scroll').fadeOut();
        }
    });

    $('#scroll').click(function() {
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });

    // Smooth scrolling for anchor links (but not for tab navigation)
    $('a[href^="#"]:not([data-tab])').on('click', function(e) {
        const href = $(this).attr('href');
        if (href.length > 1) {
            const target = $(href);
            if (target.length) {
                e.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 100
                }, 1000);
            }
        }
    });

    // Intersection Observer for animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        const elementsToObserve = '.timeline-content, .project-card, .education-item, .stat-item, .skill-category';
        $(elementsToObserve).each(function() {
            observer.observe(this);
        });
    }

    // Mobile swipe functionality
    let touchStartX = 0;
    let touchEndX = 0;

    $('.nav-tabs').on('touchstart', function(e) {
        if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].screenX;
        }
    });

    $('.nav-tabs').on('touchend', function(e) {
        if (e.changedTouches && e.changedTouches[0]) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            const currentActive = $('.nav-item.active');
            let nextTab;

            if (diff > 0) { // Swipe left - next tab
                nextTab = currentActive.next('.nav-item');
                if (!nextTab.length) {
                    nextTab = $('.nav-item').first();
                }
            } else { // Swipe right - previous tab
                nextTab = currentActive.prev('.nav-item');
                if (!nextTab.length) {
                    nextTab = $('.nav-item').last();
                }
            }

            if (nextTab.length) {
                nextTab.find('a').trigger('click');
            }
        }
    }

    // Copy contact info functionality
    $('.contact-item').on('click', function(e) {
        const text = $(this).text().trim();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Contact info copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showToast('Contact info copied to clipboard!');
                } catch (err) {
                    console.log('Copy failed');
                }
                document.body.removeChild(textArea);
            });
        }
    });

    // Toast notification function
    function showToast(message) {
        const toast = $(`
            <div class="toast" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--primary-color, #2563eb);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                font-size: 0.9rem;
                max-width: 300px;
            ">${message}</div>
        `);

        $('body').append(toast);

        setTimeout(() => {
            toast.css({
                opacity: 1,
                transform: 'translateY(0)'
            });
        }, 100);

        setTimeout(() => {
            toast.css({
                opacity: 0,
                transform: 'translateY(20px)'
            });
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Print functionality
    window.printCV = function() {
        window.print();
    };

    // Add print button if it doesn't exist
    if (!$('.print-btn').length) {
        const printBtn = $(`
            <button class="print-btn" onclick="printCV()" style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: var(--primary-color, #2563eb);
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            " title="Print CV">
                <i class="fas fa-print"></i>
            </button>
        `);
        
        printBtn.hover(
            function() { $(this).css('transform', 'scale(1.1)'); },
            function() { $(this).css('transform', 'scale(1)'); }
        );
        
        $('body').append(printBtn);
    }

    // Test function - you can call this from console to test tabs
    window.testTab = function(tabName) {
        console.log('Testing tab:', tabName);
        switchToTab(tabName);
    };

    // Run initial animations
    setTimeout(() => {
        if ($('.nav-item.active a').data('tab') === 'skills') {
            animateSkillBars();
        }
        animMeter();
    }, 500);
});

// Add CSS for animations and loading
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    /* Tab content visibility - IMPORTANT */
    .tab-content {
        display: none !important;
    }
    
    .tab-content.active {
        display: block !important;
        animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { 
            opacity: 0; 
            transform: translateY(20px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }

    /* Navigation active state */
    .nav-item.active a {
        color: var(--primary-color, #2563eb) !important;
        border-bottom-color: var(--primary-color, #2563eb) !important;
    }

    /* Loading animation styles */
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--surface, #f8fafc);
        z-index: 9999;
    }

    /* Animation styles for intersection observer */
    .timeline-content,
    .project-card,
    .education-item,
    .stat-item,
    .skill-category {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    /* Print styles */
    @media print {
        .print-btn,
        .nav-tabs,
        .toast {
            display: none !important;
        }
        
        .tab-content {
            display: block !important;
        }
    }

    /* Debug styles - remove after testing */
    .nav-item a {
        position: relative;
    }
    
    .nav-item a:hover {
        background-color: rgba(37, 99, 235, 0.1);
    }
`;

document.head.appendChild(styleSheet);