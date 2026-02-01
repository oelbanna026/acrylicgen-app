(function(global) {
    'use strict';

    /**
     * Pure function for calculating acrylic costs
     */
    const AcrylicCalculator = {
        /**
         * Calculate full cost breakdown
         * @param {Object} inputs
         * @returns {Object} Detailed result
         */
        calculate: function(inputs) {
            // Extract and normalize inputs
            const width = Math.max(0, parseFloat(inputs.width) || 0);
            const height = Math.max(0, parseFloat(inputs.height) || 0);
            const sheetWidth = Math.max(1, parseFloat(inputs.sheetWidth) || 1); // Avoid div by zero
            const sheetHeight = Math.max(1, parseFloat(inputs.sheetHeight) || 1);
            const sheetPrice = Math.max(0, parseFloat(inputs.sheetPrice) || 0);
            
            const cuttingTimeMinutes = Math.max(0, parseFloat(inputs.cuttingTimeMinutes) || 0);
            const cuttingPricePerHour = Math.max(0, parseFloat(inputs.cuttingPricePerHour) || 0);
            
            const wastePercent = Math.max(0, parseFloat(inputs.wastePercent) || 0);
            const overheadPercent = Math.max(0, parseFloat(inputs.overheadPercent) || 0);
            const profitPercent = Math.max(0, parseFloat(inputs.profitPercent) || 0);
            
            const quantity = Math.max(1, parseFloat(inputs.quantity) || 1);
            const setupFee = Math.max(0, parseFloat(inputs.setupFee) || 0);
            const minCharge = Math.max(0, parseFloat(inputs.minCharge) || 0);

            // 1. Areas
            const pieceArea = width * height;
            const sheetArea = sheetWidth * sheetHeight;

            // 2. Material Cost
            // Formula: (Piece Area / Sheet Area) * Sheet Price
            const materialCost = (pieceArea / sheetArea) * sheetPrice;

            // 3. Operation Cost (Cutting)
            // Formula: Cutting Time * Cutting Price Per Hour / 60
            const operationCost = cuttingTimeMinutes * (cuttingPricePerHour / 60);

            // 4. Waste Cost
            // Formula: (Material + Operation) * Waste %
            const wasteCost = (materialCost + operationCost) * (wastePercent / 100);

            // 5. Overhead Cost
            // Formula: (Material + Operation + Waste) * Overhead %
            const subTotalOverhead = materialCost + operationCost + wasteCost;
            const overheadCost = subTotalOverhead * (overheadPercent / 100);

            // 6. Total Unit Cost
            // Formula: Material + Operation + Waste + Overhead
            const totalUnitCost = materialCost + operationCost + wasteCost + overheadCost;

            // 7. Unit Price (Selling Price per Piece)
            // Formula: Total Unit Cost * (1 + Profit %)
            const unitPrice = totalUnitCost * (1 + (profitPercent / 100));

            // 8. Total Batch Price (Before Min Charge)
            // Formula: (Unit Price * Quantity) + Setup Fee
            let totalBatchPrice = (unitPrice * quantity) + setupFee;

            // 9. Apply Minimum Charge
            if (totalBatchPrice < minCharge) {
                totalBatchPrice = minCharge;
            }

            // 10. Cost per m2
            // Cost per m2 = Total Unit Cost / (Area in m2)
            const areaM2 = pieceArea / 10000; // cm2 to m2
            const costPerM2 = areaM2 > 0 ? (totalUnitCost / areaM2) : 0;

            return {
                inputs: { ...inputs }, // Return inputs for reference
                results: {
                    pieceArea,
                    sheetArea,
                    materialCost,
                    operationCost,
                    wasteCost,
                    overheadCost,
                    totalUnitCost,
                    unitPrice,
                    totalBatchPrice,
                    costPerM2,
                    isMinChargeApplied: totalBatchPrice === minCharge && totalBatchPrice > ((unitPrice * quantity) + setupFee)
                }
            };
        },

        /**
         * Format currency
         */
        formatCurrency: function(amount, currency = 'SAR') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2
            }).format(amount);
        }
    };

    // Expose to global scope
    global.AcrylicCalculator = AcrylicCalculator;

})(window);
