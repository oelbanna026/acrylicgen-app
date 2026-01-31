// Translation Dictionary
(function() {
const i18n = {
    ar: {
        app_title: "Acrylic Designer Pro (v1.1)",
        unit: "وحدة القياس",
        width: "العرض",
        height: "الارتفاع",
        dimensions: "الأبعاد",
        shape: "الشكل",
        shape_rect: "مستطيل",
        shape_oval: "بيضاوي",
        shape_pentagon: "خماسي",
        shape_hexagon: "سداسي",
        shape_star: "نجمة",
        corners: "الزوايا",
        straight: "حادة (Straight)",
        rounded: "دائرية (Rounded)",
        radius: "نصف القطر",
        holes: "الثقوب والمسامير",
        no_holes: "بدون ثقوب",
        corners_4: "4 زوايا (Corners)",
        side_6: "6 ثقوب (Side Middle)",
        custom_count: "عدد مخصص (توزيع متساوي)",
        hole_count: "عدد المسامير",
        diameter: "قطر المسمار",
        margin: "الهامش من الحافة",
        pricing_settings: "حساب التكلفة",
        sheet_dims: "أبعاد اللوح الخام (سم)",
        sheet_price: "سعر اللوح الخام",
        thickness_mm: "السمك (مم)",
        cutting_price_hr: "سعر ساعة القص",
        profit_margin: "نسبة الربح %",
        area: "مساحة التصميم:",
        cost: "السعر الإجمالي:",
        toggle_theme: "تغيير السمة",
        reset: "إعادة ضبط",
        warning_no_holes: "تحذير: لا توجد مساحة كافية للثقوب!",
        export_dxf: "تصدير DXF",
        export_pdf: "تصدير PDF",
        auth_required: "تسجيل الدخول مطلوب",
        enter_password: "أدخل كلمة المرور",
        login: "دخول",
        wrong_password: "كلمة المرور غير صحيحة",
        forgot_password: "نسيت كلمة المرور؟",
        send_reset_link: "إرسال رابط الاستعادة",
        history: "سجل التصدير",
        date: "التاريخ",
        type: "النوع",
        cost_credits: "التكلفة (رصيد)",
        re_export: "إعادة تحميل التصميم",
        no_history: "لا يوجد سجل تصدير حتى الآن",
        admin_dashboard: "لوحة تحكم المشرف",
        total_users: "إجمالي المستخدمين",
        total_exports: "إجمالي التصديرات",
        total_revenue: "إجمالي الإيرادات",
        users_list: "قائمة المستخدمين",
        update_available: "تحديث جديد متوفر!",
        update_now: "تحديث الآن",
        loading: "جاري التحميل...",
        layers: "الطبقات / الأشكال",
        add_shape: "إضافة شكل",
        delete_shape: "حذف",
        delete_all: "حذف الكل",
        x_pos: "الموقع X",
        y_pos: "الموقع Y",
        nesting: "ترتيب ذكي (Nesting)",
        nesting_settings: "إعدادات الترتيب",
        nest_now: "رتب الأشكال الآن",
        canvas_w: "عرض اللوح",
        canvas_h: "ارتفاع اللوح",
        rotate: "تدوير (90°)",
        duplicate: "تكرار",
        snap_to_grid: "محاذاة ذكية (Snap)",
        enable_snap: "تفعيل المحاذاة",
        drag_mode: "وضع التحريك",
        select_mode: "وضع التحديد",
        fill_sheet: "ملء اللوح",
        fill_count: "العدد (اتركه فارغاً للملء التلقائي)",
        fill_btn: "ملء وترتيب",
        fill_warning: "سيتم إضافة عدد كبير من الأشكال، هل أنت متأكد؟",
        nesting_margin: "المسافة بين الأشكال",
        rotate_short: "تدوير",
        duplicate_short: "تكرار",
        snap_short: "محاذاة",
        nesting_short: "ترتيب",
        restart_tour: "بدء الجولة التعريفية"
    },
    en: {
        app_title: "Acrylic Designer Pro (v1.1)",
        unit: "Unit",
        width: "Width",
        height: "Height",
        dimensions: "Dimensions",
        shape: "Shape",
        shape_rect: "Rectangle",
        shape_oval: "Oval",
        shape_pentagon: "Pentagon",
        shape_hexagon: "Hexagon",
        shape_star: "Star",
        corners: "Corners",
        straight: "Straight",
        rounded: "Rounded",
        radius: "Corner Radius",
        holes: "Holes & Screws",
        no_holes: "No Holes",
        corners_4: "4 Corners",
        side_6: "6 Holes (Sides)",
        custom_count: "Custom Count (Even)",
        hole_count: "Hole Count",
        diameter: "Screw Diameter",
        margin: "Margin",
        pricing_settings: "Cost Calculation",
        sheet_dims: "Raw Sheet Dims (cm)",
        sheet_price: "Raw Sheet Price",
        thickness_mm: "Thickness (mm)",
        cutting_price_hr: "Cutting Price/Hour",
        profit_margin: "Profit Margin %",
        area: "Design Area:",
        cost: "Total Price:",
        toggle_theme: "Toggle Theme",
        reset: "Reset",
        warning_no_holes: "Warning: Not enough space for holes!",
        export_dxf: "Export DXF",
        export_pdf: "Export PDF",
        auth_required: "Authentication Required",
        enter_password: "Enter Password",
        login: "Login",
        wrong_password: "Wrong Password",
        forgot_password: "Forgot Password?",
        send_reset_link: "Send Reset Link",
        history: "Export History",
        date: "Date",
        type: "Type",
        cost_credits: "Cost (Credits)",
        re_export: "Re-Export",
        no_history: "No export history yet",
        admin_dashboard: "Admin Dashboard",
        total_users: "Total Users",
        total_exports: "Total Exports",
        total_revenue: "Total Revenue",
        users_list: "Users List",
        update_available: "New Update Available!",
        update_now: "Update Now",
        loading: "Loading...",
        layers: "Layers / Shapes",
        add_shape: "Add Shape",
        delete_shape: "Delete",
        delete_all: "Delete All",
        x_pos: "Position X",
        y_pos: "Position Y",
        nesting: "Smart Nesting",
        nesting_settings: "Nesting Settings",
        nest_now: "Nest Shapes Now",
        canvas_w: "Sheet Width",
        canvas_h: "Sheet Height",
        rotate: "Rotate (90°)",
        duplicate: "Duplicate",
        snap_to_grid: "Smart Snap",
        enable_snap: "Enable Snap",
        drag_mode: "Drag Mode",
        select_mode: "Select Mode",
        fill_sheet: "Fill Sheet",
        fill_count: "Count (Empty for Auto)",
        fill_btn: "Fill & Nest",
        fill_warning: "This will add many shapes, are you sure?",
        nesting_margin: "Margin/Gap",
        rotate_short: "Rotate",
        duplicate_short: "Clone",
        snap_short: "Snap",
        nesting_short: "Nest",
        restart_tour: "Start Tour"
    }
};

function app() {
        try {
        // Ensure AuthService is available
        let auth = window.AuthService;
        if (!auth) {
            console.error("AuthService missing! Using fallback.");
            auth = {
                user: null,
                login: async () => { alert('Auth System Error'); throw new Error('Auth System Error'); },
                register: async () => { alert('Auth System Error'); throw new Error('Auth System Error'); },
                logout: () => {},
                getProfile: async () => null,
                getHistory: async () => [],
                getAdminStats: async () => null,
                getAdminUsers: async () => [],
                mockPurchase: async () => {},
                deductCredit: async () => ({ success: true }) // Allow export in fallback
            };
        }
    
        const defaultShape = () => ({
            id: Date.now(),
            name: 'Shape ' + Math.floor(Math.random() * 1000),
            x: 0,
            y: 0,
            width: 50,
            height: 30,
            rotation: 0,
            shapeType: 'rectangle',
            cornerType: 'straight',
            cornerRadius: 5,
            holePattern: 'corners',
            holeCount: 8,
            holeDiameter: 0.8,
            holeMargin: 3,
            holes: []
        });
    
        return {
        // Expose Translation Helper
        t(key) {
            // Ensure lang is set
            const lang = this.lang || 'ar';
            // Access i18n safely
            if (i18n && i18n[lang] && i18n[lang][key]) {
                return i18n[lang][key];
            }
            // Fallback to English if key missing in current lang
            if (i18n && i18n['en'] && i18n['en'][key]) {
                return i18n['en'][key];
            }
            // Fallback to key itself
            return key;
        },

        // System State
        loading: true,
        user: auth.user,
        showSidebar: window.innerWidth >= 768,
        showLoginModal: false,
        showRegisterModal: false,
        showPricingModal: false,
        showDashboardModal: false,
        showForgotPasswordModal: false,
        showHistoryModal: false,
        showAdminModal: false,
        showAboutModal: false,
        showAdModal: false,
        showPayPalModal: false,
        showNestingPanel: false,
        showCostSettings: false,
        payPalAmount: 0,
        payPalDescription: '',
        payPalItemType: '', // 'plan' or 'credits'
        payPalItemValue: '', // plan name or credits amount
        adTimer: 5,
        authLogin: { email: '', password: '' },
        authRegister: { name: '', email: '', password: '' },
        forgotPasswordEmail: '',
        history: [],
        adminStats: null,
        adminUsers: [],
        updateAvailable: false,
        
        // Settings
        lang: localStorage.getItem('acrylic_lang') || 'ar',
        theme: localStorage.getItem('acrylic_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
        currency: 'USD',
        currencies: [
            { code: 'USD', symbol: '$', name: 'USD' },
            { code: 'SAR', symbol: 'ر.س', name: 'SAR' },
            { code: 'EGP', symbol: 'ج.م', name: 'EGP' },
            { code: 'AED', symbol: 'د.إ', name: 'AED' },
            { code: 'KWD', symbol: 'د.ك', name: 'KWD' },
            { code: 'EUR', symbol: '€', name: 'EUR' }
        ],
        
        // Shapes Model
        unit: 'cm',
        shapes: [defaultShape()],
        activeShapeId: null,

        // Pricing Global Settings
        thickness: 3,
        sheetWidth: 244,
        sheetHeight: 122,
        sheetPrice: 100,
        cuttingPricePerHour: 50,
        profitMargin: 20,

        // Viewport State
        zoom: 1,
        pan: { x: 0, y: 0 },
        isPanning: false,
        lastMouse: { x: 0, y: 0 },
        
        // Interaction State
        isDraggingShape: false,
        draggedShapeId: null,
        dragOffset: { x: 0, y: 0 },
        snapEnabled: true,
        snapThreshold: 1.5, // units

        // Nesting State
        nestingSheetWidth: 244,
        nestingSheetHeight: 122,
        nestingMargin: 0.1,
        fillCount: null,

        // Computed Properties for Active Shape
        get activeShape() {
            if (!this.activeShapeId && this.shapes.length > 0) {
                this.activeShapeId = this.shapes[0].id;
            }
            const found = this.shapes.find(s => s.id === this.activeShapeId);
            if (found) return found;
            if (this.shapes.length > 0) return this.shapes[0];
            
            // Return safe dummy object to prevent UI crashes when no shapes exist
            return {
                id: null, width: 0, height: 0, x: 0, y: 0, 
                rotation: 0, shapeType: 'rectangle', 
                cornerType: 'straight', cornerRadius: 0,
                holePattern: 'none', holeCount: 0, holeDiameter: 0, holeMargin: 0,
                holes: []
            };
        },

        // Proxy Getters/Setters for Backward Compatibility and UI Binding
        get width() { return this.activeShape.width; },
        set width(v) { this.activeShape.width = v; this.updateHoles(this.activeShape); },

        get height() { return this.activeShape.height; },
        set height(v) { this.activeShape.height = v; this.updateHoles(this.activeShape); },
        
        get x() { return this.activeShape.x; },
        set x(v) { this.activeShape.x = v; },

        get y() { return this.activeShape.y; },
        set y(v) { this.activeShape.y = v; },

        get shapeType() { return this.activeShape.shapeType; },
        set shapeType(v) { this.activeShape.shapeType = v; this.updateHoles(this.activeShape); },

        get cornerType() { return this.activeShape.cornerType; },
        set cornerType(v) { this.activeShape.cornerType = v; this.updateHoles(this.activeShape); },

        get cornerRadius() { return this.activeShape.cornerRadius; },
        set cornerRadius(v) { this.activeShape.cornerRadius = v; this.updateHoles(this.activeShape); },

        get holePattern() { return this.activeShape.holePattern; },
        set holePattern(v) { this.activeShape.holePattern = v; this.updateHoles(this.activeShape); },

        get holeCount() { return this.activeShape.holeCount; },
        set holeCount(v) { this.activeShape.holeCount = v; this.updateHoles(this.activeShape); },

        get holeDiameter() { return this.activeShape.holeDiameter; },
        set holeDiameter(v) { this.activeShape.holeDiameter = v; this.updateHoles(this.activeShape); },

        get holeMargin() { return this.activeShape.holeMargin; },
        set holeMargin(v) { this.activeShape.holeMargin = v; this.updateHoles(this.activeShape); },

        get holes() { return this.activeShape.holes; },
        set holes(v) { this.activeShape.holes = v; },

        // Methods
        addShape() {
            const newShape = defaultShape();
            // Offset slightly so they don't overlap perfectly
            newShape.x = this.shapes.length * 5;
            newShape.y = this.shapes.length * 5;
            newShape.name = 'Shape ' + (this.shapes.length + 1);
            this.shapes.push(newShape);
            this.activeShapeId = newShape.id;
            this.updateHoles(newShape);
        },

        removeShape(id) {
            this.shapes = this.shapes.filter(s => s.id !== id);
            
            if (this.shapes.length === 0) {
                this.activeShapeId = null;
            } else if (this.activeShapeId === id) {
                this.activeShapeId = this.shapes[0].id;
            }
        },

        clearAllShapes() {
            if(confirm(this.lang==='ar' ? 'هل أنت متأكد من حذف جميع الأشكال؟' : 'Are you sure you want to delete all shapes?')) {
                this.shapes = [];
                this.activeShapeId = null;
            }
        },

        selectShape(id) {
            this.activeShapeId = id;
        },

        // Auth Methods
        async handleGoogleLogin(credential) {
            this.loading = true;
            try {
                await auth.googleLogin(credential);
                this.user = auth.user;
                this.showLoginModal = false;
                this.showRegisterModal = false;
                alert('Logged in with Google successfully!');
            } catch (e) {
                alert('Google Login Failed: ' + e.message);
            } finally {
                this.loading = false;
            }
        },

        async login() {
            try {
                await auth.login(this.authLogin.email.trim(), this.authLogin.password);
                this.user = auth.user;
                this.showLoginModal = false;
                this.authLogin = { email: '', password: '' };
            } catch (e) {
                alert(e.message);
            }
        },

        async register() {
            try {
                await auth.register(this.authRegister.name, this.authRegister.email.trim(), this.authRegister.password);
                this.user = auth.user;
                this.showRegisterModal = false;
                this.authRegister = { name: '', email: '', password: '' };
            } catch (e) {
                alert(e.message);
            }
        },

        async forgotPassword() {
            try {
                await auth.forgotPassword(this.forgotPasswordEmail);
                alert('Password reset link sent to your email!');
                this.showForgotPasswordModal = false;
                this.forgotPasswordEmail = '';
            } catch (e) {
                alert(e.message);
            }
        },
        
        async loadHistory() {
            if (!this.user) return;
            try {
                this.history = await auth.getHistory();
                this.showHistoryModal = true;
            } catch (e) {
                alert(e.message);
            }
        },

        loadDesign(params) {
            if (!params) return alert('No design data available for this export.');
            try {
                const data = typeof params === 'string' ? JSON.parse(params) : params;
                
                // Support legacy format (single shape)
                if (data.width && !data.shapes) {
                    this.unit = data.unit || this.unit;
                    this.shapes = [{
                        id: Date.now(),
                        name: 'Loaded Shape',
                        x: 0, y: 0,
                        width: data.width,
                        height: data.height,
                        shapeType: data.shapeType || 'rectangle',
                        cornerType: data.cornerType || 'straight',
                        cornerRadius: data.cornerRadius || 5,
                        holePattern: data.holePattern || 'corners',
                        holeCount: data.holeCount || 8,
                        holeDiameter: data.holeDiameter || 0.8,
                        holeMargin: data.holeMargin || 3,
                        holes: []
                    }];
                    this.activeShapeId = this.shapes[0].id;
                    this.updateHoles(this.shapes[0]);
                } 
                // Support new format
                else if (data.shapes) {
                    this.unit = data.unit || this.unit;
                    this.shapes = data.shapes;
                    this.activeShapeId = this.shapes[0].id;
                    this.shapes.forEach(s => this.updateHoles(s));
                }

                this.showDashboardModal = false;
                alert('Design loaded from history!');
            } catch (e) {
                console.error(e);
                alert('Failed to load design.');
            }
        },

        async openAdminDashboard() {
            if (!this.user || this.user.role !== 'admin') return;
            this.loading = true;
            try {
                const [stats, users] = await Promise.all([
                    auth.getAdminStats(),
                    auth.getAdminUsers()
                ]);
                this.adminStats = stats;
                this.adminUsers = users;
                this.showAdminModal = true;
            } catch (e) {
                alert(e.message || 'Failed to load admin data');
            } finally {
                this.loading = false;
            }
        },

        logout() {
            auth.logout();
        },

        async buyPlan(plan) {
            if (!this.user) return this.showLoginModal = true;
            try {
                await auth.mockPurchase(plan, 0, plan === 'starter' ? 3 : plan === 'pro' ? 7 : 30);
                this.user = auth.user;
                alert('Plan upgraded successfully!');
                this.showPricingModal = false;
                window.trackEvent('purchase', { item: plan, type: 'subscription' });
            } catch (e) {
                alert(e.message);
            }
        },

        async buyCredits(amount, price) {
            if (!this.user) return this.showLoginModal = true;
            try {
                await auth.mockPurchase(this.user.plan, amount, price);
                this.user = auth.user;
                alert('Credits purchased successfully!');
                this.showPricingModal = false;
                window.trackEvent('purchase', { item: amount + '_credits', type: 'credits' });
            } catch (e) {
                alert(e.message);
            }
        },

        updateHoles(shape) {
            if (!shape) return;
            const m = parseFloat(shape.holeMargin) || 0;
            const w = parseFloat(shape.width) || 0;
            const h = parseFloat(shape.height) || 0;
            const r = (parseFloat(shape.holeDiameter) || 0) / 2;
            
            // Effective offset = Margin (Clearance) + Radius
            const offset = m + r;
            
            if (shape.holePattern === 'none') {
                shape.holes = [];
                return;
            }
            
            // Safety check
            if (w <= offset*2 || h <= offset*2) {
                shape.holes = [];
                return;
            }

            let pts = [];

            if (shape.shapeType === 'rectangle') {
                if (shape.holePattern === 'corners') {
                    pts.push({x: offset, y: offset});
                    pts.push({x: w-offset, y: offset});
                    pts.push({x: w-offset, y: h-offset});
                    pts.push({x: offset, y: h-offset});
                } else if (shape.holePattern === 'corners_mid') {
                    pts.push({x: offset, y: offset});
                    pts.push({x: w-offset, y: offset});
                    pts.push({x: w-offset, y: h-offset});
                    pts.push({x: offset, y: h-offset});
                    if (w > h) {
                        pts.push({x: w/2, y: offset});
                        pts.push({x: w/2, y: h-offset});
                    } else {
                        pts.push({x: offset, y: h/2});
                        pts.push({x: w-offset, y: h/2});
                    }
                } else if (shape.holePattern === 'custom') {
                    const count = parseInt(shape.holeCount) || 4;
                    const effW = w - 2*offset;
                    const effH = h - 2*offset;
                    const perimeter = 2 * (effW + effH); 
                    
                    for (let i = 0; i < count; i++) {
                        const dist = (perimeter / count) * i;
                        let x, y;
                        if (dist < effW) { // Top edge
                            x = offset + dist;
                            y = offset;
                        } else if (dist < effW + effH) { // Right edge
                            x = w - offset;
                            y = offset + (dist - effW);
                        } else if (dist < 2*effW + effH) { // Bottom edge
                            x = (w - offset) - (dist - (effW + effH));
                            y = h - offset;
                        } else { // Left edge
                            x = offset;
                            y = (h - offset) - (dist - (2*effW + effH));
                        }
                        pts.push({x, y});
                    }
                }
            } else if (shape.shapeType === 'oval') {
                const rx = (w/2) - offset;
                const ry = (h/2) - offset;
                const cx = w/2;
                const cy = h/2;
                const count = shape.holePattern === 'custom' ? (parseInt(shape.holeCount)||4) : 4;
                const num = (shape.holePattern === 'corners') ? 4 : (shape.holePattern === 'corners_mid' ? 6 : count);
                
                for (let i = 0; i < num; i++) {
                    const angle = (2 * Math.PI * i) / num - (Math.PI/4); 
                    pts.push({
                        x: cx + rx * Math.cos(angle),
                        y: cy + ry * Math.sin(angle)
                    });
                }
            } else {
                 const rx = (w/2) - offset;
                 const ry = (h/2) - offset;
                 const cx = w/2;
                 const cy = h/2;
                 const count = shape.holePattern === 'custom' ? (parseInt(shape.holeCount)||5) : 5;
                 
                 for (let i = 0; i < count; i++) {
                    const angle = (2 * Math.PI * i) / count - Math.PI/2; 
                    pts.push({
                        x: cx + rx * Math.cos(angle),
                        y: cy + ry * Math.sin(angle)
                    });
                 }
            }

            shape.holes = pts;
        },
        
        getPolyPath(w, h, sides) {
            const cx = w/2;
            const cy = h/2;
            const rx = w/2;
            const ry = h/2;
            let d = "";
            for (let i = 0; i < sides; i++) {
                const angle = (2 * Math.PI * i) / sides - Math.PI/2;
                const x = cx + rx * Math.cos(angle);
                const y = cy + ry * Math.sin(angle);
                d += (i===0 ? "M " : "L ") + x + " " + y + " ";
            }
            d += "Z";
            return d;
        },

        getStarPath(w, h, points, ratio) {
            const cx = w/2;
            const cy = h/2;
            const rx = w/2;
            const ry = h/2;
            let d = "";
            const step = Math.PI / points;
            for (let i = 0; i < 2 * points; i++) {
                const r = (i % 2 === 0) ? 1 : ratio;
                const angle = i * step - Math.PI/2;
                const x = cx + rx * r * Math.cos(angle);
                const y = cy + ry * r * Math.sin(angle);
                d += (i===0 ? "M " : "L ") + x + " " + y + " ";
            }
            d += "Z";
            return d;
        },

        getShapePath(shape) {
            const w = parseFloat(shape.width) || 0;
            const h = parseFloat(shape.height) || 0;
            const type = shape.shapeType;
            
            if (type === 'rectangle') {
                const r = shape.cornerType === 'rounded' ? (parseFloat(shape.cornerRadius) || 0) : 0;
                if (r === 0) return `M 0 0 H ${w} V ${h} H 0 Z`;
                return `M ${r} 0 H ${w-r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h-r} A ${r} ${r} 0 0 1 ${w-r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h-r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
            }
            
            if (type === 'oval') {
                const rx = w/2;
                const ry = h/2;
                return `M ${w/2} 0 A ${rx} ${ry} 0 1 1 ${w/2} ${h} A ${rx} ${ry} 0 1 1 ${w/2} 0 Z`;
            }
            
            if (type === 'pentagon') return this.getPolyPath(w, h, 5);
            if (type === 'hexagon') return this.getPolyPath(w, h, 6);
            if (type === 'star') return this.getStarPath(w, h, 5, 0.5);
            
            return '';
        },

        getHolesPath(shape) {
            if (!shape.holes || shape.holes.length === 0) return '';
            const r = (parseFloat(shape.holeDiameter) || 0) / 2;
            return shape.holes.map(h => {
                return `M ${h.x + r} ${h.y} A ${r} ${r} 0 1 0 ${h.x - r} ${h.y} A ${r} ${r} 0 1 0 ${h.x + r} ${h.y}`;
            }).join(' ');
        },

        getShapeArea(shape) {
            const w = parseFloat(shape.width) || 0;
            const h = parseFloat(shape.height) || 0;
            const type = shape.shapeType;

            if (type === 'rectangle') {
                const r = shape.cornerType === 'rounded' ? (parseFloat(shape.cornerRadius) || 0) : 0;
                if (r > 0) {
                    // Area = w*h - 4*r^2 + PI*r^2
                    return (w * h) - (r * r * (4 - Math.PI));
                }
                return w * h;
            }
            if (type === 'oval') {
                // Area = PI * a * b
                return Math.PI * (w / 2) * (h / 2);
            }
            if (type === 'pentagon') {
                // Regular pentagon area approx 0.75 * w * h relative to bounding box
                return 0.75 * w * h;
            }
            if (type === 'hexagon') {
                // Regular hexagon area approx 0.8 * w * h
                return 0.8 * w * h;
            }
            if (type === 'star') {
                // 5-point star approx 0.5 * w * h
                return 0.5 * w * h;
            }
            return w * h;
        },

        get limits() {
            if (this.unit === 'mm') return { min: 100, max: 3000, step: 1, holeMin: 1, holeMax: 100, holeStep: 1 };
            if (this.unit === 'inch') return { min: 4, max: 120, step: 0.1, holeMin: 0.1, holeMax: 4, holeStep: 0.04 };
            return { min: 10, max: 300, step: 0.5, holeMin: 0.1, holeMax: 10, holeStep: 0.1 }; // cm
        },

        getShapeBoundingBox(shape) {
            const x = parseFloat(shape.x) || 0;
            const y = parseFloat(shape.y) || 0;
            const w = parseFloat(shape.width) || 0;
            const h = parseFloat(shape.height) || 0;
            const rot = parseFloat(shape.rotation) || 0;

            if (rot === 0) {
                return { minX: x, minY: y, maxX: x + w, maxY: y + h, width: w, height: h };
            }

            const cx = w / 2;
            const cy = h / 2;
            const radians = rot * (Math.PI / 180);
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const corners = [
                { x: 0, y: 0 },
                { x: w, y: 0 },
                { x: w, y: h },
                { x: 0, y: h }
            ];

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            corners.forEach(p => {
                // Rotate around center
                const rx = cx + (p.x - cx) * cos - (p.y - cy) * sin;
                const ry = cy + (p.x - cx) * sin + (p.y - cy) * cos;
                
                // Add global offset
                const gx = x + rx;
                const gy = y + ry;

                minX = Math.min(minX, gx);
                minY = Math.min(minY, gy);
                maxX = Math.max(maxX, gx);
                maxY = Math.max(maxY, gy);
            });

            return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        },

        get designDimensions() {
            if (this.shapes.length === 0) return { width: 0, height: 0, area: 0, areaCm2: 0 };

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            this.shapes.forEach(s => {
                const box = this.getShapeBoundingBox(s);
                minX = Math.min(minX, box.minX);
                minY = Math.min(minY, box.minY);
                maxX = Math.max(maxX, box.maxX);
                maxY = Math.max(maxY, box.maxY);
            });

            if (minX === Infinity) return { width: 0, height: 0, area: 0, areaCm2: 0 };

            const width = maxX - minX;
            const height = maxY - minY;
            const area = width * height;
            
            // Calculate area in cm2
            const w_cm = this.toCm(width);
            const h_cm = this.toCm(height);
            const areaCm2 = w_cm * h_cm;

            return { width, height, area, areaCm2, minX, minY, maxX, maxY };
        },

        get dimensionsFormatted() {
            const dims = this.designDimensions;
            const w = parseFloat(dims.width.toFixed(2));
            const h = parseFloat(dims.height.toFixed(2));
            return `${w} x ${h} ${this.unit}`;
        },

        get areaTotalFormatted() {
            const dims = this.designDimensions;
            const a = parseFloat(dims.area.toFixed(2));
            return `${a} ${this.unit}²`;
        },

        get areaFormatted() {
             return this.areaTotalFormatted;
        },

        toCm(val) {
            if (this.unit === 'mm') return val / 10;
            if (this.unit === 'inch') return val * 2.54;
            return val;
        },

        get totalAreaCm2() {
            return this.designDimensions.areaCm2;
        },

        get totalPrice() {
            let totalCuttingCost = 0;

            const sheetW = parseFloat(this.sheetWidth) || 1;
            const sheetH = parseFloat(this.sheetHeight) || 1;
            const sheetAreaCm2 = sheetW * sheetH;
            const sheetPrice = parseFloat(this.sheetPrice) || 0;
            const cuttingPrice = parseFloat(this.cuttingPricePerHour) || 0;

            // Material Cost based on Bounding Box Area
            const usedAreaCm2 = this.designDimensions.areaCm2;
            const totalBaseCost = (sheetAreaCm2 > 0) ? (usedAreaCm2 / sheetAreaCm2) * sheetPrice : 0;

            this.shapes.forEach(shape => {
                const w_cm = this.toCm(parseFloat(shape.width) || 0);
                const h_cm = this.toCm(parseFloat(shape.height) || 0);
                
                // Cutting Cost (Perimeter)
                let perimeter_cm = 0;
                const type = shape.shapeType;
                if (type === 'rectangle') perimeter_cm = 2 * (w_cm + h_cm);
                else if (type === 'oval') {
                    const a = w_cm/2;
                    const b = h_cm/2;
                    perimeter_cm = Math.PI * (3*(a+b) - Math.sqrt((3*a+b)*(a+3*b)));
                }
                else perimeter_cm = (w_cm + h_cm) * 2;
                
                if (shape.holes.length > 0) {
                    const r_cm = this.toCm((parseFloat(shape.holeDiameter)||0) / 2);
                    const holePerimeter = 2 * Math.PI * r_cm;
                    perimeter_cm += shape.holes.length * holePerimeter;
                }

                const speedCmHr = 6000;
                const cuttingTimeHr = perimeter_cm / speedCmHr;
                totalCuttingCost += cuttingTimeHr * cuttingPrice;
            });
            
            const baseCost = totalBaseCost + totalCuttingCost;
            const profitMargin = parseFloat(this.profitMargin) || 0;
            const profit = baseCost * (profitMargin / 100);
            
            return (baseCost + profit).toFixed(2);
        },

        get currencySymbol() {
            return this.currencies.find(c => c.code === this.currency)?.symbol || '$';
        },
        
        get labelScale() {
            if (this.unit === 'mm') return 10;
            if (this.unit === 'inch') return 0.4;
            return 1;
        },

        t(key) { 
            if (!i18n[this.lang]) {
                console.warn('Language not found:', this.lang);
                return i18n['ar'][key] || key;
            }
            return i18n[this.lang][key] || key; 
        },

        init() {
            // Initialize Monetization Listeners
            window.addEventListener('ad-modal-open', () => {
                this.showAdModal = true;
                this.adTimer = 5;
            });
            
            window.addEventListener('ad-timer-tick', (e) => {
                this.adTimer = e.detail;
            });
            
            window.addEventListener('ad-modal-close', () => {
                this.showAdModal = false;
            });

            window.addEventListener('show-upgrade-modal', () => {
                    this.showPricingModal = true;
                });

                // Google Auth Callback Handler
                // Handled globally outside Alpine to avoid scope issues
                
                // Fallback Event Listener
                window.addEventListener('google-auth-success', (e) => {
                    console.log('Alpine caught google-auth-success event', e.detail);
                    this.handleGoogleLogin(e.detail);
                });

                // Handle Resize
            const updateSidebar = () => {
                 this.showSidebar = window.innerWidth >= 768;
            };
            window.addEventListener('resize', updateSidebar);

            // Validate Language
            if (!i18n[this.lang]) {
                console.warn('Invalid language detected, resetting to ar');
                this.lang = 'ar';
                localStorage.setItem('acrylic_lang', 'ar');
            }

            // Check Auth
            if (this.user) {
                auth.getProfile().then(u => this.user = u);
            }

            // Load saved model
            const saved = localStorage.getItem('acrylic-pro-v1');
            if (saved) {
                try {
                    const d = JSON.parse(saved);
                    // Legacy support
                    if (!d.shapes) {
                        this.shapes[0].width = d.width;
                        this.shapes[0].height = d.height;
                        this.unit = d.unit;
                        this.shapes[0].shapeType = d.shapeType || 'rectangle';
                        this.shapes[0].cornerType = d.cornerType;
                        this.shapes[0].holePattern = d.holePattern;
                        this.currency = d.currency || 'USD';
                        
                        if (d.holeDiameterMm && !d.holeDiameter) {
                            const val = d.holeDiameterMm;
                            if (this.unit === 'cm') this.shapes[0].holeDiameter = parseFloat((val / 10).toFixed(2));
                            else if (this.unit === 'inch') this.shapes[0].holeDiameter = parseFloat((val / 25.4).toFixed(2));
                            else this.shapes[0].holeDiameter = val;
                        } else {
                            this.shapes[0].holeDiameter = d.holeDiameter || (this.unit==='mm'?8:(this.unit==='inch'?0.3:0.8));
                        }
                        if (d.holeMargin) this.shapes[0].holeMargin = d.holeMargin;
                    } else {
                        // New format support
                        this.shapes = d.shapes;
                        this.unit = d.unit;
                        this.currency = d.currency;
                        this.activeShapeId = this.shapes[0].id;
                    }
                } catch(e) { console.error(e); }
            }

            // Fetch Public Stats
            auth.getPublicStats().then(stats => {
                if(stats) this.publicStats = stats;
            }).catch(e => console.error('Failed to fetch stats', e));
            
            // Watchers - Save on any change
            this.$watch('shapes', () => { 
                this.save(); 
                // We need to re-calc holes if something changed deep, 
                // but since we call updateHoles in setters, it should be fine.
                // However, let's ensure holes are updated for all shapes on load
            }, {deep: true});

            this.$watch('unit', (newVal, oldVal) => { 
                 const toCm = { 'mm': 0.1, 'cm': 1, 'inch': 2.54 };
                 if (!oldVal) return;
                 
                 const factor = toCm[oldVal] / toCm[newVal];
                 if (!factor || factor === 1) return;

                 this.shapes.forEach(s => {
                     s.width = parseFloat((s.width * factor).toFixed(2));
                     s.height = parseFloat((s.height * factor).toFixed(2));
                     s.cornerRadius = parseFloat((s.cornerRadius * factor).toFixed(2));
                     s.holeDiameter = parseFloat((s.holeDiameter * factor).toFixed(2));
                     s.holeMargin = parseFloat((s.holeMargin * factor).toFixed(2));
                     this.updateHoles(s);
                 });
                 
                 this.save(); 
            });
            
            this.$watch('currency', () => { this.save(); });
            
            this.$watch('theme', (val) => {
                localStorage.setItem('acrylic_theme', val);
                if(val==='dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            });

            this.$watch('lang', (val) => {
                localStorage.setItem('acrylic_lang', val);
                // Re-init tour language if active
                if (window.TourService) window.TourService.init(val);
            });

            this.shapes.forEach(s => this.updateHoles(s));
            
            this.$nextTick(() => {
                this.centerView();
                window.addEventListener('resize', () => this.centerView());
                
                // Simulate Loading
                setTimeout(() => {
                    this.loading = false;
                    
                    // Start Tour
                    try {
                        if (window.TourService) {
                            window.TourService.init(this.lang);
                            window.TourService.start(false, this.lang);
                        }
                    } catch (e) {
                        console.error("Tour start failed:", e);
                    }
                }, 1000);
            });

            // Register Service Worker for Updates
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js').then(reg => {
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.updateAvailable = true;
                            }
                        });
                    });
                });
            }
        },

        save() {
            localStorage.setItem('acrylic-pro-v1', JSON.stringify({
                shapes: this.shapes,
                unit: this.unit,
                currency: this.currency
            }));
        },

        toggleTheme() { this.theme = this.theme === 'dark' ? 'light' : 'dark'; },
        toggleLang() { this.lang = this.lang === 'ar' ? 'en' : 'ar'; },
        
        hardReset() {
            if(confirm(this.lang==='ar' ? 'هل أنت متأكد؟ سيتم إعادة ضبط الإعدادات فقط.' : 'Are you sure? Only settings will be reset.')) {
                // Preserve Auth & Important Data
                const token = localStorage.getItem('token');
                const user = localStorage.getItem('user');
                const cookieConsent = localStorage.getItem('cookieConsent');

                localStorage.clear();

                // Restore Auth
                if (token) localStorage.setItem('token', token);
                if (user) localStorage.setItem('user', user);
                if (cookieConsent) localStorage.setItem('cookieConsent', cookieConsent);

                window.location.reload();
            }
        },
        
        refreshApp() {
             if (navigator.serviceWorker.controller) {
                 navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                 window.location.reload();
             }
        },

        restartTour() {
            if (window.TourService) {
                window.TourService.start(true, this.lang);
            }
        },
        
        centerView() {
            const canvas = this.$refs.svg;
            if(!canvas) return;
            
            const screenW = canvas.clientWidth || 800;
            const screenH = canvas.clientHeight || 600;
            
            const dims = this.designDimensions;
            let minX = dims.minX;
            let minY = dims.minY;
            let maxX = dims.maxX;
            let maxY = dims.maxY;
            
            if (minX === Infinity) { minX = 0; minY = 0; maxX = 50; maxY = 30; }

            const contentW = maxX - minX;
            const contentH = maxY - minY;
            const margin = 1.1; // 10% margin

            const kx = screenW / (contentW * margin);
            const ky = screenH / (contentH * margin);
            
            this.zoom = Math.min(kx, ky);
            
            // Center the content
            this.pan.x = (screenW - contentW * this.zoom) / 2 - minX * this.zoom;
            this.pan.y = (screenH - contentH * this.zoom) / 2 - minY * this.zoom;
        },

        onWheel(e) {
            const factor = Math.pow(1.001, -e.deltaY);
            const newZoom = this.zoom * factor;
            if (newZoom < 0.1 || newZoom > 5000) return;
            
            const rect = this.$refs.svg.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            
            const objX = (mx - this.pan.x) / this.zoom;
            const objY = (my - this.pan.y) / this.zoom;
            
            this.zoom = newZoom;
            this.pan.x = mx - objX * this.zoom;
            this.pan.y = my - objY * this.zoom;
        },

        onStartPan(e) {
            console.log('onStartPan', e);
            this.isPanning = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        },
        
        panView(e) {
            if (!this.isPanning) return;
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
            this.pan.x += dx;
            this.pan.y += dy;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        },
        
        onEndPan() { 
            console.log('onEndPan');
            this.isPanning = false; 
        },

        onStartTouch(e) { if(e.touches.length === 1) this.onStartPan(e.touches[0]); },
        moveTouch(e) { if(e.touches.length === 1) this.panView(e.touches[0]); },
        endTouch() { this.onEndPan(); },

        zoomIn() { this.zoom *= 1.2; },
        zoomOut() { this.zoom *= 0.8; },
        resetView() { this.zoom = 1; this.centerView(); },

        getShapePoints(shape) {
            const w = parseFloat(shape.width) || 0;
            const h = parseFloat(shape.height) || 0;
            const type = shape.shapeType;
            const pts = [];
            
            if (type === 'rectangle') {
                const r = shape.cornerType === 'rounded' ? (parseFloat(shape.cornerRadius) || 0) : 0;
                const b = -0.41421356; 
                
                if (r > 0) {
                    return [
                        {x: w-r, y: h, bulge: b},
                        {x: w, y: h-r, bulge: 0},
                        {x: w, y: r, bulge: b},
                        {x: w-r, y: 0, bulge: 0},
                        {x: r, y: 0, bulge: b},
                        {x: 0, y: r, bulge: 0},
                        {x: 0, y: h-r, bulge: b},
                        {x: r, y: h, bulge: 0}
                    ];
                } else {
                    return [
                        {x: 0, y: h, bulge: 0},
                        {x: w, y: h, bulge: 0},
                        {x: w, y: 0, bulge: 0},
                        {x: 0, y: 0, bulge: 0}
                    ];
                }
            } else if (type === 'oval') {
                const cx = w/2, cy = h/2, rx = w/2, ry = h/2;
                const steps = 128;
                for(let i=0; i<steps; i++) {
                    const t = (Math.PI/2) - (i / steps) * 2 * Math.PI;
                    pts.push({
                        x: cx + rx * Math.cos(t),
                        y: cy + ry * Math.sin(t),
                        bulge: 0
                    });
                }
                return pts;
            } else if (['pentagon', 'hexagon'].includes(type)) {
                const sides = type === 'pentagon' ? 5 : 6;
                const cx = w/2, cy = h/2, rx = w/2, ry = h/2;
                for(let i=0; i<sides; i++) {
                     const angle = (2 * Math.PI * i) / sides - Math.PI/2; 
                     pts.push({
                         x: cx + rx * Math.cos(angle),
                         y: cy + ry * Math.sin(angle),
                         bulge: 0
                     });
                }
                return pts;
            } else if (type === 'star') {
                 const points = 5;
                 const ratio = 0.5;
                 const cx = w/2, cy = h/2, rx = w/2, ry = h/2;
                 const step = Math.PI / points;
                 for (let i = 0; i < 2 * points; i++) {
                    const r = (i % 2 === 0) ? 1 : ratio;
                    const angle = i * step - Math.PI/2;
                    pts.push({
                        x: cx + rx * r * Math.cos(angle),
                        y: cy + ry * r * Math.sin(angle),
                        bulge: 0
                    });
                 }
                 return pts;
            }
            return [];
        },

        // --- Payment Logic ---

        buyPlan(plan) {
            if (!this.user) {
                this.showLoginModal = true;
                return;
            }
            const prices = { 'starter': 3, 'pro': 7, 'business': 30 };
            this.payPalAmount = prices[plan];
            this.payPalDescription = `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
            this.payPalItemType = 'plan';
            this.payPalItemValue = plan;
            this.showPricingModal = false;
            this.showPayPalModal = true;
            this.renderPayPalButton();
        },

        buyCredits(amount, price) {
            if (!this.user) {
                this.showLoginModal = true;
                return;
            }
            this.payPalAmount = price;
            this.payPalDescription = `Buy ${amount} Exports`;
            this.payPalItemType = 'credits';
            this.payPalItemValue = amount;
            this.showPricingModal = false;
            this.showPayPalModal = true;
            this.renderPayPalButton();
        },

        renderPayPalButton() {
            const container = document.getElementById('paypal-button-container');
            container.innerHTML = ''; // Clear previous buttons

            if (window.paypal) {
                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: this.payPalDescription,
                                amount: {
                                    value: this.payPalAmount
                                }
                            }]
                        });
                    },
                    onApprove: async (data, actions) => {
                        // Capture the funds from the transaction
                        const order = await actions.order.capture();
                        
                        // Call your server to save the transaction
                        this.verifyPaymentOnServer(order);
                    },
                    onError: (err) => {
                        console.error(err);
                        alert('Payment failed. Please try again.');
                    }
                }).render('#paypal-button-container');
            }
        },

        async verifyPaymentOnServer(order) {
            this.loading = true;
            try {
                // Determine what was bought
                const payload = {
                    userId: this.user.id,
                    orderId: order.id,
                    amount: this.payPalAmount,
                    currency: 'USD',
                    status: order.status,
                    payerEmail: order.payer.email_address
                };

                if (this.payPalItemType === 'plan') {
                    payload.plan = this.payPalItemValue;
                } else {
                    payload.credits = this.payPalItemValue;
                }

                // In a real scenario, we send the orderID to the backend and let the backend verify with PayPal
                // Here we are sending the captured order details for simplicity, but ideally verify-paypal endpoint should re-fetch
                
                const response = await fetch('/api/payment/verify-paypal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Payment successful! Your account has been updated.');
                    this.showPayPalModal = false;
                    // Refresh user data
                    const userRes = await fetch('/api/auth/me', {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    });
                    if (userRes.ok) {
                        this.user = await userRes.json();
                        auth.user = this.user;
                    }
                } else {
                    alert('Payment verification failed: ' + result.error);
                }
            } catch (e) {
                console.error(e);
                alert('Server error during verification');
            } finally {
                this.loading = false;
            }
        },

        async exportDXF() {
            if (!this.user) {
                this.showLoginModal = true;
                return;
            }
            
            // Monetization Check
            window.Monetization.executeProtectedAction(async () => {
                try {
                    const res = await auth.deductCredit('dxf', 'export.dxf');
                    if (!res.success) {
                        if (res.message.includes('credits')) this.showPricingModal = true;
                        alert(res.message);
                        return;
                    }
                    this.user = auth.user;
                } catch (e) {
                    alert(e.message);
                    return;
                }

                let dxf = "0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
                let scale = 1;
                if (this.unit === 'cm') scale = 10;
                else if (this.unit === 'inch') scale = 25.4;

                this.shapes.forEach(shape => {
                    const shapePts = this.getShapePoints(shape);
                    const ox = parseFloat(shape.x) || 0;
                    const oy = parseFloat(shape.y) || 0;

                    if (shapePts.length > 0) {
                        dxf += "0\nLWPOLYLINE\n8\n0\n90\n" + shapePts.length + "\n70\n1\n"; 
                        shapePts.forEach(p => {
                            dxf += `10\n${(p.x + ox) * scale}\n20\n${(p.y + oy) * scale}\n`;
                            if (p.bulge && p.bulge !== 0) {
                                dxf += `42\n${p.bulge}\n`;
                            }
                        });
                    }
                    
                    const holeR = (parseFloat(shape.holeDiameter)||0) / 2 * scale;
                    shape.holes.forEach(hole => {
                        const hx = (hole.x + ox) * scale;
                        const hy = (hole.y + oy) * scale;
                        dxf += `0\nCIRCLE\n8\n0\n10\n${hx}\n20\n${hy}\n40\n${holeR}\n`;
                    });
                });
                
                // Add Watermark for Free Plan
                const plan = window.Monetization.getUserPlan();
                if (plan.watermark) {
                     const dims = this.designDimensions;
                     const cx = ((dims.minX + dims.maxX) / 2) * scale;
                     const cy = ((dims.minY + dims.maxY) / 2) * scale;
                     const h = Math.max(dims.height * 0.05, 5) * scale; // 5% of height
                     
                     dxf += `0\nTEXT\n8\nWATERMARK\n62\n9\n10\n${cx}\n20\n${cy}\n40\n${h}\n1\nCreated with AcrylicGen Free\n72\n4\n11\n${cx}\n21\n${cy}\n`;
                }

                dxf += "0\nENDSEC\n0\nEOF";
                this.download(dxf, `design_${Date.now()}.dxf`, "application/dxf");
            });
        },

        async exportSVG() {
            if (!this.user) {
                this.showLoginModal = true;
                return;
            }

            // Monetization Check
            window.Monetization.executeProtectedAction(async () => {
                try {
                    const res = await auth.deductCredit('svg', 'export.svg');
                    if (!res.success) {
                        if (res.message.includes('credits')) this.showPricingModal = true;
                        alert(res.message);
                        return;
                    }
                    this.user = auth.user;
                } catch (e) {
                    alert(e.message);
                    return;
                }
    
                // Calculate bounding box for SVG viewbox
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                this.shapes.forEach(s => {
                    const x = parseFloat(s.x) || 0;
                    const y = parseFloat(s.y) || 0;
                    const w = parseFloat(s.width) || 0;
                    const h = parseFloat(s.height) || 0;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x + w);
                    maxY = Math.max(maxY, y + h);
                });
                
                if (minX === Infinity) { minX = 0; minY = 0; maxX = 50; maxY = 30; }
                
                const totalW = maxX - minX;
                const totalH = maxY - minY;
    
                let svgContent = '';
                this.shapes.forEach(shape => {
                    const ox = (parseFloat(shape.x) || 0) - minX; // Normalize to 0,0 based on min
                    const oy = (parseFloat(shape.y) || 0) - minY;
                    
                    svgContent += `<g transform="translate(${ox}, ${oy})">
                        <path d="${this.getShapePath(shape)}" fill="none" stroke="black" stroke-width="0.5" />
                        <path d="${this.getHolesPath(shape)}" fill="none" stroke="red" stroke-width="0.5" />
                    </g>`;
                });
    
                // Add Watermark for Free Plan
                const plan = window.Monetization.getUserPlan();
                if (plan.watermark) {
                    svgContent += `<text x="${totalW/2}" y="${totalH/2}" text-anchor="middle" fill="rgba(0,0,0,0.1)" font-size="${Math.max(totalH/20, 2)}" transform="rotate(-45, ${totalW/2}, ${totalH/2})">Created with AcrylicGen Free</text>`;
                }
    
                const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalW}${this.unit}" height="${totalH}${this.unit}" viewBox="0 0 ${totalW} ${totalH}">
      ${svgContent}
    </svg>`;
                this.download(svg, "design.svg", "image/svg+xml");
            });
        },

        download(content, name, type) {
            const blob = new Blob([content], {type});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = name;
            link.click();
        },

        // renderedShapes getter removed in favor of x-for in HTML

        handleShapeClick(e) {
            // Deprecated: Logic moved to startShapeDrag, but kept for fallback
            const g = e.target.closest('g[data-id]');
            if (g) {
                const id = parseInt(g.dataset.id);
                this.selectShape(id);
            }
        },

        // --- Drag & Drop & Snapping ---

        startShapeDrag(e, id) {
            // If touch event, get first touch
            const evt = e.touches ? e.touches[0] : e;
            
            this.isDraggingShape = true;
            this.draggedShapeId = id;
            this.selectShape(id);
            
            const shape = this.shapes.find(s => s.id === id);
            if(!shape) return;

            // Calculate offset from shape origin (top-left) to mouse position in world coordinates
            // World Mouse = (Screen Mouse - Pan) / Zoom
            const rect = this.$refs.svg.getBoundingClientRect();
            const mouseX = (evt.clientX - rect.left - this.pan.x) / this.zoom;
            const mouseY = (evt.clientY - rect.top - this.pan.y) / this.zoom;

            this.dragOffset = {
                x: mouseX - shape.x,
                y: mouseY - shape.y
            };
        },

        onMouseMove(e) {
            // console.log('onMouseMove'); // Too verbose
            const evt = e.touches ? e.touches[0] : e;
            
            if (this.isDraggingShape && this.draggedShapeId) {
                const shape = this.shapes.find(s => s.id === this.draggedShapeId);
                if (shape) {
                    const rect = this.$refs.svg.getBoundingClientRect();
                    const mouseX = (evt.clientX - rect.left - this.pan.x) / this.zoom;
                    const mouseY = (evt.clientY - rect.top - this.pan.y) / this.zoom;

                    let newX = mouseX - this.dragOffset.x;
                    let newY = mouseY - this.dragOffset.y;

                    // Apply Snapping
                    if (this.snapEnabled) {
                        const snapped = this.applySnapping(shape, newX, newY);
                        newX = snapped.x;
                        newY = snapped.y;
                    }

                    shape.x = parseFloat(newX.toFixed(2));
                    shape.y = parseFloat(newY.toFixed(2));
                }
            } else if (this.isPanning) {
                this.panView(evt);
            }
        },

        onMouseUp(e) {
            console.log('onMouseUp');
            this.isDraggingShape = false;
            this.draggedShapeId = null;
            this.onEndPan();
        },

        applySnapping(shape, x, y) {
            let snappedX = x;
            let snappedY = y;
            const logicalThreshold = this.snapThreshold;
            
            // Grid Snap (Fallback)
            if (this.snapEnabled) {
                snappedX = Math.round(x);
                snappedY = Math.round(y);
            }

            // Get Bounding Box for current shape (at proposed position x,y)
            // We need to construct a dummy shape to get the correct bounding box dimensions and offset
            const dummy = {...shape, x: x, y: y};
            const box = this.getShapeBoundingBox(dummy);
            
            const left = box.minX;
            const right = box.maxX;
            const top = box.minY;
            const bottom = box.maxY;
            const w = box.width;
            const h = box.height;

            // Offset from Origin (x,y) to Bounding Box Top-Left (minX, minY)
            const offsetX = box.minX - x;
            const offsetY = box.minY - y;

            let minXDist = logicalThreshold;
            let minYDist = logicalThreshold;

            // Check against other shapes
            this.shapes.forEach(other => {
                if (other.id === shape.id) return;
                
                const oBox = this.getShapeBoundingBox(other);
                const oLeft = oBox.minX;
                const oRight = oBox.maxX;
                const oTop = oBox.minY;
                const oBottom = oBox.maxY;

                // X Snapping - Find closest
                // Left to Right
                let dist = Math.abs(left - oRight);
                if (dist < minXDist) { minXDist = dist; snappedX = oRight - offsetX; }
                
                // Right to Left
                dist = Math.abs(right - oLeft);
                if (dist < minXDist) { minXDist = dist; snappedX = oLeft - w - offsetX; }
                
                // Left to Left
                dist = Math.abs(left - oLeft);
                if (dist < minXDist) { minXDist = dist; snappedX = oLeft - offsetX; }
                
                // Right to Right
                dist = Math.abs(right - oRight);
                if (dist < minXDist) { minXDist = dist; snappedX = oRight - w - offsetX; }

                // Y Snapping - Find closest
                // Top to Bottom
                dist = Math.abs(top - oBottom);
                if (dist < minYDist) { minYDist = dist; snappedY = oBottom - offsetY; }
                
                // Bottom to Top
                dist = Math.abs(bottom - oTop);
                if (dist < minYDist) { minYDist = dist; snappedY = oTop - h - offsetY; }
                
                // Top to Top
                dist = Math.abs(top - oTop);
                if (dist < minYDist) { minYDist = dist; snappedY = oTop - offsetY; }
                
                // Bottom to Bottom
                dist = Math.abs(bottom - oBottom);
                if (dist < minYDist) { minYDist = dist; snappedY = oBottom - h - offsetY; }
            });
            
            // Snap to Sheet Boundaries
            const sheetW = parseFloat(this.sheetWidth) || 1000;
            const sheetH = parseFloat(this.sheetHeight) || 1000;

            // Left Edge (0)
            if (Math.abs(left) < minXDist) { minXDist = Math.abs(left); snappedX = 0 - offsetX; }
            
            // Right Edge (SheetW)
            if (Math.abs(right - sheetW) < minXDist) { minXDist = Math.abs(right - sheetW); snappedX = sheetW - w - offsetX; }

            // Top Edge (0)
            if (Math.abs(top) < minYDist) { minYDist = Math.abs(top); snappedY = 0 - offsetY; }

            // Bottom Edge (SheetH)
            if (Math.abs(bottom - sheetH) < minYDist) { minYDist = Math.abs(bottom - sheetH); snappedY = sheetH - h - offsetY; }

            return { x: snappedX, y: snappedY };
        },

        // --- Shape Actions ---

        rotateSelectedShape() {
            if (!this.activeShape) return;
            const current = this.activeShape.rotation || 0;
            this.activeShape.rotation = (current + 90) % 360;
            
            // If rotated 90 or 270, conceptually width and height swap for bounding box
            // But we keep w/h properties as is, just render with rotation.
            // For nesting, we might need to physically swap dimensions if we want true "rotation" in data.
            // But visually rotating is safer for now.
        },

        duplicateSelectedShape() {
            if (!this.activeShape) return;
            const original = this.activeShape;
            const copy = JSON.parse(JSON.stringify(original));
            copy.id = Date.now();
            copy.name = original.name + ' (Copy)';
            
            // Calculate new position with boundary check
            const sheetW = parseFloat(this.sheetWidth) || 1000;
            const sheetH = parseFloat(this.sheetHeight) || 1000;
            
            // Get dimensions from bounding box to handle rotation
            const dummy = {...copy, x: 0, y: 0};
            const box = this.getShapeBoundingBox(dummy);
            const w = box.width;
            const h = box.height;
            const offsetX = box.minX;
            const offsetY = box.minY;

            let newX = parseFloat(original.x) + 10;
            let newY = parseFloat(original.y) + 10;

            // Clamp to boundaries based on Bounding Box
            // Right Edge: newX + offsetX + w <= sheetW
            if (newX + offsetX + w > sheetW) newX = Math.max(0, sheetW - w - offsetX);
            
            // Bottom Edge: newY + offsetY + h > sheetH
            if (newY + offsetY + h > sheetH) newY = Math.max(0, sheetH - h - offsetY);
            
            // Left Edge: newX + offsetX < 0
            if (newX + offsetX < 0) newX = -offsetX;
            
            // Top Edge: newY + offsetY < 0
            if (newY + offsetY < 0) newY = -offsetY;

            copy.x = newX;
            copy.y = newY;
            this.shapes.push(copy);
            this.selectShape(copy.id);
        },

        // --- Nesting Logic ---

        fillSheet() {
            if (!this.activeShape) return;
            
            window.Monetization.executeProtectedAction(() => {
                const shape = this.activeShape;
                // Use Bounding Box for dimensions to support rotation
                const dummy = JSON.parse(JSON.stringify(shape));
                dummy.x = 0; dummy.y = 0;
                const box = this.getShapeBoundingBox(dummy);
                
                const w = box.width;
                const h = box.height;
                
                if (w <= 0 || h <= 0) return;
    
                const sheetW = parseFloat(this.nestingSheetWidth) || 1000;
                const sheetH = parseFloat(this.nestingSheetHeight) || 1000;
                const margin = parseFloat(this.nestingMargin) || 0;
    
                let countToAdd = 0;
    
                if (this.fillCount && this.fillCount > 0) {
                    countToAdd = parseInt(this.fillCount);
                } else {
                    // Auto calculation
                    // Capacity = (SheetW + Margin) / (ShapeW + Margin)
                    // Using floor to be safe
                    const cols = Math.floor((sheetW + margin) / (w + margin));
                    const rows = Math.floor((sheetH + margin) / (h + margin));
                    const maxPossible = cols * rows;
                    
                    // Subtract existing shapes to avoid overflow
                    // We assume user wants to fill the board to capacity
                    const currentCount = this.shapes.length;
                    countToAdd = Math.max(0, maxPossible - currentCount);
    
                    // Limit to avoid browser crash
                    countToAdd = Math.min(countToAdd, 500); 
                }
    
                if (countToAdd <= 0) return;
    
                if (countToAdd > 100) {
                    if (!confirm(this.t('fill_warning'))) return;
                }
    
                this.loading = true;
                
                // Use setTimeout to allow UI to update loading state
                setTimeout(() => {
                    for (let i = 0; i < countToAdd; i++) {
                        const copy = JSON.parse(JSON.stringify(shape));
                        copy.id = Date.now() + i;
                        copy.name = shape.name + ' (' + (i+1) + ')';
                        // Initial position doesn't matter, nestShapes will fix it
                        copy.x = 0; 
                        copy.y = 0;
                        this.shapes.push(copy);
                    }
                    
                    // Run nesting immediately (skip monetization check)
                    this.nestShapes(true);
                    // nestShapes will handle loading = false
                }, 50);
            });
        },

        nestShapes(skipMonetization = false) {
            if (this.shapes.length === 0) return;
            
            const action = () => {
                this.loading = true;
    
                // Simulate async for UI update
                setTimeout(() => {
                    const margin = parseFloat(this.nestingMargin) || 0;
                    const sheetW = parseFloat(this.nestingSheetWidth) || 1000;
                    const sheetH = parseFloat(this.nestingSheetHeight) || 1000;
                    
                    // 1. Prepare shapes with Bounding Box info
                    let items = this.shapes.map(s => {
                        const dummy = JSON.parse(JSON.stringify(s));
                        dummy.x = 0;
                        dummy.y = 0;
                        const box = this.getShapeBoundingBox(dummy);
                        
                        return {
                            id: s.id,
                            w: box.width,
                            h: box.height,
                            offsetX: box.minX,
                            offsetY: box.minY,
                            original: s
                        };
                    });
    
                    // 2. Sort by height (descending), then width
                    items.sort((a, b) => (b.h - a.h) || (b.w - a.w));
    
                    const placed = [];
                    let overflowCount = 0;
    
                    items.forEach(item => {
                        let bestX = -1;
                        let bestY = -1;
                        let found = false;
    
                        // Strategy: Try to place in existing rows (y-levels defined by placed items)
                        // We collect all unique Y coordinates (bottoms of placed items + margin, and 0)
                        // And all unique X coordinates (rights of placed items + margin, and 0)
                        
                        let potentialY = [0];
                        let potentialX = [0];
                        
                        placed.forEach(p => {
                            potentialY.push(p.y + p.h + margin);
                            potentialX.push(p.x + p.w + margin);
                        });
                        
                        // Sort coordinates
                        potentialY = [...new Set(potentialY)].sort((a,b) => a-b);
                        potentialX = [...new Set(potentialX)].sort((a,b) => a-b);
    
                        // Filter valid coordinates within sheet
                        potentialY = potentialY.filter(y => y + item.h <= sheetH);
                        potentialX = potentialX.filter(x => x + item.w <= sheetW);
    
                        // Search Loop: Top-Left strategy (Y then X)
                        searchLoop:
                        for (let y of potentialY) {
                            for (let x of potentialX) {
                                // Check collision with all placed items
                                let collision = false;
                                for (let p of placed) {
                                    if (this.rectIntersect(x, y, item.w, item.h, p.x, p.y, p.w, p.h)) {
                                        collision = true;
                                        break;
                                    }
                                }
                                
                                if (!collision) {
                                    bestX = x;
                                    bestY = y;
                                    found = true;
                                    break searchLoop;
                                }
                            }
                        }
    
                        if (found) {
                            placed.push({
                                id: item.id,
                                x: bestX,
                                y: bestY,
                                w: item.w,
                                h: item.h
                            });
                            // Apply offset to get correct origin position
                            item.original.x = parseFloat((bestX - item.offsetX).toFixed(2));
                            item.original.y = parseFloat((bestY - item.offsetY).toFixed(2));
                        } else {
                            // Overflow!
                            overflowCount++;
                            // Place outside to the right of the sheet
                            item.original.x = sheetW + 20 - item.offsetX;
                            item.original.y = (overflowCount - 1) * 10 - item.offsetY;
                        }
                    });
    
                    this.centerView();
                    this.loading = false;
                    
                    if (overflowCount > 0) {
                        alert(this.lang === 'ar' 
                            ? `تم ترتيب الأشكال، لكن ${overflowCount} شكل لم يكفهم اللوح!` 
                            : `Nested, but ${overflowCount} shapes did not fit on the sheet!`);
                    } else {
                        alert(this.lang === 'ar' ? 'تم ترتيب الأشكال بنجاح!' : 'Shapes nested successfully!');
                    }
                }, 100);
            };

            if (skipMonetization) { action(); }
            else { window.Monetization.executeProtectedAction(action); }
        },

        rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
            const margin = 0.1; // epsilon
            return x1 < x2 + w2 - margin && x1 + w1 - margin > x2 &&
                   y1 < y2 + h2 - margin && y1 + h1 - margin > y2;
        },
    }; // Close return object
    } catch (e) {
        console.error("App initialization failed:", e);
        if (window.Diagnostics) window.Diagnostics.run();
        else alert("System Error: " + e.message);
        return {
            t: (k) => k,
            loading: false,
            shapes: [],
            user: null,
            showPricingModal: false,
            showLoginModal: false,
            showRegisterModal: false,
            showDashboardModal: false,
            showAdminModal: false,
            showForgotPasswordModal: false,
            showHistoryModal: false,
            unit: 'cm',
            authLogin: { email: '', password: '' },
            authRegister: { name: '', email: '', password: '' },
            forgotPasswordEmail: '',
            // Monetization Integration
            adTimer: 5,
            showAdModal: false,
            
            init() {
                // Initialize Monetization Listeners
                window.addEventListener('ad-modal-open', () => {
                    this.showAdModal = true;
                    this.adTimer = 5;
                });
                
                window.addEventListener('ad-timer-tick', (e) => {
                    this.adTimer = e.detail;
                });
                
                window.addEventListener('ad-modal-close', () => {
                    this.showAdModal = false;
                });

                window.addEventListener('show-upgrade-modal', () => {
                    this.showPricingModal = true;
                });
            },
            
            // Dummy handlers to prevent crashes
            onMouseMove(e) {},
            onMouseUp(e) {},
            onWheel(e) {},
            onStartPan(e) {},
            panView(e) {},
            onEndPan(e) {},
            onStartTouch(e) {},
            onMoveTouch(e) {},
            onEndTouch(e) {},
            startShapeDrag(e) {},
            selectShape(id) {},
            removeShape(id) {},
            addShape() {},
            duplicateSelectedShape() {},
            rotateSelectedShape() {},
            nestShapes() {},
            fillSheet() {},
            zoomIn() {},
            zoomOut() {},
            resetView() {},
            clearAllShapes() {},
            loadHistory() {},
            openAdminDashboard() {},
            logout() {},
            buyPlan() {},
            buyCredits() {},
            getShapePath() { return ''; },
            getHolesPath() { return ''; },
            getShapeBoundingBox() { return {minX:0, minY:0, maxX:0, maxY:0, width:0, height:0}; }
        };
    }
}
window.app = app;
    // Expose app function globally
    window.app = app;

    // Setup Google Auth Handler Outside Alpine Scope
    window.handleGoogleCredentialResponse = (response) => {
        console.log('Google Auth Response Received (Global):', response);
        // Dispatch event for Alpine to catch
        window.dispatchEvent(new CustomEvent('google-auth-success', { detail: response.credential }));
    };

})();
