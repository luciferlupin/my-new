// Force scroll to top on initial page load
document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

// Handle browser back/forward navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }
});

// Additional scroll reset for good measure
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
