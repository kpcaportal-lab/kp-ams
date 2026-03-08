"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const pool_1 = __importDefault(require("./pool"));
async function populateWorkProgress() {
    try {
        console.log('Reading Excel file...');
        const workbook = XLSX.readFile('C:/Users/newha/Downloads/0011_Budget 2025-26.xlsx');
        // Get all sheet names
        const sheetNames = workbook.SheetNames;
        console.log('Available sheets:', sheetNames);
        // For now, let's analyze the structure of relevant sheets
        const tentativeSheet = workbook.Sheets['Tentative Last Date Billing'];
        const proposalsSheet = workbook.Sheets['Proposals & Additions'];
        if (!tentativeSheet || !proposalsSheet) {
            console.error('Required sheets not found');
            return;
        }
        // Convert sheets to JSON
        const tentativeData = XLSX.utils.sheet_to_json(tentativeSheet, { header: 1 });
        const proposalsData = XLSX.utils.sheet_to_json(proposalsSheet, { header: 1 });
        console.log('Tentative sheet rows:', tentativeData.length);
        console.log('Proposals sheet rows:', proposalsData.length);
        // Process data to extract user-specific work progress
        // This is a simplified version - you'll need to adjust based on actual Excel structure
        const workProgressData = [];
        // Mock data based on previous analysis - replace with actual parsing
        const mockUsers = [
            {
                name: 'Milind Limaye',
                total_proposals: 45,
                completed_proposals: 32,
                pending_proposals: 13,
                completed_amount: 6800000,
                pending_amount: 1700000
            },
            {
                name: 'Sanjeev Deshpande',
                total_proposals: 38,
                completed_proposals: 28,
                pending_proposals: 10,
                completed_amount: 5800000,
                pending_amount: 1400000
            },
            // Add more users as needed
        ];
        // Get user IDs from database
        for (const user of mockUsers) {
            const userResult = await pool_1.default.query('SELECT id FROM profiles WHERE full_name = $1', [user.name]);
            if (userResult.rows.length > 0) {
                const userId = userResult.rows[0].id;
                const totalAmount = user.completed_amount + user.pending_amount;
                const percentageCompleted = Math.round((user.completed_proposals / user.total_proposals) * 100);
                // Insert into work_progress table
                await pool_1.default.query(`
          INSERT INTO work_progress (
            user_id, fiscal_year, total_proposals, completed_proposals,
            pending_proposals, completed_amount, pending_amount, percentage_completed
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id, fiscal_year) DO UPDATE SET
            total_proposals = EXCLUDED.total_proposals,
            completed_proposals = EXCLUDED.completed_proposals,
            pending_proposals = EXCLUDED.pending_proposals,
            completed_amount = EXCLUDED.completed_amount,
            pending_amount = EXCLUDED.pending_amount,
            percentage_completed = EXCLUDED.percentage_completed,
            updated_at = NOW()
        `, [
                    userId,
                    '2025-26',
                    user.total_proposals,
                    user.completed_proposals,
                    user.pending_proposals,
                    user.completed_amount,
                    user.pending_amount,
                    percentageCompleted
                ]);
                console.log(`Inserted work progress for ${user.name}`);
            }
            else {
                console.log(`User ${user.name} not found in database`);
            }
        }
        console.log('Work progress data populated successfully');
    }
    catch (error) {
        console.error('Error populating work progress:', error);
    }
    finally {
        await pool_1.default.end();
    }
}
// Run the script
populateWorkProgress();
