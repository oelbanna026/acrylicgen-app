
// SVG Illustrations (Embedded as Data URIs for offline support)
(function() {
const svgs = {
    welcome: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMWUyOTNiIj5BY3J5bGljIERlc2lnbmVyIFBybzwvdGV4dD48L3N2Zz4=`,
    nesting: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZjdmMCIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIiBzdHJva2U9IiNmOTczMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjE0MCIgeT0iNTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZjk3MzE2IiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI1MCIgeT0iMTQwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2Y5NzMxNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMTQwIiB5PSIxNDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZjk3MzE2IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyODAiIHk9IjExMCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2M0MzIwMiI+U21hcnQgTmVzdGluZzwvdGV4dD48L3N2Zz4=`,
    cost: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZmRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjQwIiBmaWxsPSIjMTU4MDNkIj4kJCBDYWxjdWxhdGlvbiAkJDwvdGV4dD48L3N2Zz4=`
};

const i18n = {
    ar: {
        welcome_title: '👋 مرحباً بك في مصمم الأكريليك',
        welcome_desc: 'جولة سريعة (دقيقة واحدة) لتعريفك بأدوات النظام وكيفية تصميم قصات الأكريليك باحترافية.',
        toolbar_title: '🛠️ شريط الأدوات الرئيسية',
        toolbar_desc: 'تحكم كامل في الأشكال:<br>• <b>تدوير:</b> لتغيير زاوية الشكل.<br>• <b>تكرار:</b> لنسخ الشكل الحالي.<br>• <b>محاذاة:</b> للمساعدة في رصف الأشكال بدقة.<br>• <b>ترتيب (Nesting):</b> لترتيب الأشكال تلقائياً.',
        nesting_title: '✨ الترتيب الذكي (Nesting)',
        nesting_desc: 'هذه الميزة الأقوى! تقوم بترتيب الأشكال تلقائياً على اللوح بأقل مساحة ممكنة لتوفير الخامة.',
        layers_title: '📚 إدارة الطبقات',
        layers_desc: 'هنا تجد قائمة بكل الأشكال في تصميمك. يمكنك إضافة شكل جديد (+) أو حذف شكل (×) أو اختياره للتعديل.',
        dims_title: '📏 الأبعاد والقياسات',
        dims_desc: 'تحكم دقيق في:<br>• الطول والعرض.<br>• نوع الزوايا (حادة/دائرية).<br>• أماكن الثقوب والمسامير.',
        canvas_title: '🎨 مساحة العمل',
        canvas_desc: 'هنا يظهر تصميمك النهائي.<br>• <b>سحب وإفلات:</b> لتحريك الأشكال.<br>• <b>عجلة الماوس:</b> للتكبير والتصغير.<br>• <b>ضغط وسحب الخلفية:</b> لتحريك العرض.',
        cost_title: '💰 حساب التكلفة',
        cost_desc: 'أدخل أبعاد وسعر اللوح الخام، وسيقوم النظام بحساب:<br>• المساحة المستهلكة.<br>• سعر القص (بناءً على المحيط).<br>• السعر النهائي مع هامش الربح.',
        export_title: '💾 التصدير والحفظ',
        export_desc: 'انتهيت؟ قم بتصدير الملف بصيغة <b>DXF</b> المتوافقة مع ماكينات الليزر و CNC.',
        help_title: '❓ مساعدة',
        help_desc: 'يمكنك إعادة تشغيل هذه الجولة في أي وقت بالضغط على زر الاستفهام هنا.',
        done: 'إنهاء',
        next: 'التالي',
        prev: 'السابق',
        progress: '{{current}} من {{total}}'
    },
    en: {
        welcome_title: '👋 Welcome to Acrylic Designer',
        welcome_desc: 'A quick tour (1 min) to introduce you to the system tools and how to design acrylic cuts professionally.',
        toolbar_title: '🛠️ Main Toolbar',
        toolbar_desc: 'Full control over shapes:<br>• <b>Rotate:</b> Change shape angle.<br>• <b>Duplicate:</b> Copy current shape.<br>• <b>Snap:</b> Align shapes precisely.<br>• <b>Nest:</b> Arrange shapes automatically.',
        nesting_title: '✨ Smart Nesting',
        nesting_desc: 'The most powerful feature! Automatically arranges shapes on the sheet to minimize waste and save material.',
        layers_title: '📚 Layer Management',
        layers_desc: 'List of all shapes in your design. Add new shapes (+), delete (×), or select them for editing.',
        dims_title: '📏 Dimensions & Specs',
        dims_desc: 'Precise control over:<br>• Width and Height.<br>• Corner types (Sharp/Rounded).<br>• Hole patterns and screw positions.',
        canvas_title: '🎨 Workspace',
        canvas_desc: 'Your final design appears here.<br>• <b>Drag & Drop:</b> Move shapes.<br>• <b>Mouse Wheel:</b> Zoom in/out.<br>• <b>Pan:</b> Click & drag background to move view.',
        cost_title: '💰 Cost Calculation',
        cost_desc: 'Enter raw sheet dimensions and price. System calculates:<br>• Used area.<br>• Cutting cost (based on perimeter).<br>• Final price including profit margin.',
        export_title: '💾 Export & Save',
        export_desc: 'Finished? Export the file as <b>DXF</b> compatible with Laser and CNC machines.',
        help_title: '❓ Help',
        help_desc: 'You can restart this tour anytime by clicking the question mark button here.',
        done: 'Finish',
        next: 'Next',
        prev: 'Previous',
        progress: '{{current}} of {{total}}'
    }
};

const TourService = {
    driver: null,
    lang: 'ar',
    
    init(lang = 'ar') {
        this.lang = lang;
        const t = i18n[lang] || i18n.ar;

        // Robust Driver Initialization
        let driverFunc = null;
        
        // Check for various driver.js export patterns
        if (window.driver && window.driver.js && typeof window.driver.js.driver === 'function') {
             driverFunc = window.driver.js.driver;
        } else if (typeof window.driver === 'function') {
             driverFunc = window.driver;
        } else if (window.driver && typeof window.driver.driver === 'function') {
             driverFunc = window.driver.driver;
        }

        if (!driverFunc) {
            console.warn("Driver.js not found or incompatible. Tour disabled.");
            return;
        }

        try {
            this.driver = driverFunc({
                showProgress: true,
                animate: true,
                allowClose: true,
                stagePadding: 10,
                scrollIntoViewOptions: { behavior: 'smooth', block: 'center', inline: 'center' },
                doneBtnText: t.done,
                nextBtnText: t.next,
                prevBtnText: t.prev,
                progressText: t.progress,
                steps: this.getSteps(t),
                popoverClass: 'custom-driver-popover', // Custom class for styling
                onDestroyStarted: () => {
                    if (!localStorage.getItem('tour_completed')) {
                        this.driver.destroy();
                        localStorage.setItem('tour_completed', 'true');
                    } else {
                        this.driver.destroy();
                    }
                }
            });
        } catch (e) {
            console.error("Failed to initialize driver:", e);
        }
    },

    start(force = false, lang = 'ar') {
        if (!this.driver || this.lang !== lang) this.init(lang);
        if (!this.driver) return; 
        
        const completed = localStorage.getItem('tour_completed');
        if (completed && !force) return;

        setTimeout(() => {
            this.driver.drive();
            if (!completed) {
                localStorage.setItem('tour_completed', 'true');
            }
        }, 1000);
    },

    getSteps(t) {
        return [
            { 
                popover: { 
                    title: t.welcome_title, 
                    description: `${t.welcome_desc}<br><br><img src="${svgs.welcome}" class="rounded mt-2 w-full border border-gray-200 dark:border-gray-700 shadow-sm">`,
                    side: "left", 
                    align: 'center' 
                } 
            },
            { 
                element: '#toolbar-section', 
                popover: { 
                    title: t.toolbar_title, 
                    description: t.toolbar_desc,
                    side: "bottom", 
                    align: 'start' 
                } 
            },
            { 
                element: '#btn-nesting', 
                popover: { 
                    title: t.nesting_title, 
                    description: `${t.nesting_desc}<br><br><img src="${svgs.nesting}" class="rounded mt-2 w-full border border-gray-200 dark:border-gray-700 shadow-sm">`,
                    side: "bottom", 
                    align: 'start' 
                } 
            },
            { 
                element: '#layers-section', 
                popover: { 
                    title: t.layers_title, 
                    description: t.layers_desc,
                    side: "left", 
                    align: 'start' 
                } 
            },
            { 
                element: '#dimensions-section', 
                popover: { 
                    title: t.dims_title, 
                    description: t.dims_desc,
                    side: "left", 
                    align: 'start' 
                } 
            },
            { 
                element: '#canvas-area', 
                popover: { 
                    title: t.canvas_title, 
                    description: t.canvas_desc,
                    side: "right", 
                    align: 'start' 
                } 
            },
            { 
                element: '#cost-section', 
                popover: { 
                    title: t.cost_title, 
                    description: `${t.cost_desc}<br><br><img src="${svgs.cost}" class="rounded mt-2 w-full border border-gray-200 dark:border-gray-700 shadow-sm">`,
                    side: "left", 
                    align: 'end' 
                } 
            },
            { 
                element: '#export-section', 
                popover: { 
                    title: t.export_title, 
                    description: t.export_desc,
                    side: "top", 
                    align: 'end' 
                } 
            },
            { 
                element: '#btn-restart-tour', 
                popover: { 
                    title: t.help_title, 
                    description: t.help_desc,
                    side: "bottom", 
                    align: 'end' 
                } 
            }
        ];
    }
};

    window.TourService = TourService;
})();
