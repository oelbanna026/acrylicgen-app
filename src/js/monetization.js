// Monetization Service for AcrylicGen
// Handles Freemium logic, Ads, and Limits

(function() {
    // Plan Definitions
    const PLANS = {
        FREE: {
            id: 'free',
            name: 'Free',
            dailyExports: 5,
            ads: true,
            watermark: true,
            priority: 'low'
        },
        PRO: {
            id: 'pro',
            name: 'Pro',
            dailyExports: 100,
            ads: false,
            watermark: false,
            priority: 'high'
        },
        BUSINESS: {
            id: 'business',
            name: 'Business',
            dailyExports: Infinity,
            ads: false,
            watermark: false,
            priority: 'high'
        }
    };

    const Monetization = {
        // State
        showAdModal: false,
        adTimer: 5,
        adCallback: null,
        
        // Get current user plan
        getUserPlan() {
            // Get user from AuthService (global scope)
            const user = window.AuthService?.user;
            if (!user) return PLANS.FREE;
            
            // Admin gets Business features (all unlocked)
            if (user.role === 'admin') return PLANS.BUSINESS;

            const planKey = user.plan?.toUpperCase() || 'FREE';
            return PLANS[planKey] || PLANS.FREE;
        },

        // Check if user needs to see ads
        shouldShowAds() {
            const plan = this.getUserPlan();
            return plan.ads;
        },

        // Check daily limits
        checkLimit() {
            const plan = this.getUserPlan();
            if (plan.dailyExports === Infinity) return true;

            // In a real app, we check server-side or local storage with date
            const today = new Date().toDateString();
            const usage = JSON.parse(localStorage.getItem('daily_usage') || '{}');
            
            if (usage.date !== today) {
                usage.date = today;
                usage.count = 0;
            }

            if (usage.count >= plan.dailyExports) {
                this.showUpgradePopup();
                return false;
            }

            return true;
        },

        // Increment usage
        incrementUsage() {
            const usage = JSON.parse(localStorage.getItem('daily_usage') || '{}');
            usage.count = (usage.count || 0) + 1;
            localStorage.setItem('daily_usage', JSON.stringify(usage));
        },

        // Check feature availability
        hasFeature(featureName) {
            const user = window.AuthService?.user;
            if (user && user.role === 'admin') return true;

            const plan = this.getUserPlan();
            return plan.features && plan.features[featureName];
        },

        // Main entry point for protected actions
        executeProtectedAction(callback) {
            if (!this.checkLimit()) return;
            this.incrementUsage();
            callback();
        },

        showUpgradePopup() {
            alert('You have reached your daily limit. Please upgrade to Pro!');
            // In real implementation, toggle an Alpine variable to show a nice modal
            window.dispatchEvent(new CustomEvent('show-upgrade-modal'));
        }
    };

    // Expose to window
    window.Monetization = Monetization;
})();
